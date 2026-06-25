// cronController.js
const CourseCompletion = require("../models/CourseCompletion");
const User = require("../models/User");
const catchAsync = require("../utils/catchAsync");
const { sendJsonResponse } = require("../utils/responseHelpers");

/**
 * POST /api/cron/hof-transition
 * Moves users from COMPLETED_PENDING → HOF when their 30-day window expires.
 */
const hofTransition = catchAsync(async (req, res) => {
  const now = new Date();

  // Find all completions where:
  // - The 30-day eligibility window has passed
  // - The user hasn't been inducted yet
  const eligible = await CourseCompletion.find({
    hofEligibleAt: { $lte: now },
    hofJoinedAt: null,
  });

  if (eligible.length === 0) {
    return sendJsonResponse(res, 200, "No HoF transitions needed", {
      transitioned: 0,
    });
  }

  // Bulk-update CourseCompletion records
  const completionIds = eligible.map((c) => c._id);
  const userIds = eligible.map((c) => c.userId);

  await CourseCompletion.updateMany(
    { _id: { $in: completionIds } },
    { $set: { hofJoinedAt: now } },
  );

  // Bulk-update User leaderboardStatus
  await User.updateMany(
    { _id: { $in: userIds } },
    { $set: { leaderboardStatus: "HOF" } },
  );

  sendJsonResponse(res, 200, "HoF transitions complete", {
    transitioned: eligible.length,
    userIds: userIds.map((id) => id.toString()),
  });
});

/**
 * POST /api/cron/inactivity-cleanup
 * Removes inactive users (60+ days) from the leaderboard.
 */
const inactivityCleanup = catchAsync(async (req, res) => {
  const cutoff = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000); // 60 days ago

  const result = await User.updateMany(
    {
      leaderboardStatus: { $in: ["ACTIVE", "COMPLETED_PENDING"] },
      lastActive: { $lt: cutoff },
    },
    {
      $set: {
        leaderboardStatus: "INACTIVE_REMOVED",
        removedFromLeaderboardAt: new Date(),
      },
    },
  );

  sendJsonResponse(res, 200, "Inactivity cleanup complete", {
    removed: result.modifiedCount,
  });
});

module.exports = { hofTransition, inactivityCleanup };
