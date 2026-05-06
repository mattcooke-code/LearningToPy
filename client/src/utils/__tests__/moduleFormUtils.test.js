import { describe, it, expect } from "vitest";
import {
  DEFAULT_MODULE_FORM_DATA,
  mapModuleToFormData,
  normalizeModuleForAPI,
} from "../moduleFormUtils";

// ============================================================================
// DEFAULT_MODULE_FORM_DATA
// ============================================================================

describe("DEFAULT_MODULE_FORM_DATA", () => {
  it("has all expected keys", () => {
    expect(DEFAULT_MODULE_FORM_DATA).toHaveProperty("title", "");
    expect(DEFAULT_MODULE_FORM_DATA).toHaveProperty("shortDescription", "");
    expect(DEFAULT_MODULE_FORM_DATA).toHaveProperty("description", "");
    expect(DEFAULT_MODULE_FORM_DATA).toHaveProperty("icon", "book");
    expect(DEFAULT_MODULE_FORM_DATA).toHaveProperty("color", "blue");
    expect(DEFAULT_MODULE_FORM_DATA).toHaveProperty("isPublished", false);
    expect(DEFAULT_MODULE_FORM_DATA).toHaveProperty("order", null);
    expect(DEFAULT_MODULE_FORM_DATA).toHaveProperty("moduleNumber", "");
    expect(DEFAULT_MODULE_FORM_DATA).toHaveProperty("tags", []);
    expect(DEFAULT_MODULE_FORM_DATA).toHaveProperty("lessons", []);
    expect(DEFAULT_MODULE_FORM_DATA).toHaveProperty("prerequisites", []);
    expect(DEFAULT_MODULE_FORM_DATA).toHaveProperty("estimatedDuration", 60);
    expect(DEFAULT_MODULE_FORM_DATA).toHaveProperty("difficulty", "BEGINNER");
    expect(DEFAULT_MODULE_FORM_DATA).toHaveProperty("badgeId", "");
    expect(DEFAULT_MODULE_FORM_DATA).toHaveProperty("xpReward", 200);
  });
});

// ============================================================================
// mapModuleToFormData
// ============================================================================

describe("mapModuleToFormData", () => {
  it("returns defaults when called with no argument", () => {
    const result = mapModuleToFormData();
    expect(result.title).toBe("");
    expect(result.icon).toBe("book");
    expect(result.difficulty).toBe("BEGINNER");
    expect(result.xpReward).toBe(200);
  });

  it("maps a complete API module to form data", () => {
    const module = {
      _id: "mod123",
      title: "Python Basics",
      shortDescription: "Learn the fundamentals",
      description: "A comprehensive intro to Python",
      icon: "code",
      color: "green",
      isPublished: true,
      order: 2,
      moduleNumber: "M02",
      tags: ["python", "basics"],
      lessons: [{ _id: "l1" }, { _id: "l2" }],
      prerequisites: [{ _id: "m1" }],
      estimatedDuration: 90,
      difficulty: "BEGINNER",
      badgeId: "badge123",
      xpReward: 300,
    };

    const result = mapModuleToFormData(module);

    expect(result.title).toBe("Python Basics");
    expect(result.shortDescription).toBe("Learn the fundamentals");
    expect(result.icon).toBe("code");
    expect(result.color).toBe("green");
    expect(result.isPublished).toBe(true);
    expect(result.order).toBe(2);
    expect(result.moduleNumber).toBe("M02");
    expect(result.tags).toEqual(["python", "basics"]);
    expect(result.estimatedDuration).toBe(90);
    expect(result.difficulty).toBe("BEGINNER");
    expect(result.badgeId).toBe("badge123");
    expect(result.xpReward).toBe(300);
  });

  it("unwraps populated lesson IDs to strings", () => {
    const module = {
      lessons: [{ _id: "l1" }, { _id: "l2" }, { _id: "l3" }],
    };

    const result = mapModuleToFormData(module);
    expect(result.lessons).toEqual(["l1", "l2", "l3"]);
  });

  it("handles lessons that are already strings", () => {
    const module = {
      lessons: ["l1", "l2"],
    };

    const result = mapModuleToFormData(module);
    expect(result.lessons).toEqual(["l1", "l2"]);
  });

  it("unwraps populated prerequisite IDs to strings", () => {
    const module = {
      prerequisites: [{ _id: "m1" }, { _id: "m2" }],
    };

    const result = mapModuleToFormData(module);
    expect(result.prerequisites).toEqual(["m1", "m2"]);
  });

  it("falls back moduleNumber from order when not provided", () => {
    const result = mapModuleToFormData({ order: 5 });
    expect(result.moduleNumber).toBe("5");
  });

  it("prefers moduleNumber over order when both present", () => {
    const result = mapModuleToFormData({ order: 5, moduleNumber: "CUSTOM" });
    expect(result.moduleNumber).toBe("CUSTOM");
  });

  it("casts isPublished to boolean", () => {
    expect(mapModuleToFormData({ isPublished: 1 }).isPublished).toBe(true);
    expect(mapModuleToFormData({ isPublished: 0 }).isPublished).toBe(false);
    expect(mapModuleToFormData({ isPublished: undefined }).isPublished).toBe(
      false,
    );
  });

  it("ensures tags is always an array", () => {
    expect(mapModuleToFormData({ tags: null }).tags).toEqual([]);
    expect(mapModuleToFormData({}).tags).toEqual([]);
  });

  it("provides defaults for missing fields", () => {
    const result = mapModuleToFormData({});

    expect(result.icon).toBe("book");
    expect(result.color).toBe("blue");
    expect(result.estimatedDuration).toBe(60);
    expect(result.xpReward).toBe(200);
    expect(result.badgeId).toBe("");
  });
});

