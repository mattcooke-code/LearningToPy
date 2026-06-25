/**
 * LearningToPy — Express Application Entry Point
 *
 * **Middleware order (security-first):**
 * 1. Helmet — security headers (CSP, HSTS, clickjacking protection)
 * 2. CORS — cross-origin requests from frontend
 * 3. Body parser — JSON (2mb limit)
 * 4. Cookie parser — signed/unsigned cookies
 * 5. Mongo sanitize — NoSQL injection prevention
 * 6. HPP — HTTP parameter pollution protection
 * 7. Rate limiting — IP blocker → abuse detector → API limiter
 *
 * **Static assets:**
 * - /curriculum  → server/curriculum (lesson images)
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
 * - Graceful shutdown on SIGTERM/SIGINT
 * - Unhandled rejection + uncaught exception handlers with server close
 *
 * @module server
 */
if (process.env.NODE_ENV === "production") {
  require("dotenv").config({ path: ".env.production" });
} else {
  require("dotenv").config({ path: ".env.development" });
}

const path = require("path");
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
const cronRoutes = require("./routes/cron");
const progressRoutes = require("./routes/progress");
const contentRoutes = require("./routes/content");
const supportRoutes = require("./routes/support");

const app = express();

// Trust proxy (required for secure cookies behind Render's reverse proxy)
app.set("trust proxy", 1);

// ─── Security Middleware (order matters) ────────────────────────────────────

// 1. Helmet — security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'", config.getFrontendUrl()],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:", config.getFrontendUrl()],
        fontSrc: ["'self'", config.getFrontendUrl()],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    dnsPrefetchControl: { allow: false },
    frameguard: { action: "deny" },
    hidePoweredBy: true,
    hsts: config.isProduction()
      ? { maxAge: 31536000, includeSubDomains: true, preload: true }
      : false,
    ieNoOpen: true,
    noSniff: true,
    originAgentCluster: true,
    permittedCrossDomainPolicies: { permittedPolicies: "none" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    xssFilter: true,
  }),
);

// 2. CORS
app.use(
  cors({
    origin: config.getFrontendUrl(),
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "x-session-id",
      "x-device-info",
      "x-page-path",
      "X-Device-Info",
    ],
  }),
);

// 3. Body parsing — 2MB limit sufficient for API payloads
app.use(express.json({ limit: "2mb" }));

// 4. Cookie parsing
app.use(cookieParser());

// 5. NoSQL injection prevention
app.use(
  mongoSanitize({
    replaceWith: "_",
    onSanitize: ({ req, key }) => {
      console.warn(`Sanitized key: ${key} from IP: ${req.ip}`);
    },
  }),
);

// 6. HTTP parameter pollution protection
app.use(hpp({ allowlist: ["sort", "fields", "tags"] }));

// 7. Rate limiting
app.use(ipBlocker);
app.use(abuseDetector);
app.use("/api/", apiLimiter);

// ─── Static Assets ───────────────────────────────────────────────────────────

// Serve curriculum images (e.g. /curriculum/Module0_Tutorial/images/foo.png)
app.use("/curriculum", express.static(path.join(__dirname, "curriculum")));

// ─── API Routes ──────────────────────────────────────────────────────────────

app.use("/api/admin", adminRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cron", cronRoutes);
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

// Suppress browser favicon requests
app.get("/favicon.ico", (req, res) => res.status(204).end());

// ─── Error Handling ──────────────────────────────────────────────────────────

// 404 catch-all
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handler (must be last)
app.use(errorHandler);

// ─── Server Startup (DB-first) ───────────────────────────────────────────────

const PORT = config.getPort();

const startServer = async () => {
  try {
    await mongoose.connect(config.getDatabaseUri());
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1); // Cannot operate without database
  }

  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 Environment: ${config.getNodeEnv()}`);
  });

  // ─── Graceful Shutdown ─────────────────────────────────────────────────

  const gracefulShutdown = (signal) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    server.close(() => {
      console.log("HTTP server closed");
      mongoose.connection.close(false).then(() => {
        console.log("MongoDB connection closed");
        process.exit(0);
      });
    });

    // Force exit if graceful shutdown takes too long
    setTimeout(() => {
      console.error("Forced shutdown after timeout");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));

  process.on("unhandledRejection", (err) => {
    console.error("❌ Unhandled Promise Rejection:", err);
    server.close(() => process.exit(1));
  });

  process.on("uncaughtException", (err) => {
    console.error("❌ Uncaught Exception:", err);
    server.close(() => {
      console.log("Server closed due to uncaught exception");
      process.exit(1);
    });

    setTimeout(() => {
      console.error("Forced shutdown after timeout");
      process.exit(1);
    }, 10000);
  });
};

startServer();
