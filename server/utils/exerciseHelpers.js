// exerciseHelpers.js
const ExerciseProgress = require("../models/ExerciseProgress");
const { hasExercise } = require("./quizHelpers");

/**
 * Get or create an ExerciseProgress record for a user on a specific lesson.
 * Returns null if the lesson has no exercise component.
 *
 * @param {string} userId - User ID
 * @param {string} lessonId - Lesson ID
 * @param {Object} lesson - Lesson document
 * @returns {Promise<Object|null>} - Exercise progress record, or null
 */
const getOrCreateExerciseProgress = async (userId, lessonId, lesson) => {
  if (!hasExercise(lesson)) return null;

  let progress = await ExerciseProgress.findOne({ userId, lessonId });

  if (!progress) {
    progress = await ExerciseProgress.create({
      userId,
      lessonId,
      passed: false,
      attemptCount: 0,
    });
  }

  return progress;
};

/**
 * Record the result of an exercise attempt.
 * Once `passed` is true, subsequent failing attempts don't reset it
 *
 * @param {Object} progress - ExerciseProgress document (mutated and saved)
 * @param {Object} attemptData - {passed, code, usedHints, wasOptimal, elapsedSeconds}
 * @returns {Promise<Object>} - The updated progress document
 */

const recordExerciseAttempt = async (progress, attemptData) => {
  if (!progress) return null;

  progress.attemptCount = (progress.attemptCount || 0) + 1;

  // Log exercise completion when first passed. Subsequent attempts after passing the exercise (practice) don't affect results
  if (attemptData.passed && !progress.passed) {
    progress.passed = true;
    progress.passedAt = new Date();
    progress.passingCode = attemptData.code || null;
    progress.usedHints = !!attemptData.usedHints;
    progress.wasOptimal = !!attemptData.wasOptimal;
    progress.elapsedSeconds = attemptData.elapsedSeconds ?? null;
    progress.firstAttemptPassed = progress.attemptCount === 1;
  }

  await progress.save();
  return progress;
};

module.exports = { getOrCreateExerciseProgress, recordExerciseAttempt };
