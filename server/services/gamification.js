// gamification.js

const {
  BADGE_DEFINITIONS_CORE,
} = require("../../shared/constants/badgeDefinitions.cjs");
const { XP } = require("../../shared/constants/progress.cjs");
const { toStringId } = require("../utils/generalUtils");
const Module = require("../models/Module");
const Lesson = require("../models/Lesson");
const LessonCompletion = require("../models/LessonCompletion");
const ModuleCompletion = require("../models/ModuleCompletion");
const QuizAttempt = require("../models/QuizAttempt");

// --- CONSTANTS ---
const XP_PER_LEVEL = XP.PER_LEVEL;
const TOTAL_CURRICULUM_MODULES = 20; // M1–M20, excluding M0

// --- XP & LEVELING ---

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

// --- DB HELPERS ---

const buildModuleOrderCache = async () => {
  const modules = await Module.find({ isPublished: true })
    .select("_id order")
    .lean();
  const cache = new Map();
  modules.forEach((m) => cache.set(m.order, toStringId(m._id)));
  return cache;
};

const getTotalLessonsInModule = async (moduleId) => {
  return Lesson.countDocuments({ moduleId, isPublished: true });
};

// --- BADGE EVALUATION HELPERS ---

/**
 * Creates the helpers object used by BADGE_LOGIC_MAP checks.
 * Now queries ModuleCompletion, LessonCompletion, and QuizAttempt
 * collections instead of reading embedded User arrays.
 *
 * @param {Object} user - The user document (requires _id)
 * @returns {Promise<Object>} Helpers object with check functions
 */
const createBadgeHelpers = async (user) => {
  const userId = user._id;

  // Fetch completion data from new collections
  const [moduleCompletions, lessonCompletions, quizAttempts] =
    await Promise.all([
      ModuleCompletion.find({ userId }).select("moduleId").lean(),
      LessonCompletion.find({ userId }).select("lessonId contentType").lean(),
      QuizAttempt.find({ userId }).select("_id").lean(),
    ]);

  const completedModuleSet = new Set(
    moduleCompletions.map((mc) => toStringId(mc.moduleId)).filter(Boolean),
  );

  const completedLessonSet = new Set(
    lessonCompletions.map((lc) => toStringId(lc.lessonId)).filter(Boolean),
  );

  // Store lesson completions for engagement badge checks
  const lessonCompletionHistory = lessonCompletions;

  // Single DB call — cache order → moduleId for the entire evaluation run
  const moduleOrderCache = await buildModuleOrderCache();

  const hasCompletedModuleByOrder = (order) => {
    const moduleId = moduleOrderCache.get(order);
    return moduleId ? completedModuleSet.has(moduleId) : false;
  };

  const hasSweptModule = async (order) => {
    const moduleId = moduleOrderCache.get(order);
    if (!moduleId) return false;

    const totalLessons = await getTotalLessonsInModule(moduleId);
    if (totalLessons === 0) return false;

    const completedInModule = (
      await Lesson.find({ moduleId, isPublished: true }).select("_id").lean()
    ).filter((l) => completedLessonSet.has(toStringId(l._id))).length;

    return completedInModule >= totalLessons;
  };

  const completedCurriculumModuleCount = () =>
    [...completedModuleSet].filter((id) => {
      for (const [order, moduleId] of moduleOrderCache.entries()) {
        if (moduleId === id && order > 0) return true;
      }
      return false;
    }).length;

  return {
    hasCompletedModuleByOrder,
    hasSweptModule,
    completedCurriculumModuleCount,
    completedModuleSet,
    completedLessonSet,
    moduleOrderCache,
    // Pass through for engagement badge checks
    quizAttempts,
    lessonCompletionHistory,
  };
};

// --- BADGE LOGIC MAP ---
// (Unchanged — logic references are the same, just data source changed)

