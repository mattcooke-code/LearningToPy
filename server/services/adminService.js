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
const learningEngine = require("./learningEngine");

// ---UTILITIES & CONSTANTS---
const mongoose = require("mongoose");
const adminConstants = require("../constants/adminConstants");
const adminUtils = require("../utils/adminUtils");
const AppError = require("../utils/AppError");
const dateUtils = require("../utils/dateUtils");
const levelUtils = require("../utils/levelUtils");

// ─────────────── CONSTANTS ──────────────────
/** Lesson / Module share identical update, publish and reorder flows. */
const CONTENT_TYPES = Object.freeze({
  lesson: {
    Model: Lesson,
    key: "lesson",
    label: "Lesson",
    logTarget: "LESSON",
  },
  module: {
    Model: Module,
    key: "module",
    label: "Module",
    logTarget: "MODULE",
  },
});

/** Lesson / module completion overrides differ only by these settings. */
const PROGRESS_TYPES = Object.freeze({
  lesson: {
    Model: LessonCompletion,
    idKey: "lessonId",
    counterKey: "completedLessonsCount",
    stateKey: "lessonCompleted",
    logTarget: "LESSON",
  },
  module: {
    Model: ModuleCompletion,
    idKey: "moduleId",
    counterKey: "completedModulesCount",
    stateKey: "moduleCompleted",
    logTarget: "MODULE",
  },
});

// +=============================================+
// |              SHARED HELPERS                 |
// +=============================================+

/**
 * Find a document by ID or throw 404 `"<label> not found"`.
 *
 * @param {import("mongoose").Model} Model
 * @param {string} id
 * @param {string} label
 * @param {Object}  [options]
 * @param {string}  [options.select]  - Mongoose select projection
 * @param {boolean} [options.lean]    - Return a plain object
 * @param {Object}  [options.session] - Transaction session
 * @returns {Promise<Object>}
 * @throws {AppError} 404
 */
const findOrThrow = async (Model, id, label, options = {}) => {
  const { select, lean, session } = options;

  const query = Model.findById(id);
  if (select) query.select(select);
  if (lean) query.lean();
  if (session) query.session(session);

  const doc = await query;
  if (!doc) throw new AppError(`${label} not found`, 404);
  return doc;
};

/** Find a user by ID or throw 404. See `findOrThrow` for options. */
const getUserOrThrow = (userId, select = null, options = {}) =>
  findOrThrow(User, userId, "User", { ...options, select });

/**
 * Run `fn(session)` inside a transaction and always end the session.
 * Resolves with whatever `fn` returns.
 *
 * @template T
 * @param {(session: Object) => Promise<T>} fn
 * @returns {Promise<T>}
 */
const runInTransaction = async (fn) => {
  const session = await mongoose.startSession();
  try {
    return await session.withTransaction(() => fn(session));
  } finally {
    await session.endSession();
  }
};

/**
 * Object-style wrapper around `createAdminLog` (six positional args are easy
 * to misorder). Only passes the options argument when a session is given.
 */
const logAdminAction = ({
  actor,
  action,
  targetType,
  targetId,
  changes,
  reason,
  session,
}) =>
  session
    ? createAdminLog(actor, action, targetType, targetId, changes, reason, {
        session,
      })
    : createAdminLog(actor, action, targetType, targetId, changes, reason);

/**
 * Attach computed `level` info to a plain user object, hydrating the
 * completed-module IDs that `levelUtils` needs. Accepts completions with
 * either populated or raw `moduleId`.
 */
const getUserWithHydratedLevel = (userObject, moduleCompletions) =>
  levelUtils.getUserWithLevel({
    ...userObject,
    completedModules: moduleCompletions.map(
      (mc) => mc.moduleId?._id || mc.moduleId,
    ),
  });

/**
 * Total / published / draft counts for a model with an `isPublished` flag,
 * in a single aggregation.
 *
 * @returns {Promise<{ total: number, published: number, draft: number }>}
 */
const getPublishCounts = async (Model) => {
  const rows = await Model.aggregate([
    { $group: { _id: "$isPublished", count: { $sum: 1 } } },
  ]);

  let total = 0;
  let published = 0;
  for (const { _id, count } of rows) {
    total += count;
    if (_id === true) published += count;
  }
  return { total, published, draft: total - published };
};

/** Drop fields an admin edit must never overwrite. */
const stripImmutableFields = (data = {}) =>
  Object.fromEntries(
    Object.entries(data).filter(
      ([key]) => !adminConstants.IMMUTABLE_FIELDS.includes(key),
    ),
  );

// +=============================================+
// |              USER MANAGEMENT                |
// +=============================================+

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
 * `totalUsers` uses `estimatedDocumentCount()` (collection metadata, O(1)).
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
  const [totalUsers, activeUsers, lessonCounts, pendingFlags] =
    await Promise.all([
      User.estimatedDocumentCount(),
      User.countDocuments({
        lastEngagementAt: {
          $gte: new Date(
            Date.now() -
              adminConstants.ACTIVE_USER_WINDOW_DAYS * dateUtils.MS_PER_DAY,
          ),
        },
      }),
      getPublishCounts(Lesson),
      FlaggedContent.countDocuments({ status: "PENDING" }),
    ]);

  return {
    totalUsers,
    activeUsers,
    totalLessons: lessonCounts.total,
    publishedLessons: lessonCounts.published,
    pendingFlags,
  };
};

