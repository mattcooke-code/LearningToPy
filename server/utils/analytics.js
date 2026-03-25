// analytics.js
const { XP } = require("../../shared/constants/progress");
const { calculateLevelFromModules } = require("./levelUtils");

/**
 * --- PERCENTAGE CALCULATORS ---
 */

const calculateProgress = (count, total) => {
  if (!total || total === 0) return 0;
  return Math.min(100, Math.round((count / total) * 100));
};

/**
 * Checks if a module is finished by comparing completed lessons
 * against the module's lesson list.
 */
const isModuleFinished = (userCompletedLessonIds, moduleLessons) => {
  if (!moduleLessons || moduleLessons.length === 0) return false;

  const completedSet = new Set(
    userCompletedLessonIds.map((id) => id.toString()),
  );
  return moduleLessons.every((lesson) =>
    completedSet.has(lesson._id.toString()),
  );
};

/**
 * Calculate module lesson progress percentage
 * @param {number} completedLessonsInModule - Number of completed lessons in module
 * @param {number} totalLessonsInModule - Total lessons in module
 * @returns {number} Progress percentage (0-100)
 */
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
 * Consolidates data from the user doc and course totals.
 *
 * @param {Object} user - User object with completion data
 * @param {number} totalCourseLessons - Total curriculum lessons
 * @param {number} completedCurriculumCount - User's completed curriculum lessons (optional, will calculate if not provided)
 * @param {Object} currentModuleData - Current module data { order, title, lessonCount, lessonsCompleted }
 * @param {Map} moduleOrderCache - Map of module ID to order number for level calculation
 */
const formatProgressResponse = (
  user,
  totalCourseLessons,
  completedCurriculumCount = null,
  currentModuleData = null,
  moduleOrderCache = null,
) => {
  // Calculate level based on completed modules (exclude M0)
  let currentLevel = 1;
  if (moduleOrderCache && user.completedModules) {
    currentLevel = calculateLevelFromModules(
      user.completedModules,
      moduleOrderCache,
    );
  } else if (user.level) {
    // Fallback to stored level if no cache provided
    currentLevel = user.level;
  }

  // Course progress
  const uniqueLessons = [
    ...new Set((user.completedLessons || []).map((id) => id?.toString())),
  ].filter(Boolean);

  const curriculumCompletedCount =
    completedCurriculumCount !== null
      ? completedCurriculumCount
      : uniqueLessons.length;

  const courseProgressPercentage = calculateProgress(
    curriculumCompletedCount,
    totalCourseLessons,
  );

  const daysActive = calculateDaysActive(user);

  return {
    username: user.username,
    xp: user.xp,
    level: currentLevel,
    maxLevel: 20,
    streak: user.streak || 0,
    streakStatus: user.streakStatus || "active",
    weeklyProgress: user.weeklyProgress || null,
    stats: {
      lessonsCompleted: uniqueLessons.length,
      modulesCompleted: currentLevel, // Level = modules completed (M1-M20)
      totalLearningTime: user.totalLearningTime || 0,
      daysActive,
    },
    courseProgressPercentage,
    progress: {
      coursePercentage: courseProgressPercentage,
      levelPercentage: (currentLevel / 20) * 100,
      // Removed xpToNextLevel since level is now based on modules
    },
    // Current module progress for SegmentedLevelProgressBar
    currentModule: currentModuleData,
    badges: user.badges || [],
  };
};

/**
 * Get count of completed lessons by tag
 * @param {Array} lessonHistory - User's lesson completion history
 * @param {string} tag - Tag to search for (will be lowercased)
 * @returns {number} Count of lessons with this tag
 */
const getLessonCompletionCountByTag = (lessonHistory, tag) => {
  if (!tag || !Array.isArray(lessonHistory)) return 0;

  const normalizedTag = tag.toLowerCase();

  return lessonHistory.filter((entry) =>
    Array.isArray(entry.tags)
      ? entry.tags.map((t) => (t || "").toLowerCase()).includes(normalizedTag)
      : false,
  ).length;
};

/**
 * Check if user has completed a specific challenge group
 * @param {Array} lessonHistory - User's lesson completion history
 * @param {string} groupId - Challenge group ID to check
 * @returns {boolean} True if challenge group is completed
 */
const hasCompletedChallengeGroup = (lessonHistory, groupId) => {
  if (!groupId || !Array.isArray(lessonHistory)) return false;

  const normalizedGroupId = groupId.toLowerCase();

  return lessonHistory.some(
    (entry) =>
      typeof entry.challengeGroup === "string" &&
      entry.challengeGroup.toLowerCase() === normalizedGroupId,
  );
};

/**
 * Calculate unique active days from completion history
 * @param {Object} user - User document with completion histories
 * @returns {number} - Number of unique days user has been active
 */
const calculateDaysActive = (user) => {
  const uniqueDays = new Set();

  if (user.lessonCompletionHistory) {
    user.lessonCompletionHistory.forEach((entry) => {
      if (entry.completedAt) {
        const dateKey = entry.completedAt.toISOString().split("T")[0];
        uniqueDays.add(dateKey);
      }
    });
  }

  // Add days from module completions
  if (user.moduleCompletionHistory) {
    user.moduleCompletionHistory.forEach((entry) => {
      if (entry.completedAt) {
        const dateKey = entry.completedAt.toISOString().split("T")[0];
        uniqueDays.add(dateKey);
      }
    });
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
