/**
 * Rate Limiting Middleware
 *
 * Tiered rate limiting tuned for a gamified Python learning site.
 *
 * Limiter summary:
 * - `apiLimiter`:              100 req / 1 min  — general API; keyed by user ID when authenticated
 * - `authLimiter`:             10 attempts / 15 min — login, register (keyed by IP+email)
 * - `passwordResetLimiter`:    5 attempts / 1 hour
 * - `contentCreationLimiter`:  20 submissions / 1 hour — exercise/quiz submissions
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
 */

const rateLimit = require("express-rate-limit");
const config = require("../config/envConfig");

const blockedIPs = new Map();

/**
 * Check if an IP address is currently blocked.
 */
const isIPBlocked = (ip) => {
  const blockData = blockedIPs.get(ip);
  if (!blockData) return false;

  if (Date.now() > blockData.expiresAt) {
    blockedIPs.delete(ip);
    return false;
  }

  return true;
};

/**
 * Block an IP address for a specified duration.
 */
const blockIP = (ip, durationMinutes = 60) => {
  blockedIPs.set(ip, {
    blockedAt: Date.now(),
    expiresAt: Date.now() + durationMinutes * 60 * 1000,
  });
};

/**
 * Check if the requesting user is an admin.
 * Relies on auth middleware having run first.
 */
const isAdmin = (req) => {
  return req.user?.isAdmin === true;
};

/**
 * General API rate limiter
 *
 * 100 requests per minute is generous for human browsing (even a busy lesson
 * page with 20 concurrent API calls on load leaves 80 in reserve). Keyed by
 * user ID for authenticated users so shared IPs (schools, offices) don't
 * cause false positives.
 */
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
    // Authenticated users keyed by user ID — more accurate than IP alone
    return req.user?._id?.toString() || req.ip;
  },
  skip: (req) => {
    if (config.isDevelopment() && req.path === "/api/health") return true;
    if (isAdmin(req)) return true;
    return false;
  },
});

/**
 * Lesson interaction rate limiter
 *
 * Covers quiz answers, exercise submissions, progress saves, and lesson
 * navigation events. 120/min gives a 15-question quiz plus generous room
 * for rapid re-submissions and page fetches without ever being the
 * bottleneck for a legitimate user session.
 */
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

/**
 * Authentication rate limiter
 *
 * 10 attempts per 15 minutes, keyed by IP+email so that a single IP
 * brute-forcing multiple accounts is still caught, while a user on a
 * shared IP isn't penalised for other people's failed attempts.
 * Successful logins do not count toward the limit.
 */
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

/**
 * Password reset rate limiter
 *
 * 5 per hour is intentionally strict — password reset is a common
 * account-takeover vector. Users rarely need more than 2 genuine attempts.
 */
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

/**
 * Content / submission rate limiter
 *
 * Covers exercise submissions and quiz completions. 20 per hour is enough
 * for a productive learning session (a module quiz is 15 questions, leaving
 * 5 for retries or other submissions) while preventing automated flooding.
 * Keyed by user ID so it's per-learner, not per-IP.
 */
const contentCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
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

/**
 * Admin action rate limiter
 *
 * 200 actions per minute gives the admin dashboard plenty of headroom for
 * bulk operations. This is the one limiter that admins are NOT exempt from —
 * it acts as a safety net against accidental runaway scripts on admin routes.
 */
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

/**
 * IP blocker middleware
 * Always runs first. Never blocks authenticated admins.
 */
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

/**
 * Abuse detector middleware
 *
 * Tracks request counts per IP over a 1-minute sliding window. If a single
 * IP exceeds 300 requests in that window it is blocked for 1 hour. 300 is
 * well above any realistic human session (even a heavy lesson page with 20
 * concurrent API calls on load = ~20 req/page visit) while still catching
 * bots and scrapers. Admins are always exempt.
 */
const abuseDetector = (req, res, next) => {
  if (isAdmin(req)) return next();

  const ip = req.ip;
  const now = Date.now();

  if (!global.requestTracker) {
    global.requestTracker = new Map();
  }

  const tracker = global.requestTracker.get(ip) || {
    count: 0,
    firstRequest: now,
    lastRequest: now,
  };

  if (now - tracker.firstRequest > 60 * 1000) {
    tracker.count = 0;
    tracker.firstRequest = now;
  }

  tracker.count++;
  tracker.lastRequest = now;
  global.requestTracker.set(ip, tracker);

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

/**
 * Factory for creating one-off rate limiters on specific routes.
 */
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

// Clean up stale request tracker entries every 5 minutes
setInterval(
  () => {
    if (global.requestTracker) {
      const now = Date.now();
      for (const [ip, data] of global.requestTracker.entries()) {
        if (now - data.lastRequest > 5 * 60 * 1000) {
          global.requestTracker.delete(ip);
        }
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
