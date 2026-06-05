// models/QuizAttempt.js
const mongoose = require("mongoose");

const QuizAttemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      required: true,
    },
    attemptedAt: {
      type: Date,
      default: Date.now,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
    },
    passed: {
      type: Boolean,
      required: true,
    },
    answers: [
      {
        questionId: mongoose.Schema.Types.ObjectId,
        question: String,
        userAnswer: String,
        correctAnswer: String,
        isCorrect: Boolean,
        explanation: String,
      },
    ],
  },
  {
    timestamps: true,
  },
);

// ── Indexes ───────────────────────────────────────────
// User's quiz history for a module (most recent first)
QuizAttemptSchema.index({ userId: 1, moduleId: 1, attemptedAt: -1 });

// Analytics: average scores per module
QuizAttemptSchema.index({ moduleId: 1, attemptedAt: -1 });

// "Has user passed module X?" queries
QuizAttemptSchema.index({ userId: 1, moduleId: 1, passed: 1 });

module.exports = mongoose.model("QuizAttempt", QuizAttemptSchema);
