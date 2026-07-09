/**
 * Admin Controller — 35 functions for platform administration.
 *
 * All routes require admin authentication (enforced by `adminOnly` middleware).
 * Provides CRUD for users, lessons, modules, flags, settings, and analytics.
 *
 * **Categories:**
 * - **User management:** toggleAdminStatus, getAdmins, searchUsers, adjustUserXp,
 *   updateUserStatus, getUserDetails, getUserActivity, getUserBadges, getUserProgress,
 *   overrideUserProgress, awardBadges, removeBadges
 * - **Flag management:** getFlaggedContent, getFlagStats, resolveFlag
 * - **Content management:** getAllLessons, getAllModules, createLesson, createModule,
 *   updateLesson, updateModule, deleteLesson, deleteModule, duplicateLesson,
 *   duplicateModule, updateLessonOrder, updateModuleOrder, publishLesson, publishModule
 * - **Settings & stats:** getSettings, updateSettings, getAdminStats, getContentStats,
 *   getActivityLogs
 *
 * @middleware adminOnly - Required on all routes
 */
const AdminLog = require("../models/AdminLog");
const FlaggedContent = require("../models/FlaggedContent");
const Lesson = require("../models/Lesson");
const LessonCompletion = require("../models/LessonCompletion");
const Module = require("../models/Module");
const ModuleCompletion = require("../models/ModuleCompletion");
const User = require("../models/User");
const XpTransaction = require("../models/XpTransaction");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const {
  addLevelToUsers,
  getUserWithLevel,
  getModuleOrderMap,
} = require("../utils/levelUtils");
const { anonymiseIp } = require("../utils/parseDeviceInfo");
const { sendJsonResponse } = require("../utils/responseHelpers");

const mongoose = require("mongoose");

// ======= HELPER FUNCTIONs =======
/**
 * Create an audit log entry for admin actions.
 *
 * Anonymises the admin's IP address for GDPR/data protection compliance.
 * Logging failures are caught silently — they never fail the request.
 *
 * @param {string}   adminId    - ID of the admin performing the action
 * @param {string}   action     - Action type (e.g., "USER_MADE_ADMIN", "LESSON_DELETED")
 * @param {string}   targetType - Type of target ("USER", "LESSON", "MODULE", "FLAG", "SETTINGS")
 * @param {string}   targetId   - ID of the affected resource
 * @param {Object}   changes    - { old, new } diff of the change
 * @param {string}   reason     - Human-readable reason for the action
 * @param {Object}   req        - Express request object (for IP and user-agent)
 */
const createAdminLog = async (
  adminId,
  action,
  targetType,
  targetId,
  changes,
  reason,
  req,
) => {
  try {
    // Anonymise IP address for data protection compliance
    const anonymizedIp = anonymiseIp(req.ip || req.connection.remoteAddress);

    await AdminLog.create({
      adminId,
      action,
      targetType,
      targetId,
      changes,
      reason: reason || "",
      ipAddress: anonymizedIp,
      userAgent: req.headers["user-agent"],
    });
  } catch (logError) {
    console.error("Failed to create admin log:", logError);
  }
};

/**
 * getSettings() - default settings object
 */
const DEFAULT_SETTINGS = {
  themeColor: "#3b82f6",
  codeTheme: "dark",
  defaultTheme: "system",
  xpPerLevel: 100,
  moduleXpBonus: 500,
  streakBonusMultiplier: 1.5,
  dailyStreakReward: 50,
  weeklyChallengeBonus: 1000,
  maxFileSize: 10,
  maxAvatarSize: 2,
  sessionTimeout: 60,
  maxLoginAttempts: 5,
  enableLeaderboards: true,
  enableBadges: true,
  enableStreaks: true,
  enableChallenges: true,
  enableComments: true,
  maintenanceMode: false,
  allowRegistrations: true,
  defaultDifficulty: "BEGINNER",
  maxLessonsPerModule: 20,
  previewMode: false,
  autoPublishNewContent: false,
  requireEmailVerification: false,
  requireStrongPassword: true,
  enable2FA: false,
  logIpAddresses: true,
};

/**
 * Toggle a user's admin status.
 * Prevents self-modification (admin cannot demote themselves).
 *
 * @route   PUT /api/admin/users/:userId/toggle-admin
 * @body    {boolean} makeAdmin - New admin status
 * @body    {string}  [reason]  - Reason for the change
 * @returns {Object} 200 - Updated user
 * @returns {Object} 400 - Cannot modify own admin status
 * @returns {Object} 404 - User not found
 */
const toggleAdminStatus = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { makeAdmin, reason } = req.body;

  // Prevent self-modification
  if (userId === req.userId.toString()) {
    return next(new AppError("Cannot modify own admin status.", 400));
  }

  const user = await User.findById(userId).select("+ageBracket");
  if (!user) {
    return next(new AppError("User not found.", 404));
  }

  if (makeAdmin && user.ageBracket !== "18+") {
    return next(
      new AppError(
        "Users must be 18 or older to be granted admin priviledges.",
        400,
      ),
    );
  }

  const oldStatus = user.isAdmin;
  const oldLeaderboardStatus = user.leaderboardStatus;

  user.isAdmin = makeAdmin;

  if (makeAdmin) {
    user.leaderboardStatus = "INACTIVE_REMOVED";
    user.removedFromLeaderboardAt = new Date();
    user.privacySettings = {
      showOnLeaderboards: false,
      showAsAnonymous: true,
      showUsernameOnLeaderboards: false,
    };
  } else {
    user.leaderboardStatus =
      user.completedModulesCount >= 20 ? "COMPLETED_PENDING" : "ACTIVE";
    user.removedFromLeaderboardAt = null;
    user.privacySettings = {
      showOnLeaderboards: true,
      showAsAnonymous: false,
      showUsernameOnLeaderboards: false,
    };
  }

  await user.save();

  await createAdminLog(
    req.userId,
    makeAdmin ? "USER_MADE_ADMIN" : "USER_REMOVED_ADMIN",
    "USER",
    userId,
    {
      old: { isAdmin: oldStatus, leaderboardStatus: oldLeaderboardStatus },
      new: { isAdmin: user.isAdmin, leaderboardStatus: user.leaderboardStatus },
    },
    reason || `Admin status ${makeAdmin ? "granted" : "revoked"} by admin.`,
    req,
  );

  sendJsonResponse(
    res,
    200,
    `User ${makeAdmin ? "made" : "removed from"} admin`,
    { user },
  );
});

