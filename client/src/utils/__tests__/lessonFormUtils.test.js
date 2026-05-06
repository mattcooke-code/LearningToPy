import { describe, it, expect } from "vitest";
import {
  DEFAULT_LESSON_FORM_DATA,
  mapLessonToFormData,
  normalizeLessonForAPI,
} from "../lessonFormUtils";

// ============================================================================
// DEFAULT_LESSON_FORM_DATA
// ============================================================================

describe("DEFAULT_LESSON_FORM_DATA", () => {
  it("has all expected keys", () => {
    expect(DEFAULT_LESSON_FORM_DATA).toHaveProperty("title", "");
    expect(DEFAULT_LESSON_FORM_DATA).toHaveProperty("description", "");
    expect(DEFAULT_LESSON_FORM_DATA).toHaveProperty("content", "");
    expect(DEFAULT_LESSON_FORM_DATA).toHaveProperty("difficulty", "BEGINNER");
    expect(DEFAULT_LESSON_FORM_DATA).toHaveProperty("xpReward", 100);
    expect(DEFAULT_LESSON_FORM_DATA).toHaveProperty("estimatedTime", 15);
    expect(DEFAULT_LESSON_FORM_DATA).toHaveProperty("order", 0);
    expect(DEFAULT_LESSON_FORM_DATA).toHaveProperty("isPublished", false);
    expect(DEFAULT_LESSON_FORM_DATA).toHaveProperty("tags", []);
    expect(DEFAULT_LESSON_FORM_DATA).toHaveProperty("moduleId", "");
    expect(DEFAULT_LESSON_FORM_DATA).toHaveProperty(
      "prerequisiteLessonIds",
      [],
    );
    expect(DEFAULT_LESSON_FORM_DATA).toHaveProperty("challengeGroup", "");
    expect(DEFAULT_LESSON_FORM_DATA).toHaveProperty("contentType", "THEORY");
    expect(DEFAULT_LESSON_FORM_DATA).toHaveProperty("initialCode", "");
    expect(DEFAULT_LESSON_FORM_DATA).toHaveProperty("testCases", "");
    expect(DEFAULT_LESSON_FORM_DATA).toHaveProperty("solution", "");
    expect(DEFAULT_LESSON_FORM_DATA).toHaveProperty("hints", []);
    expect(DEFAULT_LESSON_FORM_DATA).toHaveProperty("questions", []);
  });
});

// ============================================================================
// mapLessonToFormData
// ============================================================================

describe("mapLessonToFormData", () => {
  it("returns defaults when called with no argument", () => {
    const result = mapLessonToFormData();
    expect(result.title).toBe("");
    expect(result.difficulty).toBe("BEGINNER");
    expect(result.xpReward).toBe(100);
  });

  it("maps a complete API lesson to form data", () => {
    const lesson = {
      _id: "lesson123",
      title: "Variables in Python",
      description: "Learn about variables",
      content: "# Variables\nx = 1",
      difficulty: "BEGINNER",
      xpReward: 150,
      estimatedTime: 20,
      order: 3,
      isPublished: true,
      tags: ["basics", "variables"],
      moduleId: "mod1",
      prerequisiteLessonIds: [{ _id: "pre1" }, { _id: "pre2" }],
      challengeGroup: "python-basics",
      contentType: "EXERCISE",
      initialCode: "# Write your code here",
      testCases: [{ input: "2+2", expected: 4 }],
      solution: "print(2+2)",
      hints: ["Use print()", "Add the numbers"],
      questions: [],
    };

    const result = mapLessonToFormData(lesson);

    expect(result.title).toBe("Variables in Python");
    expect(result.xpReward).toBe(150);
    expect(result.isPublished).toBe(true);
    expect(result.tags).toEqual(["basics", "variables"]);
    expect(result.contentType).toBe("EXERCISE");
    expect(result.prerequisiteLessonIds).toEqual(["pre1", "pre2"]);
  });

  it("converts testCases array to pretty-printed JSON string", () => {
    const lesson = {
      testCases: [{ input: "1+1", expected: 2 }],
    };

    const result = mapLessonToFormData(lesson);
    expect(typeof result.testCases).toBe("string");
    expect(result.testCases).toContain('"input"');
    expect(result.testCases).toContain('"1+1"');
  });

  it("leaves testCases as string if already a string", () => {
    const lesson = {
      testCases: "already a string",
    };

    const result = mapLessonToFormData(lesson);
    expect(result.testCases).toBe("already a string");
  });

  it("handles empty testCases", () => {
    const result = mapLessonToFormData({ testCases: undefined });
    expect(result.testCases).toBe("");
  });

  it("casts isPublished to boolean", () => {
    expect(mapLessonToFormData({ isPublished: 1 }).isPublished).toBe(true);
    expect(mapLessonToFormData({ isPublished: 0 }).isPublished).toBe(false);
    expect(mapLessonToFormData({ isPublished: undefined }).isPublished).toBe(
      false,
    );
  });

  it("ensures tags is always an array", () => {
    expect(mapLessonToFormData({ tags: null }).tags).toEqual([]);
    expect(mapLessonToFormData({ tags: "not-array" }).tags).toEqual([]);
    expect(mapLessonToFormData({}).tags).toEqual([]);
  });

  it("ensures hints is always an array", () => {
    expect(mapLessonToFormData({ hints: null }).hints).toEqual([]);
    expect(mapLessonToFormData({}).hints).toEqual([]);
  });

  it("ensures questions is always an array", () => {
    expect(mapLessonToFormData({ questions: null }).questions).toEqual([]);
    expect(mapLessonToFormData({}).questions).toEqual([]);
  });
});

