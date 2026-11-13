// models/Session.js
const mongoose = require("mongoose");
const net = require("net");
const { SESSION_ID_PATTERN } = require("../utils/sessionId");

/**
 * One document per (user, sessionId) — logged-in users only.
 *
 * - startedAt: first authenticated request seen for this session
 * - endedAt:   last time the session was observed active (requests + end beacons)
 * - duration is NOT stored; it is endedAt - startedAt, computed on read.
 *
 * Keyed on (userId, sessionId) rather than sessionId alone so that two users
 * who share a browser profile can never collide on one session document.
 */
const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sessionId: {
      type: String,
      required: true,
      match: [SESSION_ID_PATTERN, "Invalid session ID"],
    },
    startedAt: { type: Date, required: true },
    endedAt: { type: Date, required: true },
    deviceInfo: {
      userAgent: String,
      platform: String,
      screenSize: String,
      isMobile: Boolean,
      browser: String,
      language: String,
      timezone: String,
    },
    // Anonymised at write time (see anonymiseIp)
    ipAddress: {
      type: String,
      validate: {
        validator: (value) => !value || net.isIP(value) !== 0,
        message: "Invalid IP address format",
      },
    },
  },
  { versionKey: false },
);

// Upsert key; its userId prefix also serves "all sessions for user X"
// (GDPR export / account deletion).
sessionSchema.index({ userId: 1, sessionId: 1 }, { unique: true });
// End-beacon lookup (unauthenticated, only knows sessionId)
sessionSchema.index({ sessionId: 1, endedAt: -1 });
// Analytics range queries + 90-day retention, matching ActivityLog
sessionSchema.index(
  { startedAt: 1 },
  { expireAfterSeconds: 90 * 24 * 60 * 60 },
);

module.exports = mongoose.model("Session", sessionSchema);
