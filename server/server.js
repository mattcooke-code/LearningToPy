/**
 * LearningToPy — Express Application Entry Point
 *
 * **Middleware order (security-first):**
 * 1. Helmet — security headers (CSP, HSTS, clickjacking protection)
 * 2. CORS — cross-origin requests from frontend
 * 3. Body parser — JSON (10mb limit)
 * 4. Cookie parser — signed/unsigned cookies
 * 5. Mongo sanitize — NoSQL injection prevention
 * 6. HPP — HTTP parameter pollution protection
 * 7. Rate limiting — IP blocker → abuse detector → API limiter
 *
 * **Route mounting:**
 * - /api/admin      → admin routes (adminOnly middleware applied)
 * - /api/analytics  → analytics routes (adminOnly)
 * - /api/auth       → public + protected auth routes
 * - /api/progress   → protected progress routes
 * - /api/content    → public content + protected submission routes
 * - /api/support    → protected support routes
 * - /api/health     → public health check
 *
 * **Error handling:**
 * - 404 catch-all for unmatched routes
 * - Global error handler (must be registered last)
 * - Unhandled rejection + uncaught exception handlers for process-level crashes
 *
 * @module server
 */
if (process.env.NODE_ENV === "production") {
  require("dotenv").config({ path: ".env.production" });
} else {
  require("dotenv").config({ path: ".env.development" });
}

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const config = require("./config/envConfig");

// Security middleware
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");

// Error handling
const AppError = require("./utils/AppError");
const { sendJsonResponse } = require("./utils/responseHelpers");
const errorHandler = require("./middleware/errorHandler");

// Security configuration
const IS_PRODUCTION = process.env.NODE_ENV === "production";

// Rate limiting
const {
  apiLimiter,
  ipBlocker,
  abuseDetector,
} = require("./middleware/rateLimiter");

// Routes
const adminRoutes = require("./routes/admin");
const analyticsRoutes = require("./routes/analytics");
const authRoutes = require("./routes/auth");
const progressRoutes = require("./routes/progress");
const contentRoutes = require("./routes/content");
const supportRoutes = require("./routes/support");

const app = express();

// Trust proxy (required for secure cookies behind reverse proxy)
app.set("trust proxy", 1);

// Security Middleware - Order matters!
// 1. Helmet - Set security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'", config.getFrontendUrl()],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for development
        imgSrc: ["'self'", "data:", "https:", config.getFrontendUrl()],
        fontSrc: ["'self'", config.getFrontendUrl()],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false, // Disable for development
    crossOriginResourcePolicy: { policy: "cross-origin" },
    dnsPrefetchControl: { allow: false },
    frameguard: { action: "deny" },
    hidePoweredBy: true,
    hsts: IS_PRODUCTION
      ? {
          maxAge: 31536000, // 1 year
          includeSubDomains: true,
          preload: true,
        }
      : false, // Disable HSTS in development
    ieNoOpen: true,
    noSniff: true,
    originAgentCluster: true,
    permittedCrossDomainPolicies: { permittedPolicies: "none" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    xssFilter: true,
  }),
);

// 2. CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "x-session-id", // ✅ Add this - the missing header
      "x-device-info", // Match the error message exactly
      "x-page-path", // Safe to lowercase this too
      "X-Device-Info", // Keeping the uppercase version doesn't hurt
    ],
  }),
);

// 3. Body parsing
app.use(express.json({ limit: "10mb" }));

// 4. Cookie parsing with secure defaults
app.use(cookieParser());

// 5. Data sanitization against NoSQL query injection
app.use(
  mongoSanitize({
    replaceWith: "_", // Replace prohibited characters with underscore
    onSanitize: ({ req, key }) => {
      console.warn(`Sanitized key: ${key} from IP: ${req.ip}`);
    },
  }),
);

// 6. Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      // Add any parameters that are allowed to be arrays
      "sort",
      "fields",
      "tags",
    ],
  }),
);

// 7. Rate limiting
app.use(ipBlocker); // Check if IP is blocked first
app.use(abuseDetector); // Detect suspicious patterns
app.use("/api/", apiLimiter); // Apply general API rate limiting

// Database
const connectDB = async () => {
  try {
    await mongoose.connect(config.getDatabaseUri());
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    console.log("⚠️  Continuing without database connection...");
  }
};

connectDB();

// TEMPORARY DEBUG ROUTE - Remove after fixing
app.get("/api/debug/image-paths", (req, res) => {
  const path = require("path");
  const fs = require("fs");

  const debugInfo = {
    cwd: process.cwd(),
    dirname: __dirname,
    env: process.env.NODE_ENV,
    renderEnv: !!process.env.RENDER,
    testPaths: {},
  };

  // Test if curriculum folder exists
  const curriculumPath = path.join(__dirname, "curriculum");
  try {
    const curriculumExists = fs.existsSync(curriculumPath);
    debugInfo.curriculumExists = curriculumExists;

    if (curriculumExists) {
      const modules = fs.readdirSync(curriculumPath);
      debugInfo.modules = modules;

      // Check first module's images
      if (modules.length > 0) {
        const firstModulePath = path.join(curriculumPath, modules[0]);
        const moduleContents = fs.readdirSync(firstModulePath);
        debugInfo.moduleContents = moduleContents;

        const imagesPath = path.join(firstModulePath, "images");
        if (fs.existsSync(imagesPath)) {
          debugInfo.testPaths[modules[0]] = {
            imagesPath,
            files: fs.readdirSync(imagesPath),
          };
        }
      }
    }
  } catch (error) {
    debugInfo.error = error.message;
  }

  res.json(debugInfo);
});

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/support", supportRoutes);

// Health check
app.get("/api/health", (req, res) => {
  sendJsonResponse(res, 200, "OK", {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
  });
});

// Favicon
app.get("/favicon.ico", (req, res) => res.status(204).end());

// 404 handler
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handler (MUST be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📝 Environment: ${config.getNodeEnv()}`);
});

// Handle process-level errors
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Promise Rejection:", err);
  server.close(() => process.exit(1));
});

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});