/**
 * List all admin users, sorted by creation date.
 *
 * @route   GET /api/admin/admins
 * @returns {Object} 200 - { admins: [...] }
 */
const getAdmins = catchAsync(async (req, res, next) => {
  const admins = await User.find({ isAdmin: true })
    .select("username email level xp lastActive createdAt")
    .sort({ createdAt: -1 });

  sendJsonResponse(res, 200, "Admins retrieved", { admins });
});

/**
 * Get dashboard summary stats (user counts, lesson counts, pending flags).
 *
 * @route   GET /api/admin/stats
 * @returns {Object} 200 - { totalUsers, activeUsers, totalLessons, publishedLessons, pendingFlags }
 */
const getAdminStats = catchAsync(async (req, res, next) => {
  const [
    totalUsers,
    activeUsers,
    totalLessons,
    publishedLessons,
    pendingFlags,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({
      lastActive: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    }),
    Lesson.countDocuments(),
    Lesson.countDocuments({ isPublished: true }),
    FlaggedContent.countDocuments({ status: "PENDING" }),
  ]);

  sendJsonResponse(res, 200, "Admin stats retrieved", {
    totalUsers,
    activeUsers,
    totalLessons,
    publishedLessons,
    pendingFlags,
  });
});

/**
 * Search users with filtering, sorting, and pagination.
 *
 * Supports text search on username/email, filters for blocked/admin status,
 * level range filtering, and arbitrary sort fields.
 *
 * @route   GET /api/admin/users/search
 * @query   {string}  [query]    - Text search (username/email)
 * @query   {number}  [page=1]   - Page number
 * @query   {number}  [limit=20] - Results per page
 * @query   {string}  [sort=-createdAt] - Sort field (prefix with - for descending)
 * @query   {boolean} [isBlocked] - Filter by blocked status
 * @query   {boolean} [isAdmin]   - Filter by admin status
 * @query   {number}  [levelMin]  - Minimum user level
 * @query   {number}  [levelMax]  - Maximum user level
 * @returns {Object} 200 - { users, pagination: { page, limit, total, totalPages } }
 */
const searchUsers = catchAsync(async (req, res, next) => {
  const {
    query,
    page = 1,
    limit = 20,
    sort = "-createdAt",
    isBlocked,
    isAdmin,
    levelMin,
    levelMax,
  } = req.query;

  const searchFilter = {};

  if (query) {
    searchFilter.$or = [
      { username: { $regex: query, $options: "i" } },
      { email: { $regex: query, $options: "i" } },
    ];
  }

  if (isBlocked !== undefined) {
    searchFilter.isBlocked = isBlocked === "true";
  }

  if (isAdmin !== undefined) {
    searchFilter.isAdmin = isAdmin === "true";
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  let sortOption = {};
  if (sort.startsWith("-")) {
    sortOption[sort.substring(1)] = -1;
  } else {
    sortOption[sort] = 1;
  }

  if (Object.keys(sortOption).length === 0) {
    sortOption = { createdAt: -1 };
  }

  const users = await User.find(searchFilter)
    .select(
      "username email xp streak badges lastActive isBlocked isAdmin createdAt completedModulesCount ageBracket",
    )
    .sort(sortOption)
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  // Fetch module completions for level calculation
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

  const moduleOrderMap = await getModuleOrderMap();
  const usersWithLevel = await addLevelToUsers(
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

  sendJsonResponse(res, 200, "Users retrieved", {
    users: sanitizedUsers,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
    },
  });
});

/**
 * Manually adjust a user's XP.
 * Prevents self-modification. Logs old/new XP values.
 *
 * @route   PUT /api/admin/users/:userId/xp
 * @body    {number} xpChange - Positive or negative XP adjustment
 * @body    {string} [reason] - Reason for adjustment
 * @returns {Object} 200 - { user, change }
 * @returns {Object} 400 - Cannot modify own XP
 * @returns {Object} 404 - User not found
 */
const adjustUserXp = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { xpChange, reason } = req.body;

  if (userId === req.userId.toString()) {
    return next(new AppError("Cannot modify your own XP", 400));
  }

  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const oldXp = user.xp;
  const oldLevel = user.level;

  user.xp += parseInt(xpChange);
  await user.save();

  // Fetch module completions for level calculation
  const moduleCompletions = await ModuleCompletion.find({ userId }).lean();
  const userWithModules = {
    ...user.toObject(),
    completedModules: moduleCompletions.map((mc) => mc.moduleId),
  };
  const userWithLevel = await getUserWithLevel(userWithModules);

  const updatedUser = {
    _id: user._id,
    username: user.username,
    level: userWithLevel.level,
    xp: user.xp,
    streak: user.streak,
    badgeCount: user.badges?.length || 0,
  };

  await createAdminLog(
    req.userId,
    "XP_ADJUSTMENT",
    "USER",
    userId,
    {
      old: { xp: oldXp, level: oldLevel },
      new: { xp: updatedUser.xp, level: updatedUser.level },
    },
    reason || `XP adjusted by admin: ${xpChange > 0 ? "+" : ""}${xpChange}`,
    req,
  );

  // Create XP transaction record for audit trail
  await XpTransaction.create({
    userId,
    amount: parseInt(xpChange),
    source: "BONUS",
    meta: { reason: reason || "Admin adjustment", adminId: req.userId },
  });

  sendJsonResponse(res, 200, "XP adjusted successfully", {
    user: updatedUser,
    change: xpChange,
  });
});

