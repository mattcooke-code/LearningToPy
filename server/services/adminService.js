// adminService.js
// ─────────────── IMPORTS ──────────────────
// ---MODELS---
const AdminLog = require("../models/AdminLog");
const FlaggedContent = require("../models/FlaggedContent");
const Lesson = require("../models/Lesson");
const LessonCompletion = require("../models/LessonCompletion");
const ModuleCompletion = require("../models/ModuleCompletion");
const User = require("../models/User");

// ---SERVICES---
// (added per-stage)

// ---UTILITIES---
const AppError = require("../utils/AppError");
const levelUtils = require("../utils/levelUtils");

// ---CONSTANTS---
// const { DEFAULT_SETTINGS } = require("../constants/adminConstants");

// +=============================================+
// |              USER MANAGEMENT                |
// +=============================================+

// ───────── PRIVATE HELPERS ─────────
/**
 * Find a user by ID or throw 404.
 *
 * Kept local to this service to avoid coupling to `learningEngine`'s private
 * helper of the same purpose.
 *
 * @param   {string} userId
 * @param   {string} [select] - Optional Mongoose select projection
 * @returns {Promise<Object>} Mongoose user document
 * @throws  {AppError} 404 - User not found
 */
const getUserOrThrow = async (userId, select = null) => {
  const query = User.findById(userId);
  if (select) query.select(select);
  const user = await query;
  if (!user) throw new AppError("User not found!", 404);
  return user;
};

// ───────── READS ─────────

/**
 * List all admin users, sorted by creation date.
 *
 * @returns {Promise<{ admins: Object[] }>}
 */
const getAdmins = async () => {
  const admins = await User.find({ isAdmin: true })
    .select("username email level xp lastEngagementAt createdAt")
    .sort({ createdAt: -1 })
    .lean();

  return { admins };
};

/**
 * Get dashboard summary stats (user counts, lesson counts, pending flags).
 *
 * @returns {Promise<{
 *   totalUsers: number,
 *   activeUsers: number,
 *   totalLessons: number,
 *   publishedLessons: number,
 *   pendingFlags: number
 * }>}
 */
const getAdminStats = async () => {
  const [
    totalUsers,
    activeUsers,
    totalLessons,
    publishedLessons,
    pendingFlags,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({
      lastEngagementAt: {
        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    }),
    Lesson.countDocuments(),
    Lesson.countDocuments({ isPublished: true }),
    FlaggedContent.countDocuments({ status: "PENDING" }),
  ]);

  return {
    totalUsers,
    activeUsers,
    totalLessons,
    publishedLessons,
    pendingFlags,
  };
};

/**
 * Search users with filtering, sorting, and pagination.
 *
 * Hydrates each result with a derived `level` (from module completions)
 * and supports level-range filtering. `completedModules` is stripped from
 * the final response.
 *
 * @param {Object}  params
 * @param {string}  [params.query]
 * @param {number}  [params.page=1]
 * @param {number}  [params.limit=20]
 * @param {string}  [params.sort="-createdAt"]
 * @param {boolean} [params.isBlocked]
 * @param {boolean} [params.isAdmin]
 * @param {number}  [params.levelMin]
 * @param {number}  [params.levelMax]
 * @returns {Promise<{ users: Object[], pagination: Object }>}
 */
