
## analyticsCache.js
- **Called by:** `analyticsController` (bulk stats queries), potentially any read-heavy endpoint
- **Responsibility:** Read-through caching with prefix-based invalidation. Default 5-min TTL.
- **Depends on:** `node-cache` (npm package)
- **Design:** Lightweight in-memory cache. Restarts clear it — fine for analytics, not for critical data.