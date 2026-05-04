import { describe, it, expect, vi } from "vitest";

vi.mock("../../shared/constants/progress.cjs", () => ({
  XP: { PER_LEVEL: 100 },
  THRESHOLDS: {},
  calculateLessonQuizXP: vi.fn(),
  calculateExerciseXP: vi.fn(),
  getPhaseBonus: vi.fn(),
}));

vi.mock("../../utils/levelUtils", () => ({
  calculateLevelFromModules: vi.fn((modules, cache) => {
    // Simple mock: level = number of completed modules (min 1, max 20)
    const count = modules?.length || 0;
    return Math.min(Math.max(count, 1), 20);
  }),
}));

import {
  calculateProgress,
  calculateModuleLessonProgress,
  isModuleFinished,
  formatProgressResponse,
  getLessonCompletionCountByTag,
  hasCompletedChallengeGroup,
  calculateDaysActive,
} from "../../services/analytics";

// --- TESTS ---

describe("calculateProgress", () => {
  it("returns 0 when total is 0", () => {
    expect(calculateProgress(5, 0)).toBe(0);
  });

  it("returns 0 when total is null", () => {
    expect(calculateProgress(5, null)).toBe(0);
  });

  it("returns 0 when total is undefined", () => {
    expect(calculateProgress(5, undefined)).toBe(0);
  });

  it("returns 0 when count is 0", () => {
    expect(calculateProgress(0, 100)).toBe(0);
  });

  it("returns 50 for 5/10", () => {
    expect(calculateProgress(5, 10)).toBe(50);
  });

  it("returns 100 when count equals total", () => {
    expect(calculateProgress(10, 10)).toBe(100);
  });

  it("caps at 100 even if count exceeds total", () => {
    expect(calculateProgress(15, 10)).toBe(100);
  });

  it("rounds to nearest integer", () => {
    expect(calculateProgress(1, 3)).toBe(33);
    expect(calculateProgress(2, 3)).toBe(67);
  });
});

describe("calculateModuleLessonProgress", () => {
  it("returns 0 when total is 0", () => {
    expect(calculateModuleLessonProgress(5, 0)).toBe(0);
  });

  it("returns 0 when completed is 0", () => {
    expect(calculateModuleLessonProgress(0, 10)).toBe(0);
  });

  it("calculates correct percentage", () => {
    expect(calculateModuleLessonProgress(3, 10)).toBe(30);
  });

  it("returns 100 when all complete", () => {
    expect(calculateModuleLessonProgress(10, 10)).toBe(100);
  });
});

describe("isModuleFinished", () => {
  const lessons = [{ _id: "lesson1" }, { _id: "lesson2" }, { _id: "lesson3" }];

  it("returns false for empty lessons array", () => {
    expect(isModuleFinished(["lesson1"], [])).toBe(false);
  });

  it("returns false for null/undefined lessons", () => {
    expect(isModuleFinished(["lesson1"], null)).toBe(false);
    expect(isModuleFinished(["lesson1"], undefined)).toBe(false);
  });

  it("returns false when not all lessons completed", () => {
    expect(isModuleFinished(["lesson1", "lesson2"], lessons)).toBe(false);
  });

  it("returns true when all lessons completed", () => {
    expect(isModuleFinished(["lesson1", "lesson2", "lesson3"], lessons)).toBe(
      true,
    );
  });

  it("returns true with extra completed lessons", () => {
    expect(
      isModuleFinished(["lesson1", "lesson2", "lesson3", "extra"], lessons),
    ).toBe(true);
  });
});

