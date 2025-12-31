// /src/utils/userUtils.js

/**
 * Normalizes raw user data from API into consistent shape
 * Handles multiple response formats and provides safe defaults
 */
export const normalizeUserData = (rawUser = {}, fallbackUser = {}) => {
  const source = rawUser.success && rawUser.id ? rawUser : fallbackUser;

  return {
    _id: source.id || source._id || "",
    username: source.username || "",
    email: source.email || "",
    level: source.level || source.currentLevel || 1,
    xp: source.xp || source.totalXP || 0,
    streak: source.streak || 0,
    badges: Array.isArray(source.badges) ? [...source.badges] : [],
    completedLessons: Array.isArray(source.completedLessons)
      ? [...source.completedLessons]
      : [],
    completedModules: Array.isArray(source.completedModules)
      ? [...source.completedModules]
      : [],
    stats: source.stats || {},
    privacySettings: source.privacySettings || {},
    lastActiveDate: source.lastActiveDate || source.lastActive || null,
    totalLearningTime: source.totalLearningTime || source.totalSessionTime || 0,
    createdAt: source.createdAt || null,
    isAdmin: Boolean(source.isAdmin),
    isBlocked: Boolean(source.isBlocked),
  };
};
