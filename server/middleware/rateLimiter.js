/**
 * Rate Limiting Middleware
 * Provides comprehensive rate limiting for API security
 */

const rateLimit = require('express-rate-limit');
const config = require('../config/envConfig');

// Store for tracking blocked IPs (in production, use Redis)
const blockedIPs = new Map();

/**
 * Check if IP is currently blocked
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
 * Block an IP for a specified duration
 */
const blockIP = (ip, durationMinutes = 30) => {
  blockedIPs.set(ip, {
    blockedAt: Date.now(),
    expiresAt: Date.now() + (durationMinutes * 60 * 1000)
  });
};

/**
 * Standard API rate limiter
 * General API requests: 100 requests per 15 minutes
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: 15 * 60 // seconds
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res, next, options) => {
    res.status(429).json(options.message);
  },
  skip: (req) => {
    // Skip rate limiting for health checks and development
    if (config.isDevelopment() && req.path === '/api/health') {
      return true;
    }
    return false;
  }
});

/**
 * Strict authentication rate limiter
 * Login/register/forgot-password: 5 attempts per 15 minutes
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP, please try again after 15 minutes.',
    retryAfter: 15 * 60 // seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    res.status(429).json(options.message);
  },
  skipSuccessfulRequests: true, // Don't count successful requests
  keyGenerator: (req) => {
    // Use IP + email combination for more accurate tracking
    const email = req.body.email || req.body.credential || req.body.username || '';
    return req.ip + (email ? `-${email.toLowerCase()}` : '');
  }
});

/**
 * Password reset rate limiter
 * Stricter limit for sensitive operations: 3 attempts per hour
 */
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset attempts per hour
  message: {
    success: false,
    message: 'Too many password reset attempts from this IP, please try again after 1 hour.',
    retryAfter: 60 * 60 // seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    res.status(429).json(options.message);
  }
});

/**
 * Content creation rate limiter
 * Prevent spam: 10 posts per hour
 */
const contentCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 content creation requests per hour
  message: {
    success: false,
    message: 'Content creation limit reached. Please try again later.',
    retryAfter: 60 * 60 // seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    res.status(429).json(options.message);
  },
  keyGenerator: (req) => {
    // Use user ID if authenticated, otherwise IP
    return req.user ? req.user._id.toString() : req.ip;
  }
});

/**
 * Admin action rate limiter
 * Prevent accidental mass operations: 20 admin actions per hour
 */
const adminActionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 admin actions per hour
  message: {
    success: false,
    message: 'Admin action limit reached. Please slow down your operations.',
    retryAfter: 60 * 60 // seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    res.status(429).json(options.message);
  }
});

/**
 * IP blocker middleware
 * Checks if IP is in the blocked list
 */
const ipBlocker = (req, res, next) => {
  if (isIPBlocked(req.ip)) {
    return res.status(403).json({
      success: false,
      message: 'This IP address has been temporarily blocked due to suspicious activity.'
    });
  }
  next();
};

/**
 * Create custom rate limiter
 * Factory function for creating rate limiters with custom settings
 */
const createRateLimiter = (options) => {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many requests, please try again later.',
      retryAfter: 15 * 60
    },
    handler: (req, res, next, options) => {
      res.status(429).json(options.message);
    }
  };
  
  return rateLimit({ ...defaultOptions, ...options });
};

/**
 * Suspected abuse handler
 * Automatically block IPs that show suspicious patterns
 */
const abuseDetector = (req, res, next) => {
  // Count rapid requests from same IP
  const ip = req.ip;
  const now = Date.now();
  
  if (!global.requestTracker) {
    global.requestTracker = new Map();
  }
  
  const tracker = global.requestTracker.get(ip) || { count: 0, firstRequest: now, lastRequest: now };
  
  // Reset if window passed (1 minute)
  if (now - tracker.firstRequest > 60 * 1000) {
    tracker.count = 0;
    tracker.firstRequest = now;
  }
  
  tracker.count++;
  tracker.lastRequest = now;
  global.requestTracker.set(ip, tracker);
  
  // Block IP if more than 100 requests in 1 minute
  if (tracker.count > 100) {
    blockIP(ip, 60); // Block for 1 hour
    console.warn(`IP ${ip} blocked for suspected abuse: ${tracker.count} requests in 1 minute`);
    return res.status(403).json({
      success: false,
      message: 'Suspicious activity detected. IP temporarily blocked.'
    });
  }
  
  next();
};

module.exports = {
  apiLimiter,
  authLimiter,
  passwordResetLimiter,
  contentCreationLimiter,
  adminActionLimiter,
  ipBlocker,
  createRateLimiter,
  abuseDetector,
  isIPBlocked,
  blockIP
};