/**
 * List flagged content with filters, search, and pagination.
 * Enriches lesson flags with semantic IDs (e.g., "M3L5") for readability.
 *
 * @route   GET /api/admin/flags
 * @query   {string} [status]    - Filter by status (PENDING, IN_REVIEW, FIXED, REJECTED, ALL)
 * @query   {string} [issueType] - Filter by issue type
 * @query   {string} [search]    - Text search on title/description
 * @query   {number} [page=1]    - Page number
 * @query   {number} [limit=20]  - Results per page
 * @returns {Object} 200 - { flaggedContent, pagination }
 */
const getFlaggedContent = catchAsync(async (req, res, next) => {
  const { status, issueType, search, page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const filter = {};
  if (status && status !== "ALL") {
    filter.status = status;
  }
  if (issueType && issueType !== "") {
    filter.issueType = issueType;
  }
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { suggestedFix: { $regex: search, $options: "i" } },
    ];
  }

  const [flaggedContent, total] = await Promise.all([
    FlaggedContent.find(filter)
      .populate("reporterId", "username email")
      .populate("resolvedBy", "username email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    FlaggedContent.countDocuments(filter),
  ]);

  // ── Batch-fetch lessons for enrichment ──────────────────────
  const lessonIds = flaggedContent
    .filter((f) => f.targetType === "LESSON" && f.targetId)
    .map((f) => f.targetId);

  const userFlagIds = flaggedContent
    .filter((f) => f.targetType === "USER_PROFILE" && f.targetId)
    .map((f) => f.targetId);

  const [lessons, users] = await Promise.all([
    lessonIds.length > 0
      ? Lesson.find({ _id: { $in: lessonIds } })
          .populate("moduleId", "order title")
          .lean()
      : [],
    userFlagIds.length > 0
      ? User.find({ _id: { $in: userFlagIds } })
          .select("username email")
          .lean()
      : [],
  ]);

  const lessonMap = new Map(lessons.map((l) => [l._id.toString(), l]));
  const userMap = new Map(users.map((u) => [u._id.toString(), u]));

  // ── Enrich flags with semantic data ─────────────────────────
  const enrichedContent = flaggedContent.map((flag) => {
    if (flag.targetType === "LESSON" && flag.targetId) {
      const lesson = lessonMap.get(flag.targetId.toString());
      if (lesson && lesson.moduleId) {
        return {
          ...flag,
          semanticId: `M${lesson.moduleId.order}L${lesson.order || 0}`,
          lessonTitle: lesson.title,
          moduleTitle: lesson.moduleId.title,
          contentPreview: lesson.description?.substring(0, 200),
        };
      }
      return {
        ...flag,
        semanticId: `Lesson ${flag.targetId.slice(-6)}`,
      };
    }

    if (flag.targetType === "USER_PROFILE" && flag.targetId) {
      const user = userMap.get(flag.targetId.toString());
      return {
        ...flag,
        semanticId: `User: ${user?.username || "Unknown"}`,
        contentPreview: `Email: ${user?.email || "N/A"}`,
      };
    }

    return flag;
  });

  sendJsonResponse(res, 200, "Flagged content retrieved", {
    flaggedContent: enrichedContent,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
    },
  });
});

/**
 * Get aggregate flag statistics grouped by status.
 *
 * @route   GET /api/admin/flags/stats
 * @returns {Object} 200 - { pending, in_review, fixed, rejected, xp_adjusted }
 */
const getFlagStats = catchAsync(async (req, res, next) => {
  const stats = await FlaggedContent.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const result = {
    pending: 0,
    in_review: 0,
    fixed: 0,
    rejected: 0,
    xp_adjusted: 0,
  };

  stats.forEach((stat) => {
    const key = stat._id.toLowerCase();
    if (result.hasOwnProperty(key)) {
      result[key] = stat.count;
    }
  });

  sendJsonResponse(res, 200, "Flag statistics retrieved", result);
});

/**
 * Block, unblock, or delete a user account.
 * Prevents self-modification. Block can include a duration (in days).
 *
 * @route   PUT /api/admin/users/:userId/status
 * @body    {string} action   - "block", "unblock", or "delete"
 * @body    {number} [duration] - Block duration in days (only for "block")
 * @body    {string} [reason]   - Reason for the action
 * @returns {Object} 200 - Updated user (null for delete)
 * @returns {Object} 400 - Cannot modify own status or invalid action
 * @returns {Object} 404 - User not found
 */
const updateUserStatus = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { action, duration, reason } = req.body;

  // Prevent self-modification
  if (userId === req.userId.toString()) {
    return next(new AppError("Cannot modify your own status", 400));
  }

  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const oldStatus = user.isBlocked;

  let actionType;
  switch (action) {
    case "block":
      user.isBlocked = true;
      user.suspensionEnd = duration
        ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000)
        : null;
      user.suspensionReason = reason;
      actionType = "USER_BLOCKED";
      break;
    case "unblock":
      user.isBlocked = false;
      user.suspensionEnd = null;
      user.suspensionReason = null;
      actionType = "USER_UNBLOCKED";
      break;
    case "delete":
      await User.findByIdAndDelete(userId);
      actionType = "USER_DELETED";
      break;
    default:
      return next(
        new AppError(
          "Invalid action. Use 'block', 'unblock', or 'delete'",
          400,
        ),
      );
  }

  if (action !== "delete") {
    await user.save();
  }

  await createAdminLog(
    req.userId,
    actionType,
    "USER",
    userId,
    {
      old: { isBlocked: oldStatus },
      new: action === "delete" ? null : { isBlocked: user.isBlocked },
    },
    reason || `${action} action performed by admin`,
    req,
  );

  sendJsonResponse(res, 200, `User ${action}ed successfully`, {
    user: action === "delete" ? null : user,
  });
});