const searchUsers = async ({
  query,
  page = 1,
  limit = 20,
  sort = "-createdAt",
  isBlocked,
  isAdmin,
  levelMin,
  levelMax,
}) => {
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const searchFilter = {};

  if (query) {
    searchFilter.$or = [
      { username: { $regex: query, $options: "i" } },
      { email: { $regex: query, $options: "i" } },
    ];
  }

  if (isBlocked !== undefined) searchFilter.isBlocked = isBlocked === "true";
  if (isAdmin !== undefined) searchFilter.isAdmin = isAdmin === "true";

  let sortOption = {};
  if (sort.startsWith("-")) {
    sortOption[sort.substring(1)] = -1;
  } else {
    sortOption[sort] = 1;
  }

  const users = await User.find(searchFilter)
    .select(
      "username email xp streak badges lastEngagementAt isBlocked isAdmin createdAt completedModulesCount ageBracket",
    )
    .sort(sortOption)
    .skip(skip)
    .limit(limitNum)
    .lean();

  // Hydrate completed-module IDs for level calculation
  const userIds = users.map((u) => u._id);
  const moduleCompletions = await ModuleCompletion.find({
    userId: { $in: userIds },
  }).lean();

  const completionMap = {};
  moduleCompletions.forEach((mc) => {
    const uid = mc.userId.toString();
    if (!completionMap[uid]) completionMap[uid] = [];
    completionMap[uid].push(mc.moduleId);
  });

  const usersWithModules = users.map((user) => ({
    ...user,
    completedModules: completionMap[user._id.toString()] || [],
  }));

  const moduleOrderMap = await levelUtils.getModuleOrderMap();
  const usersWithLevel = await levelUtils.addLevelToUsers(
    usersWithModules,
    moduleOrderMap,
  );

  let filteredUsers = usersWithLevel;

  if (levelMin) {
    filteredUsers = filteredUsers.filter((u) => u.level >= parseInt(levelMin));
  }
  if (levelMax) {
    filteredUsers = filteredUsers.filter((u) => u.level <= parseInt(levelMax));
  }

  const sanitizedUsers = filteredUsers.map(
    ({ completedModules, ...rest }) => rest,
  );

  const total = await User.countDocuments(searchFilter);

  return {
    users: sanitizedUsers,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

/**
 * Get detailed user information including stats, privacy settings, and
 * completion rate.
 *
 * @param {string} userId
 * @returns {Promise<Object>} Full user details with computed stats
 * @throws {AppError} 404 - User not found
 */
const getUserDetails = async (userId) => {
  const user = await User.findById(userId)
    .select(
      "-password -refreshTokenVersion -resetPasswordToken -resetPasswordExpires",
    )
    .lean();

  if (!user) throw new AppError("User not found", 404);

  const [lessonCompletions, moduleCompletions, totalLessons] =
    await Promise.all([
      LessonCompletion.find({ userId })
        .populate("lessonId", "title moduleId")
        .lean(),
      ModuleCompletion.find({ userId })
        .populate("moduleId", "title order")
        .lean(),
      Lesson.countDocuments({ isPublished: true }),
    ]);

  const completionRate =
    totalLessons > 0
      ? Math.round((lessonCompletions.length / totalLessons) * 100)
      : 0;

  const userWithLevel = await levelUtils.getUserWithLevel({
    ...user,
    completedModules: moduleCompletions.map(
      (mc) => mc.moduleId?._id || mc.moduleId,
    ),
  });

  const stats = {
    totalLearningTime: user.totalLearningTime || 0,
    totalSessionTime: user.totalSessionTime || 0,
    loginCount: user.loginCount || 0,
    badgesCount: user.badges?.length || 0,
    completedLessonsCount: lessonCompletions.length,
    completedModulesCount: moduleCompletions.length,
    streak: user.streak || 0,
    completionRate,
  };

  return {
    ...userWithLevel,
    stats,
    completedLessons: lessonCompletions.map((lc) => ({
      _id: lc.lessonId?._id,
      title: lc.lessonId?.title,
      completedAt: lc.completedAt,
    })),
    completedModules: moduleCompletions.map((mc) => ({
      _id: mc.moduleId?._id,
      title: mc.moduleId?.title,
      order: mc.moduleId?.order,
      completedAt: mc.completedAt,
    })),
    totalXP: user.xp || 0,
    currentLevel: userWithLevel.level,
    isAdmin: user.isAdmin || false,
    isBlocked: user.isBlocked || false,
    lastEngagement: user.lastEngagementAt || user.createdAt,
    privacySettings: user.privacySettings || {
      showOnLeaderboards: true,
      showUsernameOnLeaderboards: false,
      showAsAnonymous: false,
    },
  };
};

/**
 * Get a user's lesson completion activity and admin action history.
 *
 * @param {string} userId
 * @param {number} [limit=50]
 * @returns {Promise<{ userActivity: Object[], adminActions: Object[] }>}
 * @throws {AppError} 404 - User not found
 */
const getUserActivity = async (userId, limit = 50) => {
  const user = await getUserOrThrow(userId, "_id");
  const limitNum = parseInt(limit);

  const [userActivity, adminActions] = await Promise.all([
    LessonCompletion.find({ userId: user._id })
      .sort({ completedAt: -1 })
      .limit(limitNum)
      .populate("lessonId", "title")
      .lean(),
    AdminLog.find({ targetId: user._id })
      .sort({ createdAt: -1 })
      .limit(limitNum),
  ]);

  return { userActivity, adminActions };
};

/**
 * Get a user's earned badge IDs.
 *
 * @param {string} userId
 * @returns {Promise<{ badges: string[] }>}
 * @throws {AppError} 404 - User not found
 */
const getUserBadges = async (userId) => {
  const user = await getUserOrThrow(userId, "badges");
  return { badges: user.badges || [] };
};

/**
 * Get a user's completed lessons and modules.
 *
 * @param {string} userId
 * @returns {Promise<{
 *   completedLessons: Array<{ lessonId: any, completedAt: Date }>,
 *   completedModules: Array<{ moduleId: any, completedAt: Date }>
 * }>}
 */
const getUserProgress = async (userId) => {
  await getUserOrThrow(userId, "_id");

  const [lessonCompletions, moduleCompletions] = await Promise.all([
    LessonCompletion.find({ userId }).select("lessonId completedAt").lean(),
    ModuleCompletion.find({ userId }).select("moduleId completedAt").lean(),
  ]);

  return {
    completedLessons: lessonCompletions.map((lc) => ({
      lessonId: lc.lessonId,
      completedAt: lc.completedAt,
    })),
    completedModules: moduleCompletions.map((mc) => ({
      moduleId: mc.moduleId,
      completedAt: mc.completedAt,
    })),
  };
};
// +=============================================+
// |              FLAG MANAGEMENT                |
// +=============================================+

// +=============================================+
// |              CONTENT MANAGEMENT             |
// +=============================================+

// +=============================================+
// |              SETTINGS & STATS               |
// +=============================================+

// ───────── EXPORTS ────────────

module.exports = {
  // User Management
  getAdmins,
  getAdminStats,
  searchUsers,
  getUserDetails,
  getUserActivity,
  getUserBadges,
  getUserProgress,
};
