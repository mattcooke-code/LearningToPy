// routes/analytics.js
const express = require("express");
const router = express.Router();
const Activity = require("../models/ActivityLog");
const { adminOnly } = require("../middleware/adminOnly");
const { protect } = require("../middleware/auth");

// Session End - can be called without authentication
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

    Activity.create({
      ...(req.user?._id && { userId: req.user._id }),
      sessionId,
      actionType: actionType || "SESSION_END",
      metadata: { duration, deviceInfo },
      timestamp: new Date(),
      ipAddress: req.ip,
    }).catch((err) => console.error("Session end error:", err));

    res.status(200).json({ received: true });
  },
);

// Page views - require authentication
router.post("/page-view", protect, (req, res) => {
  const { path, sessionId } = req.body;

  let deviceInfo = {};
  try {
    if (req.headers["x-device-info"]) {
      const decodedHeader = decodeURIComponent(req.headers["x-device-info"]);
      deviceInfo = JSON.parse(decodedHeader);
    }
  } catch (e) {}

  Activity.create({
    userId: req.user._id, // Now this is safe because protect middleware guarantees user
    sessionId,
    actionType: "PAGE_VIEW",
    metadata: {
      path,
      deviceInfo,
      timestamp: new Date().toISOString(),
    },
    timestamp: new Date(),
    ipAddress: req.ip,
  }).catch((err) => console.error("Page view error:", err));

  res.status(200).json({ received: true });
});

// Test headers endpoint (public for debugging)
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
  });
});

// Debug endpoint - requires admin
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