describe("getLessonCompletionCountByTag", () => {
  const history = [
    { tags: ["python", "functions"] },
    { tags: ["python", "loops"] },
    { tags: ["data-types"] },
    { tags: null },
    { tags: ["FUNCTIONS"] }, // uppercase
  ];

  it("returns 0 for null tag", () => {
    expect(getLessonCompletionCountByTag(history, null)).toBe(0);
  });

  it("returns 0 for empty tag", () => {
    expect(getLessonCompletionCountByTag(history, "")).toBe(0);
  });

  it("returns 0 for non-array history", () => {
    expect(getLessonCompletionCountByTag(null, "python")).toBe(0);
    expect(getLessonCompletionCountByTag(undefined, "python")).toBe(0);
  });

  it("counts matching tags case-insensitively", () => {
    expect(getLessonCompletionCountByTag(history, "python")).toBe(2);
  });

  it("counts uppercase tag matches", () => {
    expect(getLessonCompletionCountByTag(history, "functions")).toBe(2);
  });

  it("returns 0 for non-matching tag", () => {
    expect(getLessonCompletionCountByTag(history, "classes")).toBe(0);
  });

  it("handles entries with null tags", () => {
    expect(getLessonCompletionCountByTag(history, "data-types")).toBe(1);
  });
});

describe("hasCompletedChallengeGroup", () => {
  const history = [
    { challengeGroup: "algorithms-easy" },
    { challengeGroup: "data-structures" },
    { challengeGroup: null },
    { challengeGroup: "ALGORITHMS-EASY" }, // uppercase
  ];

  it("returns false for null groupId", () => {
    expect(hasCompletedChallengeGroup(history, null)).toBe(false);
  });

  it("returns false for empty groupId", () => {
    expect(hasCompletedChallengeGroup(history, "")).toBe(false);
  });

  it("returns false for non-array history", () => {
    expect(hasCompletedChallengeGroup(null, "algorithms-easy")).toBe(false);
  });

  it("finds matching challenge group case-insensitively", () => {
    expect(hasCompletedChallengeGroup(history, "algorithms-easy")).toBe(true);
  });

  it("finds uppercase match", () => {
    expect(hasCompletedChallengeGroup(history, "ALGORITHMS-EASY")).toBe(true);
  });

  it("returns false for non-matching group", () => {
    expect(hasCompletedChallengeGroup(history, "recursion")).toBe(false);
  });

  it("handles entries with null challengeGroup", () => {
    expect(hasCompletedChallengeGroup(history, "data-structures")).toBe(true);
  });
});

describe("calculateDaysActive", () => {
  it("returns 0 for user with no history", () => {
    const user = {};
    expect(calculateDaysActive(user)).toBe(0);
  });

  it("counts unique days from lesson completions", () => {
    const user = {
      lessonCompletionHistory: [
        { completedAt: new Date("2026-01-01T10:00:00Z") },
        { completedAt: new Date("2026-01-01T14:00:00Z") }, // same day
        { completedAt: new Date("2026-01-02T10:00:00Z") }, // different day
      ],
    };
    expect(calculateDaysActive(user)).toBe(2);
  });

  it("counts days from module completions", () => {
    const user = {
      moduleCompletionHistory: [
        { completedAt: new Date("2026-01-03T10:00:00Z") },
      ],
    };
    expect(calculateDaysActive(user)).toBe(1);
  });

  it("deduplicates across lesson and module history", () => {
    const user = {
      lessonCompletionHistory: [
        { completedAt: new Date("2026-01-01T10:00:00Z") },
      ],
      moduleCompletionHistory: [
        { completedAt: new Date("2026-01-01T14:00:00Z") }, // same day
      ],
    };
    expect(calculateDaysActive(user)).toBe(1);
  });

  it("includes lastActiveDate if present", () => {
    const user = {
      lessonCompletionHistory: [
        { completedAt: new Date("2026-01-01T10:00:00Z") },
      ],
      lastActiveDate: new Date("2026-01-05T10:00:00Z"),
    };
    expect(calculateDaysActive(user)).toBe(2);
  });

  it("handles missing completedAt gracefully", () => {
    const user = {
      lessonCompletionHistory: [
        { completedAt: null },
        { completedAt: new Date("2026-01-01T10:00:00Z") },
      ],
    };
    expect(calculateDaysActive(user)).toBe(1);
  });
});

