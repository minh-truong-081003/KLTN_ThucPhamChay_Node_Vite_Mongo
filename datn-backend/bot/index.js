const socketIo = require('socket.io');
const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const server = http.createServer(app);
const cors = require('cors');
const io = socketIo(server);
const { ObjectId } = require('mongodb');
const { NlpManager } = require('node-nlp');
const multer = require('multer');
const xlsx = require('xlsx');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const axios = require('axios');
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();
app.use(
  cors({
    origin: 'http://localhost:5173', // or '*' for a less secure option that allows all origins
  })
);
// Helper: call external LLM as fallback when manager can't answer
// Implements: concurrency limit, retry/backoff, circuit-breaker and safe timeouts
const llmState = {
  concurrent: 0,
  maxConcurrent: parseInt(process.env.LLM_MAX_CONCURRENT || '3'),
  failureCount: 0,
  failureThreshold: parseInt(process.env.LLM_FAILURE_THRESHOLD || '5'),
  cooldownSeconds: parseInt(process.env.LLM_COOLDOWN_SECONDS || '60'),
  openUntil: 0,
};

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// Normalize a query into a safe cache key (URL-encode)
function normalizeCacheKey(q) {
  return encodeURIComponent(String(q || '').trim().toLowerCase());
}

// Simple in-memory cache for external LLM responses to speed up repeated queries
const llmCache = new Map(); // key -> { expires: timestamp, value: string } or { promise }
const LLM_CACHE_TTL = parseInt(process.env.LLM_CACHE_TTL_MS || String(1000 * 60 * 5)); // 5 minutes default

// Simple runtime metrics (in-memory). Persist/Prometheus integration optional later.
const metrics = {
  llmCacheHits: 0,
  llmCacheMisses: 0,
  llmCalls: 0,
  llmFailures: 0,
  localAnswers: 0,
  llmAnswers: 0,
};

function getCachedLLM(key) {
  const entry = llmCache.get(key);
  if (!entry) return null;
  if (entry.expires && Date.now() > entry.expires) {
    llmCache.delete(key);
    return null;
  }
  return entry.value || entry.promise;
}

function setCachedLLM(key, value, ttl = LLM_CACHE_TTL) {
  llmCache.set(key, { value, expires: Date.now() + ttl });
}

function setPendingLLM(key, promise, ttl = LLM_CACHE_TTL) {
  // store the pending promise so concurrent requests reuse it
  llmCache.set(key, { promise, expires: Date.now() + ttl });
}

// Redis-backed cache + lock helpers (optional)
let redisClient = null;
let useRedis = false;
(function initRedis() {
  const redisUrl = process.env.REDIS_URL || process.env.REDIS_HOST;
  if (!redisUrl) return;
  try {
    const { createClient } = require('redis');
    redisClient = createClient({ url: process.env.REDIS_URL || `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT || 6379}` });
    redisClient.on('error', (err) => console.warn('Redis client error', err));
    redisClient.connect().then(() => {
      useRedis = true;
      console.log('🔁 Connected to Redis for LLM cache');
    }).catch((e) => console.warn('Could not connect to Redis:', e?.message || e));
  } catch (e) {
    console.warn('redis package not available or failed to init. To enable Redis caching install `redis` package and set REDIS_URL');
  }
})();

async function redisGet(key) {
  if (!useRedis || !redisClient) return null;
  try {
    const v = await redisClient.get(key);
    return v;
  } catch (e) {
    console.warn(`[Redis] GET error for key '${key}':`, e?.message || e);
    return null;
  }
}

async function redisSet(key, value, ttlMs) {
  if (!useRedis || !redisClient) return false;
  try {
    if (ttlMs && ttlMs > 0) {
      await redisClient.set(key, value, { PX: ttlMs });
    } else {
      await redisClient.set(key, value);
    }
    return true;
  } catch (e) {
    console.warn(`[Redis] SET error for key '${key}':`, e?.message || e);
    return false;
  }
}

async function redisSetLock(lockKey, ttlMs) {
  if (!useRedis || !redisClient) return false;
  try {
    // SET lockKey "1" NX PX ttl
    const r = await redisClient.set(lockKey, '1', { NX: true, PX: ttlMs });
    return r === 'OK';
  } catch (e) {
    console.warn(`[Redis] SETLOCK error for key '${lockKey}':`, e?.message || e);
    return false;
  }
}

async function redisDel(key) {
  if (!useRedis || !redisClient) return false;
  try {
    await redisClient.del(key);
    return true;
  } catch (e) {
    console.warn(`[Redis] DEL error for key '${key}':`, e?.message || e);
    return false;
  }
}