// ============================================================================
// normalizeLessonForAPI
// ============================================================================

describe("normalizeLessonForAPI", () => {
  const baseFormData = {
    ...DEFAULT_LESSON_FORM_DATA,
    title: "Test Lesson",
    description: "A test",
    content: "# Code",
    contentType: "EXERCISE",
    testCases: '[\n  {"input": "1+1", "expected": 2}\n]',
    xpReward: "150",
    estimatedTime: "20",
    order: "3",
  };

  it("parses testCases JSON string to object for EXERCISE type", () => {
    const result = normalizeLessonForAPI(baseFormData);

    expect(Array.isArray(result.testCases)).toBe(true);
    expect(result.testCases).toEqual([{ input: "1+1", expected: 2 }]);
  });

  it("handles empty testCases string gracefully", () => {
    const formData = { ...baseFormData, testCases: "   " };
    const result = normalizeLessonForAPI(formData);

    expect(result.testCases).toEqual([]);
  });

  it("handles invalid testCases JSON gracefully", () => {
    const formData = { ...baseFormData, testCases: "not valid json" };
    // Should not throw
    expect(() => normalizeLessonForAPI(formData)).not.toThrow();
  });

  it("removes exercise fields for non-EXERCISE content types", () => {
    const formData = { ...baseFormData, contentType: "THEORY" };

    const result = normalizeLessonForAPI(formData);

    expect(result).not.toHaveProperty("initialCode");
    expect(result).not.toHaveProperty("testCases");
    expect(result).not.toHaveProperty("solution");
    expect(result).not.toHaveProperty("hints");
  });

  it("removes questions for non-QUIZ content types", () => {
    const formData = {
      ...baseFormData,
      contentType: "THEORY",
      questions: [{ q: "test" }],
    };

    const result = normalizeLessonForAPI(formData);

    expect(result).not.toHaveProperty("questions");
  });

  it("keeps questions for QUIZ content type", () => {
    const formData = {
      ...baseFormData,
      contentType: "QUIZ",
      questions: [{ question: "What is Python?" }],
    };

    const result = normalizeLessonForAPI(formData);

    expect(result.questions).toEqual([{ question: "What is Python?" }]);
  });

  it("casts numeric string fields to numbers", () => {
    const result = normalizeLessonForAPI(baseFormData);

    expect(typeof result.xpReward).toBe("number");
    expect(result.xpReward).toBe(150);
    expect(typeof result.estimatedTime).toBe("number");
    expect(result.estimatedTime).toBe(20);
    expect(typeof result.order).toBe("number");
    expect(result.order).toBe(3);
  });

  it("handles NaN gracefully for numeric casts", () => {
    const formData = { ...baseFormData, xpReward: "abc" };
    const result = normalizeLessonForAPI(formData);

    expect(result.xpReward).toBeNaN();
  });

  it("does not mutate the original formData object", () => {
    const original = { ...baseFormData };
    normalizeLessonForAPI(original);

    // Original should still have strings for numeric fields
    expect(typeof original.xpReward).toBe("string");
    expect(typeof original.testCases).toBe("string");
  });
});
