// services/streakManager.js
const User = require("../models/User");
const dateUtils = require("../utils/dateUtils");

const STREAK_CONFIG = {
  WARNING_DAY: 5,
  REQUIRED_COMPLETIONS: 1,
  VIEW_QUALIFIES_DAYS: 5,
  WEEK_START_DAY: 1, // (1 = Monday, 0 = Sunday)
};

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// Local calendar dates run from UTC-12 to UTC+14, so a genuine client date is
// never more than one day away from the server's current UTC date.
const MAX_CLIENT_DATE_SKEW_DAYS = 1;

/**
 * Turn a client-supplied local date into a trustworthy "YYYY-MM-DD" key.
 *
 * The client date is what makes streaks follow the user's own calendar, but it
 * is also user-controlled. Anything malformed, impossible (e.g. 2026-02-31) or
 * more than a day away from the server's UTC date is replaced with today's
 * UTC date, so a crafted date cannot be used to inflate a streak.
 *
 * @param {*} value - Client-supplied date (expected "YYYY-MM-DD")
 * @returns {string} A valid "YYYY-MM-DD" key
 */
const resolveLocalDateKey = (value) => {
  const serverKey = dateUtils.getDateKey(new Date());
  if (typeof value !== "string" || !DATE_KEY_PATTERN.test(value))
    return serverKey;

  const parsed = new Date(`${value}T00:00:00Z`);
  // Date rolls impossible dates over (Feb 31 -> Mar 3), so round-trip the key.
  if (Number.isNaN(parsed.getTime()) || dateUtils.getDateKey(parsed) !== value)
    return serverKey;

  const offsetDays = Math.round(
    (parsed.getTime() - dateUtils.startOfUtcDay(new Date())) /
      dateUtils.MS_PER_DAY,
  );
  return Math.abs(offsetDays) <= MAX_CLIENT_DATE_SKEW_DAYS ? value : serverKey;
};

/**
 * Get the start of the week (Monday 00:00:00 UTC) for a given user's local date.
 * @param {string} userLocalDateStr - Format: "YYYY-MM-DD"
 */