// ============================================================================
// normalizeModuleForAPI
// ============================================================================

describe("normalizeModuleForAPI", () => {
  const baseFormData = {
    ...DEFAULT_MODULE_FORM_DATA,
    title: "  Python Basics  ",
    shortDescription: "  Learn the basics  ",
    description: "  A great module  ",
    icon: "code",
    color: "green",
    isPublished: true,
    tags: ["python"],
    lessons: ["l1", "l2"],
    prerequisites: ["m1"],
    estimatedDuration: 90,
    difficulty: "BEGINNER",
    badgeId: "badge123",
    xpReward: 300,
    order: 2,
    moduleNumber: "  M02  ",
  };

  it("trims whitespace from title", () => {
    const result = normalizeModuleForAPI(baseFormData);
    expect(result.title).toBe("Python Basics");
  });

  it("trims whitespace from shortDescription", () => {
    const result = normalizeModuleForAPI(baseFormData);
    expect(result.shortDescription).toBe("Learn the basics");
  });

  it("trims whitespace from description", () => {
    const result = normalizeModuleForAPI(baseFormData);
    expect(result.description).toBe("A great module");
  });

  it("includes order when > 0 and not null", () => {
    const result = normalizeModuleForAPI(baseFormData);
    expect(result.order).toBe(2);
  });

  it("excludes order when null", () => {
    const formData = { ...baseFormData, order: null };
    const result = normalizeModuleForAPI(formData);
    expect(result).not.toHaveProperty("order");
  });

  it("excludes order when 0", () => {
    const formData = { ...baseFormData, order: 0 };
    const result = normalizeModuleForAPI(formData);
    expect(result).not.toHaveProperty("order");
  });

  it("excludes order when undefined", () => {
    const formData = { ...baseFormData, order: undefined };
    const result = normalizeModuleForAPI(formData);
    expect(result).not.toHaveProperty("order");
  });

  it("includes moduleNumber when non-empty after trim", () => {
    const result = normalizeModuleForAPI(baseFormData);
    expect(result.moduleNumber).toBe("M02");
  });

  it("excludes moduleNumber when empty after trim", () => {
    const formData = { ...baseFormData, moduleNumber: "   " };
    const result = normalizeModuleForAPI(formData);
    expect(result).not.toHaveProperty("moduleNumber");
  });

  it("strips badgeId when empty string (sends undefined)", () => {
    const formData = { ...baseFormData, badgeId: "" };
    const result = normalizeModuleForAPI(formData);
    expect(result.badgeId).toBeUndefined();
  });

  it("keeps badgeId when non-empty", () => {
    const result = normalizeModuleForAPI(baseFormData);
    expect(result.badgeId).toBe("badge123");
  });

  it("does not mutate the original formData", () => {
    const original = { ...baseFormData };
    normalizeModuleForAPI(original);

    expect(original.title).toBe("  Python Basics  ");
  });
});
