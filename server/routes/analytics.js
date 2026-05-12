// routes/analytics.js
const express = require("express");
const router = express.Router();
const Activity = require("../models/ActivityLog");
const { adminOnly } = require("../middleware/adminOnly");
const { protect } = require("../middleware/auth");

/**
 * Helper to safely extract IP address from request.
 * Handles IPv4, IPv6, and IPv4-mapped IPv6 addresses.
 * Falls back gracefully if req.ip is unavailable.
 */
const getClientIP = (req) => {
  // req.ip is set by Express trust proxy
  if (req.ip) return req.ip;

  // Fallbacks if trust proxy isn't working
  if (req.connection?.remoteAddress) return req.connection.remoteAddress;
  if (req.socket?.remoteAddress) return req.socket.remoteAddress;

  return "0.0.0.0"; // Last resort fallback
};

/**
 * Session End - can be called without authentication
 *
 * IMPORTANT: This is a fire-and-forget analytics endpoint.
 * Errors here should NEVER affect the user experience or auth flow.
 */
router.post(
  "/session-end",
  // Accept both text/plain (sendBeacon default) and application/json
  (req, res, next) => {
    if (req.headers["content-type"]?.includes("application/json")) {
      return express.json({ limit: "1kb" })(req, res, next);
    }
    // sendBeacon sends text/plain — read raw body and parse manually
    let raw = "";
    req.on("data", (chunk) => (raw += chunk));
    req.on("end", () => {
      try {
        req.body = JSON.parse(raw);
      } catch {
        req.body = {};
      }
      next();
    });
  },
  (req, res) => {
    const { sessionId, duration, actionType, deviceInfo = {} } = req.body;

    // Fire-and-forget: Don't await, don't let errors propagate
    Activity.create({
      ...(req.user?._id && { userId: req.user._id }),
      sessionId,
      actionType: actionType || "SESSION_END",
      metadata: { duration, deviceInfo },
      timestamp: new Date(),
      ipAddress: getClientIP(req),
    }).catch((err) => {
      // Log for debugging but NEVER crash or affect the response
      if (process.env.NODE_ENV !== "production") {
        console.warn("⚠️ Session end logging failed:", err.message);
      }
    });

    // Always return success immediately - analytics is non-critical
    res.status(200).json({ received: true });
  },
);

/**
 * Page views - require authentication
 *
 * Protected route that logs page navigation.
 * Uses fire-and-forget pattern to avoid blocking the response.
 */
router.post("/page-view", protect, (req, res) => {
  const { path, sessionId } = req.body;

  let deviceInfo = {};
  try {
    if (req.headers["x-device-info"]) {
      const decodedHeader = decodeURIComponent(req.headers["x-device-info"]);
      deviceInfo = JSON.parse(decodedHeader);
    }
  } catch (e) {
    // Silently ignore malformed device info headers
  }

  // Fire-and-forget: Don't await, don't let errors propagate
  Activity.create({
    userId: req.user._id,
    sessionId,
    actionType: "PAGE_VIEW",
    metadata: {
      path,
      deviceInfo,
      timestamp: new Date().toISOString(),
    },
    timestamp: new Date(),
    ipAddress: getClientIP(req),
  }).catch((err) => {
    // Log for debugging but NEVER crash or affect the response
    if (process.env.NODE_ENV !== "production") {
      console.warn("⚠️ Page view logging failed:", err.message);
    }
  });

  // Always return success immediately
  res.status(200).json({ received: true });
});

/**
 * Test headers endpoint (public for debugging)
 */
router.get("/test-headers", (req, res) => {
  let deviceInfo = null;
  try {
    if (req.headers["x-device-info"]) {
      deviceInfo = JSON.parse(decodeURIComponent(req.headers["x-device-info"]));
    }
  } catch (e) {}

  res.json({
    headers: {
      "x-session-id": req.headers["x-session-id"] || null,
      "x-device-info": req.headers["x-device-info"] || null,
      "user-agent": req.headers["user-agent"],
    },
    parsedDeviceInfo: deviceInfo,
    timestamp: new Date().toISOString(),
    clientIP: getClientIP(req),
  });
});

/**
 * Debug endpoint - requires admin
 * Provides activity analytics for admin dashboard
 */
router.get("/debug/check", protect, adminOnly, async (req, res) => {
  try {
    const [recentSessions, withDeviceInfo, todayActivity, total, actionCounts] =
      await Promise.all([
        Activity.find({ actionType: "SESSION_END" })
          .sort({ timestamp: -1 })
          .limit(5)
          .populate("userId", "username"),

        Activity.find({ "metadata.deviceInfo": { $exists: true } })
          .sort({ timestamp: -1 })
          .limit(5),

        Activity.countDocuments({
          timestamp: { $gte: new Date().setHours(0, 0, 0, 0) },
        }),

        Activity.countDocuments(),

        Activity.aggregate([
          { $group: { _id: "$actionType", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
      ]);

    res.json({
      summary: {
        totalActivities: total,
        todayActivity,
        actionCounts,
      },
      sessionEnds: recentSessions.map((s) => ({
        user: s.userId?.username || "Anonymous",
        duration: s.metadata?.duration,
        timestamp: s.timestamp,
        hasDeviceInfo: !!s.metadata?.deviceInfo,
        deviceInfo: s.metadata?.deviceInfo,
      })),
      deviceInfoSamples: withDeviceInfo.map((s) => ({
        actionType: s.actionType,
        deviceInfo: s.metadata?.deviceInfo,
        timestamp: s.timestamp,
      })),
    });
  } catch (error) {
    console.error("Debug error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
