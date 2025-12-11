const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  actionType: {
    type: String,
    enum: [
      "XP_ADJUSTMENT",
      "BADGE_GRANTED",
      "BADGE_REVOKED",
      "PROGRESS_OVERRIDE",
      "USER_SUSPENDED",
      "USER_REACTIVATED",
      "USER_DELETED",
      "LESSON_PUBLISHED",
      "LESSON_UNPUBLISHED",
      "CONTENT_UPDATED",
    ],
    required: true,
  },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
  targetType: { type: String, enum: ["USER", "LESSON", "MODULE", "BADGE"] },
  oldValue: mongoose.Schema.Types.Mixed,
  newValue: mongoose.Schema.Types.Mixed,
  reason: String,
  ipAddress: String,
  metadata: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ActivityLog", activityLogSchema);
