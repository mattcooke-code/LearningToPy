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


/**
 * Generates the HTML content for a password reset email.
 * @param {string} resetUrl - The full password reset URL with token
 * @returns {{ subject: string, html: string }} Email subject and HTML body
 */
const createPasswordResetEmail = (resetUrl) => {
  return {
    subject: "Password Reset Request",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #306998;">Reset Your Password</h2>
        <p>You are receiving this because you (or someone else) requested a password reset for your account.</p>
        <p>Click the button below to reset your password:</p>
        <a href="${resetUrl}" 
           style="display: inline-block; padding: 12px 24px; background-color: #306998; 
                  color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">
          Reset Password
        </a>
        <p>Or copy and paste this link into your browser:</p>
        <p style="background-color: #f4f4f4; padding: 10px; border-radius: 4px;">
          ${resetUrl}
        </p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <hr style="border: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #666; font-size: 12px;">
          This is an automated message, please do not reply to this email.
        </p>
      </div>
    `,
  };
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
  createPasswordResetEmail,
};
