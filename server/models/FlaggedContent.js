const mongoose = require("mongoose");

const flaggedContentSchema = new mongoose.Schema(
  {
    targetType: {
      type: String,
      enum: ["LESSON", "EXERCISE", "QUIZ"],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "targetType",
    },
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    issueType: {
      type: String,
      enum: [
        "CONTENT_ERROR", // Typo, incorrect information
        "CODE_ERROR", // Exercise code not working
        "QUIZ_ERROR", // Quiz marked incorrectly
        "BROKEN_FUNCTIONALITY", // Validation not working
        "XP_ADJUSTMENT", // XP not awarded correctly
        "OTHER",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxLength: 200,
    },
    description: {
      type: String,
      required: true,
      maxLength: 2000,
    },
    suggestedFix: {
      type: String,
      maxLength: 1000,
    },
    status: {
      type: String,
      enum: ["PENDING", "IN_REVIEW", "FIXED", "REJECTED", "XP_ADJUSTED"],
      default: "PENDING",
    },
    adminResponse: {
      type: String,
      maxLength: 1000,
    },
    xpCompensation: {
      type: Number,
      default: 0,
      min: 0,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    resolvedAt: Date,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

// Indexes for efficient queries
flaggedContentSchema.index({ status: 1, createdAt: -1 });
flaggedContentSchema.index({ targetType: 1, targetId: 1 });
flaggedContentSchema.index({ reporterId: 1 });

module.exports = mongoose.model("FlaggedContent", flaggedContentSchema);
