// analyticsCache.js
const NodeCache = require("node-cache");

// TTL of 300s (5 min). checkperiod cleans up expired keys every 60s.
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

/**
 * Wraps an async data-fetching function with a read-through cache.
 *
 * @param {string}   key      - Cache key. Should be unique per logical slice + params.
 * @param {Function} fetchFn  - Async function to call on a cache miss.
 * @returns {Promise<any>}    - Cached or freshly fetched value.
 *
 * @example
 *   const data = await withCache(`userStats:${start}:${end}`, () => fetchUserStats(start, end));
 */
const withCache = async (key, fetchFn) => {
  const cached = cache.get(key);
  if (cached !== undefined) return cached;

  const fresh = await fetchFn();
  cache.set(key, fresh);
  return fresh;
};

/**
 * Invalidates all cache entries whose keys begin with a given prefix.
 * Useful when you know a specific slice is stale (e.g. after a bulk import).
 *
 * @param {string} prefix - e.g. "userStats" to bust all userStats:* entries
 */
const invalidatePrefix = (prefix) => {
  const keys = cache.keys().filter((k) => k.startsWith(prefix));
  cache.del(keys);
};

module.exports = { withCache, invalidatePrefix };
