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
        // User management
        "USER_MADE_ADMIN",
        "USER_REMOVED_ADMIN",
        "XP_ADJUSTMENT",
        "USER_BLOCKED",
        "USER_UNBLOCKED",
        "USER_DELETED",

        // Badge management
        "AWARD_BADGES",
        "REMOVE_BADGES",

        // Progress overrides
        "LESSON_COMPLETED_OVERRIDE",
        "LESSON_INCOMPLETE_OVERRIDE",
        "MODULE_COMPLETED_OVERRIDE",
        "MODULE_INCOMPLETE_OVERRIDE",

        // Flags
        "FLAG_RESOLVED",

        // Settings
        "SETTINGS_UPDATED",

        // Lesson management
        "LESSON_CREATED",
        "LESSON_UPDATED",
        "LESSON_DELETED",
        "LESSON_PUBLISHED",
        "LESSON_UNPUBLISHED",
        "LESSON_DUPLICATED",

        // Module management
        "MODULE_CREATED",
        "MODULE_UPDATED",
        "MODULE_DELETED",
        "MODULE_PUBLISHED",
        "MODULE_UNPUBLISHED",
        "MODULE_DUPLICATED",
      ],
    },
    targetType: {
      type: String,
      // ✅ Uppercase to match controller usage, with SETTINGS added for
      // updateSettings which has no associated document targetId
      enum: ["USER", "LESSON", "MODULE", "BADGE", "FLAG", "SETTINGS"],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      // ✅ No longer required — SETTINGS actions have no document targetId
      required: false,
      default: null,
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

adminLogSchema.index({ adminId: 1, timestamp: -1 });
adminLogSchema.index({ targetType: 1, targetId: 1 });
adminLogSchema.index({ action: 1, timestamp: -1 });

// ✅ TTL kept at 1 year for admin audit logs (longer than activity logs
// which expire after 90 days, since audit trails have compliance value)
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