/**
 * Search users with filtering, sorting, and pagination.
 *
 * Reads `User.level` directly (denormalised counter, kept in sync by
 * learningEngine + overrideUserProgress). Level filters apply to the
 * whole result set — so `pagination.total` reflects the filtered count,
 * matching the returned page.
 *
 * Uses a single aggregation with `$facet` so the paginated page and the
 * total count come from the same snapshot (avoids the `find()` +
 * `countDocuments()` disagreement window).
 *
 * `sort` must be one of `SORTABLE_USER_FIELDS` (optionally `-` prefixed).
 * `_id` is appended as a tiebreaker so pagination is stable.
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
 * @throws {AppError} 400 - Unsupported sort field
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
  const { pageNum, limitNum, skip } = adminUtils.parsePagination(
    { page, limit },
    adminConstants.PAGE_LIMITS.USERS,
  );

  // ── Build filter ────────────────────────────────
  const searchFilter = {};

  if (typeof query === "string" && query) {
    searchFilter.$or = adminUtils.buildSearchOr(["username", "email"], query);
  }
  if (isBlocked !== undefined) searchFilter.isBlocked = isBlocked === "true";
  if (isAdmin !== undefined) searchFilter.isAdmin = isAdmin === "true";

  // Level filters apply to the whole result set. Guarded with isNaN so a
  // non-numeric `levelMin=abc` is ignored rather than producing a
  // never-matching `$gte: NaN` clause.
  const parsedLevelMin = parseInt(levelMin, 10);
  const parsedLevelMax = parseInt(levelMax, 10);

  if (!Number.isNaN(parsedLevelMin) || !Number.isNaN(parsedLevelMax)) {
    searchFilter.level = {};
    if (!Number.isNaN(parsedLevelMin)) searchFilter.level.$gte = parsedLevelMin;
    if (!Number.isNaN(parsedLevelMax)) searchFilter.level.$lte = parsedLevelMax;
  }

  // ── Build sort (whitelisted, with stable tiebreaker) ──────────
  const sortValue = typeof sort === "string" && sort ? sort : "-createdAt";
  const direction = sortValue.startsWith("-") ? -1 : 1;
  const sortField = direction === -1 ? sortValue.slice(1) : sortValue;

  if (!adminConstants.SORTABLE_USER_FIELDS.includes(sortField)) {
    throw new AppError(
      `Invalid sort field. Use one of: ${adminConstants.SORTABLE_USER_FIELDS.join(", ")}`,
      400,
    );
  }
  const sortOption = { [sortField]: direction, _id: direction };

  // ── Single aggregation: paginated page + filtered total ──
  const [result] = await User.aggregate([
    { $match: searchFilter },
    { $sort: sortOption },
    {
      $facet: {
        metadata: [{ $count: "total" }],
        users: [
          { $skip: skip },
          { $limit: limitNum },
          { $project: adminConstants.USER_LIST_PROJECTION },
        ],
      },
    },
  ]);

  const users = result?.users ?? [];
  const total = result?.metadata?.[0]?.total ?? 0;

  return {
    users,
    pagination: adminUtils.buildPagination(pageNum, limitNum, total),
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
  const user = await getUserOrThrow(
    userId,
    "-password -refreshTokenVersion -resetPasswordToken -resetPasswordExpires",
    { lean: true },
  );

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

  const userWithLevel = await getUserWithHydratedLevel(user, moduleCompletions);

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
      ...adminConstants.PRIVACY_SETTINGS.DEFAULT,
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
  const { limitNum } = adminUtils.parsePagination(
    { limit },
    adminConstants.PAGE_LIMITS.ACTIVITY,
  );

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
 * @throws {AppError} 404 - User not found
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
  adminUtils.assertNotSelf(targetUserId, actor, "admin status");

  const user = await getUserOrThrow(targetUserId, "+ageBracket");

  if (makeAdmin && user.ageBracket !== "18+") {
    throw new AppError(
      "Users must be 18 or older to be granted admin privileges.",
      400,
    );
  }

  const oldStatus = user.isAdmin;
  const oldLeaderboardStatus = user.leaderboardStatus;

  user.isAdmin = makeAdmin;

  if (makeAdmin) {
    user.leaderboardStatus = "INACTIVE_REMOVED";
    user.removedFromLeaderboardAt = new Date();
    user.privacySettings = { ...adminConstants.PRIVACY_SETTINGS.ADMIN };
  } else {
    user.leaderboardStatus =
      user.completedModulesCount >=
      adminConstants.LEADERBOARD_COMPLETION_THRESHOLD
        ? "COMPLETED_PENDING"
        : "ACTIVE";
    user.removedFromLeaderboardAt = null;
    user.privacySettings = { ...adminConstants.PRIVACY_SETTINGS.DEFAULT };
  }

  await user.save();

  await logAdminAction({
    actor,
    action: makeAdmin ? "USER_MADE_ADMIN" : "USER_REMOVED_ADMIN",
    targetType: "USER",
    targetId: targetUserId,
    changes: {
      old: { isAdmin: oldStatus, leaderboardStatus: oldLeaderboardStatus },
      new: { isAdmin: user.isAdmin, leaderboardStatus: user.leaderboardStatus },
    },
    reason:
      reason || `Admin status ${makeAdmin ? "granted" : "revoked"} by admin.`,
  });

  return { user };
};

/**
 * Manually adjust a user's XP.
 *
 * Runs in a transaction: the XP change, the `XP_ADJUSTMENT` audit log and
 * the `XpTransaction` record commit together or not at all. XP is changed
 * with an atomic `$inc` (via `user.$inc`) so concurrent adjustments don't
 * overwrite each other. Returns a slim user shape (not the full document)
 * so responses stay stable.
 *
 * Prevents self-modification.
 *
 * @param {Object} params
 * @param {string} params.targetUserId
 * @param {number|string} params.xpChange
 * @param {string} [params.reason]
 * @param {Object} params.actor - { id, ip, userAgent }
 * @returns {Promise<{ user: Object, change: number|string }>}
 * @throws {AppError} 400 - Cannot modify own XP, or xpChange not an integer
 * @throws {AppError} 404 - User not found
 */
