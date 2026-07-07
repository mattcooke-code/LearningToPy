// server/config/envConfig.js

// ─── Environment ─────────────────────────────────────────────────────────────

const getNodeEnv = () => process.env.NODE_ENV || "development";
const isProduction = () => getNodeEnv() === "production";
const isDevelopment = () => getNodeEnv() === "development";
const isTest = () => getNodeEnv() === "test";

// ─── Validation ──────────────────────────────────────────────────────────────

/**
 * Warns about missing required environment variables in production.
 * Does NOT call process.exit — a missing var should surface in logs,
 * not take down the whole server on startup.
 */
const validateSecrets = () => {
  if (!isProduction()) return true;

  const required = ["JWT_SECRET", "REFRESH_TOKEN_SECRET", "MONGODB_URI"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.warn(
      `⚠️  WARNING: Missing environment variables: ${missing.join(", ")}`,
    );
  }

  return missing.length === 0;
};

// Run validation on module load so it appears near the top of startup logs
validateSecrets();

// ─── Server ──────────────────────────────────────────────────────────────────

const getFrontendUrl = () =>
  process.env.FRONTEND_URL || "http://localhost:5173";

const getPort = () => process.env.PORT || 5000;

const getDatabaseUri = () =>
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/learning-to-py";

// ─── Auth ────────────────────────────────────────────────────────────────────

const getAccessTokenSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret && !isProduction()) {
    console.warn("⚠️  JWT_SECRET not set, using development fallback.");
    return "super-secret-fallback";
  }
  return secret;
};

const getRefreshTokenSecret = () => {
  const secret = process.env.REFRESH_TOKEN_SECRET;
  if (!secret && !isProduction()) {
    console.warn(
      "⚠️  REFRESH_TOKEN_SECRET not set, using development fallback.",
    );
    return "super_secret_refresh_token_fallback";
  }
  return secret;
};

// ─── Email ───────────────────────────────────────────────────────────────────

// ─── Email ───────────────────────────────────────────────────────────────────

const getEmailUser = () => {
  const user = process.env.EMAIL_USER;
  if (!user && isProduction()) {
    console.warn("⚠️  EMAIL_USER not set in production.");
  }
  return user || (isDevelopment() ? "dev@example.com" : undefined);
};

const getEmailFromName = () => process.env.EMAIL_FROM_NAME || "Learning To Py";

const getEmailFromAddress = () =>
  process.env.EMAIL_FROM_ADDRESS || getEmailUser();

const getEmailFrom = () => {
  const name = getEmailFromName();
  const address = getEmailFromAddress() || "onboarding@resend.dev";
  return `"${name}" <${address}>`;
};

const getSupportEmail = () => process.env.SUPPORT_EMAIL || getEmailUser();

// ─── Seeding ─────────────────────────────────────────────────────────────────

const getSeedConfig = () => {
  const defaults = {
    clearData: isDevelopment(), // Safe default: only clear in dev
    batchSize: 5,
    modules: null, // null = all modules
    dryRun: false,
    maxExecutionTime: 300000, // 5 minutes
  };

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
                (_, i) => start + i,
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

const shouldClearDataOnSeed = () => getSeedConfig().clearData;
const getSeedBatchSize = () => getSeedConfig().batchSize;
const getModulesToSeed = () => getSeedConfig().modules;
const isDryRun = () => getSeedConfig().dryRun;

// ─── Exports ─────────────────────────────────────────────────────────────────

module.exports = {
  // Environment
  getNodeEnv,
  isProduction,
  isDevelopment,
  isTest,

  // Server
  getFrontendUrl,
  getPort,
  getDatabaseUri,

  // Auth
  getAccessTokenSecret,
  getRefreshTokenSecret,

  // Email
  getEmailUser,
  getEmailFrom,
  getEmailFromName,
  getEmailFromAddress,
  getSupportEmail,

  // Seeding
  getSeedConfig,
  shouldClearDataOnSeed,
  getSeedBatchSize,
  getModulesToSeed,
  isDryRun,
};
