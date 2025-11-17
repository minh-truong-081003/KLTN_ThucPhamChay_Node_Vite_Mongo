// Lightweight dedupe utilities (no external deps)
function normalizeText(s) {
  if (!s) return '';
  return String(s)
    .toLowerCase()
    .replace(/[\u00A0\n\r\t]+/g, ' ')
    .replace(/[^a-z0-9\s\u00C0-\u024F\u1EA0-\u1EFF]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokens(s) {
  return normalizeText(s).split(' ').filter(Boolean);
}

function jaccard(a, b) {
  const A = new Set(tokens(a));
  const B = new Set(tokens(b));
  if (A.size === 0 && B.size === 0) return 1;
  const inter = [...A].filter(x => B.has(x)).length;
  const uni = new Set([...A, ...B]).size;
  return uni === 0 ? 0 : inter / uni;
}

function levenshtein(a, b) {
  const s = normalizeText(a);
  const t = normalizeText(b);
  const n = s.length;
  const m = t.length;
  if (n === 0) return m;
  if (m === 0) return n;
  let v0 = new Array(m + 1).fill(0).map((_, i) => i);
  let v1 = new Array(m + 1).fill(0);
  for (let i = 0; i < n; i++) {
    v1[0] = i + 1;
    for (let j = 0; j < m; j++) {
      const cost = s[i] === t[j] ? 0 : 1;
      v1[j + 1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + cost);
    }
    v0 = v1.slice();
  }
  return v1[m];
}

function levenshteinRatio(a, b) {
  const dist = levenshtein(a, b);
  const maxLen = Math.max(normalizeText(a).length, normalizeText(b).length, 1);
  return 1 - dist / maxLen;
}

function isSimilar(a, b, opts = {}) {
  const { jaccardThreshold = 0.65, levenshteinThreshold = 0.75 } = opts;
  if (!a || !b) return false;
  const j = jaccard(a, b);
  if (j >= jaccardThreshold) return true;
  const l = levenshteinRatio(a, b);
  return l >= levenshteinThreshold;
}

function isSimilarToAny(val, list = [], opts = {}) {
  if (!val) return false;
  for (const item of list) {
    if (isSimilar(val, item, opts)) return true;
  }
  return false;
}

module.exports = {
  normalizeText,
  jaccard,
  levenshtein,
  levenshteinRatio,
  isSimilar,
  isSimilarToAny,
};
