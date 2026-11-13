// routes/analytics.js
const express = require("express");
const router = express.Router();
const config = require("../config/envConfig");
const Activity = require("../models/ActivityLog");
const Session = require("../models/Session");
const { adminOnly } = require("../middleware/adminOnly");
const { protect } = require("../middleware/auth");
const sessionService = require("../services/sessionService");
const { isValidSessionId } = require("../utils/sessionId");
const { parseDeviceInfo, anonymiseIp } = require("../utils/parseDeviceInfo");

const warnInDev = (label, err) => {
  if (!config.isProduction()) console.warn(`⚠️ ${label}:`, err.message);
};

/**
 * sendBeacon sends a string body as text/plain, so the body arrives as a raw
 * string; other clients may send JSON (already parsed by the global parser).
 */
const parseBeaconBody = (body) => {
  if (typeof body === "string") {
    try {
      const parsed = JSON.parse(body);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }
  return body && typeof body === "object" ? body : {};
};

/**
 * Session end beacon — unauthenticated by necessity (sendBeacon can't set an
 * Authorization header and the access token may be expired by then).
 *
 * The client sends ONLY { sessionId }. The server uses its own clock, only
 * extends sessions that are still live, and ignores everything else, so a
 * caller can't inject arbitrary events or durations. Fire-and-forget: errors
 * here must never affect the user.
 */
router.post(
  "/session-end",
  express.text({ type: "*/*", limit: "1kb" }),
  (req, res) => {
    const { sessionId } = parseBeaconBody(req.body);

    if (isValidSessionId(sessionId)) {
      sessionService
        .endSession(sessionId)
        .catch((err) => warnInDev("Session end failed", err));
    }

    res.status(200).json({ received: true });
  },
);

/**
 * Page views — require authentication.
 * The session ID comes from the x-session-id header (validated by the
 * sessionTracker middleware), not from the request body.
 */
router.post("/page-view", protect, (req, res) => {
  const { path } = req.body ?? {};

  if (req.sessionId && typeof path === "string" && path) {
    Activity.create({
      userId: req.user._id,
      sessionId: req.sessionId,
      actionType: "PAGE_VIEW",
      metadata: {
        path: path.slice(0, 200),
        deviceInfo: parseDeviceInfo(req.headers),
      },
      timestamp: new Date(),
      ipAddress: anonymiseIp(req.ip),
    }).catch((err) => warnInDev("Page view logging failed", err));
  }

  res.status(200).json({ received: true });
});

/**
 * Debug endpoint — requires admin.
 */
router.get("/debug/check", protect, adminOnly, async (req, res) => {
  try {
    const [recentSessions, withDeviceInfo, todayActivity, total, actionCounts] =
      await Promise.all([
        Session.find()
          .sort({ endedAt: -1 })
          .limit(5)
          .populate("userId", "username")
          .lean(),

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
      recentSessions: recentSessions.map((s) => ({
        user: s.userId?.username || "Unknown",
        durationSeconds: Math.round((s.endedAt - s.startedAt) / 1000),
        startedAt: s.startedAt,
        endedAt: s.endedAt,
        deviceInfo: s.deviceInfo,
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
