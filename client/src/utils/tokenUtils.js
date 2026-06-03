// /client/src/utils/tokenUtils.js
/**
 * @fileoverview JWT token helper utilities.
 *
 * Pure functions for reading and validating access tokens from browser storage
 * (localStorage / sessionStorage). Used by both the AuthContext provider and
 * the API interceptor layer.
 *
 * @module utils/tokenUtils
 * @requires jwt-decode
 */

import { jwtDecode } from "jwt-decode";

/**
 * Read the stored access token from browser storage.
 *
 * Prefers localStorage over sessionStorage when both exist — localStorage
 * indicates the user selected "Remember Me" during login.
 *
 * @returns {string|null} The access token, or null if none is stored.
 */
export const getStoredAccessToken = () => {
  return (
    localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken")
  );
};

/**
 * Check whether a JWT token is present and has not expired.
 *
 * Decodes the token without verification (JWTs from the server are assumed to
 * be signed and verified on the backend). The `exp` claim is compared against
 * the current Unix timestamp.
 *
 * @param {string|null} token - The JWT string to validate.
 * @returns {boolean} true if the token exists and its `exp` claim is in the
 *   future.
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
