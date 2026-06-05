// analytics.js
const { XP } = require("../../shared/constants/progress.cjs");
const { calculateLevelFromModules } = require("../utils/levelUtils");
const LessonCompletion = require("../models/LessonCompletion");
const ModuleCompletion = require("../models/ModuleCompletion");

/**
 * --- PERCENTAGE CALCULATORS ---
 */

const calculateProgress = (count, total) => {
  if (!total || total === 0) return 0;
  return Math.min(100, Math.round((count / total) * 100));
};

const isModuleFinished = (userCompletedLessonIds, moduleLessons) => {
  if (!moduleLessons || moduleLessons.length === 0) return false;

  const completedSet = new Set(
    userCompletedLessonIds.map((id) => id.toString()),
  );
  return moduleLessons.every((lesson) =>
    completedSet.has(lesson._id.toString()),
  );
};

const calculateModuleLessonProgress = (
  completedLessonsInModule,
  totalLessonsInModule,
) => {
  if (totalLessonsInModule === 0) return 0;
  return Math.round((completedLessonsInModule / totalLessonsInModule) * 100);
};

/**
 * --- FORMATTERS ---
 */

/**
 * Formats a comprehensive progress object for the API response.
 * Now accepts pre-fetched completion data rather than reading from user arrays.
 *
 * @param {Object} user - User object (requires _id, xp, username, streak, etc.)
 * @param {number} totalCourseLessons - Total curriculum lessons
 * @param {number} completedCurriculumCount - User's completed curriculum lessons
 * @param {Object} currentModuleData - Current module data
 * @param {Map} moduleOrderCache - Map of module ID to order number
 * @param {Object} [completionData] - Pre-fetched completion data (optional)
 * @param {Array}  [completionData.completedModules] - Array of completed module IDs (strings)
 * @param {Array}  [completionData.completedLessons] - Array of completed lesson IDs (strings)
 * @param {Array}  [completionData.lessonCompletions] - Full LessonCompletion documents
 * @param {Array}  [completionData.moduleCompletions] - Full ModuleCompletion documents
 */
const formatProgressResponse = (
  user,
  totalCourseLessons,
  completedCurriculumCount = null,
  currentModuleData = null,
  moduleOrderCache = null,
  completionData = {},
) => {
  // Use provided completion data or fall back to user arrays (backward compat)
  const completedModules =
    completionData.completedModules || user.completedModules || [];
  const completedLessons =
    completionData.completedLessons || user.completedLessons || [];

  // Calculate level based on completed modules (exclude M0)
  let currentLevel = 1;
  if (moduleOrderCache && completedModules.length > 0) {
    currentLevel = calculateLevelFromModules(
      completedModules,
      moduleOrderCache,
    );
  } else if (user.completedModulesCount !== undefined) {
    currentLevel = Math.min(20, Math.max(1, user.completedModulesCount));
  } else if (user.level) {
    currentLevel = user.level;
  }

  // Course progress
  const uniqueLessons = [
    ...new Set(completedLessons.map((id) => id?.toString())),
  ].filter(Boolean);

  const curriculumCompletedCount =
    completedCurriculumCount !== null
      ? completedCurriculumCount
      : uniqueLessons.length;

  const courseProgressPercentage = calculateProgress(
    curriculumCompletedCount,
    totalCourseLessons,
  );

  // Calculate days active from pre-fetched data if available
  const daysActive =
    completionData.lessonCompletions || completionData.moduleCompletions
      ? calculateDaysActiveFromCompletions(
          completionData.lessonCompletions,
          completionData.moduleCompletions,
          user.lastActiveDate,
        )
      : calculateDaysActive(user); // Fallback to old method

  return {
    username: user.username,
    xp: user.xp,
    level: currentLevel,
    maxLevel: 20,
    streak: user.streak || 0,
    streakStatus: user.streakStatus || "ACTIVE",
    weeklyProgress: user.weeklyProgress || null,
    stats: {
      lessonsCompleted: uniqueLessons.length,
      modulesCompleted: currentLevel,
      totalLearningTime: user.totalLearningTime || 0,
      daysActive,
    },
    courseProgressPercentage,
    progress: {
      coursePercentage: courseProgressPercentage,
      levelPercentage: (currentLevel / 20) * 100,
    },
    currentModule: currentModuleData,
    badges: user.badges || [],
  };
};

