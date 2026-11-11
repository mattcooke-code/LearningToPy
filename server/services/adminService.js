// adminService.js
// ─────────────── IMPORTS ──────────────────
// ---MODELS---
const AdminLog = require("../models/AdminLog");
const FlaggedContent = require("../models/FlaggedContent");
const Lesson = require("../models/Lesson");
const LessonCompletion = require("../models/LessonCompletion");
const Module = require("../models/Module");
const ModuleCompletion = require("../models/ModuleCompletion");
const User = require("../models/User");
const XpTransaction = require("../models/XpTransaction");

// ---SERVICES---
const { createAdminLog } = require("./auditService");

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

// ───────── WRITES ────────
/**
 * Toggle a user's admin status.
 *
 * Grants or revokes admin privileges. When granting, the user is removed
 * from leaderboards (admins are leaderboard-ineligible); when revoking,
 * leaderboard status is restored based on completed-module count.
 *
 * Prevents self-modification. Enforces 18+ age bracket for new admins.
 *
 * @param {Object} params
 * @param {string} params.targetUserId
 * @param {boolean} params.makeAdmin
 * @param {string} [params.reason]
 * @param {Object} params.actor - { id, ip, userAgent }
 * @returns {Promise<{ user: Object }>}
 * @throws {AppError} 400 - Cannot modify own status, or age restriction
 * @throws {AppError} 404 - User not found
 */
const toggleAdminStatus = async ({
  targetUserId,
  makeAdmin,
  reason,
  actor,
}) => {
  if (targetUserId === actor.id.toString()) {
    throw new AppError("Cannot modify own admin status.", 400);
  }

  const user = await getUserOrThrow(targetUserId, "+ageBracket");

  if (makeAdmin && user.ageBracket !== "18+") {
    throw new AppError(
      "Users must be 18 or older to be granted admin priviledges.",
      400,
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
    actor,
    makeAdmin ? "USER_MADE_ADMIN" : "USER_REMOVED_ADMIN",
    "USER",
    targetUserId,
    {
      old: { isAdmin: oldStatus, leaderboardStatus: oldLeaderboardStatus },
      new: { isAdmin: user.isAdmin, leaderboardStatus: user.leaderboardStatus },
    },
    reason || `Admin status ${makeAdmin ? "granted" : "revoked"} by admin.`,
  );

  return { user };
};

/**
 * Manually adjust a user's XP.
 *
 * Creates an `XpTransaction` audit record and returns a slim user shape
 * (not the full document) so responses stay stable.
 *
 * Prevents self-modification.
 *
 * @param {Object} params
 * @param {string} params.targetUserId
 * @param {number|string} params.xpChange
 * @param {string} [params.reason]
 * @param {Object} params.actor - { id, ip, userAgent }
 * @returns {Promise<{ user: Object, change: number|string }>}
 * @throws {AppError} 400 - Cannot modify own XP
 * @throws {AppError} 404 - User not found
 */
const adjustUserXp = async ({ targetUserId, xpChange, reason, actor }) => {
  if (targetUserId === actor.id.toString()) {
    throw new AppError("Cannot modify your own XP", 400);
  }

  const user = await getUserOrThrow(targetUserId);

  const oldXp = user.xp;
  const oldLevel = user.level;

  user.xp += parseInt(xpChange);
  await user.save();

  // Hydrate completed-module IDs for level calculation
  const moduleCompletions = await ModuleCompletion.find({
    userId: targetUserId,
  }).lean();
  const userWithModules = {
    ...user.toObject(),
    completedModules: moduleCompletions.map((mc) => mc.moduleId),
  };
  const userWithLevel = await levelUtils.getUserWithLevel(userWithModules);

  const updatedUser = {
    _id: user._id,
    username: user.username,
    level: userWithLevel.level,
    xp: user.xp,
    streak: user.streak,
    badgeCount: user.badges?.length || 0,
  };

  await createAdminLog(
    actor,
    "XP_ADJUSTMENT",
    "USER",
    targetUserId,
    {
      old: { xp: oldXp, level: oldLevel },
      new: { xp: updatedUser.xp, level: updatedUser.level },
    },
    reason || `XP adjusted by admin: ${xpChange > 0 ? "+" : ""}${xpChange}`,
  );

  await XpTransaction.create({
    userId: targetUserId,
    amount: parseInt(xpChange),
    source: "BONUS",
    meta: { reason: reason || "Admin adjustment", adminId: actor.id },
  });

  return { user: updatedUser, change: xpChange };
};
/**
 * Block, unblock, or delete a user account.
 *
 * Prevents self-modification. Block can include a duration in days.
 *
 * @param {Object} params
 * @param {string} params.targetUserId
 * @param {"block"|"unblock"|"delete"} params.action
 * @param {number} [params.duration] - Block duration in days
 * @param {string} [params.reason]
 * @param {Object} params.actor - { id, ip, userAgent }
 * @returns {Promise<{ user: Object|null }>}
 * @throws {AppError} 400 - Cannot modify own status, or invalid action
 * @throws {AppError} 404 - User not found
 */
const updateUserStatus = async ({
  targetUserId,
  action,
  duration,
  reason,
  actor,
}) => {
  if (targetUserId === actor.id.toString()) {
    throw new AppError("Cannot modify your own status", 400);
  }

  const user = await getUserOrThrow(targetUserId);
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
      await User.findByIdAndDelete(targetUserId);
      actionType = "USER_DELETED";
      break;
    default:
      throw new AppError(
        "Invalid action. Use 'block', 'unblock', or 'delete'",
        400,
      );
  }

  if (action !== "delete") {
    await user.save();
  }

  await createAdminLog(
    actor,
    actionType,
    "USER",
    targetUserId,
    {
      old: { isBlocked: oldStatus },
      new: action === "delete" ? null : { isBlocked: user.isBlocked },
    },
    reason || `${action} action performed by admin`,
  );

  return { user: action === "delete" ? null : user };
};

