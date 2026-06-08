// /client/src/services/session.js
/**
 * @fileoverview Client-side session management utilities.
 *
 * Provides:
 * - Session ID generation and retrieval (memory-cached, persisted to localStorage).
 * - Device/browser info collection.
 * - Session-end beacon tracking via `navigator.sendBeacon`.
 *
 * @module services/session
 * @requires ../utils/deviceInfo
 */

import { getDeviceInfo } from "../utils/deviceInfo";

// Memory cache to avoid repeated localStorage reads on every API request
let cachedSessionId = null;

/**
 * Retrieve the current session ID. Uses memory cache after first read.
 * Falls back to localStorage, then generates a new UUID if neither has one.
 *
 * @returns {string} The session ID.
 */
export const getSessionId = () => {
  if (cachedSessionId) return cachedSessionId;

  cachedSessionId = localStorage.getItem("sessionId");
  if (!cachedSessionId) {
    cachedSessionId = crypto.randomUUID();
    localStorage.setItem("sessionId", cachedSessionId);
  }
  return cachedSessionId;
};

/**
 * Clear the cached session ID and remove it from localStorage.
 * Called on logout so the next login starts a fresh session.
 */
export const clearSessionId = () => {
  cachedSessionId = null;
  localStorage.removeItem("sessionId");
};

/**
 * Register a `beforeunload` listener that fires a SESSION_END analytics
 * beacon via `navigator.sendBeacon`.
 *
 * Device info is captured at setup time (not at unload) to avoid heavy
 * operations during browser teardown.
 *
 * @param {string} backendUrl - The base URL of the backend.
 * @returns {Function|undefined} A cleanup function, or undefined in SSR.
 */
export const setupSessionEndTracking = (backendUrl) => {
  if (typeof window === "undefined") return;

  const startTime = Date.now();
  const sessionId = getSessionId();
  const deviceInfo = getDeviceInfo(); // Captured once at setup

  const handleBeforeUnload = () => {
    const duration = Math.round((Date.now() - startTime) / 1000);

    const data = JSON.stringify({
      sessionId,
      duration,
      actionType: "SESSION_END",
      deviceInfo,
    });

    navigator.sendBeacon(`${backendUrl}/api/analytics/session-end`, data);
  };

  window.addEventListener("beforeunload", handleBeforeUnload);

  return () => {
    window.removeEventListener("beforeunload", handleBeforeUnload);
  };
};