describe("formatProgressResponse", () => {
  it("returns defaults for empty user with no cache", () => {
    const user = {
      username: "testuser",
      xp: 0,
      level: 1,
      completedLessons: [],
      completedModules: [],
      badges: [],
    };

    const result = formatProgressResponse(user, 100);

    expect(result.username).toBe("testuser");
    expect(result.level).toBe(1);
    expect(result.xp).toBe(0);
    expect(result.stats.lessonsCompleted).toBe(0);
    expect(result.courseProgressPercentage).toBe(0);
  });

  it("calculates course progress correctly", () => {
    const user = {
      username: "testuser",
      xp: 500,
      level: 6,
      completedLessons: ["lesson1", "lesson2", "lesson3"],
      completedModules: ["mod1", "mod2", "mod3"],
      badges: [],
      streak: 5,
      streakStatus: "ACTIVE",
    };

    const result = formatProgressResponse(user, 100);

    expect(result.courseProgressPercentage).toBe(3); // 3/100 = 3%
    expect(result.stats.lessonsCompleted).toBe(3);
  });

  it("uses provided completedCurriculumCount when available", () => {
    const user = {
      username: "testuser",
      xp: 500,
      completedLessons: ["lesson1", "lesson2", "lesson3"],
      completedModules: [],
      badges: [],
    };

    const result = formatProgressResponse(user, 100, 50); // 50 completed

    expect(result.courseProgressPercentage).toBe(50);
    expect(result.stats.lessonsCompleted).toBe(3); // unique lessons from array
  });

  it("deduplicates completed lessons", () => {
    const user = {
      username: "testuser",
      xp: 500,
      completedLessons: ["lesson1", "lesson1", "lesson2"],
      completedModules: [],
      badges: [],
    };

    const result = formatProgressResponse(user, 100);

    expect(result.stats.lessonsCompleted).toBe(2);
  });

  it("calculates level from module cache when provided", () => {
    const user = {
      username: "testuser",
      xp: 500,
      completedLessons: [],
      completedModules: ["mod1", "mod2", "mod3", "mod4", "mod5"],
      badges: [],
    };

    const cache = new Map();
    cache.set(1, "mod1");
    cache.set(2, "mod2");
    cache.set(3, "mod3");
    cache.set(4, "mod4");
    cache.set(5, "mod5");

    const result = formatProgressResponse(user, 100, 0, null, cache);

    expect(result.level).toBe(5);
    expect(result.stats.modulesCompleted).toBe(5);
  });

  it("falls back to stored level when no cache", () => {
    const user = {
      username: "testuser",
      xp: 500,
      level: 6,
      completedLessons: [],
      completedModules: [],
      badges: [],
    };

    const result = formatProgressResponse(user, 100);

    expect(result.level).toBe(6);
  });

  it("includes currentModule data when provided", () => {
    const user = {
      username: "testuser",
      xp: 0,
      level: 1,
      completedLessons: [],
      completedModules: [],
      badges: [],
    };

    const currentModule = {
      order: 3,
      title: "Functions",
      lessonCount: 10,
      lessonsCompleted: 4,
    };

    const result = formatProgressResponse(user, 100, 0, currentModule);

    expect(result.currentModule).toEqual(currentModule);
  });

  it("defaults stats for missing user fields", () => {
    const user = {
      username: "minimal",
      xp: 0,
      completedLessons: [],
      completedModules: [],
      badges: [],
    };

    const result = formatProgressResponse(user, 100);

    expect(result.stats.totalLearningTime).toBe(0);
    expect(result.stats.daysActive).toBe(0);
    expect(result.streak).toBe(0);
    expect(result.streakStatus).toBe("ACTIVE");
    expect(result.weeklyProgress).toBe(null);
  });

  it("calculates levelPercentage correctly", () => {
    const user = {
      username: "testuser",
      xp: 0,
      level: 10,
      completedLessons: [],
      completedModules: [],
      badges: [],
    };

    const result = formatProgressResponse(user, 100);

    expect(result.progress.levelPercentage).toBe(50); // 10/20 = 50%
  });
});