/**
 * Award one or more badges to a user. Skips badges already earned.
 *
 * @param {Object} params
 * @param {string} params.targetUserId
 * @param {string[]} params.badgeIds
 * @param {string} [params.reason]
 * @param {Object} params.actor - { id, ip, userAgent }
 * @returns {Promise<{ awarded: string[], total: number }>}
 * @throws {AppError} 404 - User not found
 */
const awardBadges = async ({ targetUserId, badgeIds, reason, actor }) => {
  const user = await getUserOrThrow(targetUserId);

  const newBadges = badgeIds.filter((id) => !user.badges.includes(id));

  if (newBadges.length > 0) {
    user.badges = [...new Set([...user.badges, ...newBadges])];

    await createAdminLog(
      actor,
      "AWARD_BADGES",
      "USER",
      user._id,
      { added: newBadges, reason },
      reason,
    );

    await user.save();
  }

  return { awarded: newBadges, total: user.badges.length };
};

/**
 * Remove one or more badges from a user.
 *
 * @param {Object} params
 * @param {string} params.targetUserId
 * @param {string[]} params.badgeIds
 * @param {string} [params.reason]
 * @param {Object} params.actor - { id, ip, userAgent }
 * @returns {Promise<{ removed: string[], remaining: number }>}
 * @throws {AppError} 404 - User not found
 */
const removeBadges = async ({ targetUserId, badgeIds, reason, actor }) => {
  const user = await getUserOrThrow(targetUserId);

  const removedBadges = badgeIds.filter((id) => user.badges.includes(id));

  if (removedBadges.length > 0) {
    user.badges = user.badges.filter((id) => !badgeIds.includes(id));

    await createAdminLog(
      actor,
      "REMOVE_BADGES",
      "USER",
      user._id,
      { removed: removedBadges, reason },
      reason,
    );

    await user.save();
  }

  return { removed: removedBadges, remaining: user.badges.length };
};

