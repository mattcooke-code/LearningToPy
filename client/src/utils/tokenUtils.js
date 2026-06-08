// /client/src/utils/tokenUtils.js
/**
 * @fileoverview JWT token helper utilities.
 *
 * Stores the access token in a module-level variable (memory) rather than
 * localStorage / sessionStorage. This prevents the token from being visible
 * in DevTools and eliminates the XSS attack surface of storage-based tokens.
 *
 * On page refresh the token is gone from memory, but the httpOnly refresh
 * token cookie is sent automatically by the browser and AuthContext restores
 * a fresh access token via refreshAuthToken() on mount.
 *
 * @module utils/tokenUtils
 * @requires jwt-decode
 */

import { jwtDecode } from "jwt-decode";

/**
 * Module-level token store. Never written to localStorage or sessionStorage.
 * Only accessible within this module via the exported helpers below.
 *
 * @type {string|null}
 */
let _accessToken = null;

/**
 * Write a new access token into memory (or clear it by passing null).
 * Called by AuthContext.setAuthData on every login, refresh, and logout.
 *
 * @param {string|null} token - The new JWT, or null to clear.
 */
export const setTokenMemory = (token) => {
  _accessToken = token ?? null;
};

/**
 * Read the access token from memory.
 *
 * Replaces the old localStorage / sessionStorage read. Returns null when
 * the user is unauthenticated or after a page refresh (before the initial
 * refresh-token exchange completes).
 *
 * @returns {string|null} The current access token, or null if not set.
 */
export const getStoredAccessToken = () => _accessToken;

/**
 * Check whether a JWT token is present and has not expired.
 *
 * Decodes the token without verification (JWTs from the server are assumed
 * to be signed and verified on the backend). The `exp` claim is compared
 * against the current Unix timestamp with a 30-second buffer to account for
 * clock skew and network latency.
 *
 * @param {string|null} token - The JWT string to validate.
 * @returns {boolean} true if the token exists and its `exp` claim is in the
 *   future (with 30s buffer).
 */
export const isTokenValid = (token) => {
  if (!token) return false;
  try {
    const decoded = jwtDecode(token);
    return decoded.exp > Date.now() / 1000 + 30;
  } catch {
    return false;
  }
};
