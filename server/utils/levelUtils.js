// levelUtils.js
const Module = require("../models/Module");

// Cache for module order map to avoid repeated database queries
let moduleOrderMapCache = null;
let lastCacheTime = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get the module order map (with caching)
 * @returns {Promise<Map>} Map of module ID to order number
 */
const getModuleOrderMap = async () => {
  // Check if cache is still valid
  const now = Date.now();
  if (moduleOrderMapCache && lastCacheTime && now - lastCacheTime < CACHE_TTL) {
    return moduleOrderMapCache;
  }

  // Fetch fresh data
  const allModules = await Module.find({}).select("order").lean();
  const moduleOrderMap = new Map(
    allModules.map((m) => [m._id.toString(), m.order]),
  );

  // Update cache
  moduleOrderMapCache = moduleOrderMap;
  lastCacheTime = now;

  return moduleOrderMap;
};

/**
 * Calculate a user's level based on completed modules.
 *
 * Excludes M0 (tutorial module, order = 0). Level = number of completed
 * regular modules, clamped to 1–20. If no moduleOrderMap is provided,
 * all completed modules are counted (fallback).
 *
 * @param   {Array}    completedModules - Array of completed module IDs (strings or ObjectIds)
 * @param   {Map}      [moduleOrderMap] - Map of moduleId → order (from getModuleOrderMap)
 * @returns {number}   Current level (1–20)
 */
const calculateLevelFromModules = (completedModules, moduleOrderMap = null) => {
  if (!completedModules || !Array.isArray(completedModules)) {
    return 1;
  }

  // Count completed modules that are NOT tutorial (order > 0)
  const completedRegularModules = completedModules.filter((moduleId) => {
    const order = moduleOrderMap
      ? moduleOrderMap.get(moduleId.toString())
      : null;
    // If we don't have the map, we can't determine order, so assume it's a regular module
    // (This is a fallback - ideally we always have the map)
    return order !== undefined ? order > 0 : true;
  });

  return Math.min(20, Math.max(1, completedRegularModules.length));
};

/**
 * Calculate level for a single user (with database fetch if needed)
 * @param {Object} user - User object with completedModules array
 * @param {Map} moduleOrderMap - Optional pre-fetched module order map
 * @returns {Promise<number>} Calculated level
 */
const calculateUserLevel = async (user, moduleOrderMap = null) => {
  if (!user || !user.completedModules) return 1;

  const orderMap = moduleOrderMap || (await getModuleOrderMap());
  return calculateLevelFromModules(user.completedModules, orderMap);
};

/**
 * Add calculated level to user objects
 * @param {Array} users - Array of user objects
 * @param {Map} moduleOrderMap - Optional pre-fetched module order map
 * @returns {Promise<Array>} Users with level added
 */
const addLevelToUsers = async (users, moduleOrderMap = null) => {
  if (!users || !Array.isArray(users)) return [];

  const orderMap = moduleOrderMap || (await getModuleOrderMap());

  return users.map((user) => {
    const level = calculateLevelFromModules(user.completedModules, orderMap);

    // Remove completedModules from response if it's a plain object (to keep response clean)
    const { completedModules, ...userWithoutModules } = user;
    return {
      ...userWithoutModules,
      level,
    };
  });
};

/**
 * Get a user with calculated level (for single user queries)
 * @param {Object} user - User object from database
 * @returns {Promise<Object>} User with level added
 */
const getUserWithLevel = async (user) => {
  if (!user) return null;

  const level = await calculateUserLevel(user);
  return {
    ...user,
    level,
  };
};

module.exports = {
  getModuleOrderMap,
  calculateLevelFromModules,
  calculateUserLevel,
  addLevelToUsers,
  getUserWithLevel,
};
