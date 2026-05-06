// /client/src/services/session.js
/**
 * @fileoverview Client-side session management utilities.
 *
 * Provides:
 * - Session ID generation and retrieval (persisted to localStorage).
 * - Device/browser info collection.
 * - Session-end beacon tracking via `navigator.sendBeacon`.
 *
 * These utilities are consumed by the API layer (for attaching analytics
 * headers) and by AuthContext (for session-end tracking on logout/tab close).
 *
 * @module services/session
 * @requires uuid
 * @requires ../utils/deviceInfo
 */

import { v4 as uuidv4 } from "uuid";
import { getDeviceInfo } from "../utils/deviceInfo";

/**
 * Retrieve the current session ID from localStorage, or generate a new one
 * (UUID v4) and persist it.
 *
 * A session persists across page reloads but is cleared on logout.
 *
 * @returns {string} The session ID.
 */
export const getSessionId = () => {
  let sessionId = localStorage.getItem("sessionId");
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem("sessionId", sessionId);
  }
  return sessionId;
};

/**
 * Register a `beforeunload` listener that fires a SESSION_END analytics
 * beacon via `navigator.sendBeacon` when the user closes the tab or
 * navigates away.
 *
 * The beacon payload includes:
 * - `sessionId` — the current session identifier
 * - `duration` — seconds elapsed since `setupSessionEndTracking` was called
 * - `actionType` — always `"SESSION_END"`
 * - `deviceInfo` — full device info snapshot from `getDeviceInfo()`
 *
 * **Usage:**
 * ```js
 * useEffect(() => {
 *   if (user) {
 *     const cleanup = setupSessionEndTracking(BACKEND_URL);
 *     return cleanup;
 *   }
 * }, [user]);
 * ```
 *
 * @param {string} backendUrl - The base URL of the backend (used to construct
 *   the analytics endpoint).
 * @returns {Function|undefined} A cleanup function that removes the listener,
 *   or undefined when called in a non-browser environment (SSR safety).
 */
export const setupSessionEndTracking = (backendUrl) => {
  if (typeof window === "undefined") return;

  const startTime = Date.now();
  const sessionId = getSessionId();

  const handleBeforeUnload = () => {
    const duration = Math.round((Date.now() - startTime) / 1000);
    const deviceInfo = getDeviceInfo();

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
