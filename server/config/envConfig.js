// config/envConfig.js

const getNodeEnv = () => process.env.NODE_ENV || "development";
const isProduction = () => getNodeEnv() === "production";

// --- Validation ---
const validateSecrets = () => {
  // Only perform critical check in production
  if (!isProduction()) return true;

  const required = ["JWT_SECRET", "REFRESH_TOKEN_SECRET", "MONGODB_URI"];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(
      `CRITICAL: Missing required environment variables in production: ${missing.join(
        ", "
      )}`
    );
    // Exiting is standard practice for missing production secrets
    process.exit(1);
  }
  return true;
};

// Initialize validation when this module loads
validateSecrets();

// --- Getters for Use Across the Application ---
const getAccessTokenSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret && !isProduction()) {
    console.warn("⚠️ WARNING: JWT_SECRET not set, using fallback.");
    return "super-secret-fallback"; // Safe fallback for non-production environments
  }
  return secret;
};

const getRefreshTokenSecret = () => {
  const secret = process.env.REFRESH_TOKEN_SECRET;
  if (!secret && !isProduction()) {
    console.warn("⚠️ WARNING: REFRESH_TOKEN_SECRET not set, using fallback.");
    return "super_secret_refresh_token_fallback"; // Safe fallback for non-production environments
  }
  return secret;
};

const getFrontendUrl = () =>
  process.env.FRONTEND_URL || "http://localhost:5173";
const getPort = () => process.env.PORT || 5000;
const getDatabaseUri = () =>
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/learning-to-py";

module.exports = {
  getNodeEnv,
  isProduction,
  getFrontendUrl,
  getPort,
  getDatabaseUri,
  getAccessTokenSecret,
  getRefreshTokenSecret,
};
