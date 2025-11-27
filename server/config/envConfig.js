// server/config/envConfig.js
const getNodeEnv = () => process.env.NODE_ENV || "development";
const isProduction = () => getNodeEnv() === "production";
const isDevelopment = () => getNodeEnv() === "development";
const isTest = () => getNodeEnv() === "test";

// --- Seeding Configuration ---
const getSeedConfig = () => {
  // Default configuration
  const defaults = {
    clearData: isDevelopment(), // Clear in dev, keep in prod by default
    batchSize: 5,
    modules: null, // null = all modules
    dryRun: false,
    maxExecutionTime: 300000, // 5 minutes
  };

  // Override with environment variables if present¬
  return {
    clearData:
      process.env.SEED_CLEAR_DATA !== undefined
        ? process.env.SEED_CLEAR_DATA === "true"
        : defaults.clearData,

    batchSize: process.env.SEED_BATCH_SIZE
      ? parseInt(process.env.SEED_BATCH_SIZE)
      : defaults.batchSize,

    modules: process.env.SEED_MODULES
      ? process.env.SEED_MODULES.split(",")
          .map((range) => {
            if (range.includes("-")) {
              const [start, end] = range.split("-").map(Number);
              return Array.from(
                { length: end - start + 1 },
                (_, i) => start + i
              );
            }
            return [parseInt(range)];
          })
          .flat()
      : defaults.modules,

    dryRun: process.env.SEED_DRY_RUN === "true",
    maxExecutionTime: process.env.SEED_MAX_TIME
      ? parseInt(process.env.SEED_MAX_TIME)
      : defaults.maxExecutionTime,
  };
};

// --- Validation (Enhanced for Seeding) ---
const validateSecrets = () => {
  if (!isProduction()) return true;

  const required = ["JWT_SECRET", "REFRESH_TOKEN_SECRET", "MONGODB_URI"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(
      `CRITICAL: Missing required environment variables: ${missing.join(", ")}`
    );
    process.exit(1);
  }

  // Check for weak secrets in production
  if (isProduction()) {
    const weakSecrets = [];
    if (process.env.JWT_SECRET === "your-super-secret-production-jwt-key") {
      weakSecrets.push("JWT_SECRET");
    }
    if (process.env.REFRESH_TOKEN_SECRET === "super_secret_refresh_token_key") {
      weakSecrets.push("REFRESH_TOKEN_SECRET");
    }
    if (weakSecrets.length > 0) {
      console.error(
        `❌ SECURITY: Default secrets detected: ${weakSecrets.join(", ")}`
      );
      process.exit(1);
    }
  }

  // Additional production seeding safety
  if (isProduction() && process.env.SEED_CLEAR_DATA === "true") {
    console.error(
      "❌ SAFETY: Cannot clear data in production without explicit override"
    );
    console.error("   Use: SEED_CLEAR_OVERRIDE=true npm run seed");
    process.exit(1);
  }

  return true;
};

// Initialize validation
validateSecrets();

// --- Existing Getters (unchanged) ---
const getAccessTokenSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret && !isProduction()) {
    console.warn("⚠️ WARNING: JWT_SECRET not set, using fallback.");
    return "super-secret-fallback";
  }
  return secret;
};

const getRefreshTokenSecret = () => {
  const secret = process.env.REFRESH_TOKEN_SECRET;
  if (!secret && !isProduction()) {
    console.warn("⚠️ WARNING: REFRESH_TOKEN_SECRET not set, using fallback.");
    return "super_secret_refresh_token_fallback";
  }
  return secret;
};

const getFrontendUrl = () =>
  process.env.FRONTEND_URL || "http://localhost:5173";
const getPort = () => process.env.PORT || 5000;
const getDatabaseUri = () =>
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/learning-to-py";

// Convenience getters for common seeding scenarios
const shouldClearDataOnSeed = () => getSeedConfig().clearData;
const getSeedBatchSize = () => getSeedConfig().batchSize;
const getModulesToSeed = () => getSeedConfig().modules;
const isDryRun = () => getSeedConfig().dryRun;

module.exports = {
  getNodeEnv,
  isProduction,
  isDevelopment,
  isTest,
  getFrontendUrl,
  getPort,
  getDatabaseUri,
  getAccessTokenSecret,
  getRefreshTokenSecret,

  // Seeding-specific exports
  getSeedConfig,
  shouldClearDataOnSeed,
  getSeedBatchSize,
  getModulesToSeed,
  isDryRun,
};
