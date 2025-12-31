//adminController.js
const ActivityLog = require("../models/ActivityLog");
const FlaggedContent = require("../models/FlaggedContent");
const Lesson = require("../models/Lesson");
const Module = require("../models/Module");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const { sendJsonResponse } = require("../utils/responseHelpers");

const toggleAdminStatus = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { makeAdmin, reason } = req.body;

  // Prevent self-modification
  if (userId === req.userId.toString()) {
    return next(new AppError("Cannot modify own admin status.", 400));
  }

  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError("User not found.", 404));
  }

  const oldStatus = user.isAdmin;
  user.isAdmin = makeAdmin;
  await user.save();

  await ActivityLog.create({
    userId,
    adminId: req.userId,
    actionType: makeAdmin ? "USER_MADE_ADMIN" : "USER_REMOVED_ADMIN",
    targetId: userId,
    targetType: "USER",
    oldValue: { isAdmin: oldStatus },
    newValue: { isAdmin: user.isAdmin },
    reason:
      reason || `Admin status ${makeAdmin ? "granted" : "revoked"} by admin.`,
    ipAddress: req.ip,
  });

  sendJsonResponse(
    res,
    200,
    `User ${makeAdmin ? "made" : "removed from"} admin`,
    { user }
  );
});

const getAdmins = catchAsync(async (req, res, next) => {
  const admins = (
    await User.find({ isAdmin: true }).select(
      "username email level xp lastActive createdAt"
    )
  ).sort({ createdAt: -1 });

  sendJsonResponse(res, 200, "Admins retrieved", { admins });
});

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

  // Text search
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

  // Level range filters
  if (levelMin || levelMax) {
    searchFilter.level = {};
    if (levelMin) {
      searchFilter.level.$gte = parseInt(levelMin);
    }
    if (levelMax) {
      searchFilter.level.$lte = parseInt(levelMax);
    }
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Parse sort parameter
  let sortOption = {};
  if (sort.startsWith("-")) {
    const field = sort.substring(1);
    sortOption[field] = -1;
  } else {
    sortOption[sort] = 1;
  }

  // Default sort if not provided
  if (Object.keys(sortOption).length === 0) {
    sortOption = { createdAt: -1 };
  }

  const [users, total] = await Promise.all([
    User.find(searchFilter)
      .select(
        "username email level xp streak badgeCount lastActive isBlocked isAdmin createdAt"
      )
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit)),
    User.countDocuments(searchFilter),
  ]);

  sendJsonResponse(res, 200, "Users retrieved", {
    users,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
    },
  });
});

const adjustUserXp = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { xpChange, reason } = req.body;

  // Prevent self-modification
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
  // Level will be auto-calculated in pre-save hook

  await user.save();

  // Get fresh user to see updated level
  const updatedUser = await User.findById(userId).select(
    "username level xp streak badgeCount"
  );

  await ActivityLog.create({
    userId,
    adminId: req.userId,
    actionType: "XP_ADJUSTMENT",
    targetId: userId,
    targetType: "USER",
    oldValue: { xp: oldXp, level: oldLevel },
    newValue: { xp: updatedUser.xp, level: updatedUser.level },
    reason:
      reason || `XP adjusted by admin: ${xpChange > 0 ? "+" : ""}${xpChange}`,
    ipAddress: req.ip,
  });

  sendJsonResponse(res, 200, "XP adjusted successfully", {
    user: updatedUser,
    change: xpChange,
  });
});

const getFlaggedContent = catchAsync(async (req, res, next) => {
  const { status, page = 1, limit = 20 } = req.query;

  const filter = status ? { status } : {};
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [flaggedContent, total] = await Promise.all([
    FlaggedContent.find(filter)
      .populate("reporterId", "username")
      .populate("targetUserId", "username")
      .populate("resolvedBy", "username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    FlaggedContent.countDocuments(filter),
  ]);

  sendJsonResponse(res, 200, "Flagged content retrieved", {
    flaggedContent,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
    },
  });
});

