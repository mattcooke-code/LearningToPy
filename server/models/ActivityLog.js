// models/ActivityLog.js
const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      index: true,
    },
    sessionId: { type: String, required: true, index: true },
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
    ipAddress: String,
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
