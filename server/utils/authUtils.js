// authUtils.js
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// Token Types
const tokenTypes = {
  ACCESS: "access",
  REFRESH: "refresh",
  REMEMBER_ME: "remember_me",
};

// Token Lifespans
const ACCESS_TOKEN_LIFESPAN = "15m";
const REFRESH_TOKEN_LIFESPAN = "1h";
const REMEMBER_ME_LIFESPAN = "30d";

const getAccessTokenSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
    console.warn(
      `WARNING: JWT_SECRET is not set in ${process.env.NODE_ENV} environment. Using a fallback.`
    );
    return "super_secret_fallback";
  }
  return secret;
};

const getRefreshTokenSecret = () => {
  const secret = process.env.REFRESH_TOKEN_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
    console.warn(
      `WARNING: JWT_SECRET is not set in ${process.env.NODE_ENV} environment. Using a fallback.`
    );
    return "super_secret_refresh_token_key";
  }
  return secret;
};

// Helper for JWT generation
const generateToken = (payload, type = tokenTypes.ACCESS, expiresIn = null) => {
  let secret;
  let finalExpiresIn = expiresIn;

  switch (type) {
    case tokenTypes.ACCESS:
      secret = getAccessTokenSecret();
      finalExpiresIn = finalExpiresIn || ACCESS_TOKEN_LIFESPAN;
      break;
    case tokenTypes.REFRESH:
      secret = getRefreshTokenSecret();
      finalExpiresIn = finalExpiresIn || REFRESH_TOKEN_LIFESPAN;
      break;
  }
  return jwt.sign(payload, secret, { expiresIn: finalExpiresIn });
};

const generateRefreshTokenString = () => {
  const tokenString = crypto.randomBytes(32).toString("hex");
  return tokenString;
};

const verifyRefreshToken = (tokenString, user) => {
  const refreshToken = user.refreshTokens.find(
    (tokenValue) => tokenValue.token === tokenString
  );
  if (refreshToken && refreshToken.expiresAt > Date.now()) {
    return refreshToken;
  } else {
    throw new Error("Invalid or expired token");
  }
};

const cleanupExpiredTokens = (user) => {
  const validTokens = user.refreshTokens.filter((token) => {
    return token.expiresAt > Date.now();
  });
  return validTokens;
};

const getTokenExpiration = (type) => {
  switch (type) {
    case tokenTypes.ACCESS:
      return ACCESS_TOKEN_LIFESPAN;
    case tokenTypes.REFRESH:
      return REFRESH_TOKEN_LIFESPAN;
    case tokenTypes.REMEMBER_ME:
      return REMEMBER_ME_LIFESPAN;
    default:
      return null;
  }
};

const getTokenLifespanMs = (type) => {
  switch (type) {
    case tokenTypes.ACCESS:
      return 15 * 60 * 1000;
    case tokenTypes.REFRESH:
      return 1 * 60 * 60 * 1000;
    case tokenTypes.REMEMBER_ME:
      return 30 * 24 * 60 * 60 * 1000;
    default:
      return null;
  }
};

module.exports = {
  tokenTypes,
  getAccessTokenSecret,
  generateToken,
  generateRefreshTokenString,
  verifyRefreshToken,
  cleanupExpiredTokens,
  getTokenExpiration,
  getTokenLifespanMs,
};
