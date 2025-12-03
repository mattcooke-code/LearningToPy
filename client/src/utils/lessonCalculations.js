// utils/lessonCalculations.js
import { apiClient } from "../context";
import { calculateModuleLessonProgress } from "./progressCalculations";

/**
 * Calculate the next lesson manually (fallback when backend doesn't provide nextLessonId)
 */
export const calculateNextLessonManually = async (
  currentLessonId,
  moduleId
) => {
  try {
    if (!moduleId) {
      console.log("❌ Cannot calculate next lesson - missing moduleId");
      return null;
    }

    // Get all lessons in the current module to find the next one
    const moduleResponse = await apiClient.get(
      `/content/modules/${moduleId}/lessons`
    );
    const responseData = moduleResponse.data.data;

    // Extract lessons array from the response
    const moduleLessons = responseData.lessons || [];

    if (!Array.isArray(moduleLessons) || moduleLessons.length === 0) {
      console.log("❌ No lessons array found in response");
      return null;
    }

    // Find current lesson index
    const currentIndex = moduleLessons.findIndex(
      (lesson) => lesson._id === currentLessonId
    );

    if (currentIndex === -1) {
      console.log("❌ Current lesson not found in module lessons");
      return null;
    }

    // Get next lesson if exists
    if (currentIndex < moduleLessons.length - 1) {
      const nextLessonData = moduleLessons[currentIndex + 1];
      console.log("➡️ Next lesson found manually:", nextLessonData.title);
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
 * Find the first incomplete lesson in a module
 */
export const findFirstIncompleteLesson = (lessons = []) => {
  return lessons.find((lesson) => !lesson.isCompleted) || null;
};

/**
 * Get lesson statistics for a module
 */
export const getLessonStatistics = (lessons = []) => {
  const completed = lessons.filter((lesson) => lesson.isCompleted).length;
  const total = lessons.length;
  const { moduleLessonProgress } = calculateModuleLessonProgress(lessons);

  return {
    completed,
    total,
    moduleLessonProgress,
    remaining: total - completed,
  };
};