/**
 * Get detailed user information including stats, privacy settings, and completion rate.
 *
 * @route   GET /api/admin/users/:userId
 * @returns {Object} 200 - Full user details with computed stats
 * @returns {Object} 404 - User not found
 */
const getUserDetails = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const user = await User.findById(userId)
    .select(
      "-password -refreshTokenVersion -resetPasswordToken -resetPasswordExpires",
    )
    .lean();

  if (!user) {
    return next(new AppError("User not found", 404));
  }

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

  const userWithLevel = await getUserWithLevel({
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

  const userData = {
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
    lastActiveDate: user.lastActive || user.createdAt,
    privacySettings: user.privacySettings || {
      showOnLeaderboards: true,
      showUsernameOnLeaderboards: false,
      showAsAnonymous: false,
    },
  };

  sendJsonResponse(res, 200, "User details retrieved", userData);
});

/**
 * Get a user's lesson completion activity and admin action history.
 *
 * @route   GET /api/admin/users/:userId/activity
 * @query   {number} [limit=50] - Max activity entries to return
 * @returns {Object} 200 - { userActivity, adminActions }
 * @returns {Object} 404 - User not found
 */
const getUserActivity = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { limit = 50 } = req.query;

  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const [activity, adminActions] = await Promise.all([
    LessonCompletion.find({ userId })
      .sort({ completedAt: -1 })
      .limit(parseInt(limit))
      .populate("lessonId", "title")
      .lean(),
    AdminLog.find({ targetId: userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit)),
  ]);

  sendJsonResponse(res, 200, "User activity retrieved", {
    userActivity: activity,
    adminActions,
  });
});
/**
 * Get a user's earned badge IDs.
 *
 * @route   GET /api/admin/users/:userId/badges
 * @returns {Object} 200 - { badges: [...] }
 * @returns {Object} 404 - User not found
 */
const getUserBadges = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.userId).select("badges");
  if (!user) return next(new AppError("User not found", 404));

  sendJsonResponse(res, 200, "User badges retrieved", {
    badges: user.badges || [],
  });
});

/**
 * Award one or more badges to a user. Skips badges already earned.
 *
 * @route   POST /api/admin/users/:userId/badges/award
 * @body    {string[]} badgeIds - Badge IDs to award
 * @body    {string}   [reason] - Reason for awarding
 * @returns {Object} 200 - { awarded, total }
 * @returns {Object} 404 - User not found
 */
const awardBadges = catchAsync(async (req, res, next) => {
  const { badgeIds, reason } = req.body;
  const user = await User.findById(req.params.userId);

  if (!user) return next(new AppError("User not found", 404));

  const newBadges = badgeIds.filter((id) => !user.badges.includes(id));

  if (newBadges.length > 0) {
    user.badges = [...new Set([...user.badges, ...newBadges])];

    await createAdminLog(
      req.userId,
      "AWARD_BADGES",
      "USER",
      user._id,
      { added: newBadges, reason },
      reason,
      req,
    );

    await user.save();
  }

  sendJsonResponse(
    res,
    200,
    `Successfully awarded ${newBadges.length} badges`,
    { awarded: newBadges, total: user.badges.length },
  );
});

/**
 * Remove one or more badges from a user.
 *
 * @route   POST /api/admin/users/:userId/badges/remove
 * @body    {string[]} badgeIds - Badge IDs to remove
 * @body    {string}   [reason] - Reason for removal
 * @returns {Object} 200 - { removed, remaining }
 * @returns {Object} 404 - User not found
 */
const removeBadges = catchAsync(async (req, res, next) => {
  const { badgeIds, reason } = req.body;
  const user = await User.findById(req.params.userId);

  if (!user) return next(new AppError("User not found", 404));

  const removedBadges = badgeIds.filter((id) => user.badges.includes(id));

  if (removedBadges.length > 0) {
    user.badges = user.badges.filter((id) => !badgeIds.includes(id));

    await createAdminLog(
      req.userId,
      "REMOVE_BADGES",
      "USER",
      user._id,
      { removed: removedBadges, reason },
      reason,
      req,
    );

    await user.save();
  }
  sendJsonResponse(
    res,
    200,
    `Successfully removed ${removedBadges.length} badges`,
    {
      removed: removedBadges,
      remaining: user.badges.length,
    },
  );
});

/**
 * Get a user's completed lessons and modules.
 *
 * @route   GET /api/admin/users/:userId/progress
 * @returns {Object} 200 - { completedLessons, completedModules }
 * @returns {Object} 404 - User not found
 */
const getUserProgress = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const [lessonCompletions, moduleCompletions] = await Promise.all([
    LessonCompletion.find({ userId }).select("lessonId completedAt").lean(),
    ModuleCompletion.find({ userId }).select("moduleId completedAt").lean(),
  ]);

  sendJsonResponse(res, 200, "User progress retrieved", {
    completedLessons: lessonCompletions.map((lc) => ({
      lessonId: lc.lessonId,
      completedAt: lc.completedAt,
    })),
    completedModules: moduleCompletions.map((mc) => ({
      moduleId: mc.moduleId,
      completedAt: mc.completedAt,
    })),
  });
});

