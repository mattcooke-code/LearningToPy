const Module = require("../models/Module");

const MODULE_SLUGS = {
  HELLO_WORLD: "python-fundamentals",
  IF_ELSE_CHALLENGE: "if-else-challenge-set",
  ITERATION: "iteration",
  FUNCTIONS: "functions",
  DATA_STRUCTURES_FINAL: "data-structures-final-exam",
  REQUESTS_AND_APIS: "requests-and-apis",
  REGEX_MASTERY: "regular-expressions",
};

const CORE_PATH_LEVELS = 10;
const FUNDAMENTAL_CORE_COUNT = 5;
const FUNCTION_CHALLENGE_TARGET = 10;
const DATA_STRUCTURES_TARGET_SCORE = 90;
const FIRST_TRY_TARGET = 5;
const OPTIMAL_SOLUTION_TARGET = 10;
const TURBO_LEARNER_DAILY_TARGET = 3;
const OOP_PASSING_SCORE = 80;
const FILE_CHALLENGE_TARGET = 5;

const moduleSlugCache = new Map();
const orderedModuleCache = new Map();
let allPublishedModuleIdsCache = null;

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
    if (orderedModuleCache.has(limit)) {
      return orderedModuleCache.get(limit);
    }

    const query = Module.find({ isPublished: true })
      .select("_id order")
      .sort({ order: 1 });

    const modules = await query.lean();
    const ids = modules.slice(0, limit).map((mod) => mod._id.toString());
    orderedModuleCache.set(limit, ids);
    return ids;
  };

  const countCompletedModuleIds = (moduleIds) => {
    return moduleIds.reduce(
      (count, id) => count + (completedModuleSet.has(id) ? 1 : 0),
      0
    );
  };

  const getAllPublishedModuleIds = async () => {
    if (allPublishedModuleIdsCache) {
      return allPublishedModuleIdsCache;
    }
    const modules = await Module.find({ isPublished: true })
      .select("_id")
      .lean();
    allPublishedModuleIdsCache = modules.map((mod) => mod._id.toString());
    return allPublishedModuleIdsCache;
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

  return {
    hasCompletedModuleBySlug,
    countCompletedModuleIds,
    getOrderedModuleIds,
    getAllPublishedModuleIds,
    getLessonCompletionCountByTag,
    hasCompletedChallengeGroup,
    moduleHistory,
    lessonHistory,
    stats: safeStats,
    completedModuleSet,
    getModuleCompletionCountsPerDay,
    completedModuleHistoryContainsSlug,
    getModuleIdBySlug,
  };
};

