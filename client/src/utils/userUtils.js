// /client/src/utils/userUtils.js
/**
 * @fileoverview User data normalisation utility.
 *
 * Maps raw API user responses (which may come in different shapes depending
 * on the endpoint) into a consistent client-side user object with safe
 * defaults for every field.
 *
 * @module utils/userUtils
 */

/**
 * Normalise raw user data from the API into a consistent shape.
 *
 * Handles multiple response formats:
 * - Standard `{ _id, username, email, ... }` from `/auth/user`
 * - Wrapped `{ success: true, id, ... }` from login/register
 * - Sparse objects with alternative key names (`currentLevel` vs `level`,
 *   `totalXP` vs `xp`, `lastActive` vs `lastActiveDate`)
 *
 * If `rawUser` has `success: true` and an `id`, it's used as the source;
 * otherwise `fallbackUser` (usually the previous user state) is used.
 *
 * All array fields are defensively copied. All boolean fields are cast.
 * Missing values receive safe defaults (empty strings, 0, empty arrays).
 *
 * @param {object} [rawUser={}] - The raw user object from the API.
 * @param {object} [fallbackUser={}] - Fallback user data (previous state)
 *   used when `rawUser` is a wrapped response format.
 * @returns {{
 *   _id: string,
 *   username: string,
 *   email: string,
 *   level: number,
 *   xp: number,
 *   streak: number,
 *   badges: object[],
 *   completedLessons: string[],
 *   completedModules: string[],
 *   stats: object,
 *   privacySettings: object,
 *   lastActiveDate: string|null,
 *   totalLearningTime: number,
 *   createdAt: string|null,
 *   isAdmin: boolean,
 *   isBlocked: boolean
 * }}
 */
export const normalizeUserData = (rawUser = {}, fallbackUser = {}) => {
  const source =
    rawUser._id || rawUser.id || rawUser.username ? rawUser : fallbackUser;

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
