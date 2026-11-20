// utils/authUtils.js
const jwt = require("jsonwebtoken");
const config = require("../config/envConfig");
const authConstants = require("../constants/authConstants");
const AppError = require("./AppError");

/**
 * Generates environment-specific cookie configurations.
 */
const getCookieOptions = () => {
  const isProduction = config.isProduction();
  const options = {
    httpOnly: true,
    secure: isProduction,
    sameSite: "Lax",
    path: "/",
  };

  if (isProduction) {
    options.domain = config.getCookieDomain();
  }
  return options;
};

/**
 * Get token lifespan and cookie max age based on "remember me" preference.
 * @param   {boolean} rememberMe - Whether the user checked "remember me"
 * @returns {{ tokenLifespan: string, cookieMaxAge: number }}
 */
const getRefreshTokenSettings = (rememberMe) => {
  return {
    tokenLifespan: rememberMe
      ? authConstants.REFRESH_TOKEN_LIFESPAN_REMEMBER_ME
      : authConstants.REFRESH_TOKEN_LIFESPAN_SESSION,
    cookieMaxAge: rememberMe
      ? authConstants.COOKIE_MAX_AGE_REMEMBER_ME
      : authConstants.COOKIE_MAX_AGE_SESSION,
  };
};

/**
 * Set the refresh token cookie. Single source of truth for cookie writes.
 */
const setRefreshTokenCookie = (res, token, maxAge) => {
  res.cookie("refreshToken", token, { ...getCookieOptions(), maxAge });
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

/**
 * Issue an access + refresh token pair and set the refresh cookie.
 * Returns the access token for the JSON response body.
 */
const issueTokenPair = (res, user, rememberMe = false) => {
  const accessToken = generateToken(
    { id: user._id, username: user.username, isAdmin: user.isAdmin },
    config.getAccessTokenSecret(),
    authConstants.ACCESS_TOKEN_LIFESPAN,
  );

  const { tokenLifespan, cookieMaxAge } = getRefreshTokenSettings(!!rememberMe);

  const refreshToken = generateToken(
    {
      id: user._id,
      refreshTokenVersion: user.refreshTokenVersion,
      rememberMe: !!rememberMe,
    },
    config.getRefreshTokenSecret(),
    tokenLifespan,
  );

  setRefreshTokenCookie(res, refreshToken, cookieMaxAge);
  return accessToken;
};

/**
 * Standardize user object returned upon authentication.
 * @param   {Object} user - Mongoose user document
 * @returns {Object} Sanitized user profile object
 */
const toAuthUser = (user) => ({
  _id: user._id,
  id: user._id, // legacy alias; drop once the client only uses _id
  username: user.username,
  isAdmin: user.isAdmin,
  streak: user.streak,
  streakLastCheckedDate: user.streakLastCheckedDate,
  ageBracket: user.ageBracket,
  privacySettings: user.privacySettings,
});

module.exports = {
  getCookieOptions,
  getRefreshTokenSettings,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  generateToken,
  verifyToken,
  issueTokenPair,
  toAuthUser,
  getAccessTokenSecret: config.getAccessTokenSecret,
  getRefreshTokenSecret: config.getRefreshTokenSecret,
};
