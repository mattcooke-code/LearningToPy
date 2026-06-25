// models/CourseCompletion.js
const mongoose = require("mongoose");

/**
 * Records the moment a student completes the full curriculum (M1–M20).
 *
 * Created once per user, at the point processModuleCompletion detects
 * isM20 === true. All fields are calculated and stored at creation time
 * so they remain accurate even after XpTransaction history expires (TTL: 365 days)
 * or future curriculum changes.
 *
 * Leaderboard transition flow:
 *   completedAt
 *     → hofEligibleAt (completedAt + 30 days)           [default, no opt-in]
 *     → earlyOptInAt  (if student opts in before 30 days) [sets hofJoinedAt immediately]
 *     → hofJoinedAt   (set by cron job or early opt-in)
 *
 * When hofJoinedAt is set, User.leaderboardStatus is updated to "HOF".
 *
 * HOF = Hall of Fame
 */
const CourseCompletionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // One record per student — course can only be completed once
    },

    // ── Completion Facts ───────────────────────────────

    completedAt: {
      type: Date,
      required: true,
    },

    timeToCompleteMs: {
      type: Number,
      required: true,
      min: 0,
    },

    totalXpAtCompletion: {
      type: Number,
      required: true,
      min: 0,
    },

    moduleCount: {
      type: Number,
      required: true,
      min: 1,
    },

    // ── Leaderboard Transition ─────────────────────────

    hofEligibleAt: {
      type: Date,
      required: true,
    },

    hofJoinedAt: {
      type: Date,
      default: null,
    },

    // ── Early Opt-In ───────────────────────────────────

    earlyOptIn: {
      type: Boolean,
      default: false,
    },

    earlyOptInAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// ── Indexes ───────────────────────────────────────────

// Cron job: find students whose 30-day window has elapsed and hofJoinedAt is still null
CourseCompletionSchema.index({ hofEligibleAt: 1, hofJoinedAt: 1 });

// HoF league table: primary sort is completedAt ascending (earliest completer = rank 1)
CourseCompletionSchema.index({ hofJoinedAt: 1, completedAt: 1 });

// Admin / analytics queries by completion date
CourseCompletionSchema.index({ completedAt: -1 });

module.exports = mongoose.model("CourseCompletion", CourseCompletionSchema);