/**
 * Get count of completed lessons by tag.
 * Now accepts pre-fetched LessonCompletion array.
 *
 * @param {Array} lessonCompletions - LessonCompletion documents
 * @param {string} tag - Tag to search for (will be lowercased)
 * @returns {number} Count of lessons with this tag
 */
const getLessonCompletionCountByTag = (lessonCompletions, tag) => {
  if (!tag || !Array.isArray(lessonCompletions)) return 0;

  const normalizedTag = tag.toLowerCase();

  return lessonCompletions.filter((entry) =>
    Array.isArray(entry.tags)
      ? entry.tags.map((t) => (t || "").toLowerCase()).includes(normalizedTag)
      : false,
  ).length;
};

/**
 * Check if user has completed a specific challenge group.
 * Now accepts pre-fetched LessonCompletion array.
 *
 * @param {Array} lessonCompletions - LessonCompletion documents
 * @param {string} groupId - Challenge group ID to check
 * @returns {boolean} True if challenge group is completed
 */
const hasCompletedChallengeGroup = (lessonCompletions, groupId) => {
  if (!groupId || !Array.isArray(lessonCompletions)) return false;

  const normalizedGroupId = groupId.toLowerCase();

  return lessonCompletions.some(
    (entry) =>
      typeof entry.challengeGroup === "string" &&
      entry.challengeGroup.toLowerCase() === normalizedGroupId,
  );
};

/**
 * Calculate unique active days from user's embedded arrays (legacy).
 * Used as fallback when pre-fetched completion data is not available.
 *
 * @param {Object} user - User document with completion histories
 * @returns {number} Number of unique days
 */
const calculateDaysActive = (user) => {
  const uniqueDays = new Set();

  if (user.lessonCompletionHistory) {
    user.lessonCompletionHistory.forEach((entry) => {
      if (entry.completedAt) {
        const dateKey = new Date(entry.completedAt).toISOString().split("T")[0];
        uniqueDays.add(dateKey);
      }
    });
  }

  if (user.lastActiveDate) {
    const dateKey = new Date(user.lastActiveDate).toISOString().split("T")[0];
    uniqueDays.add(dateKey);
  }

  if (user.moduleCompletionHistory) {
    user.moduleCompletionHistory.forEach((entry) => {
      if (entry.completedAt) {
        const dateKey = new Date(entry.completedAt).toISOString().split("T")[0];
        uniqueDays.add(dateKey);
      }
    });
  }

  return uniqueDays.size;
};

/**
 * Calculate unique active days from pre-fetched completion collections.
 * Preferred method when LessonCompletion and ModuleCompletion data is available.
 *
 * @param {Array} lessonCompletions - LessonCompletion documents
 * @param {Array} moduleCompletions - ModuleCompletion documents
 * @param {Date} lastActiveDate - User's lastActiveDate
 * @returns {number} Number of unique days
 */
const calculateDaysActiveFromCompletions = (
  lessonCompletions = [],
  moduleCompletions = [],
  lastActiveDate = null,
) => {
  const uniqueDays = new Set();

  lessonCompletions.forEach((entry) => {
    if (entry.completedAt) {
      const dateKey = new Date(entry.completedAt).toISOString().split("T")[0];
      uniqueDays.add(dateKey);
    }
  });

  moduleCompletions.forEach((entry) => {
    if (entry.completedAt) {
      const dateKey = new Date(entry.completedAt).toISOString().split("T")[0];
      uniqueDays.add(dateKey);
    }
  });

  if (lastActiveDate) {
    const dateKey = new Date(lastActiveDate).toISOString().split("T")[0];
    uniqueDays.add(dateKey);
  }

  return uniqueDays.size;
};

module.exports = {
  calculateProgress,
  calculateModuleLessonProgress,
  isModuleFinished,
  formatProgressResponse,
  calculateLevelFromModules,
  getLessonCompletionCountByTag,
  hasCompletedChallengeGroup,
  calculateDaysActive,
};
