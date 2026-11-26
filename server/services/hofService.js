// services/hofService.js
const CourseCompletion = require("../models/CourseCompletion");
const User = require("../models/User");
const config = require("../config/envConfig");
const { runInTransaction } = require("../utils/dbHelpers");
const hofConstants = require("../constants/hofConstants");

/**
 * Move users from COMPLETED_PENDING → HOF once their 30-day eligibility
 * window has elapsed.
 *
 * Two collections are updated (CourseCompletion.hofJoinedAt, User.leaderboard
 * status + badges). In production these run in a transaction so a partial
 * failure cannot leave a completion marked `hofJoinedAt` while its user is
 * still `COMPLETED_PENDING` — that state is unrecoverable because the retry
 * query filters on `hofJoinedAt: null`.
 *
 * In development (standalone Mongo, no replica set) the writes run
 * sequentially without transaction guarantees, mirroring the pattern used
 * by `authService.deleteUserAccount`.
 *
 * @param   {Date} [now=new Date()] - Injectable clock for testing
 * @returns {Promise<{ transitioned: number, userIds: string[] }>}
 */
const hofTransition = async (now = new Date()) => {
  const eligible = await CourseCompletion.find({
    hofEligibleAt: { $lte: now },
    hofJoinedAt: null,
  });

  if (eligible.length === 0) {
    return { transitioned: 0, userIds: [] };
  }

  const completionIds = eligible.map((c) => c._id);
  const userIds = eligible.map((c) => c.userId);

  const applyTransition = async (session) => {
    const q = (fn) => (session ? fn.session(session) : fn);

    await q(
      CourseCompletion.updateMany(
        { _id: { $in: completionIds } },
        { $set: { hofJoinedAt: now } },
      ),
    );

    await q(
      User.updateMany(
        { _id: { $in: userIds } },
        {
          $set: { leaderboardStatus: hofConstants.LEADERBOARD_STATUS.HOF },
          $addToSet: { badges: "hof" },
        },
      ),
    );
  };

  if (config.isProduction()) {
    await runInTransaction(applyTransition);
  } else {
    await applyTransition(null);
  }

  return {
    transitioned: eligible.length,
    userIds: userIds.map((id) => id.toString()),
  };
};

/**
 * Remove users who have not engaged in over 60 days from the leaderboard.
 *
 * Single-collection update — no transaction needed.
 *
 * @param   {Date} [now=new Date()] - Injectable clock for testing
 * @returns {Promise<{ removed: number }>}
 */
const cleanupInactiveUsers = async (now = new Date()) => {
  const cutoff = new Date(
    now.getTime() -
      hofConstants.INACTIVITY_THRESHOLD_DAYS * hofConstants.MS_PER_DAY,
  );

  const result = await User.updateMany(
    {
      leaderboardStatus: {
        $in: [
          hofConstants.LEADERBOARD_STATUS.ACTIVE,
          hofConstants.LEADERBOARD_STATUS.COMPLETED_PENDING,
        ],
      },
      lastEngagementAt: { $lt: cutoff },
    },
    {
      $set: {
        leaderboardStatus: hofConstants.LEADERBOARD_STATUS.INACTIVE_REMOVED,
        removedFromLeaderboardAt: now,
      },
    },
  );

  return { removed: result.modifiedCount };
};

module.exports = { hofTransition, cleanupInactiveUsers };
