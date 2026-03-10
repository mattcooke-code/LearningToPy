// gamification.js
const {
  BADGE_DEFINITIONS_CORE,
} = require("../../shared/constants/badgeDefinitions");
const { XP } = require("../../shared/constants/progress");
const {
  getLessonCompletionCountByTag,
  hasCompletedChallengeGroup,
} = require("./analytics");
const { toStringId, isSameDay, getDateKey } = require("./generalUtils");
const {
  MODULE_SLUGS,
  getModuleIdBySlug,
  getOrderedModuleIds,
} = require("./navigation");

// --- CONSTANTS ---
const XP_PER_LEVEL = XP.PER_LEVEL;
const DAILY_DOZEN_STREAK = 12;

// --- XP & LEVELING HELPERS ---

/**
 * Calculates level and progress based on total XP
 */
const calculateLevelProgress = (xp) => {
  const currentLevel = Math.floor(xp / XP_PER_LEVEL) + 1;
  const xpInCurrentLevel = xp % XP_PER_LEVEL;
  const progressCompleted = Math.round((xpInCurrentLevel / XP_PER_LEVEL) * 100);

  return {
    currentLevel,
    xpInCurrentLevel,
    progressCompleted,
    xpNeededForNextLevel: XP_PER_LEVEL - xpInCurrentLevel,
  };
};

// --- BADGE EVALUATION HELPERS ---

const createBadgeHelpers = (user) => {
  const completedModuleSet = new Set(
    (user.completedModules || []).map((id) => toStringId(id)).filter(Boolean),
  );
  const safeStats = user.stats || {};
  const moduleHistory = user.moduleCompletionHistory || [];
  const lessonHistory = user.lessonCompletionHistory || [];

  return {
    hasCompletedModuleBySlug: async (slug) => {
      const moduleId = await getModuleIdBySlug(slug);
      return moduleId ? completedModuleSet.has(moduleId) : false;
    },
    countCompletedModuleIds: (moduleIds) =>
      moduleIds.reduce(
        (count, id) => count + (completedModuleSet.has(id) ? 1 : 0),
        0,
      ),

    getQuizScore: async (slug, isFirstTryRequired = false) => {
      const moduleId = await getModuleIdBySlug(slug);
      if (!moduleId || !safeStats.moduleQuizScores) return 0;
      const scores = safeStats.moduleQuizScores[moduleId];
      return scores ? (isFirstTryRequired ? scores.first : scores.latest) : 0;
    },
    getPhaseQuizScore: (phaseSlug) => {
      const score = safeStats.phaseQuizScores
        ? safeStats.phaseQuizScores[phaseSlug]
        : null;
      return typeof score === "number" ? score : 0;
    },

    getModuleCompletionCountsPerDay: () => {
      const counts = new Map();
      moduleHistory.forEach((entry) => {
        const dateKey = getDateKey(entry.completedAt);
        if (dateKey) counts.set(dateKey, (counts.get(dateKey) || 0) + 1);
      });
      return counts;
    },
    getLessonCompletionCountByTag: (tag) =>
      getLessonCompletionCountByTag(lessonHistory, tag),
    hasCompletedChallengeGroup: (groupId) =>
      hasCompletedChallengeGroup(lessonHistory, groupId),
    stats: safeStats,
    lessonHistory,
  };
};

// --- BADGE LOGIC MAP ---
// --- Constants for logic ---
const CONSTANTS = {
  TOTAL_MODULES: 20,
  INTERMEDIATE_COUNT: 15,
  FUNDAMENTAL_COUNT: 5,
  FUNCTION_TARGET: 10,
  FIRST_TRY_TARGET: 5,
  FILE_TARGET: 5,
  OPTIMAL_TARGET: 20,
  TURBO_TARGET: 3,
  DAILY_DOZEN: 12,
  API_UNIQUE: 2,
  DECORATOR_TARGET: 5,
  DATETIME_TARGET: 5,
};

