// services/sessionService.js
const Session = require("../models/Session");
const { isValidSessionId } = require("../utils/sessionId");
const { parseDeviceInfo, anonymiseIp } = require("../utils/parseDeviceInfo");

// Matches the client's inactivity timeout in client/src/services/session.js
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
// At most one DB write per live session per interval, per server instance
const TOUCH_INTERVAL_MS = 60 * 1000;
const MAX_CACHE_ENTRIES = 10000;

/** "userId:sessionId" -> timestamp of last DB write (in-process, best effort). */
const lastTouched = new Map();

const remember = (key, now) => {
  if (lastTouched.size >= MAX_CACHE_ENTRIES) {
    for (const [k, t] of lastTouched) {
      if (now - t > TOUCH_INTERVAL_MS) lastTouched.delete(k);
    }
    // Still full (huge burst of distinct sessions): evict the oldest entry
    if (lastTouched.size >= MAX_CACHE_ENTRIES) {
      lastTouched.delete(lastTouched.keys().next().value);
    }
  }
  lastTouched.delete(key); // re-insert so Map order stays oldest-first
  lastTouched.set(key, now);
};

/**
 * Record that an authenticated user was active in a session.
 *
 * - First sight of (userId, sessionId) inserts the session (startedAt, device, IP).
 * - Later calls only advance `endedAt` ($max, so it can never move backwards).
 * - Throttled by an in-process cache, so a busy session costs ~1 write/minute.
 *   With several server instances the worst case is a few extra idempotent upserts.
 *
 * Never throws and never needs to be awaited: tracking must not affect requests.
 *
 * @param {Object} params
 * @param {string|ObjectId} params.userId
 * @param {string} params.sessionId - Validated here
 * @param {Object} params.headers   - Raw request headers (device info is parsed only on a cache miss)
 * @param {string} [params.ip]
 */
const touch = async ({ userId, sessionId, headers, ip }) => {
  try {
    if (!userId || !isValidSessionId(sessionId)) return;

    const key = `${userId}:${sessionId}`;
    const now = Date.now();
    const last = lastTouched.get(key);
    if (last !== undefined && now - last < TOUCH_INTERVAL_MS) return;
    remember(key, now);

    const at = new Date(now);
    const onInsert = { startedAt: at, deviceInfo: parseDeviceInfo(headers) };
    const ipAddress = anonymiseIp(ip);
    if (ipAddress) onInsert.ipAddress = ipAddress;

    try {
      await Session.updateOne(
        { userId, sessionId },
        { $setOnInsert: onInsert, $max: { endedAt: at } },
        { upsert: true },
      );
    } catch (err) {
      // 11000: another instance inserted the same session first — nothing to do.
      if (err.code !== 11000) {
        lastTouched.delete(key); // allow a retry on the next request
        throw err;
      }
    }
  } catch (err) {
    console.error("Session tracking failed:", err.message);
  }
};

/**
 * Handle the client's end beacon: extend `endedAt` of a *live* session to now.
 *
 * The time comes from the server clock, never from the client, and only
 * sessions active within the timeout are touched, so a stray or replayed
 * beacon cannot stretch an old session. Safe to call any number of times
 * (multi-tab, visibilitychange + pagehide, etc.).
 *
 * @param {string} sessionId
 */
const endSession = async (sessionId) => {
  if (!isValidSessionId(sessionId)) return;

  const now = new Date();
  await Session.updateMany(
    {
      sessionId,
      endedAt: { $gte: new Date(now.getTime() - SESSION_TIMEOUT_MS) },
    },
    { $max: { endedAt: now } },
  );
};

module.exports = { touch, endSession, SESSION_TIMEOUT_MS, TOUCH_INTERVAL_MS };