const getFlagStats = catchAsync(async (req, res, next) => {
  const stats = await FlaggedContent.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const flagStats = stats.reduce(
    (acc, item) => {
      acc[item._id.toLowerCase()] = item.count;
      return acc;
    },
    { pending: 0, resolved: 0, escalated: 0, warning_sent: 0, dismissed: 0 }
  );

  sendJsonResponse(res, 200, "Flag statistics retrieved.", {
    stats: flagStats,
  });
});

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
        new AppError("Invalid action. Use 'block', 'unblock', or 'delete'", 400)
      );
  }

  if (action !== "delete") {
    await user.save();
  }

  await ActivityLog.create({
    userId,
    adminId: req.userId,
    actionType,
    targetId: userId,
    targetType: "USER",
    oldValue: { isBlocked: oldStatus },
    newValue: action === "delete" ? null : { isBlocked: user.isBlocked },
    reason: reason || `${action} action performed by admin`,
    ipAddress: req.ip,
  });

  sendJsonResponse(res, 200, `User ${action}ed successfully`, {
    user: action === "delete" ? null : user,
  });
});

const getUserDetails = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const user = await User.findById(userId)
    .select("-password -refreshToken")
    .populate("badges", "name icon description")
    .populate("completedLessons", "title moduleId")
    .populate("completedModules", "title order");

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const stats = {
    totalLearningTime: user.totalLearningTime || 0,
    totalSessionTime: user.totalSessionTime || 0, // in minutes
    loginCount: user.loginCount || 0,
    badgesCount: user.badges?.length || 0,
    completedLessonsCount: user.completedLessons?.length || 0,
    completedModulesCount: user.completedModules?.length || 0,
    streak: user.streak || 0,
  };

  // Calculate completion rate if possible
  let completionRate = 0;
  if (user.completedLessons?.length > 0) {
    // You might want to get total lessons from your database
    // For now, we'll calculate a simple percentage
    completionRate = Math.min(100, (user.completedLessons.length / 20) * 100);
  }

  // Calculate average learning time per session
  const avgSessionTime =
    user.loginCount > 0
      ? (user.totalSessionTime / user.loginCount).toFixed(1)
      : 0;

  const userData = {
    ...user.toObject(),
    stats: {
      ...stats,
      completionRate,
      avgSessionTime,
      accuracyRate: user.stats?.dataStructuresExamScore
        ? (user.stats.dataStructuresExamScore +
            (user.stats.oopExamScore || 0)) /
          2
        : 0,
    },
    // Add calculated fields for frontend
    totalXP: user.xp || 0,
    currentLevel: user.level || 1,
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

const getUserActivity = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { limit = 50 } = req.query;

  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // User's Lesson Completion History
  const activity = user.lessonCompletionHistory
    .sort((a, b) => b.completedAt - a.completedAt)
    .slice(0, parseInt(limit));

  // User's Admin Activity Logs
  const adminActions = await ActivityLog.find({ userId })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));

  sendJsonResponse(res, 200, "User activity retrieved", {
    userActivity: activity,
    adminActions,
  });
});

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
    // Override Lesson Completion
    oldValue = { lessonCompleted: user.completedLessons.includes(lessonId) };

    if (completed) {
      if (!user.completedLessons.includes(lessonId)) {
        user.completedLessons.push(lessonId);
      }
    } else {
      user.completedLessons = user.completedLessons.filter(
        (id) => id.toString() !== lessonId
      );
    }

    newValue = { lessonCompleted: user.completedLessons.includes(lessonId) };

    actionType = completed
      ? "LESSON_COMPLETED_OVERRIDE"
      : "LESSON_INCOMPLETE_OVERRIDE";
  } else if (moduleId) {
    // Override Module Completion
    oldValue = { moduleCompleted: user.completedModules.includes(moduleId) };

    if (completed) {
      if (!user.completedModules.includes(moduleId)) {
        user.completedModules.push(moduleId);
      }
    } else {
      user.completedModules = user.completedModules.filter(
        (id) => id.toString() !== moduleId
      );
    }

    newValue = { moduleId: user.completedModules.includes(moduleId) };

    actionType = completed
      ? "MODULE_COMPLETED_OVERRIDE"
      : "MODULE_INCOMPLETE_OVERRIDE";
  } else {
    return next(new AppError("Either lessonId or moduleId is required", 400));
  }

  await user.save();

  await ActivityLog.create({
    userId,
    adminId: req.userId,
    actionType,
    targetId: lessonId || moduleId,
    targetType: lessonId ? "LESSON" : "MODULE",
    oldValue,
    newValue,
    reason:
      reason ||
      `Progress override by admin: ${completed ? "complete" : "incomplete"}`,
    ipAddress: req.ip,
  });

  sendJsonResponse(res, 200, "Progress updated successfully", {
    user: {
      completedLessons: user.completedLessons,
      completedModules: user.completedModules,
    },
  });
});