const BADGE_LOGIC_MAP = {
  "python-starter": {
    check: (h) => h.hasCompletedModuleBySlug(MODULE_SLUGS.PYTHON_FUNDAMENTALS),
    progress: async (h) =>
      (await h.hasCompletedModuleBySlug(MODULE_SLUGS.PYTHON_FUNDAMENTALS))
        ? 100
        : 0,
  },
  fundamentalist: {
    check: async (h) => {
      const ids = await getOrderedModuleIds(CONSTANTS.FUNDAMENTAL_COUNT);
      return ids.length > 0 && h.countCompletedModuleIds(ids) === ids.length;
    },
    progress: async (h) => {
      const ids = await getOrderedModuleIds(CONSTANTS.FUNDAMENTAL_COUNT);
      return ids.length === 0
        ? 0
        : Math.round((h.countCompletedModuleIds(ids) / ids.length) * 100);
    },
  },
  "logic-leaper": {
    check: async (h) =>
      (await h.getQuizScore(MODULE_SLUGS.CONTROL_FLOW_CONDITIONAL, true)) >= 80,
    progress: async (h) =>
      Math.min(
        100,
        Math.round(
          ((await h.getQuizScore(MODULE_SLUGS.CONTROL_FLOW_CONDITIONAL, true)) /
            80) *
            100,
        ),
      ),
  },
  "loop-commander": {
    check: async (h) =>
      (await h.hasCompletedModuleBySlug(MODULE_SLUGS.ITERATION)) &&
      (await h.getQuizScore(MODULE_SLUGS.ITERATION)) >= 100,
    progress: async (h) =>
      (await h.hasCompletedModuleBySlug(MODULE_SLUGS.ITERATION))
        ? Math.min(
            100,
            Math.round(await h.getQuizScore(MODULE_SLUGS.ITERATION)),
          )
        : 0,
  },
  "function-flinger": {
    check: async (h) =>
      (await h.hasCompletedModuleBySlug(MODULE_SLUGS.FUNCTIONS)) &&
      h.stats.functionChallengeCount >= CONSTANTS.FUNCTION_TARGET,
    progress: async (h) => {
      if (!(await h.hasCompletedModuleBySlug(MODULE_SLUGS.FUNCTIONS))) return 0;
      return Math.min(
        100,
        Math.round(
          ((h.stats.functionChallengeCount || 0) / CONSTANTS.FUNCTION_TARGET) *
            100,
        ),
      );
    },
  },
  "data-alchemist": {
    check: (h) => (h.stats.phaseQuizScores?.["phase-1"] || 0) >= 90,
    progress: (h) =>
      Math.min(
        100,
        Math.round(((h.stats.phaseQuizScores?.["phase-1"] || 0) / 90) * 100),
      ),
  },
  "full-stack-pythonista": {
    check: async (h) => {
      const ids = await getOrderedModuleIds(CONSTANTS.INTERMEDIATE_COUNT);
      return (
        h.countCompletedModuleIds(ids) === ids.length &&
        (h.stats.phaseQuizScores?.["phase-2"] || 0) >= 75
      );
    },
    progress: async (h) => {
      const ids = await getOrderedModuleIds(CONSTANTS.INTERMEDIATE_COUNT);
      const modProgress = h.countCompletedModuleIds(ids) / ids.length;
      if (modProgress < 1) return Math.round(modProgress * 75);
      return Math.min(
        100,
        Math.round(
          75 + ((h.stats.phaseQuizScores?.["phase-2"] || 0) / 75) * 25,
        ),
      );
    },
  },
  "python-master": {
    check: async (h) => {
      const ids = await getOrderedModuleIds(CONSTANTS.TOTAL_MODULES);
      return h.countCompletedModuleIds(ids) === ids.length;
    },
    progress: async (h) => {
      const ids = await getOrderedModuleIds(CONSTANTS.TOTAL_MODULES);
      return Math.round((h.countCompletedModuleIds(ids) / ids.length) * 100);
    },
  },
  "file-handler": {
    check: (h) => (h.stats.fileChallengeCount || 0) >= CONSTANTS.FILE_TARGET,
    progress: (h) =>
      Math.min(
        100,
        Math.round(
          ((h.stats.fileChallengeCount || 0) / CONSTANTS.FILE_TARGET) * 100,
        ),
      ),
  },
  "code-blacksmith": {
    check: (h) =>
      (h.stats.decoratorUsageCount || 0) >= CONSTANTS.DECORATOR_TARGET,
    progress: (h) =>
      Math.min(
        100,
        Math.round(
          ((h.stats.decoratorUsageCount || 0) / CONSTANTS.DECORATOR_TARGET) *
            100,
        ),
      ),
  },
  architect: {
    check: async (h) => (await h.getQuizScore(MODULE_SLUGS.OOP_I, true)) >= 80,
    progress: async (h) =>
      Math.min(
        100,
        Math.round(
          ((await h.getQuizScore(MODULE_SLUGS.OOP_I, true)) / 80) * 100,
        ),
      ),
  },
  "master-builder": {
    check: async (h) => (await h.getQuizScore(MODULE_SLUGS.OOP_II, true)) >= 85,
    progress: async (h) =>
      Math.min(
        100,
        Math.round(
          ((await h.getQuizScore(MODULE_SLUGS.OOP_II, true)) / 85) * 100,
        ),
      ),
  },
  "time-traveler": {
    check: (h) =>
      (h.stats.datetimeChallengeCount || 0) >= CONSTANTS.DATETIME_TARGET,
    progress: (h) =>
      Math.min(
        100,
        Math.round(
          ((h.stats.datetimeChallengeCount || 0) / CONSTANTS.DATETIME_TARGET) *
            100,
        ),
      ),
  },
  "regex-ruler": {
    check: async (h) =>
      (await h.hasCompletedModuleBySlug(MODULE_SLUGS.REGEX_MASTERY)) &&
      (await h.getQuizScore(MODULE_SLUGS.REGEX_MASTERY)) >= 100,
    progress: async (h) =>
      (await h.hasCompletedModuleBySlug(MODULE_SLUGS.REGEX_MASTERY))
        ? Math.min(100, await h.getQuizScore(MODULE_SLUGS.REGEX_MASTERY))
        : 0,
  },
  "web-slinger": {
    check: (h) => (h.stats.apiCountUnique || 0) >= CONSTANTS.API_UNIQUE,
    progress: (h) =>
      Math.min(
        100,
        Math.round(
          ((h.stats.apiCountUnique || 0) / CONSTANTS.API_UNIQUE) * 100,
        ),
      ),
  },
  "data-dynamo": {
    check: (h) => h.stats.pandasOperationRun === true,
    progress: (h) => (h.stats.pandasOperationRun ? 100 : 0),
  },
  "lightning-coder": {
    check: (h) => (h.stats.fastChallengeCount || 0) > 0,
    progress: () => 0,
  },
  "one-shot-wonder": {
    check: (h) =>
      (h.stats.firstTryChallengeCount || 0) >= CONSTANTS.FIRST_TRY_TARGET,
    progress: (h) =>
      Math.min(
        100,
        Math.round(
          ((h.stats.firstTryChallengeCount || 0) / CONSTANTS.FIRST_TRY_TARGET) *
            100,
        ),
      ),
  },
  "turbo-learner": {
    check: (h) =>
      Array.from(h.getModuleCompletionCountsPerDay().values()).some(
        (v) => v >= CONSTANTS.TURBO_TARGET,
      ),
    progress: (h) => {
      const max = Math.max(
        0,
        ...Array.from(h.getModuleCompletionCountsPerDay().values()),
      );
      return Math.min(100, Math.round((max / CONSTANTS.TURBO_TARGET) * 100));
    },
  },
  "optimal-prime": {
    check: (h) =>
      (h.stats.optimalSolutionCount || 0) >= CONSTANTS.OPTIMAL_TARGET,
    progress: (h) =>
      Math.min(
        100,
        Math.round(
          ((h.stats.optimalSolutionCount || 0) / CONSTANTS.OPTIMAL_TARGET) *
            100,
        ),
      ),
  },
  "infinity-war": {
    check: (h) => h.stats.controlledInfiniteLoopSolved === true,
    progress: (h) => (h.stats.controlledInfiniteLoopSolved ? 100 : 0),
  },
  "first-day": {
    check: (h, u) =>
      u.createdAt &&
      h.lessonHistory.some((entry) =>
        isSameDay(entry.completedAt, u.createdAt),
      ),
    progress: (h, u) =>
      u.createdAt &&
      h.lessonHistory.some((entry) => isSameDay(entry.completedAt, u.createdAt))
        ? 100
        : 0,
  },
  "week-warrior": {
    check: (h, u) => (u.streak || 0) >= 7,
    progress: (h, u) => Math.min(100, Math.round(((u.streak || 0) / 7) * 100)),
  },
  "monthly-momentum": {
    check: (h, u) => (u.streak || 0) >= 30,
    progress: (h, u) => Math.min(100, Math.round(((u.streak || 0) / 30) * 100)),
  },
  "dedicated-debugger": {
    check: (h, u) => (u.streak || 0) >= 100,
    progress: (h, u) =>
      Math.min(100, Math.round(((u.streak || 0) / 100) * 100)),
  },
  "daily-dozen": {
    check: (h, u) => (u.streak || 0) >= CONSTANTS.DAILY_DOZEN,
    progress: (h, u) =>
      Math.min(
        100,
        Math.round(((u.streak || 0) / CONSTANTS.DAILY_DOZEN) * 100),
      ),
  },
  "bug-hunter": {
    check: (h) => (h.stats.bugReportsVerified || 0) >= 3,
    progress: (h) =>
      Math.min(100, Math.round(((h.stats.bugReportsVerified || 0) / 3) * 100)),
  },
  "helpful-hero": {
    check: (h) => (h.stats.helpfulVotesReceived || 0) >= 10,
    progress: (h) =>
      Math.min(
        100,
        Math.round(((h.stats.helpfulVotesReceived || 0) / 10) * 100),
      ),
  },
  inviter: {
    check: (h) => (h.stats.referralsCompleted || 0) >= 1,
    progress: (h) => ((h.stats.referralsCompleted || 0) > 0 ? 100 : 0),
  },
  "beta-tester": {
    check: (h) => (h.stats.betaModulesCompleted || 0) >= 1,
    progress: (h) => ((h.stats.betaModulesCompleted || 0) > 0 ? 100 : 0),
  },
};

