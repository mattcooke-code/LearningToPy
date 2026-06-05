// models/LessonQuizProgress.js
const mongoose = require("mongoose");

const LessonQuizProgressSchema = new mongoose.Schema(
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
    questionAttempts: [
      {
        questionIndex: { type: Number, required: true },
        attempts: { type: Number, default: 1, min: 1 },
        correct: { type: Boolean, default: false },
      },
    ],
    correctAnswers: [{ type: Number }],
    completed: {
      type: Boolean,
      default: false,
    },
    lastAttempt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// ── Indexes ───────────────────────────────────────────
// One progress record per user per lesson
LessonQuizProgressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });

// Find incomplete quizzes for a user
LessonQuizProgressSchema.index({ userId: 1, completed: 1 });

module.exports = mongoose.model("LessonQuizProgress", LessonQuizProgressSchema);
