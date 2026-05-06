import { describe, it, expect, vi } from "vitest";

// Mock the shared constants before importing the module under test
vi.mock("@shared/constants/progress.cjs", () => ({
  XP: { PER_LEVEL: 100 },
}));

import {
  calculateModuleLessonProgress,
  calculateModulesCompletionProgress,
  calculateLevelProgress,
} from "../progressCalculations";

// ============================================================================
// calculateModuleLessonProgress
// ============================================================================

describe("calculateModuleLessonProgress", () => {
  it("returns 0% for an empty lessons array", () => {
    const result = calculateModuleLessonProgress([]);
    expect(result).toEqual({
      completedLessons: 0,
      totalLessons: 0,
      moduleLessonProgress: 0,
    });
  });

  it("returns 0% for empty array with default parameter", () => {
    const result = calculateModuleLessonProgress();
    expect(result).toEqual({
      completedLessons: 0,
      totalLessons: 0,
      moduleLessonProgress: 0,
    });
  });

  it("returns 100% when all lessons are completed", () => {
    const lessons = [
      { isCompleted: true },
      { isCompleted: true },
      { isCompleted: true },
    ];
    const result = calculateModuleLessonProgress(lessons);
    expect(result).toEqual({
      completedLessons: 3,
      totalLessons: 3,
      moduleLessonProgress: 100,
    });
  });

  it("returns 0% when no lessons are completed", () => {
    const lessons = [{ isCompleted: false }, { isCompleted: false }];
    const result = calculateModuleLessonProgress(lessons);
    expect(result).toEqual({
      completedLessons: 0,
      totalLessons: 2,
      moduleLessonProgress: 0,
    });
  });

  it("returns 50% for half completed", () => {
    const lessons = [
      { isCompleted: true },
      { isCompleted: false },
      { isCompleted: true },
      { isCompleted: false },
    ];
    const result = calculateModuleLessonProgress(lessons);
    expect(result).toEqual({
      completedLessons: 2,
      totalLessons: 4,
      moduleLessonProgress: 50,
    });
  });

  it("rounds down for fractional percentages", () => {
    const lessons = [
      { isCompleted: true },
      { isCompleted: false },
      { isCompleted: false },
    ];
    const result = calculateModuleLessonProgress(lessons);
    // 1/3 = 33.33... → rounds to 33
    expect(result.moduleLessonProgress).toBe(33);
  });

  it("rounds up for .5 and above", () => {
    const lessons = [
      { isCompleted: true },
      { isCompleted: true },
      { isCompleted: false },
    ];
    const result = calculateModuleLessonProgress(lessons);
    // 2/3 = 66.67 → rounds to 67
    expect(result.moduleLessonProgress).toBe(67);
  });

  it("handles lessons with extra properties", () => {
    const lessons = [
      { _id: "1", title: "Lesson 1", isCompleted: true },
      { _id: "2", title: "Lesson 2", isCompleted: false },
    ];
    const result = calculateModuleLessonProgress(lessons);
    expect(result).toEqual({
      completedLessons: 1,
      totalLessons: 2,
      moduleLessonProgress: 50,
    });
  });
});

// ============================================================================
// calculateModulesCompletionProgress
// ============================================================================

describe("calculateModulesCompletionProgress", () => {
  it("returns 0% when totalModules is 0", () => {
    expect(calculateModulesCompletionProgress(0, 0)).toBe(0);
    expect(calculateModulesCompletionProgress(5, 0)).toBe(0);
  });

  it("returns 100% when all modules are completed", () => {
    expect(calculateModulesCompletionProgress(5, 5)).toBe(100);
  });

  it("returns 0% when no modules are completed", () => {
    expect(calculateModulesCompletionProgress(0, 10)).toBe(0);
  });

  it("returns 50% for half completed", () => {
    expect(calculateModulesCompletionProgress(3, 6)).toBe(50);
  });

  it("rounds the result", () => {
    expect(calculateModulesCompletionProgress(1, 3)).toBe(33);
    expect(calculateModulesCompletionProgress(2, 3)).toBe(67);
  });
});

// ============================================================================
// calculateLevelProgress
// ============================================================================

describe("calculateLevelProgress", () => {
  it("returns level 1 with 0 XP", () => {
    const result = calculateLevelProgress(0);
    expect(result).toEqual({
      currentLevel: 1,
      xpInCurrentLevel: 0,
      progressCompleted: 0,
      xpNeededForNextLevel: 100,
    });
  });

  it("returns level 1 at 50 XP (50% progress)", () => {
    const result = calculateLevelProgress(50);
    expect(result).toEqual({
      currentLevel: 1,
      xpInCurrentLevel: 50,
      progressCompleted: 50,
      xpNeededForNextLevel: 50,
    });
  });

  it("returns level 2 at exactly 100 XP", () => {
    const result = calculateLevelProgress(100);
    expect(result).toEqual({
      currentLevel: 2,
      xpInCurrentLevel: 0,
      progressCompleted: 0,
      xpNeededForNextLevel: 100,
    });
  });

  it("returns level 2 with 150 XP (50% through level 2)", () => {
    const result = calculateLevelProgress(150);
    expect(result).toEqual({
      currentLevel: 2,
      xpInCurrentLevel: 50,
      progressCompleted: 50,
      xpNeededForNextLevel: 50,
    });
  });

  it("returns correct values for high XP", () => {
    const result = calculateLevelProgress(999);
    expect(result.currentLevel).toBe(10); // floor(999/100) + 1 = 10
    expect(result.xpInCurrentLevel).toBe(99);
    expect(result.progressCompleted).toBe(99);
    expect(result.xpNeededForNextLevel).toBe(1);
  });

  it("handles large XP values", () => {
    const result = calculateLevelProgress(10000);
    expect(result.currentLevel).toBe(101);
    expect(result.xpInCurrentLevel).toBe(0);
    expect(result.progressCompleted).toBe(0);
    expect(result.xpNeededForNextLevel).toBe(100);
  });
});