/**
 * Override a user's lesson or module completion status.
 * Prevents self-modification. Can mark as complete or incomplete.
 *
 * @route   PUT /api/admin/users/:userId/progress
 * @body    {string}  [lessonId] - Lesson ID to override (use this OR moduleId)
 * @body    {string}  [moduleId] - Module ID to override
 * @body    {boolean} completed  - New completion status
 * @body    {string}  [reason]   - Reason for override
 * @returns {Object} 200 - Updated progress
 * @returns {Object} 400 - Cannot modify own progress, or missing lessonId/moduleId
 * @returns {Object} 404 - User not found
 */
const overrideUserProgress = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { moduleId, lessonId, completed, reason } = req.body;

  if (userId === req.userId.toString()) {
    return next(new AppError("Cannot modify your own progress", 400));
  }

  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  let oldValue, newValue, actionType;

  if (lessonId) {
    const existingCompletion = await LessonCompletion.findOne({
      userId,
      lessonId,
    });

    oldValue = { lessonCompleted: !!existingCompletion };

    if (completed && !existingCompletion) {
      await LessonCompletion.create({ userId, lessonId });
      await User.findByIdAndUpdate(userId, {
        $inc: { completedLessonsCount: 1 },
      });
    } else if (!completed && existingCompletion) {
      await LessonCompletion.deleteOne({ userId, lessonId });
      await User.findByIdAndUpdate(userId, {
        $inc: { completedLessonsCount: -1 },
      });
    }

    const updatedExists = await LessonCompletion.findOne({ userId, lessonId });
    newValue = { lessonCompleted: !!updatedExists };

    actionType = completed
      ? "LESSON_COMPLETED_OVERRIDE"
      : "LESSON_INCOMPLETE_OVERRIDE";
  } else if (moduleId) {
    const existingCompletion = await ModuleCompletion.findOne({
      userId,
      moduleId,
    });

    oldValue = { moduleCompleted: !!existingCompletion };

    if (completed && !existingCompletion) {
      await ModuleCompletion.create({ userId, moduleId });
      await User.findByIdAndUpdate(userId, {
        $inc: { completedModulesCount: 1 },
      });
    } else if (!completed && existingCompletion) {
      await ModuleCompletion.deleteOne({ userId, moduleId });
      await User.findByIdAndUpdate(userId, {
        $inc: { completedModulesCount: -1 },
      });
    }

    const updatedExists = await ModuleCompletion.findOne({ userId, moduleId });
    newValue = { moduleCompleted: !!updatedExists };

    actionType = completed
      ? "MODULE_COMPLETED_OVERRIDE"
      : "MODULE_INCOMPLETE_OVERRIDE";
  } else {
    return next(new AppError("Either lessonId or moduleId is required", 400));
  }

  // Fetch updated counts
  const [lessonCount, moduleCount] = await Promise.all([
    LessonCompletion.countDocuments({ userId }),
    ModuleCompletion.countDocuments({ userId }),
  ]);

  await createAdminLog(
    req.userId,
    actionType,
    lessonId ? "LESSON" : "MODULE",
    lessonId || moduleId,
    { old: oldValue, new: newValue },
    reason ||
      `Progress override by admin: ${completed ? "complete" : "incomplete"}`,
    req,
  );

  sendJsonResponse(res, 200, "Progress updated successfully", {
    user: {
      _id: userId,
      completedLessonsCount: lessonCount,
      completedModulesCount: moduleCount,
    },
  });
});

/**
 * List all admin activity logs with filtering and pagination.
 *
 * @route   GET /api/admin/activity-logs
 * @query   {string} [actionType] - Filter by action type
 * @query   {string} [targetType] - Filter by target type
 * @query   {number} [page=1]     - Page number
 * @query   {number} [limit=50]   - Results per page
 * @returns {Object} 200 - { logs, pagination }
 */
const getActivityLogs = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 50, actionType, targetType } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const filter = {};
  if (actionType) filter.action = actionType; // Swapped actionType to action for AdminLog
  if (targetType) filter.targetType = targetType;

  const [logs, total] = await Promise.all([
    AdminLog.find(filter)
      .populate("adminId", "username email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    AdminLog.countDocuments(filter),
  ]);

  sendJsonResponse(res, 200, "Activity logs retrieved", {
    logs,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
    },
  });
});

/**
 * Resolve a flagged content report.
 *
 * Updates flag status to IN_REVIEW, FIXED, or REJECTED. When fixed, awards
 * 25 XP to the reporter as compensation and logs the XP adjustment.
 *
 * @route   PUT /api/admin/flags/:flagId/resolve
 * @body    {string} status         - "IN_REVIEW", "FIXED", or "REJECTED"
 * @body    {string} [adminResponse] - Response message
 * @returns {Object} 200 - { flag, message }
 * @returns {Object} 400 - Invalid status
 * @returns {Object} 404 - Flag not found
 */
