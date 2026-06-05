// middleware/sessionTracker.js
const crypto = require("crypto");
const Activity = require("../models/ActivityLog");
const { parseDeviceInfo, anonymiseIp } = require("../utils/parseDeviceInfo");

/**
 * Session tracking middleware — assigns a unique session ID and logs SESSION_START events.
 *
 * **Flow:**
 * 1. Reads existing session ID from `x-session-id` header, or generates a new one
 * 2. Stores session ID on `req.sessionId` (not on headers — avoids mutating the request)
 * 3. Sends the session ID back to the client via `x-session-id` response header
 * 4. On first call per request, logs a `SESSION_START` ActivityLog entry (fire-and-forget)
 * 5. Records `req.startTime` for duration calculation on session end
 *
 * Tracking failures are silent — they never block the request.
 *
 * @middleware Applied globally before route handlers
 */
const sessionTracker = (req, res, next) => {
  // Read or generate session ID — store on req, not req.headers
  const existingSessionId = req.headers["x-session-id"];
  if (existingSessionId) {
    req.sessionId = existingSessionId;
  } else {
    req.sessionId = crypto.randomBytes(16).toString("hex");
    res.setHeader("x-session-id", req.sessionId);
  }

  if (!req.sessionStarted) {
    req.sessionStarted = true;

    const deviceInfo = parseDeviceInfo(req.headers);

    Activity.create({
      userId: req.user?._id,
      sessionId: req.sessionId,
      actionType: "SESSION_START",
      metadata: { deviceInfo },
      ipAddress: anonymiseIp(req.ip),
      timestamp: new Date(),
    }).catch((err) => {
      // Structured logging would be better here for production monitoring
      console.error("Session start logging failed:", err.message);
    });
  }

  req.startTime = Date.now();
  next();
};

module.exports = sessionTracker;