const getActivityLogs = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 50, actionType, targetType } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const filter = {};
  if (actionType) filter.actionType = actionType;
  if (targetType) filter.targetType = targetType;

  const [logs, total] = await Promise.all([
    ActivityLog.find(filter)
      .populate("userId", "username email")
      .populate("adminId", "username email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    ActivityLog.countDocuments(filter),
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

const resolveFlag = catchAsync(async (req, res, next) => {
  const { flagId } = req.params;
  const { status, notes } = req.body;

  const validStatuses = ["RESOLVED", "WARNING_SENT", "ESCALATED", "DISMISSED"];
  if (!validStatuses.includes(status)) {
    return next(
      new AppError(`Invalid status. Use: ${validStatuses.join(", ")}`, 400)
    );
  }

  const flag = await FlaggedContent.findById(flagId);
  if (!flag) {
    return next(new AppError("Flag not found", 404));
  }

  const oldStatus = flag.status;
  flag.status = status;
  flag.adminNotes = notes;
  flag.resolvedBy = req.userId;
  flag.resolvedAt = new Date();

  await flag.save();

  await ActivityLog.create({
    userId: flag.reporterId,
    adminId: req.userId,
    actionType: "FLAG_RESOLVED",
    targetId: flagId,
    targetType: "FLAG",
    oldValue: { status: oldStatus },
    newValue: { status: flag.status },
    reason: notes || `Flag marked as ${status}`,
    ipAddress: req.ip,
  });

  sendJsonResponse(res, 200, "Flag resolved successfully", { flag });
});

const getSettings = catchAsync(async (req, res, next) => {
  const defaultSettings = {
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
    defaultDifficulty: "beginner",
    maxLessonsPerModule: 20,
    previewMode: false,
    autoPublishNewContent: false,
    requireEmailVerification: false,
    requireStrongPassword: true,
    enable2FA: false,
    logIpAddresses: true,
  };

  sendJsonResponse(res, 200, "Settings retrieved.", defaultSettings);
});

const updateSettings = catchAsync(async (req, res, next) => {
  const { changes } = req.body;

  if (changes.xpPerLevel !== undefined && changes.xpPerLevel <= 0) {
    return next(new AppError("XP must be greater than 0", 400));
  }

  if (changes.moduleXpBonus !== undefined && changes.moduleXpBonus < 0) {
    return next(new AppError("Module XP bonus cannot be negative", 400));
  }

  await ActivityLog.create({
    adminId: req.userId,
    actionType: "SETTINGS_UPDATED",
    targetType: "SETTINGS",
    oldValue: {},
    newValue: changes,
    reason: "Settings updated via admin panel.",
    ipAddress: req.ip,
  });

  sendJsonResponse(res, 200, "Settings updated successfully.", {
    changes,
    timestamp: new Date().toISOString(),
  });
});

const getAllLessons = catchAsync(async (req, res, next) => {
  const { limit = 1000, page = 1, status, difficulty } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const filter = {};
  if (status === "published") filter.isPublished = true;
  if (status === "draft") filter.isPublished = false;
  if (difficulty && difficulty !== "all") filter.difficulty = difficulty;

  const [lessons, total] = await Promise.all([
    Lesson.find(filter)
      .sort({ order: 1, createdAt: -1 })
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

  // Log the update
  await ActivityLog.create({
    adminId: req.userId,
    actionType: "LESSON_UPDATED",
    targetId: lessonId,
    targetType: "LESSON",
    newValue: updateData,
    reason: "Updated via admin panel",
    ipAddress: req.ip,
  });

  sendJsonResponse(res, 200, "Lesson updated", { lesson });
});

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

  // Log the update
  await ActivityLog.create({
    adminId: req.userId,
    actionType: "MODULE_UPDATED",
    targetId: moduleId,
    targetType: "MODULE",
    newValue: updateData,
    reason: "Updated via admin panel",
    ipAddress: req.ip,
  });

  sendJsonResponse(res, 200, "Module updated", { module });
});

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
};
