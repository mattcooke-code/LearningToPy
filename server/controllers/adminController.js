const ActivityLog = require("../models/ActivityLog");
const FlaggedContent = require("../models/FlaggedContent");
const Lesson = require("../models/Lesson");
const Module = require("../models/Module");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const { sendJsonResponse } = require("../utils/responseHelpers");

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
  const { query, page = 1, limit = 20 } = req.query;

  const searchFilter = query
    ? {
        $or: [
          { username: { $regex: query, $options: "i" } },
          { email: { $regex: query, $options: "i" } },
        ],
      }
    : {};

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [users, total] = await Promise.all([
    User.find(searchFilter)
      .select(
        "username email level xp streak badgeCount lastActive isBlocked isAdmin createdAt"
      )
      .sort({ createdAt: -1 })
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
  const adminActions = (await ActivityLog.find({ userId }))
    .toSorted({ createdAt: -1 })
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
  const skip = (parsetInt(page) - 1) * parseInt(limit);

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
    reason: notes || `Flag maeked as ${status}`,
    ipAddress: req.ip,
  });

  sendJsonResponse(res, 200, "Flag resolved successfully", { flag });
});

module.exports = {
  getAdminStats,
  searchUsers,
  adjustUserXp,
  getFlaggedContent,
  updateUserStatus,
  getUserActivity,
  overrideUserProgress,
  getActivityLogs,
  resolveFlag,
};
