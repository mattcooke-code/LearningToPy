// progressController.js
const User = require("../models/User");
const AppError = require("../utils/AppError");
const Lesson = require("../models/Lesson");
const catchAsync = require("../utils/catchAsync");
const { formatProgressResponse } = require("../utils/progressHelpers");
const {
  BADGE_DEFINITIONS,
  getBadgeProgress,
  evaluateBadges,
} = require("../utils/badgeLogic");
const { sendJsonResponse } = require("../utils/responseHelpers");

const getCurrentProgress = catchAsync(async (req, res, next) => {
  const userId = req.userId;

  const user = await User.findById(userId)
    .select(
      "username xp level streak completedLessons completedModules badges totalLearningTime lessonCompletionHistory moduleCompletionHistory stats createdAt"
    )
    .lean({ virtuals: true });

  if (!user) {
    return next(new AppError("User not found.", 404));
  }

  const { newlyUnlocked } = await evaluateBadges({ user });
  if (newlyUnlocked.length > 0) {
    await User.findByIdAndUpdate(userId, {
      $addToSet: { badges: { $each: newlyUnlocked } },
    });
    user.badges = [...new Set([...(user.badges || []), ...newlyUnlocked])];
  }

  const completedLessonDocs = await Lesson.find({
    _id: { $in: user.completedLessons },
    isPublished: true,
  })
    .select("_id")
    .lean();

  const validCompletedLessonIds = new Set(
    completedLessonDocs.map((lesson) => lesson._id.toString())
  );

  const sanitizedUser = {
    ...user,
    completedLessons: user.completedLessons.filter((lessonId) =>
      validCompletedLessonIds.has(lessonId.toString())
    ),
  };
  sanitizedUser.badges = user.badges;

  const progressData = formatProgressResponse(sanitizedUser);

  sendJsonResponse(res, 200, "User progress fetched successfully.", {
    data: progressData,
  });
});

const getAchievements = catchAsync(async (req, res, next) => {
  const userId = req.userId;

  const user = await User.findById(userId)
    .select(
      "username completedLessons completedModules badges streak createdAt moduleCompletionHistory lessonCompletionHistory stats"
    )
    .lean({ virtuals: true });

  if (!user) {
    return next(new AppError("User not found.", 404));
  }

  const { newlyUnlocked } = await evaluateBadges({ user });
  if (newlyUnlocked.length > 0) {
    await User.findByIdAndUpdate(userId, {
      $addToSet: { badges: { $each: newlyUnlocked } },
    });
    user.badges = [...new Set([...(user.badges || []), ...newlyUnlocked])];
  }

  const earned = [];
  const inProgress = [];
  const locked = [];
  const badgeProgress = await getBadgeProgress(user);
  const progressMap = new Map(
    badgeProgress.map((progressItem) => [
      progressItem.id,
      progressItem.progressPercentage ?? 0,
    ])
  );
  const earnedSet = new Set(user.badges || []);

  BADGE_DEFINITIONS.forEach((badge) => {
    const baseDetails = {
      id: badge.id,
      name: badge.name,
      description: badge.description,
      category: badge.category,
    };

    if (earnedSet.has(badge.id)) {
      earned.push({ ...baseDetails, completed: true });
      return;
    }

    const progressPercentage = progressMap.get(badge.id) ?? 0;

    if (progressPercentage > 0) {
      inProgress.push({ ...baseDetails, progressPercentage });
    } else {
      locked.push({ ...baseDetails, progressPercentage: 0 });
    }
  });

  sendJsonResponse(res, 200, "Achievements progress calculated successfully.", {
    earnedBadges: earned,
    inProgress: inProgress,
    locked: locked,
  });
});

const getSurroundingLeaderboard = catchAsync(async (req, res, next) => {
  const userId = req.userId;
  const range = 2; // User shown above and below

  // Sort all users by XP
  const allUsers = await User.find({})
    .select("username xp")
    .sort({ xp: -1 })
    .lean();

  // Current user's position
  const currentUserIndex = allUsers.findIndex(
    (user) => user._id.toString() === userId
  );

  if (currentUserIndex === -1) {
    return next(new AppError("User not found", 404));
  }

  // Calculate range of users to show
  const startIndex = Math.max(0, currentUserIndex - range);
  const endIndex = Math.min(allUsers.length - 1, currentUserIndex + range);

  const surroundingUsers = allUsers
    .slice(startIndex, endIndex + 1)
    .map((user, index) => ({
      rank: startIndex + index + 1, // place in overall leaderboard
      username: user.username,
      xp: user.xp,
      isCurrent: user._id.toString() === userId,
    }));

  sendJsonResponse(res, 200, "User's leaderboard placement found", {
    data: {
      users: surroundingUsers,
      currentUserRank: currentUserIndex + 1,
      totalUsers: allUsers.length,
    },
  });
});

const getModuleLeaderboard = catchAsync(async (req, res, next) => {
  const { moduleId } = req.params;
  const userId = req.userId;

  const moduleUsers = (
    await User.find({ completedModules: moduleId }).select("username xp")
  )
    .toSorted({ xp: -1 })
    .limit(50)
    .lean();

  const currentUserIndex = moduleUsers.findIndex(
    (user) => user._id.toString() === userId
  );

  const usersWithCurrentFlag = moduleUsers.map((user, index) => ({
    ...user,
    isCurrent: user._id.toString() === userId,
  }));

  sendJsonResponse(res, 200, "Module leaderboard fetched.", {
    users: usersWithCurrentFlag,
    currentUserRank: currentUserIndex + 1,
    totalInModule: moduleUsers.length,
  });
});

module.exports = {
  getCurrentProgress,
  getAchievements,
  getSurroundingLeaderboard,
  getModuleLeaderboard,
};
