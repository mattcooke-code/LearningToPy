// constants/hofConstants.js
/**
 * Domain constants for Hall of Fame (HoF) transitions and leaderboard
 * inactivity cleanup. Kept separate from `authConstants` because these are
 * leaderboard/lifecycle rules, not authentication rules.
 */

/**
 * Number of days a user must wait after course completion before they
 * are inducted into the Hall of Fame.
 * Matches the 30-day window written by `learningEngine.recordCourseCompletion`.
 */
const HOF_ELIGIBILITY_WINDOW_DAYS = 30;

/**
 * Number of days of inactivity after which a user is removed from the
 * leaderboard.
 */
const INACTIVITY_THRESHOLD_DAYS = 60;

/**
 * Leaderboard lifecycle states. Centralised so the string literals used in
 * `User.leaderboardStatus` and the queries that filter on them cannot drift.
 */
const LEADERBOARD_STATUS = Object.freeze({
  ACTIVE: "ACTIVE",
  COMPLETED_PENDING: "COMPLETED_PENDING",
  INACTIVE_REMOVED: "INACTIVE_REMOVED",
  HOF: "HOF",
});

module.exports = {
  HOF_ELIGIBILITY_WINDOW_DAYS,
  INACTIVITY_THRESHOLD_DAYS,
  LEADERBOARD_STATUS,
};