/**
 * Override a user's lesson or module completion status.
 *
 * Marks a lesson OR module complete/incomplete, adjusting the user's
 * running completion counts on `User`. Prevents self-modification.
 *
 * Exactly one of `lessonId` or `moduleId` must be provided.
 *
 * @param {Object} params
 * @param {string} params.targetUserId
 * @param {string} [params.lessonId]
 * @param {string} [params.moduleId]
 * @param {boolean} params.completed
 * @param {string} [params.reason]
 * @param {Object} params.actor - { id, ip, userAgent }
 * @returns {Promise<{
 *   user: { _id: string, completedLessonsCount: number, completedModulesCount: number }
 * }>}
 * @throws {AppError} 400 - Cannot modify own progress, or missing id
 * @throws {AppError} 404 - User not found
 */
const overrideUserProgress = async ({
  targetUserId,
  lessonId,
  moduleId,
  completed,
  reason,
  actor,
}) => {
  if (targetUserId === actor.id.toString()) {
    throw new AppError("Cannot modify your own progress", 400);
  }

  await getUserOrThrow(targetUserId, "_id");

  let oldValue, newValue, actionType;

  if (lessonId) {
    const existingCompletion = await LessonCompletion.findOne({
      userId: targetUserId,
      lessonId,
    });

    oldValue = { lessonCompleted: !!existingCompletion };

    if (completed && !existingCompletion) {
      await LessonCompletion.create({ userId: targetUserId, lessonId });
      await User.findByIdAndUpdate(targetUserId, {
        $inc: { completedLessonsCount: 1 },
      });
    } else if (!completed && existingCompletion) {
      await LessonCompletion.deleteOne({ userId: targetUserId, lessonId });
      await User.findByIdAndUpdate(targetUserId, {
        $inc: { completedLessonsCount: -1 },
      });
    }

    const updatedExists = await LessonCompletion.findOne({
      userId: targetUserId,
      lessonId,
    });
    newValue = { lessonCompleted: !!updatedExists };

    actionType = completed
      ? "LESSON_COMPLETED_OVERRIDE"
      : "LESSON_INCOMPLETE_OVERRIDE";
  } else if (moduleId) {
    const existingCompletion = await ModuleCompletion.findOne({
      userId: targetUserId,
      moduleId,
    });

    oldValue = { moduleCompleted: !!existingCompletion };

    if (completed && !existingCompletion) {
      await ModuleCompletion.create({ userId: targetUserId, moduleId });
      await User.findByIdAndUpdate(targetUserId, {
        $inc: { completedModulesCount: 1 },
      });
    } else if (!completed && existingCompletion) {
      await ModuleCompletion.deleteOne({ userId: targetUserId, moduleId });
      await User.findByIdAndUpdate(targetUserId, {
        $inc: { completedModulesCount: -1 },
      });
    }

    const updatedExists = await ModuleCompletion.findOne({
      userId: targetUserId,
      moduleId,
    });
    newValue = { moduleCompleted: !!updatedExists };

    actionType = completed
      ? "MODULE_COMPLETED_OVERRIDE"
      : "MODULE_INCOMPLETE_OVERRIDE";
  } else {
    throw new AppError("Either lessonId or moduleId is required", 400);
  }

  const [lessonCount, moduleCount] = await Promise.all([
    LessonCompletion.countDocuments({ userId: targetUserId }),
    ModuleCompletion.countDocuments({ userId: targetUserId }),
  ]);

  await createAdminLog(
    actor,
    actionType,
    lessonId ? "LESSON" : "MODULE",
    lessonId || moduleId,
    { old: oldValue, new: newValue },
    reason ||
      `Progress override by admin: ${completed ? "complete" : "incomplete"}`,
  );

  return {
    user: {
      _id: targetUserId,
      completedLessonsCount: lessonCount,
      completedModulesCount: moduleCount,
    },
  };
};
// +=============================================+
// |              FLAG MANAGEMENT                |
// +=============================================+
/**
 * List flagged content with filters, search, and pagination.
 *
 * Enriches lesson flags with semantic IDs (e.g. "M3L5"), lesson/module
 * titles, and a content preview; enriches user-profile flags with the
 * target user's username and email.
 *
 * @param {Object} params
 * @param {string} [params.status]     - Status filter, or "ALL" for none
 * @param {string} [params.issueType]
 * @param {string} [params.search]
 * @param {number} [params.page=1]
 * @param {number} [params.limit=20]
 * @returns {Promise<{ flaggedContent: Object[], pagination: Object }>}
 */
