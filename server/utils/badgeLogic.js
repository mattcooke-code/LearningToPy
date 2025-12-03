// /server/utils/badgeLogic.js
const Module = require("../models/Module");
const {
  BADGE_DEFINITIONS_CORE,
} = require("../../shared/constants/badgeDefinitions");

// --- CACHE INITIALIZATION (Kept for performance) ---
const moduleSlugCache = new Map();
const orderedModuleCache = new Map();
let allPublishedModuleIdsCache = null;

// --- MODULE SLUGS & CONSTANTS (Same as before) ---
const MODULE_SLUGS = {
  // PHASE 1
  PYTHON_FUNDAMENTALS: "python-fundamentals",
  CONTROL_FLOW_CONDITIONAL: "control-flow-conditionals",
  ITERATION: "iteration",
  FUNCTIONS: "functions",
  // PHASE 2
  ADVANCED_FUNCTIONS: "advanced-functions",
  OOP_I: "oop-i-classes-and-objects",
  OOP_II: "oop-ii-inheritance-and-polymorphism",
  DATETIME_MANIPULATION: "datetime-manipulation",
  REGEX_MASTERY: "regular-expressions",
  // PHASE 3
  HTTP_REQUESTS_AND_APIS: "http-requests-and-apis",
  DATA_SCIENCE_INTRO: "introduction-to-data-science",
};

const PHASE_QUIZ_SLUGS = {
  PHASE_1: "phase-1",
  PHASE_2: "phase-2",
};

// --- CONSTANTS ---
const TOTAL_MODULE_COUNT = 20;
const INTERMEDIATE_MODULE_COUNT = 15;
const FUNDAMENTAL_CORE_COUNT = 5;
const FUNCTION_CHALLENGE_TARGET = 10;
const FIRST_TRY_TARGET = 5;
const FILE_CHALLENGE_TARGET = 5;
const OPTIMAL_SOLUTION_TARGET = 20;
const TURBO_LEARNER_DAILY_TARGET = 3;
const DAILY_DOZEN_STREAK = 12;

// Quiz Requirements
const LOGIC_LEAPER_QUIZ_SCORE = 80;
const LOOP_COMMANDER_QUIZ_SCORE = 100;
const DATA_ALCHEMIST_QUIZ_SCORE = 90;
const FULL_STACK_PYTHONISTA_QUIZ_SCORE = 75;
const ARCHITECT_QUIZ_SCORE = 80;
const MASTER_BUILDER_QUIZ_SCORE = 85;
const REGEX_RULER_QUIZ_SCORE = 100;

// New Challenge Requirements
const API_UNIQUE_TARGET = 2;
const DECORATOR_USAGE_TARGET = 5;
const DATETIME_CHALLENGE_TARGET = 5;

// --- UTILITY FUNCTIONS (slugify, toStringId, normalizeDate, isSameDay) ---

const slugify = (value) =>
  (value || "")
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const toStringId = (value) => {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (value.toString) return value.toString();
  return null;
};

