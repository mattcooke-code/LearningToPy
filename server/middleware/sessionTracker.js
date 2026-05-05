// middleware/sessionTracker.js
const crypto = require("crypto");
const Activity = require("../models/ActivityLog");
const { parseDeviceInfo, anonymiseIp } = require("../utils/parseDeviceInfo");

/**
 * Session tracking middleware — assigns a unique session ID and logs SESSION_START events.
 *
 * **Flow:**
 * 1. Generates a cryptographically random session ID if none exists in `x-session-id` header
 * 2. On first call per request, logs a `SESSION_START` ActivityLog entry (fire-and-forget)
 * 3. Records `req.startTime` for duration calculation on session end
 *
 * Tracking failures are silent — they never block the request.
 *
 * @middleware Applied globally before route handlers
 */
const sessionTracker = (req, res, next) => {
  if (!req.headers["x-session-id"]) {
    req.headers["x-session-id"] = crypto.randomBytes(16).toString("hex");
  }

  if (!req.sessionStarted) {
    req.sessionStarted = true;

    const deviceInfo = parseDeviceInfo(req.headers);

    Activity.create({
      userId: req.user?._id,
      sessionId: req.headers["x-session-id"],
      actionType: "SESSION_START",
      metadata: { deviceInfo },
      ipAddress: anonymiseIp(req.ip),
      timestamp: new Date(),
    }).catch((err) => console.error("Session start error:", err));
  }

  req.startTime = Date.now();
  next();
};

module.exports = sessionTracker;
