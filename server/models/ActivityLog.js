// models/ActivityLog.js
const mongoose = require("mongoose");
const net = require("net");

const activityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      index: true,
    },
    sessionId: {
      type: String,
      required: [true, "Session ID is required"],
      index: true,
      minlength: [10, "Session ID must be at least 10 characters"],
      maxlength: [100, "Session ID must not exceed 100 characters"],
      match: [
        /^[a-zA-Z0-9_-]+$/,
        "Session ID can only contain letters, numbers, underscores, and hyphens",
      ],
    },
    actionType: {
      type: String,
      enum: [
        "PAGE_VIEW",
        "LESSON_START",
        "LESSON_COMPLETE",
        "QUIZ_ATTEMPT",
        "QUIZ_CORRECT",
        "QUIZ_INCORRECT",
        "CODE_RUN",
        "CODE_SUCCESS",
        "CODE_ERROR",
        "SESSION_START",
        "SESSION_END",
        "EXERCISE_ATTEMPT",
        "EXERCISE_COMPLETE",
      ],
      required: true,
      index: true,
    },
    metadata: {
      lessonId: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson" },
      moduleId: { type: mongoose.Schema.Types.ObjectId, ref: "Module" },
      quizId: String,
      codeLanguage: String,
      duration: Number,
      xpEarned: Number,
      success: Boolean,
      errorType: String,
      deviceInfo: {
        userAgent: String,
        platform: String,
        screenSize: String,
        isMobile: Boolean,
        browser: String,
        language: String,
        timezone: String,
      },
      path: String, // For page views
      completedAt: Date,
    },
    ipAddress: {
      type: String,
      validate: {
        validator: function (value) {
          if (!value) return true;
          return net.isIP(value) !== 0; // Returns 4 for IPv4, 6 for IPv6, 0 for invalid
        },
        message: "Invalid IP address format",
      },
    },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

// Index for efficient analytics queries
activityLogSchema.index({ userId: 1, timestamp: -1 });
activityLogSchema.index({ actionType: 1, timestamp: -1 });
activityLogSchema.index({ "metadata.lessonId": 1, timestamp: -1 });
activityLogSchema.index({ sessionId: 1, timestamp: -1 });
// Remove data after 90 days for GDPR compliance
activityLogSchema.index(
  { timestamp: 1 },
  { expireAfterSeconds: 90 * 24 * 60 * 60 },
);

module.exports = mongoose.model("ActivityLog", activityLogSchema);