const normalizeDate = (value) => {
  if (!value) {
    return null;
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date;
};

const isSameDay = (dateA, dateB) => {
  const a = normalizeDate(dateA);
  const b = normalizeDate(dateB);
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

// --- createBadgeHelpers (Same as previous version) ---
const createBadgeHelpers = (user) => {
  const completedModuleSet = new Set(
    (user.completedModules || []).map((id) => toStringId(id)).filter(Boolean)
  );

  const safeStats = user.stats || {};
  const moduleHistory = Array.isArray(user.moduleCompletionHistory)
    ? user.moduleCompletionHistory
    : [];
  const lessonHistory = Array.isArray(user.lessonCompletionHistory)
    ? user.lessonCompletionHistory
    : [];

  const getModuleIdBySlug = async (slug) => {
    if (!slug) return null;
    if (moduleSlugCache.has(slug)) {
      return moduleSlugCache.get(slug);
    }
    let moduleDoc = await Module.findOne({ slug })
      .select("_id slug title")
      .lean();

    if (!moduleDoc) {
      const fallbackModules = await Module.find()
        .select("_id title slug")
        .lean();

      moduleDoc = fallbackModules.find((mod) => slugify(mod.title) === slug);

      if (moduleDoc && (!moduleDoc.slug || moduleDoc.slug !== slug)) {
        try {
          await Module.updateOne({ _id: moduleDoc._id }, { slug });
        } catch (err) {
          // ignore duplicate errors; slug pre-save will handle future updates
        }
      }
    }

    const moduleId = moduleDoc ? moduleDoc._id.toString() : null;
    moduleSlugCache.set(slug, moduleId);
    return moduleId;
  };

  const hasCompletedModuleBySlug = async (slug) => {
    const moduleId = await getModuleIdBySlug(slug);
    if (!moduleId) return false;
    return completedModuleSet.has(moduleId);
  };

  const getOrderedModuleIds = async (limit) => {
    const cacheKey = limit === TOTAL_MODULE_COUNT ? "all" : limit;

    if (orderedModuleCache.has(cacheKey)) {
      return orderedModuleCache.get(cacheKey);
    }

    const query = Module.find({ isPublished: true })
      .select("_id order")
      .sort({ order: 1 });

    const modules = await query.lean();
    const ids = modules
      .slice(0, limit === "all" ? modules.length : limit)
      .map((mod) => mod._id.toString());
    orderedModuleCache.set(cacheKey, ids);
    return ids;
  };

  const countCompletedModuleIds = (moduleIds) => {
    return moduleIds.reduce(
      (count, id) => count + (completedModuleSet.has(id) ? 1 : 0),
      0
    );
  };

  const getLessonCompletionCountByTag = (tag) => {
    if (!tag) return 0;
    return lessonHistory.filter((entry) =>
      Array.isArray(entry.tags)
        ? entry.tags.map((t) => (t || "").toLowerCase()).includes(tag)
        : false
    ).length;
  };

  const hasCompletedChallengeGroup = (groupId) => {
    if (!groupId) return false;
    return lessonHistory.some(
      (entry) =>
        typeof entry.challengeGroup === "string" &&
        entry.challengeGroup.toLowerCase() === groupId
    );
  };

  const getModuleCompletionCountsPerDay = () => {
    const counts = new Map();
    moduleHistory.forEach((entry) => {
      const completedAt = normalizeDate(entry.completedAt);
      if (!completedAt) return;
      const key = completedAt.toISOString().split("T")[0];
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    return counts;
  };

  const completedModuleHistoryContainsSlug = async (slug) => {
    const moduleId = await getModuleIdBySlug(slug);
    if (!moduleId) return false;
    return moduleHistory.some(
      (entry) => toStringId(entry.moduleId) === moduleId
    );
  };

  const getQuizScore = async (slug, isFirstTryRequired = false) => {
    const moduleId = await getModuleIdBySlug(slug);
    if (!moduleId) return null;

    const scores = safeStats.moduleQuizScores
      ? safeStats.moduleQuizScores[moduleId]
      : null;

    if (!scores) return null;

    return isFirstTryRequired ? scores.first || 0 : scores.latest || 0;
  };

  const getPhaseQuizScore = (phaseSlug) => {
    const score = safeStats.phaseQuizScores
      ? safeStats.phaseQuizScores[phaseSlug]
      : null;
    return typeof score === "number" ? score : 0;
  };

  return {
    hasCompletedModuleBySlug,
    countCompletedModuleIds,
    getOrderedModuleIds,
    getLessonCompletionCountByTag,
    hasCompletedChallengeGroup,
    moduleHistory,
    lessonHistory,
    stats: safeStats,
    completedModuleSet,
    getModuleCompletionCountsPerDay,
    completedModuleHistoryContainsSlug,
    getModuleIdBySlug,
    getQuizScore,
    getPhaseQuizScore,
  };
};

// --- BADGE LOGIC MAPPER (NEW) ---

// This object maps badge IDs to their specific check and progress logic functions.
const BADGE_LOGIC_MAP = {
  "python-starter": {
    async check({ helpers }) {
      return helpers.hasCompletedModuleBySlug(MODULE_SLUGS.PYTHON_FUNDAMENTALS);
    },
    async progress({ helpers }) {
      const achieved = await helpers.hasCompletedModuleBySlug(
        MODULE_SLUGS.PYTHON_FUNDAMENTALS
      );
      return achieved ? 100 : 0;
    },
  },
  fundamentalist: {
    async check({ helpers }) {
      const ids = await helpers.getOrderedModuleIds(FUNDAMENTAL_CORE_COUNT);
      if (ids.length === 0) return false;
      return (
        helpers.countCompletedModuleIds(ids) === ids.length && ids.length > 0
      );
    },
    async progress({ helpers }) {
      const ids = await helpers.getOrderedModuleIds(FUNDAMENTAL_CORE_COUNT);
      if (ids.length === 0) return 0;
      const completed = helpers.countCompletedModuleIds(ids);
      return Math.round((completed / ids.length) * 100);
    },
  },
  "logic-leaper": {
    async check({ helpers }) {
      const score = await helpers.getQuizScore(
        MODULE_SLUGS.CONTROL_FLOW_CONDITIONAL,
        true
      );
      return score >= LOGIC_LEAPER_QUIZ_SCORE;
    },
    async progress({ helpers }) {
      const score = await helpers.getQuizScore(
        MODULE_SLUGS.CONTROL_FLOW_CONDITIONAL,
        true
      );
      return Math.min(100, Math.round((score / LOGIC_LEAPER_QUIZ_SCORE) * 100));
    },
  },
  "loop-commander": {
    async check({ helpers }) {
      const moduleCompleted = await helpers.hasCompletedModuleBySlug(
        MODULE_SLUGS.ITERATION
      );
      if (!moduleCompleted) return false;
      const score = await helpers.getQuizScore(MODULE_SLUGS.ITERATION);
      return score >= LOOP_COMMANDER_QUIZ_SCORE;
    },
    async progress({ helpers }) {
      const completed = await helpers.hasCompletedModuleBySlug(
        MODULE_SLUGS.ITERATION
      );
      if (!completed) return 0;
      const score = await helpers.getQuizScore(MODULE_SLUGS.ITERATION);
      return Math.min(
        100,
        Math.round((score / LOOP_COMMANDER_QUIZ_SCORE) * 100)
      );
    },
  },
  "function-flinger": {
    async check({ helpers }) {
      const moduleCompleted = await helpers.hasCompletedModuleBySlug(
        MODULE_SLUGS.FUNCTIONS
      );
      if (!moduleCompleted) return false;
      return helpers.stats.functionChallengeCount >= FUNCTION_CHALLENGE_TARGET;
    },
    async progress({ helpers }) {
      const moduleCompleted = await helpers.hasCompletedModuleBySlug(
        MODULE_SLUGS.FUNCTIONS
      );
      if (!moduleCompleted) return 0;
      const solved = helpers.stats.functionChallengeCount || 0;
      return Math.min(
        100,
        Math.round((solved / FUNCTION_CHALLENGE_TARGET) * 100)
      );
    },
  },
  "data-alchemist": {
    async check({ helpers }) {
      const score = helpers.getPhaseQuizScore(PHASE_QUIZ_SLUGS.PHASE_1);
      return score >= DATA_ALCHEMIST_QUIZ_SCORE;
    },
    async progress({ helpers }) {
      const score = helpers.getPhaseQuizScore(PHASE_QUIZ_SLUGS.PHASE_1);
      return Math.min(
        100,
        Math.round((score / DATA_ALCHEMIST_QUIZ_SCORE) * 100)
      );
    },
  },
  "full-stack-pythonista": {
    async check({ helpers }) {
      const ids = await helpers.getOrderedModuleIds(INTERMEDIATE_MODULE_COUNT);
      if (ids.length === 0) return false;
      const modulesCompleted =
        helpers.countCompletedModuleIds(ids) === ids.length;

      if (!modulesCompleted) return false;

      const score = helpers.getPhaseQuizScore(PHASE_QUIZ_SLUGS.PHASE_2);
      return score >= FULL_STACK_PYTHONISTA_QUIZ_SCORE;
    },
    async progress({ helpers }) {
      const ids = await helpers.getOrderedModuleIds(INTERMEDIATE_MODULE_COUNT);
      if (ids.length === 0) return 0;
      const completed = helpers.countCompletedModuleIds(ids);
      const moduleProgress = completed / ids.length;
      const quizScore = helpers.getPhaseQuizScore(PHASE_QUIZ_SLUGS.PHASE_2);

      if (moduleProgress < 1) return Math.round(moduleProgress * 75);
      return Math.min(
        100,
        Math.round(75 + (quizScore / FULL_STACK_PYTHONISTA_QUIZ_SCORE) * 25)
      );
    },
  },
  "python-master": {
    async check({ helpers }) {
      const ids = await helpers.getOrderedModuleIds(TOTAL_MODULE_COUNT);
      if (ids.length === 0) return false;
      return helpers.countCompletedModuleIds(ids) === ids.length;
    },
    async progress({ helpers }) {
      const ids = await helpers.getOrderedModuleIds(TOTAL_MODULE_COUNT);
      if (ids.length === 0) return 0;
      const completed = helpers.countCompletedModuleIds(ids);
      return Math.round((completed / ids.length) * 100);
    },
  },
  "file-handler": {
    async check({ helpers }) {
      return (helpers.stats.fileChallengeCount || 0) >= FILE_CHALLENGE_TARGET;
    },
    async progress({ helpers }) {
      const count = helpers.stats.fileChallengeCount || 0;
      return Math.min(100, Math.round((count / FILE_CHALLENGE_TARGET) * 100));
    },
  },
  "code-blacksmith": {
    async check({ helpers }) {
      return (helpers.stats.decoratorUsageCount || 0) >= DECORATOR_USAGE_TARGET;
    },
    async progress({ helpers }) {
      const count = helpers.stats.decoratorUsageCount || 0;
      return Math.min(100, Math.round((count / DECORATOR_USAGE_TARGET) * 100));
    },
  },
  architect: {
    async check({ helpers }) {
      const score = await helpers.getQuizScore(MODULE_SLUGS.OOP_I, true);
      return score >= ARCHITECT_QUIZ_SCORE;
    },
    async progress({ helpers }) {
      const score = await helpers.getQuizScore(MODULE_SLUGS.OOP_I, true);
      return Math.min(100, Math.round((score / ARCHITECT_QUIZ_SCORE) * 100));
    },
  },
  "master-builder": {
    async check({ helpers }) {
      const score = await helpers.getQuizScore(MODULE_SLUGS.OOP_II, true);
      return score >= MASTER_BUILDER_QUIZ_SCORE;
    },
    async progress({ helpers }) {
      const score = await helpers.getQuizScore(MODULE_SLUGS.OOP_II, true);
      return Math.min(
        100,
        Math.round((score / MASTER_BUILDER_QUIZ_SCORE) * 100)
      );
    },
  },
  "time-traveler": {
    async check({ helpers }) {
      return (
        (helpers.stats.datetimeChallengeCount || 0) >= DATETIME_CHALLENGE_TARGET
      );
    },
    async progress({ helpers }) {
      const count = helpers.stats.datetimeChallengeCount || 0;
      return Math.min(
        100,
        Math.round((count / DATETIME_CHALLENGE_TARGET) * 100)
      );
    },
  },
  "regex-ruler": {
    async check({ helpers }) {
      const moduleCompleted = await helpers.hasCompletedModuleBySlug(
        MODULE_SLUGS.REGEX_MASTERY
      );
      if (!moduleCompleted) return false;
      const score = await helpers.getQuizScore(MODULE_SLUGS.REGEX_MASTERY);
      return score >= REGEX_RULER_QUIZ_SCORE;
    },
    async progress({ helpers }) {
      const moduleCompleted = await helpers.hasCompletedModuleBySlug(
        MODULE_SLUGS.REGEX_MASTERY
      );
      if (!moduleCompleted) return 0;
      const score = await helpers.getQuizScore(MODULE_SLUGS.REGEX_MASTERY);
      return Math.min(100, Math.round((score / REGEX_RULER_QUIZ_SCORE) * 100));
    },
  },
  "web-slinger": {
    async check({ helpers }) {
      return (helpers.stats.apiCountUnique || 0) >= API_UNIQUE_TARGET;
    },
    async progress({ helpers }) {
      const count = helpers.stats.apiCountUnique || 0;
      return Math.min(100, Math.round((count / API_UNIQUE_TARGET) * 100));
    },
  },
  "data-dynamo": {
    async check({ helpers }) {
      return helpers.stats.pandasOperationRun === true;
    },
    async progress({ helpers }) {
      return helpers.stats.pandasOperationRun ? 100 : 0;
    },
  },
  "lightning-coder": {
    async check({ helpers }) {
      return (helpers.stats.fastChallengeCount || 0) > 0;
    },
    async progress() {
      return 0;
    },
  },
  "one-shot-wonder": {
    async check({ helpers }) {
      return (helpers.stats.firstTryChallengeCount || 0) >= FIRST_TRY_TARGET;
    },
    async progress({ helpers }) {
      const count = helpers.stats.firstTryChallengeCount || 0;
      return Math.min(100, Math.round((count / FIRST_TRY_TARGET) * 100));
    },
  },
  "turbo-learner": {
    async check({ helpers }) {
      const counts = helpers.getModuleCompletionCountsPerDay();
      for (const value of counts.values()) {
        if (value >= TURBO_LEARNER_DAILY_TARGET) {
          return true;
        }
      }
      return false;
    },
    async progress({ helpers }) {
      const counts = helpers.getModuleCompletionCountsPerDay();
      let max = 0;
      for (const value of counts.values()) {
        if (value > max) max = value;
      }
      return Math.min(
        100,
        Math.round((max / TURBO_LEARNER_DAILY_TARGET) * 100)
      );
    },
  },
  "optimal-prime": {
    async check({ helpers }) {
      return (
        (helpers.stats.optimalSolutionCount || 0) >= OPTIMAL_SOLUTION_TARGET
      );
    },
    async progress({ helpers }) {
      const count = helpers.stats.optimalSolutionCount || 0;
      return Math.min(100, Math.round((count / OPTIMAL_SOLUTION_TARGET) * 100));
    },
  },
  "infinity-war": {
    async check({ helpers }) {
      return helpers.stats.controlledInfiniteLoopSolved === true;
    },
    async progress({ helpers }) {
      return helpers.stats.controlledInfiniteLoopSolved ? 100 : 0;
    },
  },
  "first-day": {
    async check({ user, helpers }) {
      if (!user.createdAt) return false;
      return helpers.lessonHistory.some((entry) =>
        isSameDay(entry.completedAt, user.createdAt)
      );
    },
    async progress({ user, helpers }) {
      if (!user.createdAt) return 0;
      return helpers.lessonHistory.some((entry) =>
        isSameDay(entry.completedAt, user.createdAt)
      )
        ? 100
        : 0;
    },
  },
  "daily-dozen": {
    async check({ user }) {
      return (user.streak || 0) >= DAILY_DOZEN_STREAK;
    },
    async progress({ user }) {
      const streak = user.streak || 0;
      return Math.min(
        100,
        Math.round(
          (Math.min(streak, DAILY_DOZEN_STREAK) / DAILY_DOZEN_STREAK) * 100
        )
      );
    },
  },
  "week-warrior": {
    async check({ user }) {
      return (user.streak || 0) >= 7;
    },
    async progress({ user }) {
      const streak = user.streak || 0;
      return Math.min(100, Math.round((Math.min(streak, 7) / 7) * 100));
    },
  },
  "monthly-momentum": {
    async check({ user }) {
      return (user.streak || 0) >= 30;
    },
    async progress({ user }) {
      const streak = user.streak || 0;
      return Math.min(100, Math.round((Math.min(streak, 30) / 30) * 100));
    },
  },
  "dedicated-debugger": {
    async check({ user }) {
      return (user.streak || 0) >= 100;
    },
    async progress({ user }) {
      const streak = user.streak || 0;
      return Math.min(100, Math.round((Math.min(streak, 100) / 100) * 100));
    },
  },
  "bug-hunter": {
    async check({ helpers }) {
      return (helpers.stats.bugReportsVerified || 0) >= 3;
    },
    async progress({ helpers }) {
      const count = helpers.stats.bugReportsVerified || 0;
      return Math.min(100, Math.round((Math.min(count, 3) / 3) * 100));
    },
  },
  "helpful-hero": {
    async check({ helpers }) {
      return (helpers.stats.helpfulVotesReceived || 0) >= 10;
    },
    async progress({ helpers }) {
      const count = helpers.stats.helpfulVotesReceived || 0;
      return Math.min(100, Math.round((Math.min(count, 10) / 10) * 100));
    },
  },
  inviter: {
    async check({ helpers }) {
      return (helpers.stats.referralsCompleted || 0) >= 1;
    },
    async progress({ helpers }) {
      return (helpers.stats.referralsCompleted || 0) > 0 ? 100 : 0;
    },
  },
  "beta-tester": {
    async check({ helpers }) {
      return (helpers.stats.betaModulesCompleted || 0) >= 1;
    },
    async progress({ helpers }) {
      return (helpers.stats.betaModulesCompleted || 0) > 0 ? 100 : 0;
    },
  },
};

// --- FINAL BADGE DEFINITIONS ARRAY ---
// This uses the shared data and maps the logic functions onto it.
const BADGE_DEFINITIONS = BADGE_DEFINITIONS_CORE.map((coreBadge) => ({
  ...coreBadge,
  // Safely spread the logic functions onto the core data
  ...BADGE_LOGIC_MAP[coreBadge.id],
}));

// --- EXPORTED FUNCTIONS (Same as previous version) ---
const evaluateBadges = async ({ user, context = {} }) => {
  const helpers = createBadgeHelpers(user);
  const newlyUnlocked = [];
  const unlockedDetails = [];

  for (const badge of BADGE_DEFINITIONS) {
    if (Array.isArray(user.badges) && user.badges.includes(badge.id)) {
      continue;
    }

    // eslint-disable-next-line no-await-in-loop
    const qualifies = await badge.check({ user, context, helpers });
    if (qualifies) {
      newlyUnlocked.push(badge.id);
      unlockedDetails.push({
        id: badge.id,
        name: badge.name,
        description: badge.description,
        category: badge.category,
      });
    }
  }

  return { newlyUnlocked, unlockedDetails };
};

const getBadgeProgress = async (user) => {
  const helpers = createBadgeHelpers(user);
  const results = [];

  for (const badge of BADGE_DEFINITIONS) {
    // eslint-disable-next-line no-await-in-loop
    const progressValue = await badge.progress({
      user,
      helpers,
    });
    results.push({
      id: badge.id,
      name: badge.name,
      description: badge.description,
      category: badge.category,
      progressPercentage: progressValue ?? 0,
    });
  }

  return results;
};

module.exports = {
  BADGE_DEFINITIONS,
  evaluateBadges,
  getBadgeProgress,
};