const resolveFlag = catchAsync(async (req, res, next) => {
  const { flagId } = req.params;
  const { status, adminResponse } = req.body;

  const validStatuses = ["IN_REVIEW", "FIXED", "REJECTED"];
  if (!validStatuses.includes(status)) {
    return next(
      new AppError(`Invalid status. Use: ${validStatuses.join(", ")}`, 400),
    );
  }

  const flag = await FlaggedContent.findById(flagId);
  if (!flag) {
    return next(new AppError("Flag not found", 404));
  }

  const oldStatus = flag.status;
  flag.status = status;
  flag.adminResponse = adminResponse;
  flag.resolvedBy = req.userId;
  flag.resolvedAt = new Date();

  let compensationMessage = "";
  let xpCompensation = 0;

  // Handle XP compensation if needed
  if (status === "FIXED") {
    xpCompensation = 25;
    flag.xpCompensation = xpCompensation;

    // Award XP to the reporter
    const user = await User.findById(flag.reporterId);
    if (user) {
      const oldXp = user.xp;
      user.xp += xpCompensation;
      await user.save();

      compensationMessage = ` The reporter has been awarded ${xpCompensation} XP for their help!`;

      // Log the XP adjustment
      await createAdminLog(
        req.userId,
        "XP_ADJUSTMENT",
        "USER",
        user._id,
        {
          old: oldXp,
          new: user.xp,
          reason: `Flag compensation for: ${flag.title}`,
        },
        `Auto-awarded ${xpCompensation} XP for flag ${flagId}`,
        req,
      );
    }
  }

  await flag.save();

  // Log the admin action
  await createAdminLog(
    req.userId,
    "FLAG_RESOLVED",
    "FLAG",
    flagId,
    {
      oldStatus,
      newStatus: status,
      xpCompensation,
      targetType: flag.targetType,
      targetId: flag.targetId,
    },
    `Flag resolved with status: ${status}. ${adminResponse || ""}`,
    req,
  );

  sendJsonResponse(
    res,
    200,
    `Flag resolved successfully.${compensationMessage}`,
    {
      flag,
      message: `The reporter has been notified${compensationMessage}`,
    },
  );
});

/**
 * Get platform settings (returns defaults — not persisted to DB).
 *
 * @route   GET /api/admin/settings
 * @returns {Object} 200 - Default platform settings
 */
const getSettings = catchAsync(async (req, res, next) => {
  sendJsonResponse(res, 200, "Settings retrieved.", DEFAULT_SETTINGS);
});

/**
 * Update platform settings. Validates XP values.
 *
 * @route   PUT /api/admin/settings
 * @body    {Object} changes - Key-value pairs of settings to update
 * @returns {Object} 200 - { changes, timestamp }
 * @returns {Object} 400 - Invalid XP values
 */
const updateSettings = catchAsync(async (req, res, next) => {
  const { changes } = req.body;

  if (changes.xpPerLevel !== undefined && changes.xpPerLevel <= 0) {
    return next(new AppError("XP must be greater than 0", 400));
  }

  if (changes.moduleXpBonus !== undefined && changes.moduleXpBonus < 0) {
    return next(new AppError("Module XP bonus cannot be negative", 400));
  }

  await createAdminLog(
    req.userId,
    "SETTINGS_UPDATED",
    "SETTINGS",
    null,
    { new: changes },
    "Settings updated via admin panel.",
    req,
  );

  sendJsonResponse(res, 200, "Settings updated successfully.", {
    changes,
    timestamp: new Date().toISOString(),
  });
});

/**
 * List all lessons with filtering by status, difficulty, and module.
 *
 * @route   GET /api/admin/lessons
 * @query   {string} [status]     - "published", "draft", or omit for all
 * @query   {string} [difficulty] - Filter by difficulty
 * @query   {string} [moduleId]   - Filter by module
 * @query   {number} [page=1]     - Page number
 * @query   {number} [limit=1000] - Results per page
 * @returns {Object} 200 - { lessons, pagination }
 */
const getAllLessons = catchAsync(async (req, res, next) => {
  const { limit = 1000, page = 1, status, difficulty, moduleId } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const filter = {};
  if (status === "published") filter.isPublished = true;
  if (status === "draft") filter.isPublished = false;
  if (difficulty && difficulty !== "all") filter.difficulty = difficulty;
  if (moduleId && moduleId !== "" && moduleId !== "all") {
    filter.moduleId = moduleId;
  }

  console.log("Lesson filter:", filter); // Debug log

  const [lessons, total] = await Promise.all([
    Lesson.find(filter)
      .populate("moduleId", "title order")
      .sort({ order: 1, moduleId: 1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Lesson.countDocuments(filter),
  ]);

  sendJsonResponse(res, 200, "Lessons retrieved", {
    lessons,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
    },
  });
});

/**
 * List all modules with filtering by publish status.
 *
 * @route   GET /api/admin/modules
 * @query   {string} [status]     - "published", "draft", or omit for all
 * @query   {number} [page=1]     - Page number
 * @query   {number} [limit=1000] - Results per page
 * @returns {Object} 200 - { modules, pagination }
 */
const getAllModules = catchAsync(async (req, res, next) => {
  const { limit = 1000, page = 1, status } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const filter = {};
  if (status === "published") filter.isPublished = true;
  if (status === "draft") filter.isPublished = false;

  const [modules, total] = await Promise.all([
    Module.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Module.countDocuments(filter),
  ]);

  sendJsonResponse(res, 200, "Modules retrieved", {
    modules,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
    },
  });
});

/**
 * Update a lesson's fields. Runs Mongoose validators.
 *
 * @route   PUT /api/admin/lessons/:lessonId
 * @returns {Object} 200 - Updated lesson
 * @returns {Object} 404 - Lesson not found
 */
const updateLesson = catchAsync(async (req, res, next) => {
  const { lessonId } = req.params;
  const updateData = req.body;

  const lesson = await Lesson.findByIdAndUpdate(lessonId, updateData, {
    new: true,
    runValidators: true,
  });

  if (!lesson) {
    return next(new AppError("Lesson not found", 404));
  }

  await createAdminLog(
    req.userId,
    "LESSON_UPDATED",
    "LESSON",
    lessonId,
    { new: updateData },
    "Updated via admin panel",
    req,
  );

  sendJsonResponse(res, 200, "Lesson updated", { lesson });
});

/**
 * Update a module's fields. Runs Mongoose validators.
 *
 * @route   PUT /api/admin/modules/:moduleId
 * @returns {Object} 200 - Updated module
 * @returns {Object} 404 - Module not found
 */