const BADGE_LOGIC_MAP = {
  // ─── M0 ───────────────────────────────────────────────────────
  "orientation-complete": {
    check: (h) => h.hasCompletedModuleByOrder(0),
    progress: (h) => (h.hasCompletedModuleByOrder(0) ? 100 : 0),
  },
  // ─── PHASE 1 MODULE BADGES (M1–M9) ───────────────────────────
  "module-1-complete": {
    check: (h) => h.hasCompletedModuleByOrder(1),
    progress: (h) => (h.hasCompletedModuleByOrder(1) ? 100 : 0),
  },
  "module-2-complete": {
    check: (h) => h.hasCompletedModuleByOrder(2),
    progress: (h) => (h.hasCompletedModuleByOrder(2) ? 100 : 0),
  },
  "module-3-complete": {
    check: (h) => h.hasCompletedModuleByOrder(3),
    progress: (h) => (h.hasCompletedModuleByOrder(3) ? 100 : 0),
  },
  "module-4-complete": {
    check: (h) => h.hasCompletedModuleByOrder(4),
    progress: (h) => (h.hasCompletedModuleByOrder(4) ? 100 : 0),
  },
  "module-5-complete": {
    check: (h) => h.hasCompletedModuleByOrder(5),
    progress: (h) => (h.hasCompletedModuleByOrder(5) ? 100 : 0),
  },
  "module-6-complete": {
    check: (h) => h.hasCompletedModuleByOrder(6),
    progress: (h) => (h.hasCompletedModuleByOrder(6) ? 100 : 0),
  },
  "module-7-complete": {
    check: (h) => h.hasCompletedModuleByOrder(7),
    progress: (h) => (h.hasCompletedModuleByOrder(7) ? 100 : 0),
  },
  "module-8-complete": {
    check: (h) => h.hasCompletedModuleByOrder(8),
    progress: (h) => (h.hasCompletedModuleByOrder(8) ? 100 : 0),
  },
  "module-9-complete": {
    check: (h) => h.hasCompletedModuleByOrder(9),
    progress: (h) => (h.hasCompletedModuleByOrder(9) ? 100 : 0),
  },

  // ─── PHASE 1 COMPLETION ───────────────────────────────────────
  "phase-1-complete": {
    check: (h) => h.hasCompletedModuleByOrder(9),
    progress: (h) => {
      let count = 0;
      for (let i = 1; i <= 9; i++) {
        if (h.hasCompletedModuleByOrder(i)) count++;
      }
      return Math.round((count / 9) * 100);
    },
  },

  // ─── PHASE 2 MODULE BADGES (M10–M15) ─────────────────────────
  "module-10-complete": {
    check: (h) => h.hasCompletedModuleByOrder(10),
    progress: (h) => (h.hasCompletedModuleByOrder(10) ? 100 : 0),
  },
  "module-11-complete": {
    check: (h) => h.hasCompletedModuleByOrder(11),
    progress: (h) => (h.hasCompletedModuleByOrder(11) ? 100 : 0),
  },
  "module-12-complete": {
    check: (h) => h.hasCompletedModuleByOrder(12),
    progress: (h) => (h.hasCompletedModuleByOrder(12) ? 100 : 0),
  },
  "module-13-complete": {
    check: (h) => h.hasCompletedModuleByOrder(13),
    progress: (h) => (h.hasCompletedModuleByOrder(13) ? 100 : 0),
  },
  "module-14-complete": {
    check: (h) => h.hasCompletedModuleByOrder(14),
    progress: (h) => (h.hasCompletedModuleByOrder(14) ? 100 : 0),
  },
  "module-15-complete": {
    check: (h) => h.hasCompletedModuleByOrder(15),
    progress: (h) => (h.hasCompletedModuleByOrder(15) ? 100 : 0),
  },

  // ─── PHASE 2 COMPLETION ───────────────────────────────────────
  "phase-2-complete": {
    check: (h) => h.hasCompletedModuleByOrder(15),
    progress: (h) => {
      let count = 0;
      for (let i = 10; i <= 15; i++) {
        if (h.hasCompletedModuleByOrder(i)) count++;
      }
      return Math.round((count / 6) * 100);
    },
  },

  // ─── PHASE 3 MODULE BADGES (M16–M20) ─────────────────────────
  "module-16-complete": {
    check: (h) => h.hasCompletedModuleByOrder(16),
    progress: (h) => (h.hasCompletedModuleByOrder(16) ? 100 : 0),
  },
  "module-17-complete": {
    check: (h) => h.hasCompletedModuleByOrder(17),
    progress: (h) => (h.hasCompletedModuleByOrder(17) ? 100 : 0),
  },
  "module-18-complete": {
    check: (h) => h.hasCompletedModuleByOrder(18),
    progress: (h) => (h.hasCompletedModuleByOrder(18) ? 100 : 0),
  },
  "module-19-complete": {
    check: (h) => h.hasCompletedModuleByOrder(19),
    progress: (h) => (h.hasCompletedModuleByOrder(19) ? 100 : 0),
  },
  "module-20-complete": {
    check: (h) => h.hasCompletedModuleByOrder(20),
    progress: (h) => (h.hasCompletedModuleByOrder(20) ? 100 : 0),
  },

  // ─── PHASE 3 COMPLETION ───────────────────────────────────────
  "phase-3-complete": {
    check: (h) => h.hasCompletedModuleByOrder(20),
    progress: (h) => {
      let count = 0;
      for (let i = 16; i <= 20; i++) {
        if (h.hasCompletedModuleByOrder(i)) count++;
      }
      return Math.round((count / 5) * 100);
    },
  },

  // ─── MILESTONE BADGES ─────────────────────────────────────────
  "halfway-there": {
    check: (h) =>
      h.completedCurriculumModuleCount() >= TOTAL_CURRICULUM_MODULES / 2,
    progress: (h) =>
      Math.min(
        100,
        Math.round(
          (h.completedCurriculumModuleCount() /
            (TOTAL_CURRICULUM_MODULES / 2)) *
            100,
        ),
      ),
  },
  "course-complete": {
    check: (h) =>
      h.completedCurriculumModuleCount() >= TOTAL_CURRICULUM_MODULES,
    progress: (h) =>
      Math.min(
        100,
        Math.round(
          (h.completedCurriculumModuleCount() / TOTAL_CURRICULUM_MODULES) * 100,
        ),
      ),
  },

  // ─── ENGAGEMENT BADGES ────────────────────────────────────────
  "first-quiz": {
    // Now reads from the quizAttempts array fetched by createBadgeHelpers
    check: (h) => (h.quizAttempts || []).length > 0,
    progress: (h) => ((h.quizAttempts || []).length > 0 ? 100 : 0),
  },
  "first-challenge": {
    // Now reads from lessonCompletionHistory fetched by createBadgeHelpers
    check: (h) =>
      (h.lessonCompletionHistory || []).some(
        (entry) =>
          entry.contentType === "EXERCISE" || entry.contentType === "PROJECT",
      ),
    progress: (h) =>
      (h.lessonCompletionHistory || []).some(
        (entry) =>
          entry.contentType === "EXERCISE" || entry.contentType === "PROJECT",
      )
        ? 100
        : 0,
  },

  // ─── LEADERBOARD BADGES ───────────────────────────────────────
  "reached-the-summit": {
    check: () => false,
    progress: () => 0,
  },
  "top-ten": {
    check: () => false,
    progress: () => 0,
  },
  hof: {
    check: async (h, user) => {
      // Check if user has been inducted into HoF
      const completion = await require("../models/CourseCompletion")
        .findOne({
          userId: user._id,
          hofJoinedAt: { $ne: null },
        })
        .lean();
      return !!completion;
    },
    progress: async (h, user) => {
      const completion = await require("../models/CourseCompletion")
        .findOne({
          userId: user._id,
        })
        .lean();

      if (!completion) return 0;
      if (completion.hofJoinedAt) return 100;

      // Calculate progress toward 30-day waiting period
      if (completion.hofEligibleAt) {
        const now = new Date();
        const eligibleDate = new Date(completion.hofEligibleAt);
        const totalWaitMs = 30 * 24 * 60 * 60 * 1000;
        const waitedMs = Math.min(now - completion.completedAt, totalWaitMs);
        return Math.round((waitedMs / totalWaitMs) * 100);
      }

      return 0;
    },
  },
};