// Wrapper: get or compute LLM answer using Redis lock/cache to avoid duplicate external calls across instances
async function getOrCallLLM(query, options = {}) {
  // normalize keys to avoid spaces/special chars issues
  const raw = String(query || '').trim();
  if (!raw) return null;
  const key = normalizeCacheKey(raw);
  const cacheKey = `llm:cache:${key}`;
  const lockKey = `llm:lock:${key}`;
  const ttl = options.ttlMs || LLM_CACHE_TTL;
  const lockTtl = options.lockTtlMs || 120000; // 2 minutes default lock

  // 1) Try Redis-backed cache first (if available)
  if (useRedis) {
    try {
      const cached = await redisGet(cacheKey);
      if (cached) {
        console.log(`[LLM] cache HIT (redis) for key: ${cacheKey}`);
        metrics.llmCacheHits += 1;
        return String(cached);
      }
      console.log(`[LLM] cache MISS (redis) for key: ${cacheKey}`);
      metrics.llmCacheMisses += 1;

      // try to acquire lock, if acquired we will call external and set cache
      const gotLock = await redisSetLock(lockKey, lockTtl);
      if (gotLock) {
        try {
          metrics.llmCalls += 1;
          const ans = await callExternalAI(raw);
          if (ans) await redisSet(cacheKey, String(ans), ttl);
          if (ans) metrics.llmAnswers += 1;
          await redisDel(lockKey);
          return ans;
        } catch (e) {
          metrics.llmFailures += 1;
          await redisDel(lockKey);
          throw e;
        }
      }

      // someone else is fetching — poll for cache
      const pollInterval = 300;
      const maxWait = options.maxWaitMs || 15000;
      let waited = 0;
      while (waited < maxWait) {
        await sleep(pollInterval);
        waited += pollInterval;
        const val = await redisGet(cacheKey);
        if (val) return String(val);
      }
      return null;
    } catch (e) {
      console.warn('getOrCallLLM(redis) failed, falling back to in-memory:', e?.message || e);
    }
  }

  // Fallback: in-memory cache and pending promise reuse
  const inMem = getCachedLLM(key);
  if (inMem && typeof inMem === 'string') {
    console.log('LLM cache HIT (in-memory) for key:', key);
    metrics.llmCacheHits += 1;
    return inMem;
  }
  if (inMem && typeof inMem.then === 'function') {
    console.log('LLM pending promise reused (in-memory) for key:', key);
    metrics.llmCacheHits += 1;
    return await inMem;
  }

  metrics.llmCalls += 1;
  const p = (async () => await callExternalAI(raw))();
  setPendingLLM(key, p);
  const ans = await p;
  if (ans) setCachedLLM(key, ans);
  if (ans) metrics.llmAnswers += 1;
  return ans;
}

// Simple products cache to answer product-related questions locally
let productsCache = [] // array of { id, name, sizes, sale, nameLower }
async function refreshProductsCache() {
  try {
    // try reading from products collection in this process (mongoose model defined below)
    // First, if Redis has products cached, use that (fast shared cache)
    if (useRedis && redisClient) {
      try {
        const raw = await redisGet('products:all');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            productsCache = parsed;
            console.log('Products cache loaded from Redis:', productsCache.length);
            return;
          }
        }
      } catch (e) {
        console.warn('Failed reading products from redis, will read DB:', e?.message || e);
      }
    }

    if (typeof products !== 'undefined') {
      const docs = await products.find({ is_active: true, is_deleted: false }).populate('sizes').lean();
      productsCache = (docs || []).map(d => ({
        id: String(d._id),
        name: d.name || '',
        sizes: d.sizes || [],
        sale: d.sale || 0,
        nameLower: String(d.name || '').toLowerCase(),
      }));
      console.log('Products cache loaded from DB:', productsCache.length);

      // write to Redis for other instances to reuse (keep a longer TTL)
      if (useRedis) {
        try {
          await redisSet('products:all', JSON.stringify(productsCache), 1000 * 60 * 60 * 24); // 24h TTL
          console.log('Products cache written to Redis (24h TTL)');
        } catch (e) {
          console.warn('Could not write products cache to Redis:', e?.message || e);
        }
      }
    }
  } catch (e) {
    console.warn('Could not refresh products cache:', e?.message || e);
  }
}

function findProductMatch(query) {
  const q = String(query || '').toLowerCase();
  if (!q) return null;
  // try redis-backed productsCache first (productsCache should already be in memory from refresh)
  // exact contains match first
  for (const p of productsCache) {
    if (p.nameLower && q.includes(p.nameLower)) return p;
  }
  // fuzzy match by words
  const words = q.split(/\s+/).filter(Boolean);
  for (const p of productsCache) {
    for (const w of words) {
      if (p.nameLower.includes(w) && w.length > 2) return p;
    }
  }
  // fallback: use dedupe fuzzy similarity on full query
  try {
    const dedupe = require('./dedupe');
    const names = productsCache.map(p => p.name);
    const idx = names.findIndex(n => dedupe.isSimilarToAny(String(q), [n], { jaccardThreshold: 0.4, levenshteinThreshold: 0.6 }));
    if (idx >= 0) return productsCache[idx];
  } catch (e) {
    // ignore
  }
  return null;
}

