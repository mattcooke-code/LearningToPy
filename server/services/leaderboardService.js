const mongoose = require("mongoose");
const User = require("../models/User");
const ModuleCompletion = require("../models/ModuleCompletion");
const AppError = require("../utils/AppError");

// --- CONSTANTS (Temporary placement) ---
const ACTIVE_LEADERBOARD_FILTER = {
  "privacySettings.showOnLeaderboards": true,
  isAdmin: { $ne: true },
  ageBracket: { $in: ["16-17", "18+"] },
  leaderboardStatus: { $in: ["ACTIVE", "COMPLETED_PENDING"] },
};

/**
 * Get the leaderboard slice surrounding a specific user (±2 ranks).
 */
const getSurroundingUsers = async (userIdStr) => {
  const userId = userIdStr.toString();
  const range = 2;

  const currentUser = await User.findById(userId)
    .select("username xp privacySettings isAdmin leaderboardStatus ageBracket")
    .lean();

  if (!currentUser) return null;

  if (currentUser.ageBracket === "13-15") {
    return {
      users: [],
      currentUserRank: null,
      totalUsers: 0,
      message: "Leaderboard is not available for users under 16",
    };
  }

  const [usersAbove, usersBelow, usersWithMoreXP, totalOptedIn] =
    await Promise.all([
      User.find({
        ...ACTIVE_LEADERBOARD_FILTER,
        xp: { $gt: currentUser.xp },
      })
        .select("username xp privacySettings")
        .sort({ xp: 1 })
        .limit(range)
        .lean(),
      User.find({
        ...ACTIVE_LEADERBOARD_FILTER,
        xp: { $lt: currentUser.xp },
        _id: { $ne: currentUser._id },
      })
        .select("username xp privacySettings")
        .sort({ xp: -1 })
        .limit(range)
        .lean(),
      User.countDocuments({
        ...ACTIVE_LEADERBOARD_FILTER,
        xp: { $gt: currentUser.xp },
      }),
      User.countDocuments(ACTIVE_LEADERBOARD_FILTER),
    ]);

  const rank = usersWithMoreXP + 1;
  const aboveReversed = usersAbove.reverse();
  const allSlice = [...aboveReversed, currentUser, ...usersBelow];

  const surroundingUsers = allSlice.map((user, index) => ({
    _id: user._id,
    rank: rank - aboveReversed.length + index,
    username: user.privacySettings?.showUsernameOnLeaderboards
      ? user.username
      : `Learner #${user._id.toString().slice(-6)}`,
    xp: user.xp,
    isCurrent: user._id.toString() === userId,
    isAnonymous: !user.privacySettings?.showUsernameOnLeaderboards,
  }));

  return {
    users: surroundingUsers,
    currentUserRank: rank,
    totalUsers: totalOptedIn,
  };
};

/**
 * Get the top N users on the platform leaderboard.
 */
const getTopUsers = async (limitNum = 10) => {
  const limit = parseInt(limitNum) || 10;

  const topUsers = await User.find(ACTIVE_LEADERBOARD_FILTER)
    .select("username xp privacySettings leaderboardStatus")
    .sort({ xp: -1 })
    .limit(limit)
    .lean();

  // Deduplicate by _id
  const seen = new Set();
  const dedupedUsers = topUsers.filter((u) => {
    const id = u._id.toString();
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });

  return dedupedUsers.map((user, index) => ({
    ...user,
    rank: user.leaderboardStatus === "COMPLETED_PENDING" ? null : index + 1,
    isCompleted: user.leaderboardStatus === "COMPLETED_PENDING",
    displayName: user.privacySettings?.showUsernameOnLeaderboards
      ? user.username
      : `Learner #${user._id.toString().slice(-6)}`,
    isAnonymous: !user.privacySettings?.showUsernameOnLeaderboards,
  }));
};

/**
 * Get the leaderboard for a specific module.
 */
const getModuleLeaderboardData = async (moduleId) => {
  // Prefix filter keys with "userData." for aggregation lookup matching
  const aggregatedFilter = Object.entries(ACTIVE_LEADERBOARD_FILTER).reduce(
    (acc, [key, value]) => {
      acc[`userData.${key}`] = value;
      return acc;
    },
    {},
  );

  const moduleLeaderboard = await ModuleCompletion.aggregate([
    { $match: { moduleId: new mongoose.Types.ObjectId(moduleId) } },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "userData",
      },
    },
    { $unwind: "$userData" },
    { $match: aggregatedFilter },
    { $sort: { "userData.xp": -1 } },
    { $limit: 50 },
    {
      $project: {
        _id: "$userData._id",
        username: "$userData.username",
        xp: "$userData.xp",
        privacySettings: "$userData.privacySettings",
      },
    },
  ]);

  return moduleLeaderboard;
};

module.exports = {
  ACTIVE_LEADERBOARD_FILTER,
  getSurroundingUsers,
  getTopUsers,
  getModuleLeaderboardData,
};
