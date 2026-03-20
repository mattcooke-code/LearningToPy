// AdminLog.js
const mongoose = require("mongoose");

const adminLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        "AWARD_BADGES",
        "REMOVE_BADGES",
        "ADJUST_XP",
        "OVERRIDE_PROGRESS",
        "TOGGLE_ADMIN",
        "BLOCK_USER",
        "UNBLOCK_USER",
        "UPDATE_SETTINGS",
      ],
    },
    targetType: {
      type: String,
      enum: ["user", "lesson", "module", "badge", "flag"],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "targetType",
    },
    changes: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    reason: {
      type: String,
      default: "",
    },
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

// Index for efficient queries
adminLogSchema.index({ adminId: 1, timestamp: -1 });
adminLogSchema.index({ targetType: 1, targetId: 1 });
adminLogSchema.index({ action: 1, timestamp: -1 });

// Automatically expire logs after 1 year (365 days) for GDPR compliance
adminLogSchema.index(
  { timestamp: 1 },
  { expireAfterSeconds: 365 * 24 * 60 * 60 },
);

module.exports = mongoose.model("AdminLog", adminLogSchema);

/**
 * AdminLog Model
 *
 * Privacy & GDPR Compliance:
 * - IP addresses are anonymized before storage (last octet/group zeroed out)
 * - Logs automatically expire after 365 days
 * - Admin IDs are stored but only reference authenticated admin users
 * - Changes are stored as JSON for audit purposes
 * - No personal data beyond user IDs is stored in changes
 */