async function callExternalAI(query) {
  try {
    metrics.llmCalls += 1;
    const now = Date.now();
    if (llmState.openUntil > now) {
      console.warn('LLM circuit open, skipping external call until', new Date(llmState.openUntil).toISOString());
      return null;
    }

    // Throttle concurrent calls
    if (llmState.concurrent >= llmState.maxConcurrent) {
      console.warn('LLM concurrency limit reached, skipping external call');
      return null;
    }

    const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    const OPENAI_KEY = process.env.OPENAI_API_KEY;
    if (!GEMINI_KEY && !OPENAI_KEY) return null;

    llmState.concurrent += 1;
    try {
      // prefer Gemini when available
      if (GEMINI_KEY) {
        const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`;
        const baseMaxTokens = parseInt(process.env.GEMINI_MAX_TOKENS || '800');

        // small system prompt tailored to your shop
        const systemPrompt = 'Bạn là trợ lý bán hàng cho cửa hàng thực phẩm chay. Trả lời ngắn gọn, lịch sự và theo ngữ cảnh của cửa hàng.';

        // attempt loop with exponential backoff
        let attempt = 0;
        const maxAttempts = parseInt(process.env.LLM_MAX_RETRIES || '3');
        while (attempt < maxAttempts) {
          attempt += 1;
          const maxTokens = Math.min(baseMaxTokens * Math.pow(2, attempt - 1), 1600);
          const payload = {
            contents: [
              { parts: [{ text: systemPrompt }, { text: query }] },
            ],
            generationConfig: { temperature: 0.6, maxOutputTokens: maxTokens },
          };
          const headers = { 'Content-Type': 'application/json' };

          // wrap axios with a hard overall timeout via Promise.race
          const timeoutMs = parseInt(process.env.LLM_OVERALL_TIMEOUT_MS || '15000');
          const axiosTimeout = parseInt(process.env.LLM_HTTP_TIMEOUT_MS || '12000');

          // attempt call and handle HTTP errors explicitly so we can retry on 5xx / 503 / timeouts
          let res = null;
          try {
            const axiosPromise = axios.post(endpoint, payload, { headers, timeout: axiosTimeout });
            res = await Promise.race([
              axiosPromise,
              (async () => { await sleep(timeoutMs); throw new Error('LLM overall timeout'); })(),
            ]);
          } catch (e) {
            const status = e?.response?.status;
            const code = e?.code;
            const isTimeout = code === 'ECONNABORTED' || (e && String(e.message || '').toLowerCase().includes('timeout'));
            const isTransient = (status && status >= 500) || isTimeout || status === 429 || status === 503;
            console.warn(`LLM attempt ${attempt} error:`, status || code || e?.message);
            if (isTransient) {
              const backoff = Math.min(1000 * Math.pow(2, attempt - 1), 8000);
              await sleep(backoff + Math.floor(Math.random() * 300));
              continue; // retry
            }
            // Non-transient error -> rethrow to outer handler
            throw e;
          }

          // parse candidate
          const candidate = res?.data?.candidates?.[0];
          const text = candidate?.content?.parts?.[0]?.text || candidate?.text || candidate?.content?.text;

          // handle success
          if (text) {
            // reset failure counter on success
            llmState.failureCount = 0;
            return String(text);
          }

          // If response indicates MAX_TOKENS or transient server errors, retry with backoff
          const status = res?.status;
          const finishReason = candidate?.finishReason;
          if (status >= 500 || finishReason === 'MAX_TOKENS') {
            console.warn(`LLM attempt ${attempt} transient issue (status=${status}, finish=${finishReason}), retrying`);
            const backoff = Math.min(1000 * Math.pow(2, attempt - 1), 8000);
            await sleep(backoff + Math.floor(Math.random() * 300));
            continue;
          }

          // If no useful text and not transient, break
          break;
        }

        // If reached here: attempts exhausted
        llmState.failureCount += 1;
        metrics.llmFailures += 1;
        if (llmState.failureCount >= llmState.failureThreshold) {
          llmState.openUntil = Date.now() + llmState.cooldownSeconds * 1000;
          console.warn('LLM circuit opened due to repeated failures until', new Date(llmState.openUntil).toISOString());
        }
        return null;
      }

      // Optional: fallback to OpenAI (not implemented here) — keep pattern similar
      if (OPENAI_KEY) {
        // implement similar pattern for OpenAI requests, with timeouts/retries
        return null;
      }
    } finally {
      llmState.concurrent = Math.max(0, llmState.concurrent - 1);
    }
    return null;
  } catch (err) {
    console.error('External AI call failed:', err?.response?.data || err?.message || err);
    // increment failure counter and trip circuit if needed
    llmState.failureCount += 1;
    metrics.llmFailures += 1;
    if (llmState.failureCount >= llmState.failureThreshold) {
      llmState.openUntil = Date.now() + llmState.cooldownSeconds * 1000;
      console.warn('LLM circuit opened due to repeated failures until', new Date(llmState.openUntil).toISOString());
    }
    return null;
  }
}
// const manager = require('./langchain.js');
const { all } = require('axios');
// Use central manager from more.js and register static intents from langchain
var manager = require('./more.js');
const { registerStaticIntents } = require('./langchain.js');
// Register static intents into the running manager (fire-and-forget)
registerStaticIntents(manager).catch((err) => console.error('registerStaticIntents error:', err));
//train model
// manager.train().then(async () => {
//   manager.save();
//   //router

//   // bot chat o port 3000
//   app.get('/bot', async (req, res) => {
//     let response = await manager.process('vi', req.query.message);
//     res.json(response);

//     //success

//     // res.send(response.answer || 'Xin lỗi , thông tin không có sẵn , vui lòng chuyển sang câu hỏi khác');
//   });
//   // console.log( await manager.process('vi',"hello"));
//   // app.listen(3000);//
// });

//connect serrver
mongoose
  .connect(process.env.MONGOOSE_URI || process.env.MONGOOSE_DB)
  .then(() => console.log('Bot Database connected!'))
  .catch((err) => console.log(err));
//schema
const products = mongoose.model(
  'products',
  new mongoose.Schema({
    name: String,
    description: String,
    sale: Number,
    images: [
      {
        url: String,
      },
    ],

    sizes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Size',
      },
    ],
  })
);

const checkouts = mongoose.model(
  'orders',
  new mongoose.Schema({
    name: String,
    description: String,
    sale: Number,
    images: [
      {
        url: String,
      },
    ],
    description: String,
    createdAt: String,
  })
);const FastOrder = mongoose.model(
  'FastOrder',
  new mongoose.Schema({
    text: String,
  })
);
const trained = mongoose.model(
  'trained',
  mongoose.Schema({
    data: String,
  })
);
const size = mongoose.model(
  'Size',
  mongoose.Schema({
    data: String,
  })
);

app.get('/products', async (req, res) => {
  try {
    const documents = await products.find({ is_active: true, is_deleted: false }).populate('sizes');
    if (documents) res.json(documents);
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
});
app.get('/size', async (req, res) => {
  try {
    const documents = await size.find({});
    if (documents) res.json(documents);
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
});
app.get('/checkouts', async (req, res) => {
  try {
    const documents = await checkouts.find({});
    res.json(documents);
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
});
app.get('/vouchers', async (req, res) => {
  try {
    const axios = require('axios');
    // console.log('📞 Calling main API: http://localhost:8000/api/vouchers');

    const response = await axios.get('http://localhost:8000/api/vouchers', {
      timeout: 5000,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ Got vouchers from main API:', response.data?.data?.docs?.length || 0, 'items');
    res.json(response.data);
  } catch (error) {
    // console.error('❌ Error fetching vouchers from main API:');
    // console.error('   Status:', error.response?.status);
    // console.error('   Status Text:', error.response?.statusText);
    // console.error('   Message:', error.message);
    // console.error('   Code:', error.code);
    // console.error('   Data:', error.response?.data);

    // Nếu là lỗi timeout hoặc connection
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return res.status(503).json({
        error: 'Main API is not available',
        message: 'Cannot connect to main API server',
        code: error.code,
      });
    }

    return res.status(500).json({
      error: error.message || 'Unknown error',
      message: 'Failed to fetch vouchers from main API',
      details: error.response?.data,
      code: error.code,
    });
  }
});
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// io.on('connection', (socket) => {
//   socket.on('ChatMessage', async (message) => {
//     // First try the trained NLP manager
//     let response = await manager.process('vi', message);
//     // THÊM DÒNG NÀY ĐỂ DEBUG
//     console.log('[DEBUG] NLP Response:', JSON.stringify(response, null, 2));
//     io.emit('ChatMessage', message);

//     // If manager returns no answer or low confidence, use external AI fallback
//     const lowConfidence = typeof response.score === 'number' ? response.score < 0.9 : false;
//     if (!response.answer || response.answer === '' || response.intent === 'None' || lowConfidence) {
//       // THÊM DÒNG NÀY
//       console.log(`[BOT] node-nlp không hiểu. Đang gọi Gemini với câu: "${message}"`);

//       const fallback = await callExternalAI(message);
//       const reply =
//         fallback || 'Xin lỗi, shop chưa hiểu câu hỏi của bạn. Bạn vui lòng chat cụ thể hơn nhé!';
//       io.emit('ChatMessage', `<str style='color:green'>${reply}</str>`);
//       return;
//     }

//     io.emit('ChatMessage', `<str style='color:green'>${response.answer}</str>`);
//   });

io.on('connection', (socket) => {
  socket.on('ChatMessage', async (message) => {
    try {
      // 1. Xử lý bằng NLP local (nhanh)
      let response = await manager.process('vi', message);

      // debug
      console.log('[DEBUG] NLP Response:', JSON.stringify(response, null, 2));

      // 2. Gửi tin nhắn của user lên chat ngay
      io.emit('ChatMessage', message);

      // 3. Nếu NLP có câu trả lời rõ ràng và tự tin -> trả lời ngay
      // Hạ ngưỡng confidence để sử dụng model local nhiều hơn (nhanh và không tốn Gemini)
      const lowConfidence = typeof response.score === 'number' ? response.score < parseFloat(process.env.LOCAL_CONFIDENCE_THRESHOLD || '0.8') : false;
      if (response.answer && response.answer !== '' && response.intent !== 'None' && !lowConfidence) {
        console.log(`[BOT] node-nlp tự tin trả lời (score: ${response.score}).`);
        metrics.localAnswers += 1;
        io.emit('ChatMessage', `<str style='color:green'>${response.answer}</str>`);
        return;
      }

      // 4. NLP không tự tin hoặc không trả lời -> trước hết kiểm tra product cache
      const productMatch = findProductMatch(message);
      if (productMatch) {
        const ob = productMatch;
        const quick = `Sản phẩm ${ob.name} hiện có ${ob.sizes?.length || 0} kích cỡ. Giá ví dụ: ${ob.sizes?.[0]?.price || 'Liên hệ'}; giảm giá: ${ob.sale || 0}`;
        metrics.localAnswers += 1;
        io.emit('ChatMessage', `<str style='color:green'>${quick}</str>`);
        io.emit('BotTyping', { typing: false });
        return;
      }

      // 5. Nếu không match product -> gọi LLM **đồng bộ** theo yêu cầu của user
      console.log(`[BOT] node-nlp không chắc (score: ${response.score}). Sẽ gọi LLM đồng bộ.`);

      // Inform clients that bot is typing (UI có thể hiển thị vòng chờ)
      io.emit('BotTyping', { typing: true });

      try {
        const ans = await getOrCallLLM(message);
        if (ans) {
          io.emit('ChatMessage', `<str style='color:green'>${ans}</str>`);
        } else {
          io.emit('ChatMessage', `<str style='color:green'>Xin lỗi, shop chưa hiểu câu hỏi của bạn. Bạn vui lòng chat cụ thể hơn nhé!</str>`);
        }
      } catch (err) {
        console.error('LLM sync error:', err?.message || err);
        io.emit('ChatMessage', `<str style='color:green'>Xin lỗi, shop đang bận. Vui lòng thử lại sau.</str>`);
      } finally {
        io.emit('BotTyping', { typing: false });
      }
      return;
    } catch (err) {
      console.error('Error in ChatMessage handler:', err?.message || err);
      io.emit('ChatMessage', 'Lỗi nội bộ, vui lòng thử lại sau');
    }
  });

  socket.on('Order', async (message) => {
    io.emit('ChatMessage', message);
    //
    new FastOrder({
      text: 'message',
    }).save();
    io.emit('ChatMessage', 'Đặt hàng thành công ! Shop cảm ơn bạn đã đặt hàng nè  ');
  });
  socket.on('update', async () => {
    try {
      console.log('🔄 Socket update: rebuilding trainer and importing to running manager');
      const { NlpManager } = require('node-nlp');
      const newManager = new NlpManager({ languages: ['vi'] });

      // register static intents
      const { registerStaticIntents } = require('./langchain.js');
      await registerStaticIntents(newManager);

      // load dynamic intents into the fresh trainer
      const more = require('./more.js');
      if (typeof more.loadDynamicIntentsFor === 'function') {
        await more.loadDynamicIntentsFor(newManager);
      }

      // load pre_training entries
      const p = await pre_training.find({});
      for (const v of p) {
        newManager.addDocument('vi', `${v.question}`, `${v.class}`);
        newManager.addAnswer('vi', `${v.class}`, `${v.answer}`);
      }

      // refresh products cache after retrain/update
      try {
        await refreshProductsCache();
      } catch (e) {
        console.warn('Could not refresh products cache after update:', e?.message || e);
      }

      // train and import into running manager
      await newManager.train();
      const exported = newManager.export();
      manager.import(exported);
      console.log('🔁 Running manager updated successfully');
    } catch (err) {
      console.error('⚠️ Error during socket update:', err);
    }
  });
});

app.get('/update', async (req, res) => {
  try {
    console.log('🔄 Starting bot retrain...');
    // Build a fresh trainer, register static & dynamic intents, train, then import
    delete require.cache[require.resolve('./langchain.js')];
    delete require.cache[require.resolve('./more.js')];

    const { NlpManager } = require('node-nlp');
    const newManager = new NlpManager({ languages: ['vi'] });

    // Register static intents
    const { registerStaticIntents } = require('./langchain.js');
    await registerStaticIntents(newManager);

    // Load dynamic intents into the trainer
    const more = require('./more.js');
    if (typeof more.loadDynamicIntentsFor === 'function') {
      await more.loadDynamicIntentsFor(newManager);
    } else if (typeof more.loadDynamicIntents === 'function') {
      await more.loadDynamicIntents(newManager);
    }

    // Load pre_training entries from DB
    const p = await pre_training.find({});
    for (const v of p) {
      newManager.addDocument('vi', `${v.question}`, `${v.class}`);
      newManager.addAnswer('vi', `${v.class}`, `${v.answer}`);
    }

    // Train the fresh manager and replace running manager's model
    await newManager.train();
    await newManager.save();
    const exported = newManager.export();
    manager.import(exported);

    console.log('✅ Bot retrain completed successfully!');
    res.json({ success: true, message: 'Bot retrained successfully' });
  } catch (error) {
    console.error('❌ Error during bot retrain:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
app.get('/ask', async (req, res) => {
  const { query, id } = req.query;
  if (!query) return res.status(400).json({ error: 'missing query' });

  // 1) Run local manager first (fast)
  let response = await manager.process('vi', String(query));

  // 2) Special intent handling that requires DB/API lookups (handle first)
  try {
    if (response.intent && response.intent.includes('AskProduct')) {
      const str = response.intent;
      const match = str.match(/\d+/);
      if (match) {
        const number = match[0];
        var llsd = await axios.get('http://localhost:3333/products');
        llsd = llsd.data;
        var ob = llsd[number];
        return res.json({
          answer: `giá hiện tại của ${ob.name} size ${ob.sizes?.[0]?.name || ''} là ${ob.sizes?.[0]?.price || ''} và sale ${ob.sale}`,
        });
      }
    }
    if (response.intent == 'dtt') {
      const pp = await axios.get('http://localhost:8000/api/analyst');
      const aaa = pp.data;
      const nn = aaa['TopSell']['sản phẩm bán nhiều nhất'].name;
      const cc = aaa['TopSell']['sản phẩm bán nhiều nhất'].count;

      return res.json({
        answer: `Sản phẩm bán chạy nhất tháng này là ${nn} và đã bán được ${cc} lượt`,
      });
    }
    if (response.intent == 'bought_num' && (!id || id == '')) {
      return res.json({ answer: 'Bạn cần phải đăng nhập để xem mục này !' });
    }
    // lastest_buy
    else if (response.intent == 'lastest_buy') {
      const _id = new mongoose.Types.ObjectId(id);
      const documents = await checkouts.find({ user: _id });
      if (documents[0]?.createdAt == undefined) {
        return res.json({
          answer: `Không có đơn hàng nào gần đây !`,
        });
      }
      return res.json({
        answer: `lần cuối bạn mua hàng là ${documents[0]?.createdAt} `,
      });
    } else if (response.intent == 'bought_num') {
      const _id = new mongoose.Types.ObjectId(id);
      const documents = await checkouts.find({ user: _id });
      return res.json({
        answer: `bạn đã mua ${documents.length} đơn hàng`,
      });
    }
  } catch (e) {
    console.warn('Error handling special intent:', e?.message || e);
  }

  // 3) If manager has an answer, return it immediately (fast)
  if (response.answer && response.answer !== '' && response.intent !== 'None') {
    metrics.localAnswers += 1;
    return res.json({ answer: response.answer, intent: response.intent, score: response.score });
  }

  // 4) Otherwise call LLM synchronously (user requested immediate enhanced answer)
  try {
    const key = normalizeCacheKey(String(query));
    const cached = getCachedLLM(key);
    if (cached && typeof cached === 'string') {
      metrics.llmCacheHits += 1;
      return res.json({ answer: cached, cached: true });
    }

    if (cached && typeof cached.then === 'function') {
      // await pending
      const ans = await cached;
      if (ans) return res.json({ answer: ans });
    }

    const fallback = await getOrCallLLM(String(query));
    if (fallback) return res.json({ answer: fallback });
    return res.json({ answer: `Xin lỗi, tôi không hiểu ý của bạn. Vui lòng hỏi lại cụ thể hơn.` });
  } catch (err) {
    console.error('Synchronous LLM error on /ask:', err?.message || err);
    return res.json({ answer: `Xin lỗi, shop đang bận. Vui lòng thử lại sau.` });
  }
});

app.get('/admin', async (req, res) => {
  res.sendFile(__dirname + '/add.html');
});
const pre_training = mongoose.model(
  'pre_training',
  mongoose.Schema({
    class: String,
    answer: String,
    question: String,
  })
);
// Endpoint to sanitize training data (remove banned keywords like 'trà sữa' )
app.get('/sanitize-training', async (req, res) => {
  try {
    const banned = ['trà sữa'];
    const all = await pre_training.find({});
    let removed = 0;
    for (const doc of all) {
      const q = String(doc.question || '').toLowerCase();
      const a = String(doc.answer || '').toLowerCase();
      if (banned.some(b => q.includes(b) || a.includes(b))) {
        await pre_training.deleteOne({ _id: doc._id });
        removed += 1;
      }
    }
    return res.json({ ok: true, removed });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e?.message || e });
  }
});

// Endpoint that sanitizes training data then triggers retrain via existing /api/train
app.get('/train-clean', async (req, res) => {
  try {
    await new Promise((r) => setTimeout(r, 50));
    // sanitize first
    const s = await (async () => {
      const banned = ['trà sữa'];
      const all = await pre_training.find({});
      let removed = 0;
      for (const doc of all) {
        const q = String(doc.question || '').toLowerCase();
        const a = String(doc.answer || '').toLowerCase();
        if (banned.some(b => q.includes(b) || a.includes(b))) {
          await pre_training.deleteOne({ _id: doc._id });
          removed += 1;
        }
      }
      return removed;
    })();

    // call our train endpoint internally
    const r = await axios.get('http://localhost:3333/api/train', { timeout: 600000 });
    return res.json({ ok: true, removed: s, trainResult: r.data });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e?.message || e });
  }
});
app.get('/api/loadAll', async (req, res) => {
  const p = await pre_training.find({});
  var json = {};
  var onClass = [];
  for (const x of p) {
    onClass.push(x.class);
    if (json[x.class] !== undefined) {
      json[x.class]['answer'].push(x.answer);
      json[x.class]['question'].push(x.question);
    } else {
      json = {
        ...json,
        ...{
          [x.class]: {
            answer: [x.answer],
            question: [x.question],
          },
        },
      };
    }
  }
  const { c } = req.query;
  if (c) return res.json(onClass);
  res.json(json);
});
app.get('/api/add', async (req, res) => {
  const { answer, classs, question } = req.query;
  await pre_training({
    class: classs,
    answer: answer,
    question: question,
  }).save();

  res.json({ status: true });
});
app.get('/api/delete', async (req, res) => {
  const { question } = req.query;
  await pre_training.deleteOne({ question: question });
  res.json({ status: true });
});
app.get('/api/train', async (req, res) => {
  try {
    // Build a fresh trainer to avoid accumulating duplicate intents
    delete require.cache[require.resolve('./langchain.js')];
    delete require.cache[require.resolve('./more.js')];

    const { NlpManager } = require('node-nlp');
    const newManager = new NlpManager({ languages: ['vi'] });

    // Register static intents
    const { registerStaticIntents } = require('./langchain.js');
    await registerStaticIntents(newManager);

    // Load dynamic intents into the trainer
    const more = require('./more.js');
    if (typeof more.loadDynamicIntentsFor === 'function') {
      await more.loadDynamicIntentsFor(newManager);
    } else if (typeof more.loadDynamicIntents === 'function') {
      await more.loadDynamicIntents(newManager);
    }

    // Load any manual pre-training entries from DB
      const p = await pre_training.find({});
      // Build a set of normalized existing utterances to avoid duplicates
      const existingUtterances = (newManager.documents || []).filter(d => d.locale === 'vi').map(d => String(d.utterance || ''));
      for (const v of p) {
        try {
          const q = String(v.question || '').trim();
          const cls = String(v.class || '').trim();
          if (!q || !cls) continue;
          // use fuzzy dedupe
          const dedupe = require('./dedupe');
          if (dedupe.isSimilarToAny(q, existingUtterances, { jaccardThreshold: 0.65, levenshteinThreshold: 0.72 })) continue;
          newManager.addDocument('vi', q, cls);
          existingUtterances.push(q);
          // answers dedupe per intent
          const answers = (newManager.answers && newManager.answers['vi'] && newManager.answers['vi'][cls]) || [];
          if (!dedupe.isSimilarToAny(String(v.answer || ''), answers, { jaccardThreshold: 0.7, levenshteinThreshold: 0.78 })) newManager.addAnswer('vi', cls, String(v.answer || ''));
        } catch (err) {
          console.warn('⚠️ Skipping pre_training item due to error:', err?.message || err);
        }
      }

    // Train, save, export and import into running manager
    await newManager.train();
    await newManager.save();
    const ex = newManager.export();
    fs.writeFileSync('./model.txt', ex);
    manager.import(ex);
    res.json({ status: true });
  } catch (error) {
    console.error('❌ Error during /api/train:', error);
    res.status(500).json({ status: false, error: error.message || String(error) });
  }
});

app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    res.status(400).send('cần upload file');
    return;
  }

  // Đọc dữ liệu từ tệp .xlsx
  const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });

  // Chuyển đổi dữ liệu sang định dạng JSON
  const result = {};
  workbook.SheetNames.forEach((sheetName) => {
    const sheet = workbook.Sheets[sheetName];
    result[sheetName] = xlsx.utils.sheet_to_json(sheet);
  });
  // Use fresh trainer flow for uploaded data to avoid polluting running manager
  const { NlpManager } = require('node-nlp');
  const newManager = new NlpManager({ languages: ['vi'] });

  // Register static intents and dynamic intents first
  const { registerStaticIntents } = require('./langchain.js');
  await registerStaticIntents(newManager);
  const more = require('./more.js');
  if (typeof more.loadDynamicIntentsFor === 'function') {
    await more.loadDynamicIntentsFor(newManager);
  }

  // Import any existing trained model if present and merge
  const allData = await trained.findOne({});
  if (allData && allData.data) newManager.import(allData.data);

  // Add uploaded sheet entries (dedupe)
  const existing = new Set(((newManager.documents || []).filter(d=>d.locale==='vi').map(d=>String(d.utterance).trim().toLowerCase())));
  for (const v of result.Sheet1) {
    const q = String(v.question || '').trim();
    const a = String(v.answer || '').trim();
    const cls = String(v.class || '').trim();
    if (!q || !cls) continue;
    const norm = q.toLowerCase();
    if (!existing.has(norm)) {
      newManager.addDocument('vi', q, cls);
      existing.add(norm);
    }
    const answers = (newManager.answers && newManager.answers['vi'] && newManager.answers['vi'][cls]) || [];
    if (a && !answers.includes(a)) newManager.addAnswer('vi', cls, a);
  }

  // Train and save
  await newManager.train();
  await newManager.save();

  const ex = newManager.export();
  await trained.deleteMany({});
  await trained({ data: ex }).save();

  // Import into running manager
  manager.import(ex);
  res.json(result);
});
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://fe-du-an-tot-nghiep-hrdg4lmqx-dangtienhung.vercel.app/',
    ],
    credentials: true,
  })
);

server.listen(3333, () => {
  console.log('Server đang lắng nghe trên cổng 3333');
});

// Ensure products cache is refreshed once the DB connection is open and models are available
mongoose.connection.once('open', async () => {
  try {
    await refreshProductsCache();
  } catch (e) {
    console.warn('Initial products cache refresh failed:', e?.message || e);
  }
});

// Temporary route to directly test Gemini call
app.get('/test-gemini', async (req, res) => {
  const q = req.query.q || req.query.query || 'Xin chào';
  try {
    console.log('🔎 /test-gemini called with:', q.slice(0,200));
    const fallback = await callExternalAI(q);
    if (!fallback) return res.status(502).json({ ok: false, message: 'No response from Gemini or fallback', data: null });
    return res.json({ ok: true, data: fallback });
  } catch (err) {
    console.error('/test-gemini error:', err);
    return res.status(500).json({ ok: false, message: err.message || String(err) });
  }
});

// Redis status endpoint for quick health checks and metrics
app.get('/redis-status', async (req, res) => {
  if (!useRedis || !redisClient) return res.json({ ok: false, message: 'Redis not configured' });
  try {
    const ping = await redisClient.ping();
    // count llm cache keys (may be many, so limit scanning)
    let count = 0;
    try {
      const keys = await redisClient.keys('llm:cache:*');
      count = keys.length;
    } catch (e) {
      // ignore
    }
    const productsCached = !!(await redisGet('products:all'));
    return res.json({ ok: true, ping, llmCacheKeys: count, productsCached });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e?.message || e });
  }
});

// Warmup endpoint: accept `q` param (single) or `list` (pipe-separated) to pre-populate LLM cache
app.get('/warmup', async (req, res) => {
  try {
    const q = req.query.q;
    const list = req.query.list;
    const queries = [];
    if (q) queries.push(String(q));
    if (list) queries.push(...String(list).split('|').map(s => s.trim()).filter(Boolean));
    // default popular queries if none provided
    if (queries.length === 0) {
      queries.push('giá đậu hũ');
      queries.push('giờ mở cửa');
      queries.push('phương thức thanh toán');
    }
    const results = {};
    for (const item of queries) {
      try {
        const ans = await getOrCallLLM(item, { ttlMs: 1000 * 60 * 60 * 24 });
        results[item] = ans || null;
      } catch (e) {
        results[item] = null;
      }
    }
    return res.json({ warmed: Object.keys(results).length, results });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e?.message || e });
  }
});

// Simple runtime metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    return res.json({ ok: true, metrics, uptimeMs: process.uptime() * 1000 });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e?.message || e });
  }
});

// Clear caches: in-memory + Redis keys (llm cache and products)
app.get('/cache-clear', async (req, res) => {
  try {
    // clear in-memory LLM cache
    llmCache.clear();
    productsCache = [];

    const report = { inMemoryCleared: true, redis: { deleted: 0, errors: null } };
    if (useRedis && redisClient) {
      try {
        // delete llm:cache:* keys
        const keys = await redisClient.keys('llm:cache:*');
        if (keys && keys.length) {
          await redisClient.del(...keys);
          report.redis.deleted += keys.length;
        }
        // delete products cache
        const p = await redisGet('products:all');
        if (p) {
          await redisDel('products:all');
          report.redis.deleted += 1;
        }
      } catch (e) {
        report.redis.errors = e?.message || String(e);
      }
    }

    return res.json(report);
  } catch (e) {
    return res.status(500).json({ ok: false, error: e?.message || e });
  }
});
