// FlaggedContent.js
const mongoose = require("mongoose");

const flaggedContentSchema = new mongoose.Schema({
  reporterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  targetUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  targetType: {
    type: String,
    enum: ["COMMENT", "EXERCISE_SUBMISSION", "USER_PROFILE", "LESSON_CONTENT"],
    required: true,
  },
  reason: { type: String, required: true },
  description: String,
  status: {
    type: String,
    enum: ["PENDING", "RESOLVED", "WARNING_SENT", "ESCALATED", "DISMISSED"],
    default: "PENDING",
  },
  adminNotes: String,
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  resolvedAt: Date,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("FlaggedContent", flaggedContentSchema);
