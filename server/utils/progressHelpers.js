// progressHelpers.js

const { BADGE_DEFINITIONS } = require("./badgeLogic");
const { THRESHOLDS, XP } = require("../../shared/constants/progress");

// ===== CONSTANTS =====
const XP_PER_LEVEL = XP.PER_LEVEL;

// ===== BADGE DEFINITIONS =====
const ALL_BADGES = BADGE_DEFINITIONS.map(
  ({ id, name, description, category }) => ({
    id,
    name,
    description,
    category,
  })
);

const shouldAwardProgressBadge = (progress) => {
  if (progress >= THRESHOLDS.MASTER) {
    return "master_progress_badge";
  }
  // etc.
};

// ===== STREAK LOGIC =====
const checkDate = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

const streakLogic = (lastActiveDate) => {
  const today = checkDate(new Date());
  const lastActive = checkDate(lastActiveDate);
  const diffTime = today - lastActive;
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return { streakAction: "$inc", value: 1 };
  } else if (diffDays === 0) {
    return { streakAction: "$set", value: null };
  } else {
    return { streakAction: "$set", value: 1 };
  }
};

// ===== MODULE PROGRESS CALCULATIONS =====

/**
 * Calculate module lesson progress percentage
 * @param {number} completedLessonsInModule - Number of completed lessons in module
 * @param {number} totalLessonsInModule - Total lessons in module
 * @returns {number} Progress percentage (0-100)
 */
const calculateModuleLessonProgress = (
  completedLessonsInModule,
  totalLessonsInModule
) => {
  if (totalLessonsInModule === 0) return 0;
  return Math.round((completedLessonsInModule / totalLessonsInModule) * 100);
};

/**
 * Calculate overall course progress
 * @param {number} completedLessonsCount - Total completed lessons
 * @param {number} totalLessons - Total lessons in course
 * @returns {number} Course progress percentage (0-100)
 */
const calculateCourseProgress = (completedLessonsCount, totalLessons) => {
  if (totalLessons === 0) return 0;
  return Math.min(
    100,
    Math.round((completedLessonsCount / totalLessons) * 100)
  );
};

/**
 * Calculate if module is completed (all lessons completed)
 * @param {Array} completedLessons - User's completed lessons array
 * @param {Array} moduleLessons - All lessons in module
 * @returns {boolean} Whether module is completed
 */
const isModuleCompleted = (completedLessons, moduleLessons) => {
  const completedLessonsSet = new Set(
    completedLessons.map((id) => id.toString())
  );
  return moduleLessons.every((lesson) =>
    completedLessonsSet.has(lesson._id.toString())
  );
};

const calculateLevelProgress = (xp) => {
  const currentLevel = Math.floor(xp / XP.PER_LEVEL) + 1;
  const xpInCurrentLevel = xp % XP.PER_LEVEL;
  const progressCompleted = (xpInCurrentLevel / XP.PER_LEVEL) * 100;

  return {
    currentLevel,
    xpInCurrentLevel,
    progressCompleted: Math.round(progressCompleted),
    xpNeededForNextLevel: XP.PER_LEVEL - xpInCurrentLevel,
  };
};

// ===== RESPONSE FORMATTING =====
const formatProgressResponse = (userData, totalLessons) => {
  const currentLevel = Math.floor(userData.xp / XP_PER_LEVEL) + 1;
  const xpInCurrentLevel = userData.xp % XP_PER_LEVEL;
  const progressCompleted = (xpInCurrentLevel / XP_PER_LEVEL) * 100;
  const xpNeededForNextLevel = XP_PER_LEVEL - xpInCurrentLevel;

  const uniqueCompletedLessons = Array.isArray(userData.completedLessons)
    ? [
        ...new Set(userData.completedLessons.map((id) => id?.toString())),
      ].filter(Boolean)
    : [];

  const uniqueCompletedModules = Array.isArray(userData.completedModules)
    ? [
        ...new Set(userData.completedModules.map((id) => id?.toString())),
      ].filter(Boolean)
    : [];

  const completedLessonsCount = uniqueCompletedLessons.length;
  const completedModulesCount = uniqueCompletedModules.length;

  const courseProgressPercentage = calculateCourseProgress(
    completedLessonsCount,
    totalLessons
  );

  return {
    username: userData.username,
    xp: userData.xp,
    level: currentLevel,
    streak: userData.streak,
    completedLessonsCount,
    completedModulesCount,
    badges: userData.badges || [],
    courseProgressPercentage,
    nextLevelXp: xpNeededForNextLevel,
    totalLearningTime: userData.totalLearningTime || 0,
  };
};

// ===== EXPORTS =====
module.exports = {
  // Constants
  XP_PER_LEVEL,

  // Badges
  ALL_BADGES,
  BADGE_DEFINITIONS,

  // Streak
  checkDate,
  streakLogic,

  // Progress Calculations
  calculateModuleLessonProgress,
  calculateCourseProgress,
  calculateLevelProgress,
  isModuleCompleted,

  // Response Formatting
  formatProgressResponse,
};
