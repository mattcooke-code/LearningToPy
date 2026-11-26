// controllers/cronController.js
const catchAsync = require("../utils/catchAsync");
const { sendJsonResponse } = require("../utils/responseHelpers");
const hofService = require("../services/hofService");

/**
 * POST /api/cron/hof-transition
 * Moves users from COMPLETED_PENDING → HOF when their 30-day window expires.
 */
const hofTransition = catchAsync(async (req, res) => {
  const result = await hofService.hofTransition();
  sendJsonResponse(res, 200, "HoF transitions complete", result);
});

/**
 * POST /api/cron/inactivity-cleanup
 * Removes inactive users (60+ days) from the leaderboard.
 */
const inactivityCleanup = catchAsync(async (req, res) => {
  const result = await hofService.cleanupInactiveUsers();
  sendJsonResponse(res, 200, "Inactivity cleanup complete", result);
});

module.exports = { hofTransition, inactivityCleanup };
