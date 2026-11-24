// services/analyticsService.js
// ─────────────── IMPORTS ──────────────────
const Activity = require("../models/ActivityLog");
const Lesson = require("../models/Lesson");
const LessonCompletion = require("../models/LessonCompletion");
const Module = require("../models/Module");
const Session = require("../models/Session");
const User = require("../models/User");
const analyticsConstants = require("../constants/analyticsConstants");
const AppError = require("../utils/AppError");
const analyticsCache = require("../utils/analyticsCache");
const generalUtils = require("../utils/generalUtils");

// +=============================================+
// |              DATE RANGE                     |
// +=============================================+

/**
 * Calculate a date range based on a named range or custom start/end dates.
 * Custom dates take precedence over named ranges.
 *
 * @param   {string}  range       - Named range ("24h", "7d", "30d", "90d", "1y", "all")
 * @param   {string}  [customStart] - ISO date string for custom start
 * @param   {string}  [customEnd]   - ISO date string for custom end
 * @returns {{ start: Date, end: Date, range: string }}
 */
const getDateRange = (range, customStart, customEnd) => {
  if (customStart && customEnd) {
    const start = generalUtils.normalizeDate(customStart);
    const end = generalUtils.normalizeDate(customEnd);
    if (!start || !end) {
      throw new AppError("Invalid custom date range.", 400);
    }
    return { start, end, range: "custom" };
  }

  const now = new Date();
  const endDate = new Date();
  let startDate = new Date();

  switch (range) {
    case "24h":
      startDate.setHours(now.getHours() - 24);
      break;
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
      startDate = new Date(0);
      break;
    default:
      startDate.setDate(now.getDate() - 30);
  }

  return { start: startDate, end: endDate, range };
};

// +=============================================+
// |              CACHE KEY BUILDER              |
// +=============================================+

/**
 * Build a stable cache key for a named range. Custom ranges fall back to
 * the exact ISO timestamps (callers with custom ranges pay the cache-miss cost).
 *
 * @param   {string} prefix
 * @param   {{ start: Date, end: Date, range: string }} rangeInfo
 * @param   {string} [suffix] - e.g. groupBy
 * @returns {string}
 */
const buildCacheKey = (prefix, { start, end, range }, suffix = "") => {
  const granularity =
    analyticsConstants.CACHE_BUCKET_GRANULARITY[range] || "day";
  return `${prefix}:${range}:${analyticsCache.truncateDate(start, granularity)}:${analyticsCache.truncateDate(end, granularity)}${suffix ? `:${suffix}` : ""}`;
};

// +=============================================+
// |              RETENTION                      |
// +=============================================+

/**
 * Calculate weekly retention cohorts for users who signed up within a date range.
 *
 * For each monthly cohort, tracks how many users returned in weeks 1–4 after
 * their signup date. Uses indexed activity lookups and a Set per user for
 * O(1) boundary checks.
 *
 * @param   {Date} startDate
 * @param   {Date} endDate
 * @returns {Object} Cohorts keyed by "YYYY-MM"
 */
const calculateRetention = async (startDate, endDate) => {
  const users = await User.find({
    createdAt: { $gte: startDate, $lte: endDate },
  }).select("_id createdAt");

  if (users.length === 0) return {};

  const allActivity = await Activity.find({
    userId: { $in: users.map((u) => u._id) },
    timestamp: { $gte: startDate },
  }).select("userId timestamp");

  const activityByUser = {};
  for (const log of allActivity) {
    const uid = log.userId.toString();
    if (!activityByUser[uid]) activityByUser[uid] = new Set();
    activityByUser[uid].add(generalUtils.getDateKey(log.timestamp));
  }

  const WEEK_OFFSETS = analyticsConstants.WEEKS_TO_TRACK.map(
    (w) => w * analyticsConstants.MS_PER_WEEK,
  );
  const cohorts = {};

  for (const user of users) {
    const cohortKey = generalUtils.getDateKey(user.createdAt).slice(0, 7);

    if (!cohorts[cohortKey]) {
      cohorts[cohortKey] = {
        total: 0,
        ...Object.fromEntries(
          analyticsConstants.WEEKS_TO_TRACK.map((w) => [`week${w}`, 0]),
        ),
      };
    }

    cohorts[cohortKey].total++;

    const activityDates = activityByUser[user._id.toString()];
    if (!activityDates) continue;

    const userCreatedTime = user.createdAt.getTime();
    for (let i = 0; i < analyticsConstants.WEEKS_TO_TRACK.length; i++) {
      const boundaryStr = generalUtils.getDateKey(
        new Date(userCreatedTime + WEEK_OFFSETS[i]),
      );

      if (activityDates.has(boundaryStr)) {
        cohorts[cohortKey][`week${analyticsConstants.WEEKS_TO_TRACK[i]}`]++;
      }
    }
  }

  return cohorts;
};

