// models/LessonCompletion.js
const mongoose = require("mongoose");

const LessonCompletionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
    tags: [{ type: String, trim: true }],
    contentType: { type: String, trim: true },
    difficulty: { type: String, trim: true },
    challengeGroup: { type: String, trim: true },
    elapsedSeconds: { type: Number, min: 0 },
    attemptNumber: { type: Number, min: 1 },
    usedHints: { type: Boolean, default: false },
    linesOfCode: { type: Number, min: 0 },
    wasOptimal: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

// ── Indexes ───────────────────────────────────────────
// Prevent duplicate completions
LessonCompletionSchema.index({ userId: 1, lessonId: 1 }, { unique: true });

// Query completions by date range (streak checks, analytics)
LessonCompletionSchema.index({ userId: 1, completedAt: -1 });

// Analytics: which lessons are most completed
LessonCompletionSchema.index({ lessonId: 1, completedAt: -1 });

module.exports = mongoose.model("LessonCompletion", LessonCompletionSchema);