const getFlaggedContent = async ({
  status,
  issueType,
  search,
  page = 1,
  limit = 20,
}) => {
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const filter = {};
  if (status && status !== "ALL") filter.status = status;
  if (issueType && issueType !== "") filter.issueType = issueType;
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
      .limit(limitNum)
      .lean(),
    FlaggedContent.countDocuments(filter),
  ]);

  // ── Batch-fetch lessons and users for enrichment ──────────────
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

  return {
    flaggedContent: enrichedContent,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

/**
 * Get aggregate flag statistics grouped by status.
 *
 * Result always contains `pending`, `in_review`, `fixed`, `rejected`,
 * and `xp_adjusted` keys, defaulting to 0 when no flags of that status
 * exist.
 *
 * @returns {Promise<{
 *   pending: number,
 *   in_review: number,
 *   fixed: number,
 *   rejected: number,
 *   xp_adjusted: number
 * }>}
 */
const getFlagStats = async () => {
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

  return result;
};

/**
 * Resolve a flagged content report.
 *
 * Updating a flag to FIXED awards 25 XP to the reporter as compensation
 * and writes a corresponding XP_ADJUSTMENT audit log, followed by a
 * FLAG_RESOLVED audit log.
 *
 * The returned `compensationMessage` is not part of the client payload —
 * it's used by the controller to reconstruct the top-level response
 * message (matching the original controller's redundant message format).
 *
 * @param {Object} params
 * @param {string} params.flagId
 * @param {"IN_REVIEW"|"FIXED"|"REJECTED"} params.status
 * @param {string} [params.adminResponse]
 * @param {Object} params.actor - { id, ip, userAgent }
 * @returns {Promise<{
 *   flag: Object,
 *   message: string,
 *   compensationMessage: string
 * }>}
 * @throws {AppError} 400 - Invalid status
 * @throws {AppError} 404 - Flag not found
 */
const resolveFlag = async ({ flagId, status, adminResponse, actor }) => {
  const validStatuses = ["IN_REVIEW", "FIXED", "REJECTED"];
  if (!validStatuses.includes(status)) {
    throw new AppError(`Invalid status. Use: ${validStatuses.join(", ")}`, 400);
  }

  const flag = await FlaggedContent.findById(flagId);
  if (!flag) throw new AppError("Flag not found", 404);

  const oldStatus = flag.status;
  flag.status = status;
  flag.adminResponse = adminResponse;
  flag.resolvedBy = actor.id;
  flag.resolvedAt = new Date();

  let compensationMessage = "";
  let xpCompensation = 0;

  if (status === "FIXED") {
    xpCompensation = 25;
    flag.xpCompensation = xpCompensation;

    const reporter = await User.findById(flag.reporterId);
    if (reporter) {
      const oldXp = reporter.xp;
      reporter.xp += xpCompensation;
      await reporter.save();

      compensationMessage = ` The reporter has been awarded ${xpCompensation} XP for their help!`;

      await createAdminLog(
        actor,
        "XP_ADJUSTMENT",
        "USER",
        reporter._id,
        {
          old: oldXp,
          new: reporter.xp,
          reason: `Flag compensation for: ${flag.title}`,
        },
        `Auto-awarded ${xpCompensation} XP for flag ${flagId}`,
      );
    }
  }

  await flag.save();

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

  return {
    flag,
    message: `The reporter has been notified${compensationMessage}`,
    compensationMessage,
  };
};

// +=============================================+
// |              CONTENT MANAGEMENT             |
// +=============================================+

// ───────── READS ─────────

/**
 * List all lessons with filtering by status, difficulty, and module.
 *
 * Note: `status`, `difficulty`, and `moduleId` filters use explicit
 * sentinel checks (`"all"`, `""`) rather than treating any unrecognised
 * value as "no filter" — matches the existing admin UI contract.
 *
 * @param {Object} params
 * @param {number} [params.page=1]
 * @param {number} [params.limit=1000]
 * @param {string} [params.status]     - "published" | "draft" | (anything else = no filter)
 * @param {string} [params.difficulty] - Filter by difficulty, "all" disables
 * @param {string} [params.moduleId]   - Filter by module, "" or "all" disables
 * @returns {Promise<{ lessons: Object[], pagination: Object }>}
 */
const getAllLessons = async ({
  limit = 1000,
  page = 1,
  status,
  difficulty,
  moduleId,
}) => {
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const filter = {};
  if (status === "published") filter.isPublished = true;
  if (status === "draft") filter.isPublished = false;
  if (difficulty && difficulty !== "all") filter.difficulty = difficulty;
  if (moduleId && moduleId !== "" && moduleId !== "all") {
    filter.moduleId = moduleId;
  }

  const [lessons, total] = await Promise.all([
    Lesson.find(filter)
      .populate("moduleId", "title order")
      .sort({ order: 1, moduleId: 1 })
      .skip(skip)
      .limit(limitNum),
    Lesson.countDocuments(filter),
  ]);

  return {
    lessons,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

/**
 * List all modules with filtering by publish status.
 *
 * @param {Object} params
 * @param {number} [params.page=1]
 * @param {number} [params.limit=1000]
 * @param {string} [params.status] - "published" | "draft" | (anything else = no filter)
 * @returns {Promise<{ modules: Object[], pagination: Object }>}
 */
const getAllModules = async ({ limit = 1000, page = 1, status }) => {
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const filter = {};
  if (status === "published") filter.isPublished = true;
  if (status === "draft") filter.isPublished = false;

  const [modules, total] = await Promise.all([
    Module.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Module.countDocuments(filter),
  ]);

  return {
    modules,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

/**
 * Get content statistics (lesson/module counts, published vs draft).
 *
 * @returns {Promise<{
 *   totalLessons: number,
 *   publishedLessons: number,
 *   draftLessons: number,
 *   totalModules: number,
 *   publishedModules: number,
 *   draftModules: number
 * }>}
 */
const getContentStats = async () => {
  const [totalLessons, publishedLessons, totalModules, publishedModules] =
    await Promise.all([
      Lesson.countDocuments(),
      Lesson.countDocuments({ isPublished: true }),
      Module.countDocuments(),
      Module.countDocuments({ isPublished: true }),
    ]);

  return {
    totalLessons,
    publishedLessons,
    draftLessons: totalLessons - publishedLessons,
    totalModules,
    publishedModules,
    draftModules: totalModules - publishedModules,
  };
};

// ───────── WRITES ─────────

/**
 * Update a lesson's fields.
 *
 * Runs Mongoose validators on the resulting document. The full request
 * body is passed to the update — no field whitelisting is applied here
 * (matches the original admin controller's behavior).
 *
 * @param {Object} params
 * @param {string} params.lessonId
 * @param {Object} params.updateData - Fields to update
 * @param {Object} params.actor      - { id, ip, userAgent }
 * @returns {Promise<{ lesson: Object }>}
 * @throws {AppError} 404 - Lesson not found
 */
const updateLesson = async ({ lessonId, updateData, actor }) => {
  const lesson = await Lesson.findByIdAndUpdate(lessonId, updateData, {
    new: true,
    runValidators: true,
  });

  if (!lesson) throw new AppError("Lesson not found", 404);

  await createAdminLog(
    actor,
    "LESSON_UPDATED",
    "LESSON",
    lessonId,
    { new: updateData },
    "Updated via admin panel",
  );

  return { lesson };
};

/**
 * Update a module's fields.
 *
 * Runs Mongoose validators on the resulting document. Same body-passthrough
 * behavior as `updateLesson`.
 *
 * @param {Object} params
 * @param {string} params.moduleId
 * @param {Object} params.updateData
 * @param {Object} params.actor      - { id, ip, userAgent }
 * @returns {Promise<{ module: Object }>}
 * @throws {AppError} 404 - Module not found
 */
const updateModule = async ({ moduleId, updateData, actor }) => {
  const module = await Module.findByIdAndUpdate(moduleId, updateData, {
    new: true,
    runValidators: true,
  });

  if (!module) throw new AppError("Module not found", 404);

  await createAdminLog(
    actor,
    "MODULE_UPDATED",
    "MODULE",
    moduleId,
    { new: updateData },
    "Updated via admin panel",
  );

  return { module };
};

/**
 * Publish or unpublish a lesson.
 *
 * @param {Object} params
 * @param {string} params.lessonId
 * @param {boolean} params.publish
 * @param {Object} params.actor - { id, ip, userAgent }
 * @returns {Promise<{ lesson: Object }>}
 * @throws {AppError} 404 - Lesson not found
 */
const publishLesson = async ({ lessonId, publish, actor }) => {
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) throw new AppError("Lesson not found", 404);

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

  return { lesson };
};

/**
 * Publish or unpublish a module.
 *
 * @param {Object} params
 * @param {string} params.moduleId
 * @param {boolean} params.publish
 * @param {Object} params.actor - { id, ip, userAgent }
 * @returns {Promise<{ module: Object }>}
 * @throws {AppError} 404 - Module not found
 */
const publishModule = async ({ moduleId, publish, actor }) => {
  const module = await Module.findById(moduleId);
  if (!module) throw new AppError("Module not found", 404);

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

  return { module };
};

/**
 * Update a lesson's sort order within its module.
 *
 * No audit log is written — matches the original controller's behavior.
 *
 * @param {Object} params
 * @param {string} params.lessonId
 * @param {number} params.order
 * @returns {Promise<{ lesson: Object }>}
 * @throws {AppError} 404 - Lesson not found
 */
const updateLessonOrder = async ({ lessonId, order }) => {
  const lesson = await Lesson.findByIdAndUpdate(
    lessonId,
    { order },
    { new: true },
  );

  if (!lesson) throw new AppError("Lesson not found", 404);

  return { lesson };
};

/**
 * Update a module's sort order in the curriculum.
 *
 * No audit log is written — matches the original controller's behavior.
 *
 * @param {Object} params
 * @param {string} params.moduleId
 * @param {number} params.order
 * @returns {Promise<{ module: Object }>}
 * @throws {AppError} 404 - Module not found
 */
const updateModuleOrder = async ({ moduleId, order }) => {
  const module = await Module.findByIdAndUpdate(
    moduleId,
    { order },
    { new: true },
  );

  if (!module) throw new AppError("Module not found", 404);

  return { module };
};
// +=============================================+
// |              SETTINGS & STATS               |
// +=============================================+

// ───────── EXPORTS ────────────

module.exports = {
  // User Management (reads)
  getAdmins,
  getAdminStats,
  searchUsers,
  getUserDetails,
  getUserActivity,
  getUserBadges,
  getUserProgress,
  // User Management (writes)
  toggleAdminStatus,
  adjustUserXp,
  updateUserStatus,
  awardBadges,
  removeBadges,
  overrideUserProgress,
  // Flag management
  getFlaggedContent,
  getFlagStats,
  resolveFlag,
  // Content management (reads)
  getAllLessons,
  getAllModules,
  getContentStats,
  // Content management (writes)
  updateLesson,
  updateModule,
  publishLesson,
  publishModule,
  updateLessonOrder,
  updateModuleOrder,
};