const BADGE_DEFINITIONS = [
  {
    id: "python-starter",
    name: "Python Starter",
    description: "Completed the very first introductory lesson.",
    category: "curriculum",
    async check({ helpers }) {
      return helpers.hasCompletedModuleBySlug(MODULE_SLUGS.HELLO_WORLD);
    },
    async progress({ helpers }) {
      const achieved = await helpers.hasCompletedModuleBySlug(
        MODULE_SLUGS.HELLO_WORLD
      );
      return achieved ? 100 : 0;
    },
  },
  {
    id: "fundamentalist",
    name: "Fundamentalist",
    description:
      "Mastered the basics of variables, data types, and operators (first 5 core modules).",
    category: "curriculum",
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
  {
    id: "logic-leaper",
    name: "Logic Leaper",
    description:
      "Demonstrated proficiency with conditional statements (If/Else Challenge Set).",
    category: "curriculum",
    async check({ helpers }) {
      const completed =
        (await helpers.hasCompletedModuleBySlug(
          MODULE_SLUGS.IF_ELSE_CHALLENGE
        )) ||
        helpers.hasCompletedChallengeGroup(MODULE_SLUGS.IF_ELSE_CHALLENGE);
      return completed;
    },
    async progress({ helpers }) {
      const completed =
        (await helpers.hasCompletedModuleBySlug(
          MODULE_SLUGS.IF_ELSE_CHALLENGE
        )) ||
        helpers.hasCompletedChallengeGroup(MODULE_SLUGS.IF_ELSE_CHALLENGE);
      return completed ? 100 : 0;
    },
  },
  {
    id: "loop-commander",
    name: "Loop Commander",
    description:
      "Conquered all lessons and challenges on loops (Iteration module).",
    category: "curriculum",
    async check({ helpers }) {
      return helpers.hasCompletedModuleBySlug(MODULE_SLUGS.ITERATION);
    },
    async progress({ helpers }) {
      const completed = await helpers.hasCompletedModuleBySlug(
        MODULE_SLUGS.ITERATION
      );
      return completed ? 100 : 0;
    },
  },
  {
    id: "function-flinger",
    name: "Function Flinger",
    description:
      "Successfully defined and used functions with parameters (Functions module + 10 challenges).",
    category: "curriculum",
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
  {
    id: "data-structure-specialist",
    name: "Data Structure Specialist",
    description: "Scored 90%+ on the Data Structures final exam.",
    category: "curriculum",
    async check({ helpers }) {
      return (
        (helpers.stats.dataStructuresExamScore || 0) >=
        DATA_STRUCTURES_TARGET_SCORE
      );
    },
    async progress({ helpers }) {
      const score = helpers.stats.dataStructuresExamScore;
      if (typeof score !== "number") return 0;
      return Math.min(100, Math.round((score / 100) * 100));
    },
  },
  {
    id: "full-stack-pythonista",
    name: "Full Stack Pythonista",
    description: "Completed the entire foundational curriculum (Levels 1-10).",
    category: "curriculum",
    async check({ helpers }) {
      const ids = await helpers.getOrderedModuleIds(CORE_PATH_LEVELS);
      if (ids.length === 0) return false;
      return helpers.countCompletedModuleIds(ids) === ids.length;
    },
    async progress({ helpers }) {
      const ids = await helpers.getOrderedModuleIds(CORE_PATH_LEVELS);
      if (ids.length === 0) return 0;
      const completed = helpers.countCompletedModuleIds(ids);
      return Math.round((completed / ids.length) * 100);
    },
  },
  {
    id: "lightning-coder",
    name: "Lightning Coder",
    description: "Solved a challenge in under 30 seconds.",
    category: "performance",
    async check({ helpers }) {
      return (helpers.stats.fastChallengeCount || 0) > 0;
    },
    async progress() {
      return 0;
    },
  },
  {
    id: "one-shot-wonder",
    name: "One-Shot Wonder",
    description: "Solved five medium/hard challenges on the first attempt.",
    category: "performance",
    async check({ helpers }) {
      return (helpers.stats.firstTryChallengeCount || 0) >= FIRST_TRY_TARGET;
    },
    async progress({ helpers }) {
      const count = helpers.stats.firstTryChallengeCount || 0;
      return Math.min(100, Math.round((count / FIRST_TRY_TARGET) * 100));
    },
  },
  {
    id: "turbo-learner",
    name: "Turbo Learner",
    description: "Completed three learning modules in a single day.",
    category: "performance",
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
  {
    id: "efficiency-expert",
    name: "Efficiency Expert",
    description:
      "Submitted 10 solutions that beat the community average for code efficiency.",
    category: "performance",
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
  {
    id: "first-day",
    name: "First Day",
    description: "Completed a challenge on the day of signup.",
    category: "habit",
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
  {
    id: "week-warrior",
    name: "Week Warrior",
    description: "Maintained a learning streak for 7 consecutive days.",
    category: "habit",
    async check({ user }) {
      return (user.streak || 0) >= 7;
    },
    async progress({ user }) {
      const streak = user.streak || 0;
      return Math.min(100, Math.round((Math.min(streak, 7) / 7) * 100));
    },
  },
  {
    id: "monthly-momentum",
    name: "Monthly Momentum",
    description: "Maintained a learning streak for 30 consecutive days.",
    category: "habit",
    async check({ user }) {
      return (user.streak || 0) >= 30;
    },
    async progress({ user }) {
      const streak = user.streak || 0;
      return Math.min(100, Math.round((Math.min(streak, 30) / 30) * 100));
    },
  },
  {
    id: "dedicated-debugger",
    name: "Dedicated Debugger",
    description: "Maintained a learning streak for 100 consecutive days.",
    category: "habit",
    async check({ user }) {
      return (user.streak || 0) >= 100;
    },
    async progress({ user }) {
      const streak = user.streak || 0;
      return Math.min(100, Math.round((Math.min(streak, 100) / 100) * 100));
    },
  },
  {
    id: "oop-genius",
    name: "OOP Genius",
    description:
      "Passed the advanced OOP module exam (Classes, Inheritance, etc.).",
    category: "advanced",
    async check({ helpers }) {
      return (helpers.stats.oopExamScore || 0) >= OOP_PASSING_SCORE;
    },
    async progress({ helpers }) {
      const score = helpers.stats.oopExamScore;
      if (typeof score !== "number") return 0;
      return Math.min(100, Math.round((score / 100) * 100));
    },
  },
  {
    id: "api-explorer",
    name: "API Explorer",
    description:
      "Successfully completed challenges involving external API calls.",
    category: "advanced",
    async check({ helpers }) {
      const moduleCompleted = await helpers.hasCompletedModuleBySlug(
        MODULE_SLUGS.REQUESTS_AND_APIS
      );
      if (moduleCompleted) return true;
      return (helpers.stats.apiChallengeCount || 0) > 0;
    },
    async progress({ helpers }) {
      const moduleCompleted = await helpers.hasCompletedModuleBySlug(
        MODULE_SLUGS.REQUESTS_AND_APIS
      );
      if (moduleCompleted) return 100;
      const count = helpers.stats.apiChallengeCount || 0;
      return count > 0 ? 100 : 0;
    },
  },
  {
    id: "file-handler",
    name: "File Handler",
    description:
      "Solved five challenges involving reading and writing files (CSV, TXT, etc.).",
    category: "advanced",
    async check({ helpers }) {
      return (helpers.stats.fileChallengeCount || 0) >= FILE_CHALLENGE_TARGET;
    },
    async progress({ helpers }) {
      const count = helpers.stats.fileChallengeCount || 0;
      return Math.min(100, Math.round((count / FILE_CHALLENGE_TARGET) * 100));
    },
  },
  {
    id: "regex-ruler",
    name: "Regex Ruler",
    description:
      "Used regular expressions effectively to solve a complex parsing problem.",
    category: "advanced",
    async check({ helpers }) {
      const moduleCompleted = await helpers.hasCompletedModuleBySlug(
        MODULE_SLUGS.REGEX_MASTERY
      );
      if (moduleCompleted) return true;
      const historyMatch = await helpers.completedModuleHistoryContainsSlug(
        MODULE_SLUGS.REGEX_MASTERY
      );
      return historyMatch;
    },
    async progress({ helpers }) {
      const moduleCompleted = await helpers.hasCompletedModuleBySlug(
        MODULE_SLUGS.REGEX_MASTERY
      );
      if (moduleCompleted) return 100;
      const lessonCount = helpers.getLessonCompletionCountByTag("regex");
      return lessonCount > 0 ? 50 : 0;
    },
  },
  {
    id: "bug-hunter",
    name: "Bug Hunter",
    description: "Reported three verified bugs or typos in the platform.",
    category: "community",
    async check({ helpers }) {
      return (helpers.stats.bugReportsVerified || 0) >= 3;
    },
    async progress({ helpers }) {
      const count = helpers.stats.bugReportsVerified || 0;
      return Math.min(100, Math.round((Math.min(count, 3) / 3) * 100));
    },
  },
  {
    id: "helpful-hero",
    name: "Helpful Hero",
    description: "Provided explanations that earned 10 helpful upvotes.",
    category: "community",
    async check({ helpers }) {
      return (helpers.stats.helpfulVotesReceived || 0) >= 10;
    },
    async progress({ helpers }) {
      const count = helpers.stats.helpfulVotesReceived || 0;
      return Math.min(100, Math.round((Math.min(count, 10) / 10) * 100));
    },
  },
  {
    id: "inviter",
    name: "Inviter",
    description:
      "Successfully referred a friend who completed their first module.",
    category: "community",
    async check({ helpers }) {
      return (helpers.stats.referralsCompleted || 0) >= 1;
    },
    async progress({ helpers }) {
      return (helpers.stats.referralsCompleted || 0) > 0 ? 100 : 0;
    },
  },
  {
    id: "beta-tester",
    name: "Beta Tester",
    description:
      "Participated in testing a new feature or module before release.",
    category: "community",
    async check({ helpers }) {
      return (helpers.stats.betaModulesCompleted || 0) >= 1;
    },
    async progress({ helpers }) {
      return (helpers.stats.betaModulesCompleted || 0) > 0 ? 100 : 0;
    },
  },
];

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
