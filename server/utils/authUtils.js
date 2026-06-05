// utils/authUtils.js
const jwt = require("jsonwebtoken");
const config = require("../config/envConfig");
const AppError = require("./AppError");

// --- Configuration Constants ---
const ACCESS_TOKEN_LIFESPAN = "15m";
const REFRESH_TOKEN_LIFESPAN_SESSION = "1h";
const REFRESH_TOKEN_LIFESPAN_REMEMBER_ME = "30d";

const COOKIE_MAX_AGE_SESSION = 60 * 60 * 1000;
const COOKIE_MAX_AGE_REMEMBER_ME = 30 * 24 * 60 * 60 * 1000;

/**
 * Generates environment-specific cookie configurations.
 */
const getCookieOptions = () => {
  const isProduction = config.isProduction();
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "Strict" : "Lax",
    path: "/",
    ...(isProduction && { partitioned: true }),
  };
};

/**
 * Get token lifespan and cookie max age based on "remember me" preference.
 * @param   {boolean} rememberMe - Whether the user checked "remember me"
 * @returns {{ tokenLifespan: string, cookieMaxAge: number }}
 */
const getRefreshTokenSettings = (rememberMe) => {
  return {
    tokenLifespan: rememberMe
      ? REFRESH_TOKEN_LIFESPAN_REMEMBER_ME
      : REFRESH_TOKEN_LIFESPAN_SESSION,
    cookieMaxAge: rememberMe
      ? COOKIE_MAX_AGE_REMEMBER_ME
      : COOKIE_MAX_AGE_SESSION,
  };
};

/**
 * Overwrite the refresh token cookie with an expired placeholder.
 * Called on logout, invalid token detection, or account blocking.
 */
const clearRefreshTokenCookie = (res) => {
  const { maxAge, ...options } = getCookieOptions();
  res.clearCookie("refreshToken", options);
};

/**
 * Sign a JWT with a given payload, secret, and expiration.
 */
const generateToken = (payload, secret, expiresIn) => {
  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Verify and decode a JWT. Throws AppError on expiration or invalid signature.
 * @param   {string} token  - JWT to verify
 * @param   {string} secret - Signing secret
 * @returns {Object} Decoded payload
 * @throws  {AppError} 401 - Token expired or invalid
 * @throws  {AppError} 500 - Unexpected verification failure
 */
const verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (err) {
    if (
      err instanceof jwt.TokenExpiredError ||
      err instanceof jwt.JsonWebTokenError
    ) {
      throw new AppError("Authentication failed. Please log in again.", 401);
    }
    throw new AppError("Token verification failed unexpectedly.", 500);
  }
};

module.exports = {
  ACCESS_TOKEN_LIFESPAN,
  getCookieOptions,
  getRefreshTokenSettings,
  generateToken,
  verifyToken,
  clearRefreshTokenCookie,
  getAccessTokenSecret: config.getAccessTokenSecret,
  getRefreshTokenSecret: config.getRefreshTokenSecret,
};