const updateModule = catchAsync(async (req, res, next) => {
  const { moduleId } = req.params;
  const updateData = req.body;

  const module = await Module.findByIdAndUpdate(moduleId, updateData, {
    new: true,
    runValidators: true,
  });

  if (!module) {
    return next(new AppError("Module not found", 404));
  }

  await createAdminLog(
    req.userId,
    "MODULE_UPDATED",
    "MODULE",
    moduleId,
    { new: updateData },
    "Updated via admin panel",
    req,
  );

  sendJsonResponse(res, 200, "Module updated", { module });
});

/**
 * Get content statistics (lesson/module counts, published vs draft).
 *
 * @route   GET /api/admin/content/stats
 * @returns {Object} 200 - { totalLessons, publishedLessons, draftLessons, totalModules, publishedModules, draftModules }
 */
const getContentStats = catchAsync(async (req, res, next) => {
  const [totalLessons, publishedLessons, totalModules, publishedModules] =
    await Promise.all([
      Lesson.countDocuments(),
      Lesson.countDocuments({ isPublished: true }),
      Module.countDocuments(),
      Module.countDocuments({ isPublished: true }),
    ]);

  sendJsonResponse(res, 200, "Content stats retrieved", {
    totalLessons,
    publishedLessons,
    draftLessons: totalLessons - publishedLessons,
    totalModules,
    publishedModules,
    draftModules: totalModules - publishedModules,
  });
});

/**
 * Publish or unpublish a lesson.
 *
 * @route   PUT /api/admin/lessons/:lessonId/publish
 * @body    {boolean} publish - True to publish, false to unpublish
 * @returns {Object} 200 - Updated lesson
 * @returns {Object} 404 - Lesson not found
 */
const publishLesson = catchAsync(async (req, res, next) => {
  const { lessonId } = req.params;
  const { publish } = req.body;

  const lesson = await Lesson.findById(lessonId);
  if (!lesson) {
    return next(new AppError("Lesson not found", 404));
  }

  lesson.isPublished = publish;
  await lesson.save();

  await createAdminLog(
    req.userId,
    publish ? "LESSON_PUBLISHED" : "LESSON_UNPUBLISHED",
    "LESSON",
    lessonId,
    { old: { isPublished: !publish }, new: { isPublished: publish } },
    `Lesson ${publish ? "published" : "unpublished"} via admin panel`,
    req,
  );

  sendJsonResponse(
    res,
    200,
    `Lesson ${publish ? "published" : "unpublished"}`,
    { lesson },
  );
});

/**
 * Publish or unpublish a module.
 * Same pattern as publishLesson
 * @route   PUT /api/admin/modules/:moduleId/publish
 */
const publishModule = catchAsync(async (req, res, next) => {
  const { moduleId } = req.params;
  const { publish } = req.body;

  const module = await Module.findById(moduleId);
  if (!module) {
    return next(new AppError("Module not found", 404));
  }

  module.isPublished = publish;
  await module.save();

  await createAdminLog(
    req.userId,
    publish ? "MODULE_PUBLISHED" : "MODULE_UNPUBLISHED",
    "MODULE",
    moduleId,
    { old: { isPublished: !publish }, new: { isPublished: publish } },
    `Module ${publish ? "published" : "unpublished"} via admin panel`,
    req,
  );

  sendJsonResponse(
    res,
    200,
    `Module ${publish ? "published" : "unpublished"}`,
    { module },
  );
});

/**
 * Create a new lesson. Auto-assigns order if not provided.
 * @route   POST /api/admin/lessons
 */
const createLesson = catchAsync(async (req, res, next) => {
  const lessonData = req.body;

  if (!lessonData.order) {
    const lastLesson = await Lesson.findOne({
      moduleId: lessonData.moduleId,
    }).sort({ order: -1 });
    lessonData.order = (lastLesson?.order || 0) + 1;
  }

  const lesson = await Lesson.create(lessonData);

  await createAdminLog(
    req.userId,
    "LESSON_CREATED",
    "LESSON",
    lesson._id,
    { new: { title: lesson.title, moduleId: lesson.moduleId } },
    "Lesson created via admin panel",
    req,
  );

  sendJsonResponse(res, 201, "Lesson created", { lesson });
});

/**
 * Create a new module. Auto-handles moduleNumber and order.
 * @route   POST /api/admin/modules
 */
const createModule = catchAsync(async (req, res, next) => {
  const moduleData = req.body;

  if (
    !moduleData.order ||
    moduleData.order === 0 ||
    moduleData.order === null
  ) {
    delete moduleData.order;
  }

  if (!moduleData.moduleNumber || moduleData.moduleNumber === "") {
    delete moduleData.moduleNumber;
  }

  const module = await Module.create(moduleData);

  await createAdminLog(
    req.userId,
    "MODULE_CREATED",
    "MODULE",
    module._id,
    {
      title: module.title,
      moduleNumber: module.moduleNumber,
      order: module.order,
    },
    "Module created via admin panel",
    req,
  );

  sendJsonResponse(res, 201, "Module created", { module });
});

/**
 * Delete a lesson by ID.
 * @route   DELETE /api/admin/lessons/:lessonId
 */
const deleteLesson = catchAsync(async (req, res, next) => {
  const { lessonId } = req.params;

  const lesson = await Lesson.findById(lessonId);
  if (!lesson) {
    return next(new AppError("Lesson not found", 404));
  }

  await Lesson.findByIdAndDelete(lessonId);

  await createAdminLog(
    req.userId,
    "LESSON_DELETED",
    "LESSON",
    lessonId,
    { old: { title: lesson.title } },
    "Lesson deleted via admin panel",
    req,
  );

  sendJsonResponse(res, 200, "Lesson deleted", { lessonId });
});

