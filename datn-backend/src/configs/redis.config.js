import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL || `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT || 6379}`;

const redisClient = createClient({
  url: redisUrl,
  // socket options help with slow networks / transient issues
  socket: {
    // increase connect timeout to 10s
    connectTimeout: Number(process.env.REDIS_CONNECT_TIMEOUT) || 10000,
    // optional: for cloud providers that require TLS, set REDIS_URL to use rediss://
    // reconnectStrategy may be supported by the client; keep a safe function
    reconnectStrategy: (retries) => Math.min(retries * 50, 2000),
  },
  // allow password from env if needed (also supported via URL)
  password: process.env.REDIS_PASSWORD || undefined,
});

redisClient.on('connect', () => console.log('Redis connecting...'));
redisClient.on('ready', () => console.log('Redis ready'));
// some client versions emit 'reconnecting' with a delay argument
redisClient.on('reconnecting', (delay) => console.log('Redis reconnecting, delay:', delay));
redisClient.on('end', () => console.log('Redis connection closed'));
redisClient.on('error', (err) => console.warn('Redis client error', err));

(async () => {
  try {
    await redisClient.connect();
    console.log('Connected to Redis');
  } catch (err) {
    console.error('Failed to connect to Redis', err);
  }
})();

export default redisClient;