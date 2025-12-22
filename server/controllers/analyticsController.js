// analyticsController.js
const Lesson = require("../models/Lesson");
const Module = require("../models/Module");
const User = require("../models/User");
const catchAsync = require("../utils/catchAsync");
const { sendJsonResponse } = require("../utils/responseHelpers");

const getPlatformAnalytics = catchAsync(async (req, res, next) => {
  const { range = "7d" } = req.query;

  const now = new Date();
  let startDate = new Date();

  switch (range) {
    case "7d":
      startDate.setDate(now.getDate() - 7);
      break;
    case "30d":
      startDate.setDate(now.getDate() - 30);
      break;
    case "90d":
      startDate.setDate(now.getDate() - 90);
      break;
    case "1y":
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    case "all":
      startDate = new Date(0); // Beginning of time
      break;
  }

  // Get total counts
  const [
    totalUsers,
    activeUsers30d,
    totalLessons,
    totalModules,
    lessonsCompleted,
    totalXP,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({
      lastActive: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    }),
    Lesson.countDocuments({ isPublished: true }),
    Module.countDocuments({ isPublished: true }),
    User.aggregate([{ $unwind: "$completedLessons" }, { $count: "total" }]),
    User.aggregate([{ $group: { _id: null, total: { $sum: "$xp" } } }]),
  ]);

  // Get daily activity for the selected range
  const dailyActivity = await User.aggregate([
    {
      $match: {
        lastActive: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$lastActive" },
        },
        activeUsers: { $sum: 1 },
        totalXP: { $sum: "$xp" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Get user growth by month
  const userGrowth = await User.aggregate([
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m", date: "$createdAt" },
        },
        newUsers: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $limit: 12 },
  ]);

  // Get content performance
  const contentPerformance = await Lesson.aggregate([
    { $match: { isPublished: true } },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "completedLessons",
        as: "completers",
      },
    },
    {
      $project: {
        name: "$title",
        completions: { $size: "$completers" },
        xpReward: 1,
        difficulty: 1,
      },
    },
    { $sort: { completions: -1 } },
    { $limit: 10 },
  ]);

  sendJsonResponse(res, 200, "Analytics data retrieved.", {
    metrics: {
      totalUsers,
      activeUsers30d,
      totalLessons,
      totalModules,
      lessonsCompleted: lessonsCompleted[0]?.total || 0,
      totalXP: totalXP[0]?.total || 0,
      avgSessionDuration: 24,
      completionRate: 68,
      retentionRate: 42,
    },
    dailyActivity,
    userGrowth,
    contentPerformance,
    deviceBreakdown: [
      { device: "Desktop", percentage: 65 },
      { device: "Mobile", percentage: 30 },
      { device: "Tablet", percentage: 5 },
    ],
    userSegments: [
      {
        segment: "Beginners",
        count: Math.floor(totalUsers * 0.5),
        avgLevel: 1.8,
      },
      {
        segment: "Intermediate",
        count: Math.floor(totalUsers * 0.35),
        avgLevel: 4.5,
      },
      {
        segment: "Advanced",
        count: Math.floor(totalUsers * 0.15),
        avgLevel: 8.2,
      },
    ],
  });
});

module.exports = { getPlatformAnalytics };
