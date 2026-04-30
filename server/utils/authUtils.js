// authUtils.js
const jwt = require("jsonwebtoken");
const config = require("../config/envConfig");
const AppError = require("./AppError");

// --- Token Lifespans ---
const ACCESS_TOKEN_LIFESPAN = "15m";
const REFRESH_TOKEN_LIFESPAN_SESSION = "1h";
const REFRESH_TOKEN_LIFESPAN_REMEMBER_ME = "30d";

// --- Cookie Max Ages (milliseconds) ---
const COOKIE_MAX_AGE_SESSION = 60 * 60 * 1000; // 1 hour
const COOKIE_MAX_AGE_REMEMBER_ME = 30 * 24 * 60 * 60 * 1000; // 30 days

// Common cookie options for refresh tokens
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
  secure: IS_PRODUCTION, // Requires HTTPS in production
  sameSite: "Strict", // Strict CSRF protection (was "Lax")
  path: "/",
  partitioned: true, // CHIPS (Cookies Having Independent Partitioned State) for privacy
};

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

// Helper to clear refresh token cookie (using the name 'refreshToken')
const clearRefreshTokenCookie = (res) => {
  res.cookie("refreshToken", "loggedout", {
    httpOnly: true,
    expires: new Date(Date.now() + 10 * 1000),
    secure: REFRESH_COOKIE_OPTIONS.secure,
    sameSite: REFRESH_COOKIE_OPTIONS.sameSite,
    path: REFRESH_COOKIE_OPTIONS.path,
  });
};

// Helper for JWT generation (takes payload, secret, expiresIn)
const generateToken = (payload, secret, expiresIn) => {
  return jwt.sign(payload, secret, { expiresIn });
};

// Helper for JWT verification (takes token, secret)
const verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new AppError("Token has expired! Please log in again.", 401);
    }
    if (err instanceof jwt.JsonWebTokenError) {
      throw new AppError("Invalid token! Please log in again.", 401);
    }
    // For any other unexpected errors during verification
    throw new AppError("Token verification failed unexpectedly.", 500);
  }
};

module.exports = {
  ACCESS_TOKEN_LIFESPAN,
  REFRESH_COOKIE_OPTIONS,
  getRefreshTokenSettings,
  generateToken,
  verifyToken,
  clearRefreshTokenCookie,
  getAccessTokenSecret: config.getAccessTokenSecret,
  getRefreshTokenSecret: config.getRefreshTokenSecret,
};
