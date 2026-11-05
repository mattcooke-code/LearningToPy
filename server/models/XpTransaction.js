// models/XpTransaction.js
const mongoose = require("mongoose");

const XpTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    source: {
      type: String,
      enum: [
        "LESSON_COMPLETION",
        "LESSON_QUIZ",
        "EXERCISE",
        "MODULE_QUIZ",
        "MODULE_COMPLETION",
        "MODULE_COMPLETION_AUTO",
        "BONUS",
      ],
      uppercase: true,
      required: true,
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    awardedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// ── Indexes ───────────────────────────────────────────
// User's XP history (most recent first)
XpTransactionSchema.index({ userId: 1, awardedAt: -1 });

// Analytics: XP by source type
XpTransactionSchema.index({ userId: 1, source: 1 });

// TTL index: auto-delete transactions older than 365 days
// (Keep XP total on User document, but archive detailed history)
XpTransactionSchema.index(
  { awardedAt: 1 },
  { expireAfterSeconds: 365 * 24 * 60 * 60 },
);

// Prevent duplicate partial XP awards for the exact same lesson quiz question or exercise submission
XpTransactionSchema.index(
  { userId: 1, source: 1, "meta.lessonId": 1, "meta.questionIndex": 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: { "meta.questionIndex": { $exists: true } },
  },
);

XpTransactionSchema.index(
  { userId: 1, source: 1, "meta.lessonId": 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: { source: "EXERCISE", "meta.isFirstTry": true },
  },
);

module.exports = mongoose.model("XpTransaction", XpTransactionSchema);