/**
 * Delete a module. Refuses if it still contains lessons.
 * @route   DELETE /api/admin/modules/:moduleId
 * @returns {Object} 400 - Cannot delete non-empty module
 */
const deleteModule = catchAsync(async (req, res, next) => {
  const { moduleId } = req.params;

  const module = await Module.findById(moduleId);
  if (!module) {
    return next(new AppError("Module not found", 404));
  }

  const lessonCount = await Lesson.countDocuments({ moduleId });
  if (lessonCount > 0) {
    return next(
      new AppError(
        `Cannot delete module with ${lessonCount} lessons. Delete or reassign lessons first.`,
        400,
      ),
    );
  }

  await Module.findByIdAndDelete(moduleId);

  await createAdminLog(
    req.userId,
    "MODULE_DELETED",
    "MODULE",
    moduleId,
    { old: { title: module.title } },
    "Module deleted via admin panel",
    req,
  );

  sendJsonResponse(res, 200, "Module deleted", { moduleId });
});

/**
 * Duplicate a lesson (unpublished, titled "Original (Copy)").
 * @route   POST /api/admin/lessons/:lessonId/duplicate
 */
const duplicateLesson = catchAsync(async (req, res, next) => {
  const { lessonId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(lessonId)) {
    return next(new AppError("Invalid lesson ID", 400));
  }

  const originalLesson = await Lesson.findById(lessonId);
  if (!originalLesson) {
    return next(new AppError("Lesson not found", 404));
  }

  const duplicatedLesson = await Lesson.create({
    ...originalLesson.toObject(),
    _id: undefined,
    title: `${originalLesson.title} (Copy)`,
    isPublished: false,
    createdAt: undefined,
    updatedAt: undefined,
  });

  await createAdminLog(
    req.userId,
    "LESSON_DUPLICATED",
    "LESSON",
    duplicatedLesson._id,
    { new: { title: duplicatedLesson.title, sourceLesson: lessonId } },
    "Lesson duplicated via admin panel",
    req,
  );

  sendJsonResponse(res, 201, "Lesson duplicated", { lesson: duplicatedLesson });
});

/**
 * Duplicate an entire module including all its lessons (all unpublished).
 * @route   POST /api/admin/modules/:moduleId/duplicate
 */
const duplicateModule = catchAsync(async (req, res, next) => {
  const { moduleId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(moduleId)) {
    return next(new AppError("Invalid module ID", 400));
  }

  const originalModule = await Module.findById(moduleId);
  if (!originalModule) {
    return next(new AppError("Module not found", 404));
  }

  const lessons = await Lesson.find({ moduleId });

  const duplicatedModule = await Module.create({
    ...originalModule.toObject(),
    _id: undefined,
    title: `${originalModule.title} (Copy)`,
    moduleNumber: undefined,
    order: undefined,
    isPublished: false,
    createdAt: undefined,
    updatedAt: undefined,
  });

  const duplicatedLessons = await Lesson.insertMany(
    lessons.map((lesson) => ({
      ...lesson.toObject(),
      _id: undefined,
      moduleId: duplicatedModule._id,
      title: `${lesson.title} (Copy)`,
      isPublished: false,
      createdAt: undefined,
      updatedAt: undefined,
    })),
  );

  await createAdminLog(
    req.userId,
    "MODULE_DUPLICATED",
    "MODULE",
    duplicatedModule._id,
    {
      new: {
        title: duplicatedModule.title,
        sourceModule: moduleId,
        lessonCount: lessons.length,
        newModuleNumber: duplicatedModule.newModuleNumber,
        newOrder: duplicatedModule.order,
      },
    },
    "Module duplicated via admin panel",
    req,
  );

  sendJsonResponse(res, 201, "Module duplicated", {
    module: duplicatedModule,
    lessons: duplicatedLessons,
  });
});

/**
 * Update a lesson's sort order within its module.
 * @route   PUT /api/admin/lessons/:lessonId/order
 */
const updateLessonOrder = catchAsync(async (req, res, next) => {
  const { lessonId } = req.params;
  const { order } = req.body;

  const lesson = await Lesson.findByIdAndUpdate(
    lessonId,
    { order },
    { new: true },
  );

  if (!lesson) {
    return next(new AppError("Lesson not found", 404));
  }

  sendJsonResponse(res, 200, "Lesson order updated", { lesson });
});

/**
 * Update a module's sort order in the curriculum.
 * @route   PUT /api/admin/modules/:moduleId/order
 */
const updateModuleOrder = catchAsync(async (req, res, next) => {
  const { moduleId } = req.params;
  const { order } = req.body;

  const module = await Module.findByIdAndUpdate(
    moduleId,
    { order },
    { new: true },
  );

  if (!module) {
    return next(new AppError("Module not found", 404));
  }

  sendJsonResponse(res, 200, "Module order updated", { module });
});

module.exports = {
  toggleAdminStatus,
  getAdmins,
  getAdminStats,
  searchUsers,
  adjustUserXp,
  getFlaggedContent,
  getFlagStats,
  updateUserStatus,
  getUserDetails,
  getUserActivity,
  getUserBadges,
  awardBadges,
  removeBadges,
  getUserProgress,
  overrideUserProgress,
  getActivityLogs,
  resolveFlag,
  getSettings,
  updateSettings,
  getAllLessons,
  getAllModules,
  updateLesson,
  updateModule,
  getContentStats,
  publishLesson,
  publishModule,
  createLesson,
  createModule,
  deleteLesson,
  deleteModule,
  duplicateLesson,
  duplicateModule,
  updateLessonOrder,
  updateModuleOrder,
};
