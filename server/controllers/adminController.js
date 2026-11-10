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
const Module = require("../models/Module");
const User = require("../models/User");
const adminService = require("../services/adminService");
const {
  createAdminLog,
  actorFromRequest,
} = require("../services/auditService");
const learningEngine = require("../services/learningEngine");
const { DEFAULT_SETTINGS } = require("../constants/adminConstants");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const { sendJsonResponse } = require("../utils/responseHelpers");

const mongoose = require("mongoose");

// +=============================================+
// |              USER MANAGEMENT                |
// +=============================================+

// ───────── READS ─────────
/**
 * List all admin users, sorted by creation date.
 *
 * @route   GET /api/admin/admins
 * @returns {Object} 200 - { admins: [...] }
 */
const getAdmins = catchAsync(async (req, res, next) => {
  const data = await adminService.getAdmins();

  sendJsonResponse(res, 200, "Admins retrieved", data);
});

/**
 * Get dashboard summary stats (user counts, lesson counts, pending flags).
 *
 * @route   GET /api/admin/stats
 * @returns {Object} 200 - { totalUsers, activeUsers, totalLessons, publishedLessons, pendingFlags }
 */
const getAdminStats = catchAsync(async (req, res, next) => {
  const data = await adminService.getAdminStats();

  sendJsonResponse(res, 200, "Admin stats retrieved", data);
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
  const { query, page, limit, sort, isBlocked, isAdmin, levelMin, levelMax } =
    req.query;

  const data = await adminService.searchUsers({
    query,
    page,
    limit,
    sort,
    isBlocked,
    isAdmin,
    levelMin,
    levelMax,
  });

  sendJsonResponse(res, 200, "Users retrieved", data);
});

/**
 * Get detailed user information including stats, privacy settings, and completion rate.
 *
 * @route   GET /api/admin/users/:userId
 * @returns {Object} 200 - Full user details with computed stats
 * @returns {Object} 404 - User not found
 */
const getUserDetails = catchAsync(async (req, res, next) => {
  const data = await adminService.getUserDetails(req.params.userId);
  sendJsonResponse(res, 200, "User details retrieved", data);
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
  const { limit } = req.query;
  const data = await adminService.getUserActivity(req.params.userId, limit);
  sendJsonResponse(res, 200, "User activity retrieved", data);
});

/**
 * Get a user's earned badge IDs.
 *
 * @route   GET /api/admin/users/:userId/badges
 * @returns {Object} 200 - { badges: [...] }
 * @returns {Object} 404 - User not found
 */
const getUserBadges = catchAsync(async (req, res, next) => {
  const data = await adminService.getUserBadges(req.params.userId);

  sendJsonResponse(res, 200, "User badges retrieved", data);
});

/**
 * Get a user's completed lessons and modules.
 *
 * @route   GET /api/admin/users/:userId/progress
 * @returns {Object} 200 - { completedLessons, completedModules }
 * @returns {Object} 404 - User not found
 */
const getUserProgress = catchAsync(async (req, res, next) => {
  const data = await adminService.getUserProgress(req.params.userId);

  sendJsonResponse(res, 200, "User progress retrieved", data);
});

