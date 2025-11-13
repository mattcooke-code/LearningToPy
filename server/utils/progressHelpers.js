// progressHelpers.js

const { BADGE_DEFINITIONS } = require("./badgeLogic");

// ===== CONSTANTS =====
const XP_PER_LEVEL = 100;
const TOTAL_LESSONS = 10;
const LESSON_XP_REWARD = 25;
const MODULE_XP_BONUS = 100;

// ===== BADGE DEFINITIONS =====
const ALL_BADGES = BADGE_DEFINITIONS.map(
  ({ id, name, description, category }) => ({
    id,
    name,
    description,
    category,
  })
);

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

// ===== RESPONSE FORMATTING =====
const formatProgressResponse = (userData) => {
  const nextLevelMilestoneXp = userData.level * XP_PER_LEVEL;
  const xpInCurrentLevel = userData.xp - (userData.level - 1) * XP_PER_LEVEL;
  const nextLevelXp = Math.max(0, nextLevelMilestoneXp - xpInCurrentLevel);

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
  const progressPercentage =
    TOTAL_LESSONS > 0
      ? Math.min(100, Math.round((completedLessonsCount / TOTAL_LESSONS) * 100))
      : 0;

  return {
    username: userData.username,
    xp: userData.xp,
    level: userData.level,
    streak: userData.streak,
    completedLessonsCount,
    completedModulesCount,
    badges: userData.badges || [],
    progressPercentage,
    nextLevelXp: nextLevelXp,
    totalLearningTime: userData.totalLearningTime || 0,
  };
};

// ===== EXPORTS =====
module.exports = {
  // Constants
  XP_PER_LEVEL,
  TOTAL_LESSONS,
  LESSON_XP_REWARD,
  MODULE_XP_BONUS,

  // Badges
  ALL_BADGES,
  BADGE_DEFINITIONS,

  // Streak
  checkDate,
  streakLogic,

  // Response Formatting
  formatProgressResponse,
};
