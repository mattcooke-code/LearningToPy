//adminController.js
const AdminLog = require("../models/AdminLog");
const FlaggedContent = require("../models/FlaggedContent");
const Lesson = require("../models/Lesson");
const Module = require("../models/Module");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const {
  addLevelToUsers,
  getUserWithLevel,
  getModuleOrderMap,
} = require("../utils/levelUtils");
const { sendJsonResponse } = require("../utils/responseHelpers");
const { anonymiseIp } = require("../utils/parseDeviceInfo");
const mongoose = require("mongoose");

// ======= HELPER FUNCTION =======
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

  await createAdminLog(
    req.userId,
    makeAdmin ? "USER_MADE_ADMIN" : "USER_REMOVED_ADMIN",
    "USER",
    userId,
    { old: { isAdmin: oldStatus }, new: { isAdmin: user.isAdmin } },
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

const getAdmins = catchAsync(async (req, res, next) => {
  const admins = (
    await User.find({ isAdmin: true }).select(
      "username email level xp lastActive createdAt",
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

  const users = await User.find(searchFilter)
    .select(
      "username email xp streak badgeCount lastActive isBlocked isAdmin createdAt completedModules",
    )
    .sort(sortOption)
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  const moduleOrderMap = await getModuleOrderMap();

  const usersWithLevel = await addLevelToUsers(users, moduleOrderMap);

  // Apply level filters after calculation
  let filteredUsers = usersWithLevel;
  if (levelMin) {
    filteredUsers = filteredUsers.filter((u) => u.level >= parseInt(levelMin));
  }
  if (levelMax) {
    filteredUsers = filteredUsers.filter((u) => u.level <= parseInt(levelMax));
  }

  const total = await User.countDocuments(searchFilter);

  sendJsonResponse(res, 200, "Users retrieved", {
    users: filteredUsers,
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
  await user.save();

  const userWithLevel = await getUserWithLevel(user);

  // Get fresh user to see updated level
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

  sendJsonResponse(res, 200, "XP adjusted successfully", {
    user: updatedUser,
    change: xpChange,
  });
});

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

  console.log("Flag filter:", filter); // Debug log

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

  console.log(
    `Found ${flaggedContent.length} flagged items out of ${total} total`,
  ); // Debug log

  // Apply semantic IDs for lessons
  const enrichedContent = await Promise.all(
    flaggedContent.map(async (flag) => {
      const enrichedFlag = { ...flag };

      if (flag.targetType === "LESSON" && flag.targetId) {
        try {
          const lesson = await Lesson.findById(flag.targetId)
            .populate("moduleId", "order")
            .lean();

          if (lesson && lesson.moduleId) {
            const moduleOrder = lesson.moduleId.order;
            const lessonOrder = lesson.order || 0;
            enrichedFlag.semanticId = `M${moduleOrder}L${lessonOrder}`;
            enrichedFlag.lessonTitle = lesson.title;
            enrichedFlag.moduleTitle = lesson.moduleId.title;
            enrichedFlag.contentPreview = lesson.description?.substring(0, 200);
          } else {
            enrichedFlag.semanticId = `Lesson ${flag.targetId.slice(-6)}`;
          }
        } catch (err) {
          console.error(`Error enriching flag ${flag._id}:`, err);
          enrichedFlag.semanticId = `Lesson ${flag.targetId.slice(-6)}`;
        }
      } else if (flag.targetType === "USER_PROFILE") {
        const user = await User.findById(flag.targetId)
          .select("username email")
          .lean();
        enrichedFlag.semanticId = `User: ${user?.username || "Unknown"}`;
        enrichedFlag.contentPreview = `Email: ${user?.email || "N/A"}`;
      }

      return enrichedFlag;
    }),
  );

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

  const userWithLevel = await getUserWithLevel(user);

  // Calculate completion rate
  const totalLessons = await Lesson.countDocuments({ isPublished: true });
  const completionRate =
    totalLessons > 0
      ? Math.round(((user.completedLessons?.length || 0) / totalLessons) * 100)
      : 0;

  const stats = {
    totalLearningTime: user.totalLearningTime || 0,
    totalSessionTime: user.totalSessionTime || 0, // in minutes
    loginCount: user.loginCount || 0,
    badgesCount: user.badges?.length || 0,
    completedLessonsCount: user.completedLessons?.length || 0,
    completedModulesCount: user.completedModules?.length || 0,
    streak: user.streak || 0,
    completionRate,
  };

  const userData = {
    ...userWithLevel,
    stats,
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

  // User's Admin Activity Logs (Note: Changed this to AdminLog for consistency)
  const adminActions = await AdminLog.find({ targetId: userId })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));

  sendJsonResponse(res, 200, "User activity retrieved", {
    userActivity: activity,
    adminActions,
  });
});

const getUserBadges = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.userId).select("badges");
  if (!user) return next(new AppError("User not found", 404));

  sendJsonResponse(res, 200, "User badges retrieved", {
    badges: user.badges || [],
  });
});

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
        (id) => id.toString() !== lessonId,
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
        (id) => id.toString() !== moduleId,
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
      completedLessons: user.completedLessons,
      completedModules: user.completedModules,
    },
  });
});

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

  const duplicatedLessons = [];
  for (const lesson of lessons) {
    const duplicatedLesson = await Lesson.create({
      ...lesson.toObject(),
      _id: undefined,
      moduleId: duplicatedModule._id,
      title: `${lesson.title} (Copy)`,
      isPublished: false,
      createdAt: undefined,
      updatedAt: undefined,
    });
    duplicatedLessons.push(duplicatedLesson);
  }

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