const getWeekStart = (userLocalDateStr) => {
  const d = new Date(userLocalDateStr + "T00:00:00Z");
  const day = d.getUTCDay();
  const diff = day === 0 ? 6 : day - STREAK_CONFIG.WEEK_START_DAY;
  d.setUTCDate(d.getUTCDate() - diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

/**
 * Get the 1-based day of the week relative to the user's week start.
 */
const getDayOfWeek = (userLocalDateStr, weekStart) => {
  const dateTime = new Date(userLocalDateStr + "T00:00:00Z");
  const weekStartTime = dateUtils.startOfUtcDay(weekStart);
  const diffDays = Math.round(
    (dateTime - weekStartTime) / dateUtils.MS_PER_DAY,
  );
  return diffDays + 1;
};

/**
 * Track general user daily activity (triggered on login or token refresh).
 *
 * @param {Object} user - User document (mutated in place; caller saves)
 * @param {string} userLocalDateStr - Client's local date, "YYYY-MM-DD"
 *   (validated by resolveLocalDateKey; falls back to today UTC)
 */
const trackDailyActivity = async (user, userLocalDateStr) => {
  const localDate = resolveLocalDateKey(userLocalDateStr);
  const todayTime = new Date(localDate + "T00:00:00Z");

  await initializeWeekIfNeeded(user, todayTime, localDate);

  const streakLastChecked = user.streakLastCheckedDate
    ? dateUtils.startOfUtcDay(user.streakLastCheckedDate)
    : null;

  if (!streakLastChecked || streakLastChecked < todayTime) {
    await handleNewDayOfActivity(user, todayTime, localDate);
    // Store the user's LOCAL calendar day (as UTC midnight), not the server
    // clock. Using "now" meant a user whose local day differs from the UTC
    // day was compared against the wrong date on their next visit.
    user.streakLastCheckedDate = todayTime;
  }

  // checkWarningStatus does not save — caller handles persistence
  await checkWarningStatus(user, localDate);

  return {
    streak: user.streak,
    streakStatus: user.streakStatus,
    weeklyProgress: user.weeklyProgress,
  };
};

/**
 * Track when user COMPLETES a lesson or module quiz.
 */
const trackCompletion = async (user, userLocalDateStr) => {
  const localDate = resolveLocalDateKey(userLocalDateStr);
  const todayTime = new Date(localDate + "T00:00:00Z");

  await initializeWeekIfNeeded(user, todayTime, localDate);

  // Guard against counting multiple completions on the same day
  const lastCompletion = user.lastCompletionDate
    ? dateUtils.startOfUtcDay(user.lastCompletionDate)
    : null;

  const alreadyCompletedToday = lastCompletion && lastCompletion >= todayTime;

  if (!alreadyCompletedToday) {
    user.weeklyProgress.completionsThisWeek += 1;
  }

  // Local calendar day as UTC midnight (see trackDailyActivity); never moves backwards.
  if (!alreadyCompletedToday) user.lastCompletionDate = todayTime;

  // Recover from both "WARNING" and "AT_RISK" statuses on completion
  if (
    (user.streakStatus === "WARNING" || user.streakStatus === "AT_RISK") &&
    user.weeklyProgress.completionsThisWeek >=
      STREAK_CONFIG.REQUIRED_COMPLETIONS
  ) {
    user.streakStatus = "ACTIVE";
    user.weeklyProgress.warningIssued = false;
  }

  // Advance the streak at most once per day. updateStreak() compares against
  // streakLastCheckedDate, which completions don't move, so without this guard
  // every extra completion on days 6-7 would add another +1.
  const dayOfWeek = getDayOfWeek(localDate, user.weeklyProgress.weekStartDate);
  if (
    !alreadyCompletedToday &&
    (dayOfWeek > STREAK_CONFIG.VIEW_QUALIFIES_DAYS ||
      !user.streakLastCheckedDate)
  ) {
    await updateStreak(user, todayTime);
  }

  return {
    streak: user.streak,
    streakStatus: user.streakStatus,
    weeklyProgress: user.weeklyProgress,
  };
};

/**
 * Initialize a new week's tracking data if the current week has ended.
 * Rolls over weeklyProgress and evaluates the previous week's performance
 * (resets streak if requirements weren't met).
 */
const initializeWeekIfNeeded = async (user, todayTime, userLocalDateStr) => {
  const weekStart = getWeekStart(userLocalDateStr);
  const weekStartTime = dateUtils.startOfUtcDay(weekStart);

  if (
    !user.weeklyProgress.weekStartDate ||
    dateUtils.startOfUtcDay(user.weeklyProgress.weekStartDate) < weekStartTime
  ) {
    const weekEnd = new Date(weekStart);
    weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
    weekEnd.setUTCHours(23, 59, 59, 999);
    const weekEndTime = dateUtils.startOfUtcDay(weekEnd);

    if (todayTime > weekEndTime) {
      await evaluateLastWeek(user);
    }

    user.weeklyProgress = {
      weekStartDate: weekStart,
      daysActive: 0,
      completionsThisWeek: 0,
      warningIssued: false,
      warningDay: STREAK_CONFIG.WARNING_DAY,
    };
  }
};

/**
 * Process the first activity on a new day.
 * Increments daysActive, updates streak if within the qualifying window
 * (first 5 days of the week), or marks streak AT_RISK if past that window
 * with insufficient completions.
 *
 */
const handleNewDayOfActivity = async (user, todayTime, userLocalDateStr) => {
  user.weeklyProgress.daysActive += 1;

  const dayOfWeek = getDayOfWeek(
    userLocalDateStr,
    user.weeklyProgress.weekStartDate,
  );

  if (dayOfWeek <= STREAK_CONFIG.VIEW_QUALIFIES_DAYS) {
    await updateStreak(user, todayTime);
  } else {
    if (
      user.weeklyProgress.completionsThisWeek <
      STREAK_CONFIG.REQUIRED_COMPLETIONS
    ) {
      user.streakStatus = "AT_RISK";
    }
  }
};

/**
 * Update the user's streak counter.
 * Increments if yesterday was active, resets to 1 if a gap occurred.
 * Consecutive days only — a single missed day breaks the streak.
 *
 */
const updateStreak = async (user, todayTime) => {
  if (!user.streakLastCheckedDate) {
    user.streak = 1;
    user.streakStatus = "ACTIVE";
    return;
  }

  const streakLastCheckedTime = dateUtils.startOfUtcDay(
    user.streakLastCheckedDate,
  );
  const diffDays = Math.round(
    (todayTime - streakLastCheckedTime) / dateUtils.MS_PER_DAY,
  );

  if (diffDays === 1) {
    user.streak += 1;
  } else if (diffDays > 1) {
    user.streak = 1;
    user.streakStatus = "ACTIVE";
  }
};

/**
 * Evaluate last week's performance and set streak status for the new week.
 * Sets status to RESETTING if completions fell below the required threshold,
 * or ACTIVE if the requirement was met.
 *
 * @param {Object} user - User document (mutated in place)
 */
const evaluateLastWeek = async (user) => {
  if (
    user.weeklyProgress.completionsThisWeek < STREAK_CONFIG.REQUIRED_COMPLETIONS
  ) {
    user.streak = 0;
    user.streakStatus = "RESETTING";
  } else {
    user.streakStatus = "ACTIVE";
  }
};

/**
 * Check if the user should receive a streak warning.
 * Issues WARNING on day 5 with no completions and an active streak.
 * Issues RESETTING on day 7 with no completions.
 * Does NOT persist — caller must call user.save().
 *
 * @param {Object} user - User document (mutated in place)
 */
const checkWarningStatus = async (user, userLocalDateStr) => {
  if (!user.weeklyProgress.weekStartDate) return;

  const dayOfWeek = getDayOfWeek(
    userLocalDateStr,
    user.weeklyProgress.weekStartDate,
  );

  // Day 5: Entering the danger zone
  if (
    dayOfWeek === STREAK_CONFIG.WARNING_DAY &&
    !user.weeklyProgress.warningIssued &&
    user.weeklyProgress.completionsThisWeek === 0 &&
    user.streak > 0
  ) {
    user.weeklyProgress.warningIssued = true;
    user.streakStatus = "WARNING";
  }

  // Day 7: Point of No Return
  if (
    dayOfWeek === 7 &&
    user.weeklyProgress.completionsThisWeek === 0 &&
    user.streak > 0
  ) {
    user.streakStatus = "RESETTING";
  }
};

/**
 * Get current streak info for a user.
 * This is a read-only query so fetching by userId here is appropriate.
 */
const getStreakInfo = async (userId, userLocalDateStr) => {
  const user = await User.findById(userId).select(
    "streak streakStatus streakLastCheckedDate lastCompletionDate weeklyProgress",
  );

  if (!user) return null;

  const dayOfWeek = user.weeklyProgress.weekStartDate
    ? getDayOfWeek(
        resolveLocalDateKey(userLocalDateStr),
        user.weeklyProgress.weekStartDate,
      )
    : 1;

  return {
    streak: user.streak,
    status: user.streakStatus,
    daysActiveThisWeek: user.weeklyProgress.daysActive || 0,
    completionsThisWeek: user.weeklyProgress.completionsThisWeek || 0,
    requiredCompletions: STREAK_CONFIG.REQUIRED_COMPLETIONS,
    warningDay: STREAK_CONFIG.WARNING_DAY,
    currentDayOfWeek: dayOfWeek,
    daysRemaining: Math.max(0, 7 - dayOfWeek),
    streakLastChecked: user.streakLastCheckedDate,
    lastCompletion: user.lastCompletionDate,
  };
};

module.exports = {
  trackDailyActivity,
  trackCompletion,
  getStreakInfo,
};