/**
 * Format raw retention cohort data into an array with calculated percentage rates.
 * @param {Object} retentionData
 * @returns {Array}
 */
const formatRetentionCohorts = (retentionData) =>
  Object.entries(retentionData).map(([cohort, data]) => ({
    cohort,
    ...data,
    ...Object.fromEntries(
      analyticsConstants.WEEKS_TO_TRACK.map((w) => [
        `week${w}Rate`,
        data.total > 0 ? (data[`week${w}`] / data.total) * 100 : 0,
      ]),
    ),
  }));

// +=============================================+
// |              QUERY GROUPS                   |
// +=============================================+

/**
 * Fetch user statistics: totals, active users, new signups, retention cohorts.
 *
 * @param   {Date} start
 * @param   {Date} end
 * @returns {Promise<Object>} { total, active, new, retention }
 */
const fetchUserStats = async (start, end) => {
  const [total, active, newUsers] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ lastEngagementAt: { $gte: start } }),
    User.countDocuments({ createdAt: { $gte: start } }),
  ]);

  let retention = [];
  try {
    const retentionData = await calculateRetention(start, end);
    retention = formatRetentionCohorts(retentionData);
  } catch (err) {
    console.error("[analyticsService] Retention calculation failed:", err);
  }

  return { total, active, new: newUsers, retention };
};

/**
 * Fetch content statistics: lesson/module counts, total completions,
 * aggregate XP, and lesson start→complete conversion rate for the period.
 *
 * @param   {Date} start
 * @returns {Promise<Object>} { totalLessons, totalModules, lessonsCompleted, totalXP, completionRate }
 */
const fetchContentStats = async (start) => {
  const [
    totalLessons,
    totalModules,
    totalXP,
    totalStarts,
    totalCompletes,
    lessonsCompleted,
  ] = await Promise.all([
    Lesson.countDocuments({ isPublished: true }),
    Module.countDocuments({ isPublished: true }),
    User.aggregate([{ $group: { _id: null, total: { $sum: "$xp" } } }]),
    Activity.countDocuments({
      actionType: "LESSON_START",
      timestamp: { $gte: start },
    }),
    Activity.countDocuments({
      actionType: "LESSON_COMPLETE",
      timestamp: { $gte: start },
    }),
    LessonCompletion.countDocuments(),
  ]);

  return {
    totalLessons,
    totalModules,
    lessonsCompleted,
    totalXP: totalXP[0]?.total || 0,
    completionRate:
      totalStarts > 0
        ? Math.round((totalCompletes / totalStarts) * 1000) / 10
        : 0,
  };
};

/**
 * Fetch time-series activity data for charts and rankings.
 *
 * @param   {Date}   start
 * @param   {Date}   end
 * @param   {string} groupBy - "hour" | "day" | "month"
 * @returns {Promise<Object>} { dailyActivity, userGrowth, contentPerformance }
 */
