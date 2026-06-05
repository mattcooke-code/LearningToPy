// middleware/rateLimiter.js
const rateLimit = require("express-rate-limit");
const config = require("../config/envConfig");

/**
 * Rate Limiting Middleware
 *
 * Tiered rate limiting tuned for a gamified Python learning site.
 *
 * Limiter summary:
 * - `apiLimiter`:              100 req / 1 min  — general API; keyed by user ID when authenticated
 * - `authLimiter`:             10 attempts / 15 min — login, register (keyed by IP+email)
 * - `passwordResetLimiter`:    5 attempts / 1 hour
 * - `contentCreationLimiter`:  60 submissions / 1 hour — exercise/quiz submissions (bumped from 20)
 * - `adminActionLimiter`:      200 actions / 1 min — safety net for admin routes
 * - `lessonInteractionLimiter`:120 req / 1 min — quiz answers, progress saves, lesson nav
 *
 * IP blocking: >300 requests in 1 minute from a single IP triggers a 1-hour block.
 *
 * Admin exemptions:
 * Admins are exempt from apiLimiter, lessonInteractionLimiter, ipBlocker,
 * and abuseDetector. adminActionLimiter still applies as a safety net.
 *
 * IMPORTANT — registration order in server.js:
 * 1. `ipBlocker`      — reject known bad IPs first
 * 2. `abuseDetector`  — detect and block suspicious burst patterns
 * 3. Per-route limiters — apply specific limits to sensitive endpoints
 *
 * NOTE: Ensure your auth middleware runs BEFORE these limiters so that
 * req.user is populated when the admin-skip checks execute.
 *
 * LIMITATION: blockedIPs and requestTracker are stored in process memory.
 * In a multi-process deployment (PM2 cluster, multiple dynos), each process
 * maintains its own state. For single-instance deployments (current), this
 * works correctly. For horizontal scaling, migrate to Redis.
 */

// ── In-Memory Stores ──────────────────────────────────────────
// NOTE: Replace with Redis for multi-process deployments
const blockedIPs = new Map();
const requestTracker = new Map();

// Maximum tracked IPs before eviction (prevents memory exhaustion under DDoS)
const MAX_TRACKED_IPS = 10000;

// ── Helpers ────────────────────────────────────────────────────

const isIPBlocked = (ip) => {
  const blockData = blockedIPs.get(ip);
  if (!blockData) return false;

  if (Date.now() > blockData.expiresAt) {
    blockedIPs.delete(ip);
    return false;
  }

  return true;
};

const blockIP = (ip, durationMinutes = 60) => {
  blockedIPs.set(ip, {
    blockedAt: Date.now(),
    expiresAt: Date.now() + durationMinutes * 60 * 1000,
  });
};

const isAdmin = (req) => {
  return req.user?.isAdmin === true;
};

/**
 * Evict oldest entries from requestTracker if it exceeds the size cap.
 * Called before inserting new entries to prevent unbounded growth.
 */
const evictOldestIfNeeded = () => {
  if (requestTracker.size >= MAX_TRACKED_IPS) {
    const entries = [...requestTracker.entries()].sort(
      (a, b) => a[1].lastRequest - b[1].lastRequest,
    );
    // Remove oldest 25%
    const removeCount = Math.floor(MAX_TRACKED_IPS * 0.25);
    entries.slice(0, removeCount).forEach(([ip]) => requestTracker.delete(ip));
  }
};

// ── Rate Limiters ──────────────────────────────────────────────

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many requests. Please slow down.",
    retryAfter: 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    res.status(429).json(options.message);
  },
  keyGenerator: (req) => {
    return req.user?._id?.toString() || req.ip;
  },
  skip: (req) => {
    if (config.isDevelopment() && req.path === "/api/health") return true;
    if (isAdmin(req)) return true;
    return false;
  },
});

const lessonInteractionLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  message: {
    success: false,
    message: "You're going too fast! Take a breath and try again.",
    retryAfter: 10,
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    res.status(429).json(options.message);
  },
  keyGenerator: (req) => {
    return req.user?._id?.toString() || req.ip;
  },
  skip: (req) => {
    if (isAdmin(req)) return true;
    return false;
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Too many login attempts. Please try again after 15 minutes.",
    retryAfter: 15 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    res.status(429).json(options.message);
  },
  skipSuccessfulRequests: true,
  keyGenerator: (req) => {
    const email =
      req.body.email || req.body.credential || req.body.username || "";
    return req.ip + (email ? `-${email.toLowerCase()}` : "");
  },
});

const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many password reset attempts. Please try again after 1 hour.",
    retryAfter: 60 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    res.status(429).json(options.message);
  },
});

const contentCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 60, // Bumped from 20 — 15-question quiz + retries shouldn't hit this
  message: {
    success: false,
    message:
      "You've reached the submission limit for this hour. Take a short break and try again soon.",
    retryAfter: 60 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    res.status(429).json(options.message);
  },
  keyGenerator: (req) => {
    return req.user?._id?.toString() || req.ip;
  },
  skip: (req) => {
    if (isAdmin(req)) return true;
    return false;
  },
});

const adminActionLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  message: {
    success: false,
    message: "Admin action limit reached. Please slow down slightly.",
    retryAfter: 5,
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    res.status(429).json(options.message);
  },
  skip: (req) => {
    if (req.path === "/api/health") return true;
    return false;
  },
});

// ── IP Blocker ─────────────────────────────────────────────────

const ipBlocker = (req, res, next) => {
  if (isAdmin(req)) return next();

  if (isIPBlocked(req.ip)) {
    return res.status(403).json({
      success: false,
      message:
        "This IP address has been temporarily blocked due to suspicious activity.",
    });
  }
  next();
};

// ── Abuse Detector ─────────────────────────────────────────────

const abuseDetector = (req, res, next) => {
  if (isAdmin(req)) return next();

  const ip = req.ip;
  const now = Date.now();

  const tracker = requestTracker.get(ip) || {
    count: 0,
    firstRequest: now,
    lastRequest: now,
  };

  // Reset window if expired
  if (now - tracker.firstRequest > 60 * 1000) {
    tracker.count = 0;
    tracker.firstRequest = now;
  }

  tracker.count++;
  tracker.lastRequest = now;

  // Evict before inserting to prevent unbounded growth
  if (!requestTracker.has(ip)) {
    evictOldestIfNeeded();
  }
  requestTracker.set(ip, tracker);

  if (tracker.count > 300) {
    blockIP(ip, 60);
    console.warn(
      `🚫 IP ${ip} blocked for suspected abuse: ${tracker.count} requests in 1 minute`,
    );
    return res.status(403).json({
      success: false,
      message: "Suspicious activity detected. IP temporarily blocked.",
    });
  }

  next();
};

// ── Factory ────────────────────────────────────────────────────

const createRateLimiter = (options) => {
  const defaultOptions = {
    windowMs: 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: "Too many requests, please try again later.",
      retryAfter: 60,
    },
    handler: (req, res, next, options) => {
      res.status(429).json(options.message);
    },
  };

  return rateLimit({ ...defaultOptions, ...options });
};

// ── Cleanup ────────────────────────────────────────────────────

// Clean up stale entries every 5 minutes
setInterval(
  () => {
    const now = Date.now();
    for (const [ip, data] of requestTracker.entries()) {
      if (now - data.lastRequest > 5 * 60 * 1000) {
        requestTracker.delete(ip);
      }
    }
    // Also clean expired blocks
    for (const [ip, data] of blockedIPs.entries()) {
      if (now > data.expiresAt) {
        blockedIPs.delete(ip);
      }
    }
  },
  5 * 60 * 1000,
);

module.exports = {
  apiLimiter,
  authLimiter,
  passwordResetLimiter,
  contentCreationLimiter,
  adminActionLimiter,
  lessonInteractionLimiter,
  ipBlocker,
  createRateLimiter,
  abuseDetector,
  isIPBlocked,
  blockIP,
};
