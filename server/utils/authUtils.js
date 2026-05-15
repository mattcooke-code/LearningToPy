// utils/authUtils.js
const jwt = require("jsonwebtoken");
const config = require("../config/envConfig");
const AppError = require("./AppError");

// --- Token Lifespans ---
/**
 * Access token lifespan: 15 minutes.
 */
const ACCESS_TOKEN_LIFESPAN = "15m";

/**
 * Refresh token lifespan when "remember me" is NOT checked: 1 hour.
 */
const REFRESH_TOKEN_LIFESPAN_SESSION = "1h";

/**
 * Refresh token lifespan when "remember me" IS checked: 30 days.
 */
const REFRESH_TOKEN_LIFESPAN_REMEMBER_ME = "30d";

// --- Cookie Max Ages (milliseconds) ---
/**
 * Cookie max age for session-only refresh token: 1 hour in milliseconds.
 */
const COOKIE_MAX_AGE_SESSION = 60 * 60 * 1000;

/**
 * Cookie max age for "remember me" refresh token: 30 days in milliseconds.
 */
const COOKIE_MAX_AGE_REMEMBER_ME = 30 * 24 * 60 * 60 * 1000;

/**
 * Get the correct cookie options based on environment.
 *
 * IMPORTANT: partitioned:true requires secure:true.
 * In development (localhost), we use Lax sameSite and no partitioned.
 * In production, we use Strict sameSite with partitioned for CHIPS.
 *
 * @returns {Object} Cookie configuration object
 */
const getCookieOptions = () => {
  const isProduction = config.isProduction();

  const options = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "Strict" : "Lax",
    path: "/",
  };

  // partitioned requires secure:true (Chrome's CHIPS standard)
  if (isProduction) {
    options.partitioned = true;
  }

  return options;
};

/**
 * Common cookie options for refresh tokens (cached at module load).
 * Uses getCookieOptions() to build environment-appropriate settings.
 */
const REFRESH_COOKIE_OPTIONS = getCookieOptions();

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
 * Uses environment-appropriate cookie settings to ensure the clear
 * actually reaches the browser.
 *
 * @param {Object} res - Express response object
 */
const clearRefreshTokenCookie = (res) => {
  const cookieOptions = getCookieOptions();

  res.cookie("refreshToken", "loggedout", {
    ...cookieOptions,
    expires: new Date(Date.now() + 10 * 1000), // 10 seconds
    maxAge: undefined, // Don't set maxAge when using expires
  });
};

/**
 * Sign a JWT with a given payload, secret, and expiration.
 * @param   {Object} payload   - Data to encode in the token
 * @param   {string} secret    - Signing secret
 * @param   {string} expiresIn - Token lifespan (e.g., "15m", "1h", "30d")
 * @returns {string} Signed JWT
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
    if (err instanceof jwt.TokenExpiredError) {
      throw new AppError("Token has expired! Please log in again.", 401);
    }
    if (err instanceof jwt.JsonWebTokenError) {
      throw new AppError("Invalid token! Please log in again.", 401);
    }
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

// Age Verification GDPR
const calculateAge = (birthDate) => {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
};

const getAgeBracket = (age) => {
  if (age < 16) return "13-15";
  if (age < 18) return "16-17";
  return "18+";
};

module.exports = { calculateAge, getAgeBracket };

module.exports = {
  ACCESS_TOKEN_LIFESPAN,
  REFRESH_COOKIE_OPTIONS,
  getCookieOptions,
  getRefreshTokenSettings,
  generateToken,
  verifyToken,
  clearRefreshTokenCookie,
  getAccessTokenSecret: config.getAccessTokenSecret,
  getRefreshTokenSecret: config.getRefreshTokenSecret,
  createPasswordResetEmail,
  calculateAge,
  getAgeBracket,
};