const fetchActivityStats = async (start, end, groupBy) => {
  const [dailyActivity, rawUserGrowth, allLessons, lessonCompletions] =
    await Promise.all([
      Activity.aggregate([
        { $match: { timestamp: { $gte: start, $lte: end } } },
        {
          $group: {
            _id: {
              $dateToString: {
                format: groupBy === "hour" ? "%Y-%m-%d %H:00" : "%Y-%m-%d",
                date: "$timestamp",
              },
            },
            activeUsers: { $addToSet: "$userId" },
            pageViews: { $sum: 1 },
            lessonStarts: {
              $sum: { $cond: [{ $eq: ["$actionType", "LESSON_START"] }, 1, 0] },
            },
            lessonCompletes: {
              $sum: {
                $cond: [{ $eq: ["$actionType", "LESSON_COMPLETE"] }, 1, 0],
              },
            },
            quizAttempts: {
              $sum: {
                $cond: [
                  {
                    $in: [
                      "$actionType",
                      ["QUIZ_ATTEMPT", "QUIZ_CORRECT", "QUIZ_INCORRECT"],
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            codeRuns: {
              $sum: { $cond: [{ $eq: ["$actionType", "CODE_RUN"] }, 1, 0] },
            },
          },
        },
        {
          $project: {
            date: "$_id",
            activeUsers: { $size: "$activeUsers" },
            pageViews: 1,
            lessonStarts: 1,
            lessonCompletes: 1,
            quizAttempts: 1,
            codeRuns: 1,
            completionRate: {
              $cond: [
                { $gt: ["$lessonStarts", 0] },
                {
                  $multiply: [
                    { $divide: ["$lessonCompletes", "$lessonStarts"] },
                    100,
                  ],
                },
                0,
              ],
            },
          },
        },
        { $sort: { date: 1 } },
      ]),

      User.aggregate([
        { $match: { createdAt: { $lte: end } } },
        {
          $group: {
            _id: {
              $dateToString: {
                format: groupBy === "month" ? "%Y-%m" : "%Y-%m-%d",
                date: "$createdAt",
              },
            },
            newUsers: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      Lesson.find({ isPublished: true })
        .select("title moduleId difficulty xpReward")
        .lean(),

      LessonCompletion.aggregate([
        { $group: { _id: "$lessonId", completions: { $sum: 1 } } },
      ]),
    ]);

  const completionMap = new Map(
    lessonCompletions.map((lc) => [lc._id.toString(), lc.completions]),
  );

  const contentPerformance = allLessons
    .map((lesson) => {
      const completions = completionMap.get(lesson._id.toString()) || 0;
      return {
        _id: lesson._id,
        title: lesson.title,
        moduleId: lesson.moduleId,
        difficulty: lesson.difficulty,
        xpReward: lesson.xpReward,
        completions,
        starts: 0,
        avgTimeSpent: 0,
        completionRate: 0,
      };
    })
    .sort((a, b) => b.completions - a.completions)
    .slice(0, 20);

  let running = 0;
  const userGrowth = rawUserGrowth.map((entry) => {
    running += entry.newUsers;
    return { ...entry, cumulativeUsers: running };
  });

  return { dailyActivity, userGrowth, contentPerformance };
};

/**
 * Fetch demographic statistics: device/platform breakdown and user segmentation.
 *
 * @param   {Date} start
 * @returns {Promise<Object>} { devices, userSegments }
 */
const fetchDemographicStats = async (start) => {
  const [rawDeviceStats, userSegments] = await Promise.all([
    Activity.aggregate([
      {
        $match: {
          timestamp: { $gte: start },
          [analyticsConstants.DEVICE_PLATFORM_PATH]: { $exists: true },
        },
      },
      {
        $group: {
          _id: `$${analyticsConstants.DEVICE_PLATFORM_PATH}`,
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]),

    User.aggregate([
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                {
                  case: {
                    $lte: [
                      "$level",
                      analyticsConstants.SEGMENT_THRESHOLDS.BEGINNER_MAX,
                    ],
                  },
                  then: "BEGINNER",
                },
                {
                  case: {
                    $lte: [
                      "$level",
                      analyticsConstants.SEGMENT_THRESHOLDS.INTERMEDIATE_MAX,
                    ],
                  },
                  then: "INTERMEDIATE",
                },
                {
                  case: {
                    $lte: [
                      "$level",
                      analyticsConstants.SEGMENT_THRESHOLDS.ADVANCED_MAX,
                    ],
                  },
                  then: "ADVANCED",
                },
              ],
              default: "Expert",
            },
          },
          count: { $sum: 1 },
          avgLevel: { $avg: "$level" },
          avgXP: { $avg: "$xp" },
          userIds: { $push: "$_id" },
        },
      },
      {
        $project: {
          segment: "$_id",
          count: 1,
          avgLevel: { $round: ["$avgLevel", 1] },
          avgXP: { $round: ["$avgXP", 0] },
          userIds: 1,
        },
      },
      { $sort: { avgLevel: 1 } },
    ]),
  ]);

  const deviceTotal = rawDeviceStats.reduce((sum, d) => sum + d.count, 0);
  const devices = rawDeviceStats.map((d) => ({
    device: d._id,
    count: d.count,
    percentage:
      deviceTotal > 0 ? Math.round((d.count / deviceTotal) * 10000) / 100 : 0,
  }));

  const segmentCompletions = await Promise.all(
    userSegments.map(async (seg) => {
      const count = await LessonCompletion.countDocuments({
        userId: { $in: seg.userIds },
      });
      return {
        segment: seg.segment,
        totalCompletions: count,
        userCount: seg.userIds.length,
      };
    }),
  );

  const completionMap = new Map(
    segmentCompletions.map((sc) => [sc.segment, sc]),
  );

  const userSegmentsWithCompletions = userSegments.map((seg) => {
    const { userIds, ...rest } = seg;
    const compData = completionMap.get(seg.segment);
    return {
      ...rest,
      avgLessonsCompleted: compData
        ? compData.userCount > 0
          ? Math.round(compData.totalCompletions / compData.userCount)
          : 0
        : 0,
    };
  });

  return { devices, userSegments: userSegmentsWithCompletions };
};

/**
 * Fetch engagement statistics: average session duration, actions per active
 * user, total sessions, and returning user count.
 *
 * @param   {Date} start
 * @returns {Promise<Object>} { avgSessionDuration, avgActionsPerUser, totalSessions, returningUsers }
 */
const fetchEngagementStats = async (start) => {
  const [
    avgSessionDuration,
    activeUserCount,
    totalActivity,
    totalSessions,
    returningUsers,
  ] = await Promise.all([
    Session.aggregate([
      { $match: { startedAt: { $gte: start } } },
      {
        $project: {
          seconds: {
            $divide: [{ $subtract: ["$endedAt", "$startedAt"] }, 1000],
          },
        },
      },
      { $match: { seconds: { $gt: 0 } } },
      { $group: { _id: null, avg: { $avg: "$seconds" } } },
    ]),
    User.countDocuments({ lastEngagementAt: { $gte: start } }),
    Activity.countDocuments({ timestamp: { $gte: start } }),
    Session.countDocuments({ startedAt: { $gte: start } }),
    Activity.aggregate([
      { $match: { timestamp: { $gte: start } } },
      { $group: { _id: "$userId", count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
      { $count: "returning" },
    ]),
  ]);

  return {
    avgSessionDuration: avgSessionDuration[0]?.avg || 0,
    avgActionsPerUser:
      activeUserCount > 0 ? (totalActivity / activeUserCount).toFixed(1) : 0,
    totalSessions,
    returningUsers: returningUsers[0]?.returning || 0,
  };
};

// +=============================================+
// |              PER-CONTENT / PER-USER         |
// +=============================================+

/**
 * Get per-day engagement for a single lesson or module.
 *
 * @param   {string} contentId
 * @param   {"lesson"|"module"} contentType
 * @returns {Promise<{ content: Object, activity: Object[], summary: Object }>}
 * @throws  {AppError} 404 if the content doesn't exist
 */
const getContentAnalytics = async (contentId, contentType) => {
  const Model = contentType === "lesson" ? Lesson : Module;
  const content = await Model.findById(contentId);
  if (!content) throw new AppError(`${contentType} not found`, 404);

  const activity = await Activity.aggregate([
    {
      $match: {
        $or: [
          { "metadata.lessonId": content._id },
          { "metadata.moduleId": content._id },
        ],
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
        views: {
          $sum: { $cond: [{ $eq: ["$actionType", "PAGE_VIEW"] }, 1, 0] },
        },
        starts: {
          $sum: { $cond: [{ $eq: ["$actionType", "LESSON_START"] }, 1, 0] },
        },
        completes: {
          $sum: { $cond: [{ $eq: ["$actionType", "LESSON_COMPLETE"] }, 1, 0] },
        },
        avgTimeSpent: { $avg: "$metadata.duration" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const totals = activity.reduce(
    (acc, day) => ({
      totalViews: acc.totalViews + day.views,
      totalStarts: acc.totalStarts + day.starts,
      totalCompletes: acc.totalCompletes + day.completes,
    }),
    { totalViews: 0, totalStarts: 0, totalCompletes: 0 },
  );

  const completionRate =
    totals.totalStarts > 0
      ? (totals.totalCompletes / totals.totalStarts) * 100
      : 0;

  return {
    content,
    activity,
    summary: { ...totals, completionRate },
  };
};

/**
 * Get per-day behaviour for a single user.
 *
 * @param   {string} userId
 * @returns {Promise<{ user: Object, activity: Object[], summary: Object }>}
 * @throws  {AppError} 404 if the user doesn't exist
 */
const getUserAnalytics = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404);

  const activity = await Activity.aggregate([
    { $match: { userId: user._id } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
        actions: { $sum: 1 },
        lessonsCompleted: {
          $sum: { $cond: [{ $eq: ["$actionType", "LESSON_COMPLETE"] }, 1, 0] },
        },
        xpEarned: { $sum: "$metadata.xpEarned" },
        timeSpent: { $sum: "$metadata.duration" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const summary = activity.reduce(
    (acc, day) => ({
      totalActions: acc.totalActions + day.actions,
      totalLessonsCompleted: acc.totalLessonsCompleted + day.lessonsCompleted,
      totalXPEarned: acc.totalXPEarned + (day.xpEarned || 0),
      totalTimeSpent: acc.totalTimeSpent + (day.timeSpent || 0),
    }),
    {
      totalActions: 0,
      totalLessonsCompleted: 0,
      totalXPEarned: 0,
      totalTimeSpent: 0,
    },
  );

  return {
    user: {
      id: user._id,
      username: user.username,
      level: user.level,
      xp: user.xp,
    },
    activity,
    summary: {
      ...summary,
      averageDailyActions:
        activity.length > 0
          ? (summary.totalActions / activity.length).toFixed(1)
          : 0,
    },
  };
};

// ─────── EXPORTS ───────
module.exports = {
  getDateRange,
  buildCacheKey,
  formatRetentionCohorts,
  fetchUserStats,
  fetchContentStats,
  fetchActivityStats,
  fetchDemographicStats,
  fetchEngagementStats,
  getContentAnalytics,
  getUserAnalytics,
};
