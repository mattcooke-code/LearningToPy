// gamification.js

const {
  BADGE_DEFINITIONS_CORE,
} = require("../../shared/constants/badgeDefinitions.cjs");
const { XP } = require("../../shared/constants/progress.cjs");
const { toStringId } = require("../utils/generalUtils");
const Module = require("../models/Module");
const Lesson = require("../models/Lesson");

// --- CONSTANTS ---
const XP_PER_LEVEL = XP.PER_LEVEL;
const TOTAL_CURRICULUM_MODULES = 20; // M1–M20, excluding M0

// --- XP & LEVELING ---

/**
 * Calculates level and progress based on total XP.
 * NOTE: Level is now also derivable from completedModules.length on the
 * frontend. This function is retained for XP-based display in the
 * SegmentedLevelProgressBar and leaderboard contexts.
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

// --- DB HELPERS ---

/**
 * Cache of order → moduleId to avoid repeated DB queries
 * within a single badge evaluation run.
 */
const buildModuleOrderCache = async () => {
  const modules = await Module.find({ isPublished: true })
    .select("_id order")
    .lean();
  const cache = new Map();
  modules.forEach((m) => cache.set(m.order, toStringId(m._id)));
  return cache;
};

/**
 * Returns the total published lesson count for a given moduleId.
 * Used for clean sweep badge checks.
 */
const getTotalLessonsInModule = async (moduleId) => {
  return Lesson.countDocuments({ moduleId, isPublished: true });
};

// --- BADGE EVALUATION HELPERS ---

const createBadgeHelpers = async (user) => {
  const completedModuleSet = new Set(
    (user.completedModules || []).map((id) => toStringId(id)).filter(Boolean),
  );
  const completedLessonSet = new Set(
    (user.completedLessons || []).map((id) => toStringId(id)).filter(Boolean),
  );

  // Single DB call — cache order → moduleId for the entire evaluation run
  const moduleOrderCache = await buildModuleOrderCache();

  const hasCompletedModuleByOrder = (order) => {
    const moduleId = moduleOrderCache.get(order);
    return moduleId ? completedModuleSet.has(moduleId) : false;
  };

  /**
   * Clean sweep: all published lessons in a module completed.
   * Requires one DB count query per check — results are not cached
   * since this is called selectively, not for every module.
   */
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
      // Only count modules with order > 0 (exclude M0)
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
  };
};

// --- BADGE LOGIC MAP ---

/**
 * Each entry maps a badge id to:
 *   check(h, user)    → boolean — has the badge been earned?
 *   progress(h, user) → number  — 0–100 percentage towards earning it
 *
 * Convention:
 *   Module badges:      check if module N is in completedModules
 *   Clean sweep badges: check if all lessons in module N are completed
 *   Phase badges:       check if last module in phase is completed (same
 *                       event that fires the module badge — awarded together)
 *   Milestone badges:   check against completedModules count or course state
 *   Engagement badges:  check lessonCompletionHistory / quizAttempts
 *   Leaderboard badges: evaluated separately at point of XP gain, not here
 */
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
    // Fires alongside module-9-complete
    check: (h) => h.hasCompletedModuleByOrder(9),
    progress: (h) => {
      // Show progress through Phase 1 as modules completed out of 9
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
    // Awarded when user has at least one entry in quizAttempts
    check: (h, user) => (user.quizAttempts || []).length > 0,
    progress: (h, user) => ((user.quizAttempts || []).length > 0 ? 100 : 0),
  },
  "first-challenge": {
    // Awarded when lessonCompletionHistory contains at least one exercise/project
    check: (h, user) =>
      (user.lessonCompletionHistory || []).some(
        (entry) =>
          entry.contentType === "EXERCISE" || entry.contentType === "PROJECT",
      ),
    progress: (h, user) =>
      (user.lessonCompletionHistory || []).some(
        (entry) =>
          entry.contentType === "EXERCISE" || entry.contentType === "PROJECT",
      )
        ? 100
        : 0,
  },

  // ─── LEADERBOARD BADGES ───────────────────────────────────────
  // These are NOT evaluated by evaluateBadges() — they are awarded
  // directly by the leaderboard controller at the point of XP gain.
  // The entries here exist only so getBadgeProgress() can return
  // a display state for them (always 0 until awarded).
  "reached-the-summit": {
    check: () => false,
    progress: () => 0,
  },
  "top-ten": {
    check: () => false,
    progress: () => 0,
  },
};

// --- PUBLIC API ---

/**
 * Evaluate all badges and return newly unlocked ones.
 * Call this after any state-changing event (lesson/module completion).
 */
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

/**
 * Return progress percentage (0–100) for every badge.
 * Used by the achievements page to show in-progress and locked badges.
 * 
 * NOTE: Leaderboard badges always return 0% until awarded externally
 * by checkLeaderboardBadges(). They cannot be progressed through normal play.
 */
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

// --- LEADERBOARD BADGE TRIGGER ---

/**
 * Checks whether a user's current XP has crossed the top-10 or top-1
 * threshold and awards the relevant leaderboard badge if so.
 *
 * Only runs if:
 *   - The user has showOnLeaderboards: true
 *   - At least one leaderboard badge has not yet been earned
 *
 * Two lightweight DB queries at most — skipped entirely once both
 * badges are awarded.
 */
const checkLeaderboardBadges = async (user, User) => {
  const hasSummit = user.badges?.includes("reached-the-summit");
  const hasTopTen = user.badges?.includes("top-ten");

  // Both already awarded — nothing to do
  if (hasSummit && hasTopTen) return;

  // User has opted out of leaderboard display — ineligible
  if (!user.privacySettings?.showOnLeaderboards) return;

  if (!hasTopTen) {
    // Get the XP of the current 10th place user
    const tenthPlace = await User.findOne({
      "privacySettings.showOnLeaderboards": true,
      _id: { $ne: user._id },
    })
      .sort({ xp: -1 })
      .skip(9)
      .select("xp")
      .lean();

    // Award if user is in top 10, or fewer than 10 users exist on leaderboard
    if (!tenthPlace || user.xp >= tenthPlace.xp) {
      await awardLeaderboardBadge(user, "top-ten");
    }
  }

  if (!hasSummit) {
    // Get the XP of the current 1st place user (excluding self)
    const firstPlace = await User.findOne({
      "privacySettings.showOnLeaderboards": true,
      _id: { $ne: user._id },
    })
      .sort({ xp: -1 })
      .select("xp")
      .lean();

    // Award if no other users exist, or user has more XP than current leader
    if (!firstPlace || user.xp >= firstPlace.xp) {
      await awardLeaderboardBadge(user, "reached-the-summit");
    }
  }
};

/**
 * Award a leaderboard badge directly — bypasses evaluateBadges()
 * since rank is not stored on the user document.
 * Call this from the leaderboard controller after an XP update.
 */
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
