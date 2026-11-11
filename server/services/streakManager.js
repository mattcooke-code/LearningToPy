// services/streakManager.js
const User = require("../models/User");
const { checkDate } = require("../utils/generalUtils");

const STREAK_CONFIG = {
  WARNING_DAY: 5,
  REQUIRED_COMPLETIONS: 1,
  VIEW_QUALIFIES_DAYS: 5,
  WEEK_START_DAY: 1, // (1 = Monday, 0 = Sunday)
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
  const weekStartTime = checkDate(weekStart);
  const diffDays = Math.round(
    (dateTime - weekStartTime) / (1000 * 60 * 60 * 24),
  );
  return diffDays + 1;
};

/**
 * Track general user daily activity (triggered on login or token refresh).
 */
const trackDailyActivity = async (user, userLocalDateStr) => {
  const todayTime = new Date(userLocalDateStr + "T00:00:00Z");

  await initializeWeekIfNeeded(user, todayTime, userLocalDateStr);

  const streakLastChecked = user.streakLastCheckedDate
    ? checkDate(user.streakLastCheckedDate)
    : null;

  if (!streakLastChecked || streakLastChecked < todayTime) {
    await handleNewDayOfActivity(user, todayTime, userLocalDateStr);
  }

  user.streakLastCheckedDate = new Date();

  // checkWarningStatus does not save — caller handles persistence
  await checkWarningStatus(user, userLocalDateStr);

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
  const todayTime = new Date(userLocalDateStr + "T00:00:00Z");

  await initializeWeekIfNeeded(user, todayTime, userLocalDateStr);

  // Guard against counting multiple completions on the same day
  const lastCompletion = user.lastCompletionDate
    ? checkDate(user.lastCompletionDate)
    : null;

  const alreadyCompletedToday = lastCompletion && lastCompletion >= todayTime;

  if (!alreadyCompletedToday) {
    user.weeklyProgress.completionsThisWeek += 1;
  }

  user.lastCompletionDate = new Date();

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
  const dayOfWeek = getDayOfWeek(
    userLocalDateStr,
    user.weeklyProgress.weekStartDate,
  );
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
  const weekStartTime = checkDate(weekStart);

  if (
    !user.weeklyProgress.weekStartDate ||
    checkDate(user.weeklyProgress.weekStartDate) < weekStartTime
  ) {
    const weekEnd = new Date(weekStart);
    weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
    weekEnd.setUTCHours(23, 59, 59, 999);
    const weekEndTime = checkDate(weekEnd);

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

  const streakLastCheckedTime = checkDate(user.streakLastCheckedDate);
  const diffDays = Math.round(
    (todayTime - streakLastCheckedTime) / (1000 * 60 * 60 * 24),
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
    ? getDayOfWeek(userLocalDateStr, user.weeklyProgress.weekStartDate)
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
