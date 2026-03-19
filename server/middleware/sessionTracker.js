// middleware/sessionTracker.js
const crypto = require("crypto");
const Activity = require("../models/ActivityLog");
const { parseDeviceInfo, anonymiseIp } = require("../utils/parseDeviceInfo");

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
