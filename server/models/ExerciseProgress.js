// ExerciseProgress.js
const mongoose = require("mongoose");

/**
 * Tracks a user's progress on a lesson's EXERCISE component, independent of the lesson's quiz component.
 *
 * One record per (user, lesson). Created lazily on first exercise submission.
 * Existence of a record does not imply success - check `passed`.
 *
 * Completion semantics: a lesson that has both an exercise and a quiz requires
 * BOTH this record's `passed === true` AND the corresponding
 * LessonQuizProgress record to be complete. See isLessonFullyCompleted().
 */
const ExerciseProgressSchema = new mongoose.Schema(
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
    // ── Exercise outcome ─────────────────────────────
    passed: { type: Boolean, default: false },
    passedAt: { type: Date, default: null },

    // ── Attempt history (aggregate) ──────────────────
    attemptCount: { type: Number, default: 0, min: 0 },
    firstAttemptedPassed: { type: Boolean, default: false },
    // Snapshot of the passing attempt's code — useful for admin review,
    passingCode: { type: String, default: null },

    // ── Metadata about the passing attempt ───────────
    usedHints: { type: Boolean, default: false },
    wasOptimal: { type: Boolean, default: false },
    elapsedSeconds: { type: Number, default: null, min: 0 },
  },
  { timestamps: true },
);

// ── Indexes ───────────────────────────────────────────
ExerciseProgressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });
ExerciseProgressSchema.index({ userId: 1, passed: 1 });

module.exports = mongoose.model("ExerciseProgress", ExerciseProgressSchema);
