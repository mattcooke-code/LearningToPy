// utils/streakManager.js
const User = require("../models/User");
const { checkDate } = require("./generalUtils");

const STREAK_CONFIG = {
  WARNING_DAY: 5,
  REQUIRED_COMPLETIONS: 1,
  VIEW_QUALIFIES_DAYS: 5,
  WEEK_START_DAY: 1, // (1 = Monday, 0 = Sunday)
};

/**
 * Get the start of the week (Monday) for a given date
 */
const getWeekStart = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - STREAK_CONFIG.WEEK_START_DAY;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Get the day of the week (1 = Monday ... 7 = Sunday)
 */
const getDayOfWeek = (date, weekStart) => {
  const dateTime = checkDate(date);
  const weekStartTime = checkDate(weekStart);
  const diffDays = Math.round(
    (dateTime - weekStartTime) / (1000 * 60 * 60 * 24),
  );
  return diffDays + 1;
};

/**
 * Track when user views ANY lesson content.
 * Accepts a pre-fetched Mongoose user document.
 * Caller is responsible for fetching the user and calling user.save() afterwards.
 */
const trackLessonView = async (user) => {
  const today = new Date();
  const todayTime = checkDate(today);

  await initializeWeekIfNeeded(user, today);

  const lastActive = user.lastActiveDate
    ? checkDate(user.lastActiveDate)
    : null;

  if (!lastActive || lastActive < todayTime) {
    await handleNewDayOfActivity(user, today);
  }

  user.lastActiveDate = new Date();

  // checkWarningStatus does not save — caller handles persistence
  await checkWarningStatus(user);

  return {
    streak: user.streak,
    streakStatus: user.streakStatus,
    weeklyProgress: user.weeklyProgress,
  };
};

/**
 * Track when user COMPLETES a lesson or module quiz.
 * Accepts a pre-fetched Mongoose user document.
 * Caller is responsible for fetching the user and calling user.save() afterwards.
 */
const trackCompletion = async (user) => {
  const today = new Date();
  const todayTime = checkDate(today);

  await initializeWeekIfNeeded(user, today);

  // Guard against counting multiple completions on the same day
  const lastCompletion = user.lastCompletionDate
    ? checkDate(user.lastCompletionDate)
    : null;

  const alreadyCompletedToday = lastCompletion && lastCompletion >= todayTime;

  if (!alreadyCompletedToday) {
    user.weeklyProgress.completionsThisWeek += 1;
  }

  user.lastCompletionDate = new Date();

  // Recover from both "warning" and "at_risk" statuses on completion
  if (
    (user.streakStatus === "warning" || user.streakStatus === "at_risk") &&
    user.weeklyProgress.completionsThisWeek >=
      STREAK_CONFIG.REQUIRED_COMPLETIONS
  ) {
    user.streakStatus = "active";
    user.weeklyProgress.warningIssued = false;
  }

  const dayOfWeek = getDayOfWeek(today, user.weeklyProgress.weekStartDate);
  if (dayOfWeek > STREAK_CONFIG.VIEW_QUALIFIES_DAYS || !user.lastActiveDate) {
    await updateStreak(user, today);
  }

  return {
    streak: user.streak,
    streakStatus: user.streakStatus,
    weeklyProgress: user.weeklyProgress,
  };
};

/**
 * Initialize new week if needed
 */
const initializeWeekIfNeeded = async (user, today) => {
  const weekStart = getWeekStart(today);
  const weekStartTime = checkDate(weekStart);

  if (
    !user.weeklyProgress.weekStartDate ||
    checkDate(user.weeklyProgress.weekStartDate) < weekStartTime
  ) {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    const weekEndTime = checkDate(weekEnd);

    const todayTime = checkDate(today);

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
 * Handle first activity of a new day
 */
const handleNewDayOfActivity = async (user, today) => {
  user.weeklyProgress.daysActive += 1;

  const dayOfWeek = getDayOfWeek(today, user.weeklyProgress.weekStartDate);

  if (dayOfWeek <= STREAK_CONFIG.VIEW_QUALIFIES_DAYS) {
    await updateStreak(user, today);
  } else {
    if (
      user.weeklyProgress.completionsThisWeek <
      STREAK_CONFIG.REQUIRED_COMPLETIONS
    ) {
      user.streakStatus = "at_risk";
    }
  }
};

/**
 * Update user's streak based on consecutive days
 */
const updateStreak = async (user, today) => {
  const todayTime = checkDate(today);

  if (!user.lastActiveDate) {
    user.streak = 1;
    user.streakStatus = "active";
    return;
  }

  const lastActiveTime = checkDate(user.lastActiveDate);
  const diffDays = Math.round(
    (todayTime - lastActiveTime) / (1000 * 60 * 60 * 24),
  );

  if (diffDays === 1) {
    user.streak += 1;
  } else if (diffDays > 1) {
    user.streak = 1;
    user.streakStatus = "active";
  }
};

/**
 * Evaluate last week's performance before rolling into a new week
 */
const evaluateLastWeek = async (user) => {
  if (
    user.weeklyProgress.completionsThisWeek < STREAK_CONFIG.REQUIRED_COMPLETIONS
  ) {
    user.streak = 0;
    user.streakStatus = "resetting";
  } else {
    user.streakStatus = "active";
  }
};

/**
 * Check whether a warning needs to be issued.
 * Does NOT save — caller handles persistence.
 */
const checkWarningStatus = async (user) => {
  if (!user.weeklyProgress.weekStartDate) return;

  const today = new Date();
  const dayOfWeek = getDayOfWeek(today, user.weeklyProgress.weekStartDate);

  // Day 5: Entering the danger zone
  if (
    dayOfWeek === STREAK_CONFIG.WARNING_DAY &&
    !user.weeklyProgress.warningIssued &&
    user.weeklyProgress.completionsThisWeek === 0 &&
    user.streak > 0
  ) {
    user.weeklyProgress.warningIssued = true;
    user.streakStatus = "warning";
  }

  // Day 7: Point of No Return
  if (
    dayOfWeek === 7 &&
    user.weeklyProgress.completionsThisWeek === 0 &&
    user.streak > 0
  ) {
    user.streakStatus = "resetting";
  }
};

/**
 * Get current streak info for a user.
 * This is a read-only query so fetching by userId here is appropriate.
 */
const getStreakInfo = async (userId) => {
  const user = await User.findById(userId).select(
    "streak streakStatus lastActiveDate lastCompletionDate weeklyProgress",
  );

  if (!user) return null;

  const today = new Date();
  const dayOfWeek = user.weeklyProgress.weekStartDate
    ? getDayOfWeek(today, user.weeklyProgress.weekStartDate)
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
    lastActive: user.lastActiveDate,
    lastCompletion: user.lastCompletionDate,
  };
};

module.exports = {
  trackLessonView,
  trackCompletion,
  getStreakInfo,
};
