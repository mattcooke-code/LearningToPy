// src/utils/__tests__/lessonCalculations.test.js
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  calculateNextLessonManually,
  findFirstIncompleteLesson,
  getLessonStatistics,
} from "../lessonCalculations";

// 🔹 Mock external dependencies using @/ alias for reliable resolution
vi.mock("@/services", () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

vi.mock("@/utils/progressCalculations", () => ({
  calculateModuleLessonProgress: vi.fn(),
}));

// Import mocked modules AFTER vi.mock calls
import { apiClient } from "@/services";
import { calculateModuleLessonProgress } from "@/utils/progressCalculations";

describe("lessonCalculations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("findFirstIncompleteLesson", () => {
    it("returns first lesson where isCompleted is falsy", () => {
      const lessons = [
        { id: "l1", title: "Intro", isCompleted: true },
        { id: "l2", title: "Basics", isCompleted: false },
        { id: "l3", title: "Advanced", isCompleted: false },
      ];
      const result = findFirstIncompleteLesson(lessons);
      expect(result).toEqual({ id: "l2", title: "Basics", isCompleted: false });
    });

    it("returns null when all lessons are completed", () => {
      const lessons = [
        { id: "l1", isCompleted: true },
        { id: "l2", isCompleted: true },
      ];
      expect(findFirstIncompleteLesson(lessons)).toBeNull();
    });

    it("returns null for empty array", () => {
      expect(findFirstIncompleteLesson([])).toBeNull();
    });

    it("handles lessons without isCompleted property (treats as incomplete)", () => {
      const lessons = [
        { id: "l1", title: "No Status" },
        { id: "l2", isCompleted: true },
      ];
      expect(findFirstIncompleteLesson(lessons)).toEqual({
        id: "l1",
        title: "No Status",
      });
    });
  });

  describe("getLessonStatistics", () => {
    beforeEach(() => {
      calculateModuleLessonProgress.mockReturnValue({
        moduleLessonProgress: 60,
      });
    });

    it("calculates correct stats for mixed completion", () => {
      const lessons = [
        { id: "l1", isCompleted: true },
        { id: "l2", isCompleted: false },
        { id: "l3", isCompleted: true },
        { id: "l4", isCompleted: false },
        { id: "l5", isCompleted: true },
      ];
      const result = getLessonStatistics(lessons);
      expect(result).toEqual({
        completed: 3,
        total: 5,
        remaining: 2,
        moduleLessonProgress: 60,
      });
    });

    it("returns 100% progress when all completed", () => {
      calculateModuleLessonProgress.mockReturnValue({
        moduleLessonProgress: 100,
      });
      const lessons = [
        { id: "l1", isCompleted: true },
        { id: "l2", isCompleted: true },
      ];
      const result = getLessonStatistics(lessons);
      expect(result.moduleLessonProgress).toBe(100);
      expect(result.remaining).toBe(0);
    });

    it("handles empty lessons array", () => {
      calculateModuleLessonProgress.mockReturnValue({
        moduleLessonProgress: 0,
      });
      const result = getLessonStatistics([]);
      expect(result).toEqual({
        completed: 0,
        total: 0,
        remaining: 0,
        moduleLessonProgress: 0,
      });
    });
  });

  describe("calculateNextLessonManually", () => {
    const mockLessons = [
      { _id: "l1", title: "Lesson 1" },
      { _id: "l2", title: "Lesson 2" },
      { _id: "l3", title: "Lesson 3" },
    ];

    it("returns next lesson when current is not last", async () => {
      apiClient.get.mockResolvedValue({ lessons: mockLessons });
      const result = await calculateNextLessonManually("l1", "mod-123");
      expect(result).toEqual({ _id: "l2", title: "Lesson 2" });
      expect(apiClient.get).toHaveBeenCalledWith(
        "/content/modules/mod-123/lessons",
      );
    });

    it("returns null when current lesson is the last one", async () => {
      apiClient.get.mockResolvedValue({ lessons: mockLessons });
      const result = await calculateNextLessonManually("l3", "mod-123");
      expect(result).toBeNull();
    });

    it("returns null when moduleId is missing", async () => {
      const result = await calculateNextLessonManually("l1", null);
      expect(result).toBeNull();
      expect(apiClient.get).not.toHaveBeenCalled();
    });

    it("returns null when API response has no lessons array", async () => {
      apiClient.get.mockResolvedValue({ data: "unexpected" });
      const result = await calculateNextLessonManually("l1", "mod-123");
      expect(result).toBeNull();
    });

    it("handles array response directly (fallback for different API shape)", async () => {
      apiClient.get.mockResolvedValue(mockLessons);
      const result = await calculateNextLessonManually("l2", "mod-123");
      expect(result).toEqual({ _id: "l3", title: "Lesson 3" });
    });

    it("returns null when current lesson not found in module", async () => {
      apiClient.get.mockResolvedValue({ lessons: mockLessons });
      const result = await calculateNextLessonManually("unknown-id", "mod-123");
      expect(result).toBeNull();
    });

    it("returns null on API error", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      apiClient.get.mockRejectedValue(new Error("Network error"));
      const result = await calculateNextLessonManually("l1", "mod-123");
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it("supports lessons with `id` instead of `_id`", async () => {
      const lessonsWithId = [
        { id: "l1", title: "Lesson 1" },
        { id: "l2", title: "Lesson 2" },
      ];
      apiClient.get.mockResolvedValue({ lessons: lessonsWithId });
      const result = await calculateNextLessonManually("l1", "mod-123");
      expect(result).toEqual({ id: "l2", title: "Lesson 2" });
    });
  });
});
