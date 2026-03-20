// AdminLog.js
const mongoose = require("mongoose");

const adminLogSchema = new mongoose.Schema({
  adminId: {
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
  changes: { type: mongoose.Schema.Types.Mixed, default: {} },
  reason: { type: String, default: "" },
  ipAddress: String,
  userAgent: String,
  timestamp: { type: Date, default: Date.now },
});

// Index
adminLogSchema.index({ adminId: 1, timestamp: -1 });
adminLogSchema.index({ targetType: 1, targetId: 1 });
adminLogSchema.index({ action: 1 });

module.exports = mongoose.model("AdminLog", adminLogSchema);
