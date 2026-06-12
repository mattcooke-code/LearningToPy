// /client/src/utils/lessonCalculations.js
/**
 * @fileoverview Lesson navigation and statistics utilities.
 *
 * Provides functions for calculating the next lesson in a module (with a
 * manual fallback when the backend doesn't provide `nextLessonId`), finding
 * the first incomplete lesson, and aggregating lesson completion statistics.
 *
 * @module utils/lessonCalculations
 * @requires ../services (apiClient)
 * @requires ./progressCalculations
 */

import { apiClient } from "../services";
import { calculateModuleLessonProgress } from "./progressCalculations";

/**
 * Calculate the next lesson in a module by fetching the full lesson list
 * and finding the successor of the current lesson.
 *
 * This is a **fallback** — used only when the backend response doesn't
 * include a `nextLessonId` field. It fetches all lessons for the module,
 * finds the current lesson's index, and returns the next one if it exists.
 *
 * Returns `null` when:
 * - `moduleId` is missing
 * - The API request fails
 * - The module has no lessons
 * - The current lesson is the last one in the module
 * - The current lesson is not found in the module's lesson list
 *
 * @param {string} currentLessonId - The `_id` of the current lesson.
 * @param {string} moduleId - The `_id` of the parent module.
 * @returns {Promise<object|null>} The next lesson object, or null.
 */
export const calculateNextLessonManually = async (
  currentLessonId,
  moduleId,
) => {
  try {
    if (!moduleId) {
      console.log("❌ Cannot calculate next lesson - missing moduleId");
      return null;
    }

    const responseData = await apiClient.get(
      `/content/modules/${moduleId}/lessons`,
    );

    const moduleLessons =
      responseData.lessons || (Array.isArray(responseData) ? responseData : []);

    if (moduleLessons.length === 0) {
      console.log("❌ No lessons array found in response");
      return null;
    }

    const currentIndex = moduleLessons.findIndex(
      (lesson) => (lesson._id || lesson.id) === currentLessonId,
    );

    if (currentIndex === -1) {
      console.log("❌ Current lesson not found in module lessons");
      return null;
    }

    if (currentIndex < moduleLessons.length - 1) {
      const nextLessonData = moduleLessons[currentIndex + 1];
      return nextLessonData;
    } else {
      console.log("🏁 No next lesson - this is the last lesson in module");
      return null;
    }
  } catch (err) {
    console.error("❌ Failed to calculate next lesson manually:", err);
    return null;
  }
};

/**
 * Find the first incomplete lesson in an array of lessons.
 *
 * A lesson is considered incomplete when `isCompleted` is falsy.
 *
 * @param {object[]} [lessons=[]] - Array of lesson objects with `isCompleted`
 *   properties.
 * @returns {object|null} The first incomplete lesson, or null if all are
 *   completed or the array is empty.
 */
export const findFirstIncompleteLesson = (lessons = []) => {
  return lessons.find((lesson) => !lesson.isCompleted) || null;
};

/**
 * Calculate completion statistics for a module's lessons.
 *
 * @param {object[]} [lessons=[]] - Array of lesson objects with `isCompleted`
 *   properties.
 * @returns {{ completed: number, total: number, moduleLessonProgress: number, remaining: number }}
 *   An object with counts and the computed progress percentage
 */
export const getLessonStatistics = (lessons = []) => {
  const completed = lessons.filter((lesson) => lesson.isCompleted).length;
  const total = lessons.length;

  return {
    completed,
    total,
    moduleLessonProgress: total > 0 ? Math.round((completed / total) * 100) : 0,
    remaining: total - completed,
  };
};