const adjustUserXp = async ({ targetUserId, xpChange, reason, actor }) => {
  adminUtils.assertNotSelf(targetUserId, actor, "XP");

  const delta = parseInt(xpChange, 10);
  if (Number.isNaN(delta)) {
    throw new AppError("xpChange must be a valid integer", 400);
  }

  const updatedUser = await runInTransaction(async (session) => {
    const user = await getUserOrThrow(targetUserId, null, { session });

    const oldXp = user.xp;
    const oldLevel = user.level;

    user.$inc("xp", delta);
    await user.save({ session });

    const moduleCompletions = await ModuleCompletion.find({
      userId: targetUserId,
    })
      .session(session)
      .lean();
    const userWithLevel = await getUserWithHydratedLevel(
      user.toObject(),
      moduleCompletions,
    );

    const summary = {
      _id: user._id,
      username: user.username,
      level: userWithLevel.level,
      xp: user.xp,
      streak: user.streak,
      badgeCount: user.badges?.length || 0,
    };

    await logAdminAction({
      actor,
      action: "XP_ADJUSTMENT",
      targetType: "USER",
      targetId: targetUserId,
      changes: {
        old: { xp: oldXp, level: oldLevel },
        new: { xp: summary.xp, level: summary.level },
      },
      reason: reason || `XP adjusted by admin: ${delta > 0 ? "+" : ""}${delta}`,
      session,
    });

    await XpTransaction.create(
      [
        {
          userId: targetUserId,
          amount: delta,
          source: "BONUS",
          meta: { reason: reason || "Admin adjustment", adminId: actor.id },
        },
      ],
      { session },
    );

    return summary;
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
  adminUtils.assertNotSelf(targetUserId, actor, "status");

  // Validate `duration` whenever it's provided — regardless of `action` — so
  // typos like `{ action: "unblock", duration: -1 }` surface as errors rather
  // than being silently ignored. Omitting `duration` (or passing 0/null) means
  // "permanent block", matching pre-fix behaviour.
  if (duration !== undefined && duration !== null) {
    if (!Number.isInteger(duration) || duration < 0) {
      throw new AppError(
        "duration must be a non-negative integer (days), or omitted for a permanent block",
        400,
      );
    }
  }

  const user = await getUserOrThrow(targetUserId);
  const oldStatus = user.isBlocked;
  const isDelete = action === "delete";

  let actionType;
  switch (action) {
    case "block":
      user.isBlocked = true;
      user.suspensionEnd = duration
        ? new Date(Date.now() + duration * dateUtils.MS_PER_DAY)
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

  if (!isDelete) await user.save();

  await logAdminAction({
    actor,
    action: actionType,
    targetType: "USER",
    targetId: targetUserId,
    changes: {
      old: { isBlocked: oldStatus },
      new: isDelete ? null : { isBlocked: user.isBlocked },
    },
    reason: reason || `${action} action performed by admin`,
  });

  return { user: isDelete ? null : user };
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
 * @throws {AppError} 400 - badgeIds is not an array
 * @throws {AppError} 404 - User not found
 */
const awardBadges = async ({ targetUserId, badgeIds, reason, actor }) => {
  const requested = adminUtils.normalizeBadgeIds(badgeIds);
  const user = await getUserOrThrow(targetUserId);

  const owned = new Set(user.badges);
  const newBadges = requested.filter((id) => !owned.has(id));

  if (newBadges.length > 0) {
    user.badges = [...user.badges, ...newBadges];
    await user.save();

    await logAdminAction({
      actor,
      action: "AWARD_BADGES",
      targetType: "USER",
      targetId: user._id,
      changes: { new: { added: newBadges } },
      reason,
    });
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
 * @throws {AppError} 400 - badgeIds is not an array
 * @throws {AppError} 404 - User not found
 */
const removeBadges = async ({ targetUserId, badgeIds, reason, actor }) => {
  const requested = adminUtils.normalizeBadgeIds(badgeIds);
  const user = await getUserOrThrow(targetUserId);

  const owned = new Set(user.badges);
  const removedBadges = requested.filter((id) => owned.has(id));

  if (removedBadges.length > 0) {
    const toRemove = new Set(removedBadges);
    user.badges = user.badges.filter((id) => !toRemove.has(id));
    await user.save();

    await logAdminAction({
      actor,
      action: "REMOVE_BADGES",
      targetType: "USER",
      targetId: user._id,
      changes: { new: { removed: removedBadges } },
      reason,
    });
  }

  return { removed: removedBadges, remaining: user.badges.length };
};

/**
 * Override a user's lesson or module completion status.
 *
 * Marks a lesson OR module complete/incomplete, adjusting the user's
 * running completion counts on `User`. Prevents self-modification.
 * Module overrides also recompute and persist the user's level.
 *
 * Exactly one of `lessonId` or `moduleId` must be provided (`lessonId`
 * wins if both are).
 *
 * @param {Object} params
 * @param {string} params.targetUserId
 * @param {string} [params.lessonId]
 * @param {string} [params.moduleId]
 * @param {boolean} params.completed
 * @param {string} [params.reason]
 * @param {Object} params.actor - { id, ip, userAgent }
 * @returns {Promise<{
 *   user: {
 *     _id: string,
 *     level: number,
 *     completedLessonsCount: number,
 *     completedModulesCount: number
 *   }
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
  adminUtils.assertNotSelf(targetUserId, actor, "progress");

  const user = await getUserOrThrow(targetUserId, "level");

  const typeKey = lessonId ? "lesson" : moduleId ? "module" : null;
  if (!typeKey) {
    throw new AppError("Either lessonId or moduleId is required", 400);
  }

  const { Model, idKey, counterKey, stateKey, logTarget } =
    PROGRESS_TYPES[typeKey];
  const targetId = lessonId || moduleId;
  const filter = { userId: targetUserId, [idKey]: targetId };

  // NOTE: check-then-write is not atomic; a unique index on
  // (userId, lessonId/moduleId) is the real guard against double-counting.
  const existing = await Model.exists(filter);

  if (completed && !existing) {
    await Model.create(filter);
    await User.findByIdAndUpdate(targetUserId, { $inc: { [counterKey]: 1 } });
  } else if (!completed && existing) {
    await Model.deleteOne(filter);
    await User.findByIdAndUpdate(targetUserId, { $inc: { [counterKey]: -1 } });
  }

  // Recompute and persist level AFTER ModuleCompletion is updated.
  // Lesson overrides don't affect level, so the current value is returned.
  const level =
    typeKey === "module"
      ? await levelUtils.recalculateUserLevel(targetUserId)
      : user.level;

  const [lessonCount, moduleCount] = await Promise.all([
    LessonCompletion.countDocuments({ userId: targetUserId }),
    ModuleCompletion.countDocuments({ userId: targetUserId }),
  ]);

  await logAdminAction({
    actor,
    action: `${logTarget}_${completed ? "COMPLETED" : "INCOMPLETE"}_OVERRIDE`,
    targetType: logTarget,
    targetId,
    changes: {
      old: { [stateKey]: !!existing },
      new: { [stateKey]: !!completed },
    },
    reason:
      reason ||
      `Progress override by admin: ${completed ? "complete" : "incomplete"}`,
  });

  return {
    user: {
      _id: targetUserId,
      level,
      completedLessonsCount: lessonCount,
      completedModulesCount: moduleCount,
    },
  };
};

// +=============================================+
// |              FLAG MANAGEMENT                |
// +=============================================+

/** IDs of flags' targets of the given type (skipping flags with no target). */
const collectTargetIds = (flags, targetType) =>
  flags
    .filter((f) => f.targetType === targetType && f.targetId)
    .map((f) => f.targetId);

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
  const { pageNum, limitNum, skip } = adminUtils.parsePagination(
    { page, limit },
    adminConstants.PAGE_LIMITS.FLAGS,
  );

  const filter = {};
  if (status && status !== "ALL") filter.status = status;
  if (issueType) filter.issueType = issueType;
  if (typeof search === "string" && search) {
    filter.$or = adminUtils.buildSearchOr(
      ["title", "description", "suggestedFix"],
      search,
    );
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
  const lessonIds = collectTargetIds(flaggedContent, "LESSON");
  const userFlagIds = collectTargetIds(flaggedContent, "USER_PROFILE");

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
        semanticId: `Lesson ${flag.targetId.toString().slice(-6)}`,
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
    pagination: adminUtils.buildPagination(pageNum, limitNum, total),
  };
};

/**
 * Get aggregate flag statistics grouped by status.
 *
 * Result always contains `pending`, `in_review`, `fixed`, and `rejected`
 * keys, defaulting to 0 when no flags of that status
 * exist.
 *
 * @returns {Promise<{
 *   pending: number,
 *   in_review: number,
 *   fixed: number,
 *   rejected: number,
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
  };

  for (const { _id, count } of stats) {
    const key = _id?.toLowerCase();
    if (key && Object.hasOwn(result, key)) result[key] = count;
  }

  return result;
};

/**
 * Resolve a flagged content report.
 *
 * Updating a flag to FIXED awards 25 XP to the reporter as compensation
 * and writes a corresponding XP_ADJUSTMENT audit log, followed by a
 * FLAG_RESOLVED audit log. Everything runs in one transaction.
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
 * @throws {AppError} 409 - Flag already resolved as FIXED
 */
const resolveFlag = async ({ flagId, status, adminResponse, actor }) => {
  if (!adminConstants.VALID_FLAG_RESOLUTIONS.includes(status)) {
    throw new AppError(
      `Invalid status. Use: ${adminConstants.VALID_FLAG_RESOLUTIONS.join(", ")}`,
      400,
    );
  }

  return runInTransaction(async (session) => {
    const flag = await findOrThrow(FlaggedContent, flagId, "Flag", { session });
    if (flag.status === "FIXED") {
      throw new AppError("Flag already resolved as FIXED", 409);
    }

    const oldStatus = flag.status;
    flag.status = status;
    flag.adminResponse = adminResponse;
    flag.resolvedBy = actor.id;
    flag.resolvedAt = new Date();

    let compensationMessage = "";
    let xpCompensation = 0;

    if (status === "FIXED") {
      xpCompensation = adminConstants.FLAG_FIX_XP_REWARD;
      flag.xpCompensation = xpCompensation;

      const reporter = await User.findById(flag.reporterId).session(session);
      if (reporter) {
        const oldXp = reporter.xp;
        reporter.xp += xpCompensation;
        await reporter.save({ session });

        compensationMessage = ` The reporter has been awarded ${xpCompensation} XP for their help!`;

        // NOTE: unlike `adjustUserXp`, this award does not write an
        // `XpTransaction` record — confirm whether that is intentional.
        await logAdminAction({
          actor,
          action: "XP_ADJUSTMENT",
          targetType: "USER",
          targetId: reporter._id,
          changes: { old: { xp: oldXp }, new: { xp: reporter.xp } },
          reason: `Auto-awarded ${xpCompensation} XP for flag ${flagId}`,
          session,
        });
      }
    }

    await flag.save({ session });

    await logAdminAction({
      actor,
      action: "FLAG_RESOLVED",
      targetType: "FLAG",
      targetId: flagId,
      changes: {
        oldStatus,
        newStatus: status,
        xpCompensation,
        targetType: flag.targetType,
        targetId: flag.targetId,
      },
      reason: `Flag resolved with status: ${status}. ${adminResponse || ""}`,
      session,
    });

    return {
      flag,
      message: `The reporter has been notified${compensationMessage}`,
      compensationMessage,
    };
  });
};

// +=============================================+
// |              CONTENT MANAGEMENT             |
// +=============================================+

// ───────── PRIVATE HELPERS (lesson / module shared flows) ─────────

/**
 * Update a lesson/module's fields. Immutable fields (`_id`, `__v`,
 * timestamps) are stripped; Mongoose validators run on the result.
 *
 * @returns {Promise<Object>} `{ [type.key]: updatedDoc }`
 * @throws {AppError} 404
 */
const updateContent = async (type, id, updateData, actor) => {
  const { Model, key, label, logTarget } = type;
  const changes = stripImmutableFields(updateData);

  const doc = await Model.findByIdAndUpdate(id, changes, {
    new: true,
    runValidators: true,
  });
  if (!doc) throw new AppError(`${label} not found`, 404);

  await logAdminAction({
    actor,
    action: `${logTarget}_UPDATED`,
    targetType: logTarget,
    targetId: id,
    changes: { new: changes },
    reason: "Updated via admin panel",
  });

  return { [key]: doc };
};

/**
 * Publish or unpublish a lesson/module.
 *
 * @returns {Promise<Object>} `{ [type.key]: doc }`
 * @throws {AppError} 404
 */
const publishContent = async (type, id, publish, actor) => {
  const { Model, key, label, logTarget } = type;
  const doc = await findOrThrow(Model, id, label);

  const oldStatus = doc.isPublished;
  doc.isPublished = publish;
  await doc.save();

  await logAdminAction({
    actor,
    action: `${logTarget}_${publish ? "PUBLISHED" : "UNPUBLISHED"}`,
    targetType: logTarget,
    targetId: id,
    changes: { old: { isPublished: oldStatus }, new: { isPublished: publish } },
    reason: `${label} ${publish ? "published" : "unpublished"} via admin panel`,
  });

  return { [key]: doc };
};

/**
 * Update a lesson/module's sort order.
 *
 * @returns {Promise<Object>} `{ [type.key]: doc }`
 * @throws {AppError} 404
 */
const updateContentOrder = async (type, id, order, actor) => {
  const { Model, key, label, logTarget } = type;
  const doc = await findOrThrow(Model, id, label);

  const oldOrder = doc.order;
  doc.order = order;
  await doc.save();

  await logAdminAction({
    actor,
    action: `${logTarget}_ORDER_UPDATED`,
    targetType: logTarget,
    targetId: id,
    changes: { old: { order: oldOrder }, new: { order } },
    reason: `${label} order updated via admin panel`,
  });

  return { [key]: doc };
};

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
  const { pageNum, limitNum, skip } = adminUtils.parsePagination(
    { page, limit },
    adminConstants.PAGE_LIMITS.CONTENT,
  );

  const filter = {};
  if (status === "published") filter.isPublished = true;
  if (status === "draft") filter.isPublished = false;
  if (difficulty && difficulty !== "all") filter.difficulty = difficulty;
  if (moduleId && moduleId !== "all") filter.moduleId = moduleId;

  const [lessons, total] = await Promise.all([
    Lesson.find(filter)
      .populate("moduleId", "title order")
      .sort({ order: 1, _id: 1 })
      .skip(skip)
      .limit(limitNum),
    Lesson.countDocuments(filter),
  ]);

  return {
    lessons,
    pagination: adminUtils.buildPagination(pageNum, limitNum, total),
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
  const { pageNum, limitNum, skip } = adminUtils.parsePagination(
    { page, limit },
    adminConstants.PAGE_LIMITS.CONTENT,
  );

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
    pagination: adminUtils.buildPagination(pageNum, limitNum, total),
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
  const [lessons, modules] = await Promise.all([
    getPublishCounts(Lesson),
    getPublishCounts(Module),
  ]);

  return {
    totalLessons: lessons.total,
    publishedLessons: lessons.published,
    draftLessons: lessons.draft,
    totalModules: modules.total,
    publishedModules: modules.published,
    draftModules: modules.draft,
  };
};

// ───────── WRITES ─────────

/**
 * Update a lesson's fields.
 *
 * Runs Mongoose validators on the resulting document. Immutable fields
 * (`_id`, `__v`, `createdAt`, `updatedAt`) are stripped from the payload;
 * Mongoose's strict mode drops unknown fields. No further whitelisting.
 *
 * @param {Object} params
 * @param {string} params.lessonId
 * @param {Object} params.updateData - Fields to update
 * @param {Object} params.actor      - { id, ip, userAgent }
 * @returns {Promise<{ lesson: Object }>}
 * @throws {AppError} 404 - Lesson not found
 */
const updateLesson = ({ lessonId, updateData, actor }) =>
  updateContent(CONTENT_TYPES.lesson, lessonId, updateData, actor);

/**
 * Update a module's fields. Same behaviour as `updateLesson`.
 *
 * @param {Object} params
 * @param {string} params.moduleId
 * @param {Object} params.updateData
 * @param {Object} params.actor      - { id, ip, userAgent }
 * @returns {Promise<{ module: Object }>}
 * @throws {AppError} 404 - Module not found
 */
const updateModule = ({ moduleId, updateData, actor }) =>
  updateContent(CONTENT_TYPES.module, moduleId, updateData, actor);

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
const publishLesson = ({ lessonId, publish, actor }) =>
  publishContent(CONTENT_TYPES.lesson, lessonId, publish, actor);

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
const publishModule = ({ moduleId, publish, actor }) =>
  publishContent(CONTENT_TYPES.module, moduleId, publish, actor);

/**
 * Update a lesson's sort order within its module.
 *
 * @param {Object} params
 * @param {string} params.lessonId
 * @param {number} params.order
 * @param {Object} params.actor - { id, ip, userAgent }
 * @returns {Promise<{ lesson: Object }>}
 * @throws {AppError} 404 - Lesson not found
 */
const updateLessonOrder = ({ lessonId, order, actor }) =>
  updateContentOrder(CONTENT_TYPES.lesson, lessonId, order, actor);

/**
 * Update a module's sort order in the curriculum.
 *
 * @param {Object} params
 * @param {string} params.moduleId
 * @param {number} params.order
 * @param {Object} params.actor - { id, ip, userAgent }
 * @returns {Promise<{ module: Object }>}
 * @throws {AppError} 404 - Module not found
 */
const updateModuleOrder = ({ moduleId, order, actor }) =>
  updateContentOrder(CONTENT_TYPES.module, moduleId, order, actor);

/**
 * Create a new lesson. Auto-assigns `order` when not provided (or falsy) by
 * finding the current highest order for the target module and adding 1.
 * The input object is not mutated.
 *
 * NOTE: max-then-insert is not atomic; two concurrent creates in the same
 * module can receive the same `order`.
 *
 * @param {Object} params
 * @param {Object} params.lessonData - Fields for the new lesson
 * @param {Object} params.actor      - { id, ip, userAgent }
 * @returns {Promise<{ lesson: Object }>}
 */
const createLesson = async ({ lessonData, actor }) => {
  const data = { ...lessonData };

  if (!data.order) {
    const lastLesson = await Lesson.findOne({
      moduleId: data.moduleId,
    }).sort({ order: -1 });
    data.order = (lastLesson?.order || 0) + 1;
  }

  const lesson = await Lesson.create(data);

  await logAdminAction({
    actor,
    action: "LESSON_CREATED",
    targetType: "LESSON",
    targetId: lesson._id,
    changes: { new: { title: lesson.title, moduleId: lesson.moduleId } },
    reason: "Lesson created via admin panel",
  });

  return { lesson };
};

/**
 * Create a new module.
 *
 * Normalizes `order` and `moduleNumber` by omitting them from the payload
 * when falsy / 0 / null / empty-string — this lets the schema's defaults
 * and pre-save hooks assign them. (Does NOT auto-assign `order` the way
 * `createLesson` does — asymmetric with the lesson path, matching the
 * original admin controller's behavior.) The input object is not mutated.
 *
 * @param {Object} params
 * @param {Object} params.moduleData - Fields for the new module
 * @param {Object} params.actor      - { id, ip, userAgent }
 * @returns {Promise<{ module: Object }>}
 */
const createModule = async ({ moduleData, actor }) => {
  const data = { ...moduleData };
  for (const key of ["order", "moduleNumber"]) {
    if (!data[key]) delete data[key];
  }

  const moduleDoc = await Module.create(data);

  await logAdminAction({
    actor,
    action: "MODULE_CREATED",
    targetType: "MODULE",
    targetId: moduleDoc._id,
    changes: {
      new: {
        title: moduleDoc.title,
        moduleNumber: moduleDoc.moduleNumber,
        order: moduleDoc.order,
      },
    },
    reason: "Module created via admin panel",
  });

  return { module: moduleDoc };
};

/**
 * Delete a lesson by ID.
 *
 * @param {Object} params
 * @param {string} params.lessonId
 * @param {Object} params.actor - { id, ip, userAgent }
 * @returns {Promise<{ lessonId: string }>}
 * @throws {AppError} 404 - Lesson not found
 */
const deleteLesson = async ({ lessonId, actor }) => {
  const lesson = await Lesson.findByIdAndDelete(lessonId);
  if (!lesson) throw new AppError("Lesson not found", 404);

  await logAdminAction({
    actor,
    action: "LESSON_DELETED",
    targetType: "LESSON",
    targetId: lessonId,
    changes: { old: { title: lesson.title } },
    reason: "Lesson deleted via admin panel",
  });

  return { lessonId };
};

/**
 * Delete a module.
 *
 * Refuses to delete a module that still contains any lessons (published
 * or draft). Callers must delete or reassign lessons first.
 *
 * @param {Object} params
 * @param {string} params.moduleId
 * @param {Object} params.actor - { id, ip, userAgent }
 * @returns {Promise<{ moduleId: string }>}
 * @throws {AppError} 404 - Module not found
 * @throws {AppError} 400 - Module is not empty
 */
const deleteModule = async ({ moduleId, actor }) => {
  const moduleDoc = await findOrThrow(Module, moduleId, "Module");

  const lessonCount = await Lesson.countDocuments({ moduleId });
  if (lessonCount > 0) {
    throw new AppError(
      `Cannot delete module with ${lessonCount} lessons. Delete or reassign lessons first.`,
      400,
    );
  }

  await Module.findByIdAndDelete(moduleId);

  await logAdminAction({
    actor,
    action: "MODULE_DELETED",
    targetType: "MODULE",
    targetId: moduleId,
    changes: { old: { title: moduleDoc.title } },
    reason: "Module deleted via admin panel",
  });

  return { moduleId };
};

/**
 * Duplicate a lesson as a new unpublished copy.
 *
 * The copy is titled `"<original title> (Copy)"` and starts unpublished
 * so it can be reviewed before being made visible. `order` is copied
 * verbatim from the original.
 *
 * @param {Object} params
 * @param {string} params.lessonId
 * @param {Object} params.actor - { id, ip, userAgent }
 * @returns {Promise<{ lesson: Object }>}
 * @throws {AppError} 400 - Invalid lesson ID
 * @throws {AppError} 404 - Lesson not found
 */
const duplicateLesson = async ({ lessonId, actor }) => {
  adminUtils.assertValidObjectId(lessonId, "lesson ID");

  const originalLesson = await findOrThrow(Lesson, lessonId, "Lesson");

  const duplicatedLesson = await Lesson.create({
    ...originalLesson.toObject(),
    _id: undefined,
    title: `${originalLesson.title} (Copy)`,
    isPublished: false,
    createdAt: undefined,
    updatedAt: undefined,
  });

  await logAdminAction({
    actor,
    action: "LESSON_DUPLICATED",
    targetType: "LESSON",
    targetId: duplicatedLesson._id,
    changes: {
      new: { title: duplicatedLesson.title, sourceLesson: lessonId },
    },
    reason: "Lesson duplicated via admin panel",
  });

  return { lesson: duplicatedLesson };
};

/**
 * Duplicate an entire module, including all of its lessons.
 *
 * Both the module and every lesson copy start unpublished. The module's
 * `order` and `moduleNumber` are unset so the schema assigns the next
 * available values. Wrapped in a transaction so a partial failure leaves
 * no orphan module behind. The audit log is written after commit.
 *
 * @param {Object} params
 * @param {string} params.moduleId
 * @param {Object} params.actor - { id, ip, userAgent }
 * @returns {Promise<{ module: Object, lessons: Object[] }>}
 * @throws {AppError} 400 - Invalid module ID
 * @throws {AppError} 404 - Module not found
 */
const duplicateModule = async ({ moduleId, actor }) => {
  adminUtils.assertValidObjectId(moduleId, "module ID");

  const result = await runInTransaction(async (session) => {
    const originalModule = await findOrThrow(Module, moduleId, "Module", {
      session,
    });

    const lessons = await Lesson.find({ moduleId }).session(session);

    const [moduleCopy] = await Module.create(
      [
        {
          ...originalModule.toObject(),
          _id: undefined,
          title: `${originalModule.title} (Copy)`,
          moduleNumber: undefined,
          order: undefined,
          isPublished: false,
          createdAt: undefined,
          updatedAt: undefined,
        },
      ],
      { session },
    );

    const duplicatedLessons = await Lesson.insertMany(
      lessons.map((lesson) => ({
        ...lesson.toObject(),
        _id: undefined,
        moduleId: moduleCopy._id,
        title: `${lesson.title} (Copy)`,
        isPublished: false,
        createdAt: undefined,
        updatedAt: undefined,
      })),
      { session },
    );

    return { module: moduleCopy, lessons: duplicatedLessons };
  });

  // Audit log safely executes AFTER the transaction has successfully committed
  await logAdminAction({
    actor,
    action: "MODULE_DUPLICATED",
    targetType: "MODULE",
    targetId: result.module._id,
    changes: {
      new: {
        title: result.module.title,
        sourceModule: moduleId,
        lessonCount: result.lessons.length,
        moduleNumber: result.module.moduleNumber,
        order: result.module.order,
      },
    },
    reason: "Module duplicated via admin panel",
  });

  return result;
};

// +=============================================+
// |             ADMIN OPERATIONS                |
// +=============================================+

/**
 * List admin activity logs with filtering and pagination.
 *
 * @param {Object} params
 * @param {number} [params.page=1]
 * @param {number} [params.limit=50]
 * @param {string} [params.actionType] - Matches `AdminLog.action`
 * @param {string} [params.targetType] - Matches `AdminLog.targetType`
 * @returns {Promise<{ logs: Object[], pagination: Object }>}
 */
const getActivityLogs = async ({
  page = 1,
  limit = 50,
  actionType,
  targetType,
}) => {
  const { pageNum, limitNum, skip } = adminUtils.parsePagination(
    { page, limit },
    adminConstants.PAGE_LIMITS.LOGS,
  );

  const filter = {};
  if (actionType) filter.action = actionType;
  if (targetType) filter.targetType = targetType;

  const [logs, total] = await Promise.all([
    AdminLog.find(filter)
      .populate("adminId", "username email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    AdminLog.countDocuments(filter),
  ]);

  return {
    logs,
    pagination: adminUtils.buildPagination(pageNum, limitNum, total),
  };
};

/**
 * Backfill missing module completions for a user.
 *
 * Composes `learningEngine.fixUserModuleProgress` (which owns the repair
 * logic) with an admin-audit entry recording what was fixed.
 *
 * `targetUserId` should be the target of the repair — NOT the admin
 * invoking it — though admins can repair their own progress by passing
 * their own ID (the original controller defaulted to `req.userId` when
 * the body omitted `userId`; that default is applied at the controller).
 *
 * @param {Object} params
 * @param {string} params.targetUserId
 * @param {string} [params.reason]
 * @param {Object} params.actor - { id, ip, userAgent }
 * @returns {Promise<{ fixedCount: number, modules: string[] }>}
 * @throws {AppError} 400 - Invalid user id
 * @throws {AppError} 404 - User not found (from learningEngine)
 */
const fixModuleProgress = async ({ targetUserId, reason, actor }) => {
  adminUtils.assertValidObjectId(targetUserId, "user id");

  const modulesFixed = await learningEngine.fixUserModuleProgress(targetUserId);

  await logAdminAction({
    actor,
    action: "MODULE_PROGRESS_FIXED",
    targetType: "USER",
    targetId: targetUserId,
    changes: { new: { modulesFixed, fixedCount: modulesFixed.length } },
    reason:
      reason ||
      `Backfilled missing module completions (${modulesFixed.length} fixed)`,
  });

  return {
    fixedCount: modulesFixed.length,
    modules: modulesFixed,
  };
};

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
  createLesson,
  createModule,
  deleteLesson,
  deleteModule,
  duplicateLesson,
  duplicateModule,
  // Admin Ops
  getActivityLogs,
  fixModuleProgress,
};