// --- PUBLIC API ---

const evaluateBadges = async (user, context = {}) => {
  const helpers = await createBadgeHelpers(user);
  const newlyUnlocked = [];
  const unlockedDetails = [];

  for (const badge of BADGE_DEFINITIONS_CORE) {
    if (user.badges?.includes(badge.id)) continue;

    const logic = BADGE_LOGIC_MAP[badge.id];
    if (!logic) continue;

    const qualifies = await logic.check(helpers, user, context);
    if (qualifies) {
      newlyUnlocked.push(badge.id);
      unlockedDetails.push({ ...badge });
    }
  }

  return { newlyUnlocked, unlockedDetails };
};

const getBadgeProgress = async (user) => {
  const helpers = await createBadgeHelpers(user);
  const results = [];

  for (const badge of BADGE_DEFINITIONS_CORE) {
    const logic = BADGE_LOGIC_MAP[badge.id];
    if (!logic) continue;

    const progressValue = await logic.progress(helpers, user);

    results.push({
      id: badge.id,
      name: badge.name,
      description: badge.description,
      category: badge.category,
      tier: badge.tier,
      module: badge.module,
      phase: badge.phase,
      progressPercentage: progressValue ?? 0,
    });
  }

  return results;
};

const checkLeaderboardBadges = async (user, User) => {
  const hasSummit = user.badges?.includes("reached-the-summit");
  const hasTopTen = user.badges?.includes("top-ten");

  if (hasSummit && hasTopTen) return;

  if (!user.privacySettings?.showOnLeaderboards) return;

  if (!hasTopTen) {
    const tenthPlace = await User.findOne({
      "privacySettings.showOnLeaderboards": true,
      _id: { $ne: user._id },
    })
      .sort({ xp: -1 })
      .skip(9)
      .select("xp")
      .lean();

    if (!tenthPlace || user.xp >= tenthPlace.xp) {
      await awardLeaderboardBadge(user, "top-ten");
    }
  }

  if (!hasSummit) {
    const firstPlace = await User.findOne({
      "privacySettings.showOnLeaderboards": true,
      _id: { $ne: user._id },
    })
      .sort({ xp: -1 })
      .select("xp")
      .lean();

    if (!firstPlace || user.xp >= firstPlace.xp) {
      await awardLeaderboardBadge(user, "reached-the-summit");
    }
  }
};

const awardLeaderboardBadge = async (user, badgeId) => {
  if (!["reached-the-summit", "top-ten"].includes(badgeId)) return false;
  if (user.badges?.includes(badgeId)) return false;

  user.badges = [...(user.badges || []), badgeId];
  await user.save();
  return true;
};

module.exports = {
  evaluateBadges,
  getBadgeProgress,
  awardLeaderboardBadge,
  calculateLevelProgress,
  checkLeaderboardBadges,
  XP_PER_LEVEL,
};
