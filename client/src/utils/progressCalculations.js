// /client/src/utils/progressCalculations.js
/**
 * @fileoverview Progress and XP calculation utilities.
 *
 * Pure functions for calculating lesson completion percentages within a
 * module and overall module completion rates.
 * Used by the dashboard, module pages, and lesson navigation to display
 * progress bars and level indicators.
 *
 * @module utils/progressCalculations
 */

/**
 * Calculate the percentage of completed lessons within a module.
 *
 * Iterates over the lesson array, counting those with `isCompleted === true`,
 * and returns the count, total, and rounded percentage.
 *
 * @param {object[]} [lessons=[]] - Array of lesson objects with `isCompleted`
 *   properties.
 * @returns {{ completedLessons: number, totalLessons: number, moduleLessonProgress: number }}
 *   An object with the completed count, total count, and progress percentage
 *   (0–100, rounded).
 */
export const calculateModuleLessonProgress = (lessons = []) => {
  const completedLessons = lessons.filter(
    (lesson) => lesson.isCompleted,
  ).length;
  const totalLessons = lessons.length;
  let moduleLessonProgress = 0;

  if (totalLessons > 0) {
    moduleLessonProgress = Math.round((completedLessons / totalLessons) * 100);
  }

  return { completedLessons, totalLessons, moduleLessonProgress };
};

/**
 * Calculate the percentage of modules completed across the curriculum.
 *
 * @param {number} completedModules - Number of fully completed modules.
 * @param {number} totalModules - Total number of modules in the curriculum.
 * @returns {number} Rounded completion percentage (0–100), or 0 if
 *   `totalModules` is 0.
 */
export const calculateModulesCompletionProgress = (
  completedModules,
  totalModules,
) => {
  if (totalModules === 0) return 0;
  return Math.round((completedModules / totalModules) * 100);
};
