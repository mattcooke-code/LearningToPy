// /client/src/services/session.js
/**
 * @fileoverview Client-side session management.
 *
 * A "session" is one continuous period of activity in this browser profile,
 * shared across tabs and ended by 30 minutes of inactivity or by logout.
 *
 * - The session ID lives in localStorage as { id, lastActive } and is cached
 *   in memory. `lastActive` is refreshed on every call to getSessionId()
 *   (i.e. every API request), with localStorage writes throttled.
 * - All storage access is guarded: if localStorage is unavailable the session
 *   still works, it just lives in memory for this page load.
 * - The server computes session start/end/duration itself. The client only
 *   sends a lightweight "I'm leaving" beacon with the session ID, so multiple
 *   tabs can never produce conflicting durations.
 *
 * @module services/session
 */

const STORAGE_KEY = "session";
const LEGACY_STORAGE_KEY = "sessionId";
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // inactivity before a new session starts
const WRITE_THROTTLE_MS = 15 * 1000; // max localStorage write frequency
const BEACON_MIN_INTERVAL_MS = 1000; // visibilitychange + pagehide often both fire

/** @type {{ id: string, lastActive: number } | null} */
let current = null;
let lastWrite = 0;
let lastBeaconAt = 0;

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

/**
 * Generate a session ID matching the server's ActivityLog/Session validation
 * (/^[a-zA-Z0-9_-]+$/, 10–100 chars).
 *
 * crypto.randomUUID() only exists in secure contexts, so fall back to
 * getRandomValues (available everywhere) and finally to Math.random.
 */
const generateId = () => {
  try {
    if (typeof crypto !== "undefined") {
      if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
      const bytes = crypto.getRandomValues(new Uint8Array(16));
      return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    }
  } catch {
    // fall through to the non-crypto fallback
  }
  return (
    Date.now().toString(36) +
    Math.random().toString(36).slice(2) +
    Math.random().toString(36).slice(2)
  );
};

const isFresh = (session, now) =>
  now - session.lastActive <= SESSION_TIMEOUT_MS;

const readStored = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return typeof parsed?.id === "string" && Number.isFinite(parsed.lastActive)
      ? parsed
      : null;
  } catch {
    return null; // storage blocked or corrupted value
  }
};

const persist = (session, now) => {
  lastWrite = now;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Storage unavailable — keep the session in memory only
  }
};

if (typeof window !== "undefined") {
  // One-off cleanup of the pre-timeout storage key
  try {
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    /* ignore */
  }

  // Another tab rotated, refreshed or cleared the session: drop our cache so
  // the next call re-reads storage instead of using a stale ID.
  window.addEventListener("storage", (event) => {
    if (event.key === null || event.key === STORAGE_KEY) current = null;
  });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Get the current session ID, starting a new session if none exists or the
 * previous one has been inactive for more than 30 minutes. Counts as activity.
 *
 * Never throws.
 *
 * @returns {string} The session ID.
 */
export const getSessionId = () => {
  const now = Date.now();
  let session = current;

  if (!session || !isFresh(session, now)) {
    // Another tab may have kept the session alive while this one was idle.
    const stored = readStored();
    session = stored && isFresh(stored, now) ? stored : null;
  }

  if (!session) {
    session = { id: generateId(), lastActive: now };
    current = session;
    persist(session, now);
    return session.id;
  }

  session.lastActive = now;
  current = session;
  if (now - lastWrite > WRITE_THROTTLE_MS) persist(session, now);
  return session.id;
};

/**
 * Read the live session ID without counting as activity and without ever
 * starting a new session. Returns null if there is no live session.
 *
 * Used by the end beacon: a tab that was hidden for hours and is then closed
 * must not create a brand-new session just to report its end.
 *
 * @returns {string|null}
 */
export const peekSessionId = () => {
  const now = Date.now();
  const newest = [current, readStored()]
    .filter(Boolean)
    .sort((a, b) => b.lastActive - a.lastActive)[0];
  return newest && isFresh(newest, now) ? newest.id : null;
};

/**
 * End the current session locally. The next getSessionId() starts a new one.
 * Call on logout (after sendSessionEnd) so a different user on a shared
 * device never inherits the previous user's session.
 */
export const clearSessionId = () => {
  current = null;
  lastWrite = 0;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
};

/**
 * Tell the server this session was last seen now. Safe to call repeatedly:
 * the server keeps the latest end time, so duplicate or multi-tab beacons
 * cannot distort durations.
 *
 * @param {string} backendUrl - Base URL of the backend.
 */
export const sendSessionEnd = (backendUrl) => {
  if (
    typeof navigator === "undefined" ||
    typeof navigator.sendBeacon !== "function"
  ) {
    return;
  }

  const sessionId = peekSessionId();
  if (!sessionId) return;

  const now = Date.now();
  if (now - lastBeaconAt < BEACON_MIN_INTERVAL_MS) return;
  lastBeaconAt = now;

  try {
    // A string body is sent as text/plain: a CORS "simple" request, no preflight.
    navigator.sendBeacon(
      `${backendUrl}/api/analytics/session-end`,
      JSON.stringify({ sessionId }),
    );
  } catch {
    // Analytics must never throw into the app
  }
};

/**
 * Register page-lifecycle listeners that send the end beacon whenever the
 * page is hidden or unloaded.
 *
 * Uses `visibilitychange` (the only reliable signal on mobile, where
 * `beforeunload` frequently never fires) plus `pagehide` for Safari/bfcache.
 * Register once for the lifetime of the app — it does not depend on login state.
 *
 * @param {string} backendUrl - Base URL of the backend.
 * @returns {Function|undefined} Cleanup function, or undefined outside the browser.
 */
export const setupSessionEndTracking = (backendUrl) => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return undefined;
  }

  const onVisibilityChange = () => {
    if (document.visibilityState === "hidden") sendSessionEnd(backendUrl);
  };
  const onPageHide = () => sendSessionEnd(backendUrl);

  document.addEventListener("visibilitychange", onVisibilityChange);
  window.addEventListener("pagehide", onPageHide);

  return () => {
    document.removeEventListener("visibilitychange", onVisibilityChange);
    window.removeEventListener("pagehide", onPageHide);
  };
};