// ───────── WRITES ─────────
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
  const { makeAdmin, reason } = req.body;

  const data = await adminService.toggleAdminStatus({
    targetUserId: req.params.userId,
    makeAdmin,
    reason,
    actor: actorFromRequest(req),
  });

  sendJsonResponse(
    res,
    200,
    `User ${makeAdmin ? "made" : "removed from"} admin`,
    data,
  );
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
  const { xpChange, reason } = req.body;

  const data = await adminService.adjustUserXp({
    targetUserId: req.params.userId,
    xpChange,
    reason,
    actor: actorFromRequest(req),
  });

  sendJsonResponse(res, 200, "XP adjusted successfully", data);
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
  const { action, duration, reason } = req.body;

  const data = await adminService.updateUserStatus({
    targetUserId: req.params.userId,
    action,
    duration,
    reason,
    actor: actorFromRequest(req),
  });

  sendJsonResponse(res, 200, `User ${action}ed successfully`, data);
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

  const data = await adminService.awardBadges({
    targetUserId: req.params.userId,
    badgeIds,
    reason,
    actor: actorFromRequest(req),
  });

  sendJsonResponse(
    res,
    200,
    `Successfully awarded ${data.awarded.length} badges`,
    data,
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

  const data = await adminService.removeBadges({
    targetUserId: req.params.userId,
    badgeIds,
    reason,
    actor: actorFromRequest(req),
  });

  sendJsonResponse(
    res,
    200,
    `Successfully removed ${data.removed.length} badges`,
    data,
  );
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
  const { moduleId, lessonId, completed, reason } = req.body;

  const data = await adminService.overrideUserProgress({
    targetUserId: req.params.userId,
    lessonId,
    moduleId,
    completed,
    reason,
    actor: actorFromRequest(req),
  });

  sendJsonResponse(res, 200, "Progress updated successfully", data);
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
  const actor = actorFromRequest(req);

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
        actor,
        "XP_ADJUSTMENT",
        "USER",
        user._id,
        {
          old: oldXp,
          new: user.xp,
          reason: `Flag compensation for: ${flag.title}`,
        },
        `Auto-awarded ${xpCompensation} XP for flag ${flagId}`,
      );
    }
  }

  await flag.save();

  // Log the admin action
  await createAdminLog(
    actor,
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
  const actor = actorFromRequest(req);
  const { changes } = req.body;

  if (changes.xpPerLevel !== undefined && changes.xpPerLevel <= 0) {
    return next(new AppError("XP must be greater than 0", 400));
  }

  if (changes.moduleXpBonus !== undefined && changes.moduleXpBonus < 0) {
    return next(new AppError("Module XP bonus cannot be negative", 400));
  }

  await createAdminLog(
    actor,
    "SETTINGS_UPDATED",
    "SETTINGS",
    null,
    { new: changes },
    "Settings updated via admin panel.",
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
  const actor = actorFromRequest(req);

  const lesson = await Lesson.findByIdAndUpdate(lessonId, updateData, {
    new: true,
    runValidators: true,
  });

  if (!lesson) {
    return next(new AppError("Lesson not found", 404));
  }

  await createAdminLog(
    actor,
    "LESSON_UPDATED",
    "LESSON",
    lessonId,
    { new: updateData },
    "Updated via admin panel",
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
  const actor = actorFromRequest(req);

  const module = await Module.findByIdAndUpdate(moduleId, updateData, {
    new: true,
    runValidators: true,
  });

  if (!module) {
    return next(new AppError("Module not found", 404));
  }

  await createAdminLog(
    actor,
    "MODULE_UPDATED",
    "MODULE",
    moduleId,
    { new: updateData },
    "Updated via admin panel",
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
  const actor = actorFromRequest(req);

  const lesson = await Lesson.findById(lessonId);
  if (!lesson) {
    return next(new AppError("Lesson not found", 404));
  }

  lesson.isPublished = publish;
  await lesson.save();

  await createAdminLog(
    actor,
    publish ? "LESSON_PUBLISHED" : "LESSON_UNPUBLISHED",
    "LESSON",
    lessonId,
    { old: { isPublished: !publish }, new: { isPublished: publish } },
    `Lesson ${publish ? "published" : "unpublished"} via admin panel`,
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
  const actor = actorFromRequest(req);

  const module = await Module.findById(moduleId);
  if (!module) {
    return next(new AppError("Module not found", 404));
  }

  module.isPublished = publish;
  await module.save();

  await createAdminLog(
    actor,
    publish ? "MODULE_PUBLISHED" : "MODULE_UNPUBLISHED",
    "MODULE",
    moduleId,
    { old: { isPublished: !publish }, new: { isPublished: publish } },
    `Module ${publish ? "published" : "unpublished"} via admin panel`,
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
  const actor = actorFromRequest(req);

  if (!lessonData.order) {
    const lastLesson = await Lesson.findOne({
      moduleId: lessonData.moduleId,
    }).sort({ order: -1 });
    lessonData.order = (lastLesson?.order || 0) + 1;
  }

  const lesson = await Lesson.create(lessonData);

  await createAdminLog(
    actor,
    "LESSON_CREATED",
    "LESSON",
    lesson._id,
    { new: { title: lesson.title, moduleId: lesson.moduleId } },
    "Lesson created via admin panel",
  );

  sendJsonResponse(res, 201, "Lesson created", { lesson });
});

/**
 * Create a new module. Auto-handles moduleNumber and order.
 * @route   POST /api/admin/modules
 */
const createModule = catchAsync(async (req, res, next) => {
  const moduleData = req.body;
  const actor = actorFromRequest(req);

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
    actor,
    "MODULE_CREATED",
    "MODULE",
    module._id,
    {
      title: module.title,
      moduleNumber: module.moduleNumber,
      order: module.order,
    },
    "Module created via admin panel",
  );

  sendJsonResponse(res, 201, "Module created", { module });
});

/**
 * Delete a lesson by ID.
 * @route   DELETE /api/admin/lessons/:lessonId
 */
const deleteLesson = catchAsync(async (req, res, next) => {
  const { lessonId } = req.params;
  const actor = actorFromRequest(req);

  const lesson = await Lesson.findById(lessonId);
  if (!lesson) {
    return next(new AppError("Lesson not found", 404));
  }

  await Lesson.findByIdAndDelete(lessonId);

  await createAdminLog(
    actor,
    "LESSON_DELETED",
    "LESSON",
    lessonId,
    { old: { title: lesson.title } },
    "Lesson deleted via admin panel",
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
  const actor = actorFromRequest(req);

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
    actor,
    "MODULE_DELETED",
    "MODULE",
    moduleId,
    { old: { title: module.title } },
    "Module deleted via admin panel",
  );

  sendJsonResponse(res, 200, "Module deleted", { moduleId });
});

/**
 * Duplicate a lesson (unpublished, titled "Original (Copy)").
 * @route   POST /api/admin/lessons/:lessonId/duplicate
 */
const duplicateLesson = catchAsync(async (req, res, next) => {
  const { lessonId } = req.params;
  const actor = actorFromRequest(req);

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
    actor,
    "LESSON_DUPLICATED",
    "LESSON",
    duplicatedLesson._id,
    { new: { title: duplicatedLesson.title, sourceLesson: lessonId } },
    "Lesson duplicated via admin panel",
  );

  sendJsonResponse(res, 201, "Lesson duplicated", { lesson: duplicatedLesson });
});

/**
 * Duplicate an entire module including all its lessons (all unpublished).
 * @route   POST /api/admin/modules/:moduleId/duplicate
 */
const duplicateModule = catchAsync(async (req, res, next) => {
  const { moduleId } = req.params;
  const actor = actorFromRequest(req);

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
    actor,
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

/**
 * Backfill missing module completions for a user (defaults to the caller).
 * @route POST /api/admin/modules/fix-progress
 */
const fixModuleProgress = catchAsync(async (req, res, next) => {
  const userId = req.body.userId ?? req.userId;
  const { reason } = req.body;
  const actor = actorFromRequest(req);

  if (typeof userId !== "string" || !mongoose.isValidObjectId(userId)) {
    return next(new AppError("Invalid user id", 400));
  }

  const modulesFixed = await learningEngine.fixUserModuleProgress(userId);

  // ── Create audit log entry ─────────────────────────────────
  await createAdminLog(
    actor,
    "MODULE_PROGRESS_FIXED",
    "USER",
    userId,
    { modulesFixed, fixedCount: modulesFixed.length },
    reason ||
      `Backfilled missing module completions (${modulesFixed.length} fixed)`,
  );

  sendJsonResponse(res, 200, "Module integrity check complete", {
    fixedCount: modulesFixed.length,
    modules: modulesFixed,
  });
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
  fixModuleProgress,
};