/**
 * Main function to check for newly unlocked badges
 */
const evaluateBadges = async (user, context = {}) => {
  const helpers = createBadgeHelpers(user);
  const newlyUnlocked = [];
  const unlockedDetails = [];

  for (const coreBadge of BADGE_DEFINITIONS_CORE) {
    if (user.badges?.includes(coreBadge.id)) continue;

    const logic = BADGE_LOGIC_MAP[coreBadge.id];
    if (!logic) continue;

    const qualifies = await logic.check(helpers, user, context);
    if (qualifies) {
      newlyUnlocked.push(coreBadge.id);
      unlockedDetails.push({ ...coreBadge });
    }
  }

  return { newlyUnlocked, unlockedDetails };
};

/**
 * Get progress for all badges (percentage completion)
 * @param {Object} user - User document
 * @returns {Promise<Array>} Array of badge progress objects
 */
const getBadgeProgress = async (user) => {
  const helpers = createBadgeHelpers(user);
  const results = [];

  for (const coreBadge of BADGE_DEFINITIONS_CORE) {
    const logic = BADGE_LOGIC_MAP[coreBadge.id];
    if (!logic) continue;

    // Use the progress function from BADGE_LOGIC_MAP
    const progressValue = await logic.progress(helpers, user);

    results.push({
      id: coreBadge.id,
      name: coreBadge.name,
      description: coreBadge.description,
      category: coreBadge.category,
      progressPercentage: progressValue ?? 0,
    });
  }

  return results;
};

module.exports = {
  evaluateBadges,
  getBadgeProgress,
  calculateLevelProgress,

  XP_PER_LEVEL,
};
