import { describe, it, expect } from "vitest";
import {
  checkPrerequisites,
  hasPassedModuleQuiz,
  getModuleLessonCompletion,
} from "../../services/moduleProgress";

// --- TESTS ---

describe("checkPrerequisites", () => {
  it("returns unlocked when no prerequisites exist", () => {
    const module = { prerequisites: [] };
    const result = checkPrerequisites(module, []);
    expect(result.isLocked).toBe(false);
  });

  it("returns unlocked when prerequisites is undefined", () => {
    const module = {};
    const result = checkPrerequisites(module, ["mod1"]);
    expect(result.isLocked).toBe(false);
  });

  it("returns unlocked when prerequisites is null", () => {
    const module = { prerequisites: null };
    const result = checkPrerequisites(module, []);
    expect(result.isLocked).toBe(false);
  });

  it("returns unlocked when all prerequisites are met", () => {
    const module = {
      prerequisites: [{ _id: "mod1" }, { _id: "mod2" }],
    };
    const result = checkPrerequisites(module, ["mod1", "mod2", "mod3"]);
    expect(result.isLocked).toBe(false);
  });

  it("returns locked when a prerequisite is unmet", () => {
    const module = {
      prerequisites: [{ _id: "mod1" }, { _id: "mod2" }, { _id: "mod3" }],
    };
    const result = checkPrerequisites(module, ["mod1", "mod3"]);
    expect(result.isLocked).toBe(true);
    expect(result.unmetPrerequisites).toHaveLength(1);
    expect(result.unmetPrerequisites[0]._id).toBe("mod2");
  });

  it("returns locked when no prerequisites are met", () => {
    const module = {
      prerequisites: [{ _id: "mod1" }, { _id: "mod2" }],
    };
    const result = checkPrerequisites(module, ["mod3", "mod4"]);
    expect(result.isLocked).toBe(true);
    expect(result.unmetPrerequisites).toHaveLength(2);
  });

  it("returns locked with empty completed modules array", () => {
    const module = {
      prerequisites: [{ _id: "mod1" }],
    };
    const result = checkPrerequisites(module, []);
    expect(result.isLocked).toBe(true);
  });

  it("compares IDs as strings", () => {
    const module = {
      prerequisites: [{ _id: "507f1f77bcf86cd799439011" }],
    };
    // Same ID but as a string — should match
    const result = checkPrerequisites(module, ["507f1f77bcf86cd799439011"]);
    expect(result.isLocked).toBe(false);
  });
});

describe("hasPassedModuleQuiz", () => {
  it("returns false for user with no quiz attempts", () => {
    const user = { quizAttempts: [] };
    expect(hasPassedModuleQuiz(user, "mod123")).toBe(false);
  });

  it("returns false when quizAttempts is undefined", () => {
    const user = {};
    expect(hasPassedModuleQuiz(user, "mod123")).toBe(false);
  });

  it("returns false when no attempt matches the module", () => {
    const user = {
      quizAttempts: [{ moduleId: "otherModule", passed: true }],
    };
    expect(hasPassedModuleQuiz(user, "mod123")).toBe(false);
  });

  it("returns false when module matches but quiz not passed", () => {
    const user = {
      quizAttempts: [{ moduleId: "mod123", passed: false }],
    };
    expect(hasPassedModuleQuiz(user, "mod123")).toBe(false);
  });

  it("returns true when module quiz was passed", () => {
    const user = {
      quizAttempts: [
        { moduleId: "mod456", passed: false },
        { moduleId: "mod123", passed: true },
      ],
    };
    expect(hasPassedModuleQuiz(user, "mod123")).toBe(true);
  });

  it("returns true when multiple attempts exist and one passed", () => {
    const user = {
      quizAttempts: [
        { moduleId: "mod123", passed: false },
        { moduleId: "mod123", passed: true },
      ],
    };
    expect(hasPassedModuleQuiz(user, "mod123")).toBe(true);
  });

  it("compares module IDs as strings", () => {
    const user = {
      quizAttempts: [{ moduleId: "507f1f77bcf86cd799439011", passed: true }],
    };
    expect(hasPassedModuleQuiz(user, "507f1f77bcf86cd799439011")).toBe(true);
  });
});

describe("getModuleLessonCompletion", () => {
  const lessons = [
    { _id: "lesson1" },
    { _id: "lesson2" },
    { _id: "lesson3" },
    { _id: "lesson4" },
    { _id: "lesson5" },
  ];

  it("returns 0 when no lessons are completed", () => {
    expect(getModuleLessonCompletion(lessons, [])).toBe(0);
  });

  it("returns correct count for partial completion", () => {
    expect(getModuleLessonCompletion(lessons, ["lesson1", "lesson3"])).toBe(2);
  });

  it("returns all lessons count when all completed", () => {
    const completed = ["lesson1", "lesson2", "lesson3", "lesson4", "lesson5"];
    expect(getModuleLessonCompletion(lessons, completed)).toBe(5);
  });

  it("handles empty lessons array", () => {
    expect(getModuleLessonCompletion([], ["lesson1"])).toBe(0);
  });

  it("ignores extra completed lessons not in this module", () => {
    const completed = ["lesson1", "lesson99", "lesson100"];
    expect(getModuleLessonCompletion(lessons, completed)).toBe(1);
  });

  it("compares IDs as strings", () => {
    const lessonsWithObjectIds = [
      { _id: "507f1f77bcf86cd799439001" },
      { _id: "507f1f77bcf86cd799439002" },
    ];
    const completed = ["507f1f77bcf86cd799439001"];
    expect(getModuleLessonCompletion(lessonsWithObjectIds, completed)).toBe(1);
  });
});
