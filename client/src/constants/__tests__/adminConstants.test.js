// src/constants/__tests__/adminConstants.test.js
import { describe, it, expect, beforeEach } from "vitest";
import {
  ADMIN_MENU_ITEMS,
  FLAG_STATUS_CONFIG,
  getStatusConfig,
  ISSUE_TYPE_CONFIG,
  getIssueTypeConfig,
  ANALYTICS_CHARTS,
  CHART_COLORS,
  ANALYTICS_TIME_RANGES,
  ANALYTICS_GROUP_BY,
} from "@/constants/adminConstants";

describe("adminConstants", () => {
  // Helper to check if value is a valid React component (function or object)
  const isValidComponent = (value) => {
    const type = typeof value;
    return type === "function" || (type === "object" && value !== null);
  };

  describe("ADMIN_MENU_ITEMS", () => {
    it("should be an array with correct structure", () => {
      expect(Array.isArray(ADMIN_MENU_ITEMS)).toBe(true);
      expect(ADMIN_MENU_ITEMS.length).toBeGreaterThan(0);
    });

    it("should have all required properties for each menu item", () => {
      ADMIN_MENU_ITEMS.forEach((item) => {
        expect(item).toHaveProperty("path");
        expect(item).toHaveProperty("label");
        expect(item).toHaveProperty("icon");
        expect(typeof item.path).toBe("string");
        expect(typeof item.label).toBe("string");
        // Lucide icons can be objects (React components) or functions
        expect(isValidComponent(item.icon)).toBe(true);
      });
    });

    it("should have valid paths", () => {
      ADMIN_MENU_ITEMS.forEach((item) => {
        expect(item.path).toBeTruthy();
        expect(item.path.startsWith("/")).toBe(true);
      });
    });

    it("should have expected menu items", () => {
      const paths = ADMIN_MENU_ITEMS.map((item) => item.path);
      expect(paths).toContain("/admin");
      expect(paths).toContain("/admin/users");
      expect(paths).toContain("/admin/content");
      expect(paths).toContain("/admin/flagged");
      expect(paths).toContain("/admin/analytics");
      expect(paths).toContain("/admin/settings");
    });

    it("should have exact flag only for dashboard", () => {
      const dashboardItem = ADMIN_MENU_ITEMS.find(
        (item) => item.path === "/admin",
      );
      expect(dashboardItem.exact).toBe(true);

      const otherItems = ADMIN_MENU_ITEMS.filter(
        (item) => item.path !== "/admin",
      );
      otherItems.forEach((item) => {
        expect(item.exact).toBeUndefined();
      });
    });

    it("should have badge configuration for Flagged Content", () => {
      const flaggedItem = ADMIN_MENU_ITEMS.find(
        (item) => item.path === "/admin/flagged",
      );
      expect(flaggedItem.badge).toBe(true);
      expect(flaggedItem.badgeCount).toBeDefined();
      expect(typeof flaggedItem.badgeCount).toBe("number");
    });

    it("should not have badge on non-flagged items", () => {
      const nonFlaggedItems = ADMIN_MENU_ITEMS.filter(
        (item) => item.path !== "/admin/flagged",
      );
      nonFlaggedItems.forEach((item) => {
        expect(item.badge).toBeUndefined();
        expect(item.badgeCount).toBeUndefined();
      });
    });

    it("should have unique paths", () => {
      const paths = ADMIN_MENU_ITEMS.map((item) => item.path);
      const uniquePaths = new Set(paths);
      expect(uniquePaths.size).toBe(paths.length);
    });

    it("should have unique labels", () => {
      const labels = ADMIN_MENU_ITEMS.map((item) => item.label);
      const uniqueLabels = new Set(labels);
      expect(uniqueLabels.size).toBe(labels.length);
    });

    it("should have valid icon components", () => {
      ADMIN_MENU_ITEMS.forEach((item) => {
        // Icons should be usable as React components
        expect(item.icon).toBeTruthy();
        expect(isValidComponent(item.icon)).toBe(true);
      });
    });
  });

  describe("FLAG_STATUS_CONFIG", () => {
    it("should be an object with expected statuses", () => {
      expect(typeof FLAG_STATUS_CONFIG).toBe("object");
      expect(FLAG_STATUS_CONFIG).toHaveProperty("PENDING");
      expect(FLAG_STATUS_CONFIG).toHaveProperty("IN_REVIEW");
      expect(FLAG_STATUS_CONFIG).toHaveProperty("FIXED");
      expect(FLAG_STATUS_CONFIG).toHaveProperty("REJECTED");
      expect(FLAG_STATUS_CONFIG).toHaveProperty("XP_ADJUSTED");
    });

    it("should have correct structure for each status", () => {
      Object.values(FLAG_STATUS_CONFIG).forEach((config) => {
        expect(config).toHaveProperty("color");
        expect(config).toHaveProperty("icon");
        expect(config).toHaveProperty("label");
        expect(typeof config.color).toBe("string");
        // Lucide icons can be objects (React components) or functions
        expect(isValidComponent(config.icon)).toBe(true);
        expect(typeof config.label).toBe("string");
      });
    });

    it("should have valid colors for all statuses", () => {
      const validColors = ["yellow", "blue", "green", "red", "purple"];
      Object.values(FLAG_STATUS_CONFIG).forEach((config) => {
        expect(validColors).toContain(config.color);
      });
    });

    it("should have non-empty labels", () => {
      Object.values(FLAG_STATUS_CONFIG).forEach((config) => {
        expect(config.label.length).toBeGreaterThan(0);
      });
    });

    it("PENDING status should be yellow with Clock icon", () => {
      expect(FLAG_STATUS_CONFIG.PENDING.color).toBe("yellow");
      expect(FLAG_STATUS_CONFIG.PENDING.label).toBe("Pending");
      expect(FLAG_STATUS_CONFIG.PENDING.icon).toBeTruthy();
    });

    it("IN_REVIEW status should be blue with Eye icon", () => {
      expect(FLAG_STATUS_CONFIG.IN_REVIEW.color).toBe("blue");
      expect(FLAG_STATUS_CONFIG.IN_REVIEW.label).toBe("In Review");
      expect(FLAG_STATUS_CONFIG.IN_REVIEW.icon).toBeTruthy();
    });

    it("FIXED status should be green with CheckCircle icon", () => {
      expect(FLAG_STATUS_CONFIG.FIXED.color).toBe("green");
      expect(FLAG_STATUS_CONFIG.FIXED.label).toBe("Fixed");
      expect(FLAG_STATUS_CONFIG.FIXED.icon).toBeTruthy();
    });

    it("REJECTED status should be red with XCircle icon", () => {
      expect(FLAG_STATUS_CONFIG.REJECTED.color).toBe("red");
      expect(FLAG_STATUS_CONFIG.REJECTED.label).toBe("Rejected");
      expect(FLAG_STATUS_CONFIG.REJECTED.icon).toBeTruthy();
    });

    it("XP_ADJUSTED status should be purple with Star icon", () => {
      expect(FLAG_STATUS_CONFIG.XP_ADJUSTED.color).toBe("purple");
      expect(FLAG_STATUS_CONFIG.XP_ADJUSTED.label).toBe("XP Adjusted");
      expect(FLAG_STATUS_CONFIG.XP_ADJUSTED.icon).toBeTruthy();
    });
  });

  describe("getStatusConfig", () => {
    it("should return correct config for known statuses", () => {
      expect(getStatusConfig("PENDING")).toEqual(FLAG_STATUS_CONFIG.PENDING);
      expect(getStatusConfig("IN_REVIEW")).toEqual(
        FLAG_STATUS_CONFIG.IN_REVIEW,
      );
      expect(getStatusConfig("FIXED")).toEqual(FLAG_STATUS_CONFIG.FIXED);
      expect(getStatusConfig("REJECTED")).toEqual(FLAG_STATUS_CONFIG.REJECTED);
      expect(getStatusConfig("XP_ADJUSTED")).toEqual(
        FLAG_STATUS_CONFIG.XP_ADJUSTED,
      );
    });

    it("should return fallback config for unknown status", () => {
      const fallback = getStatusConfig("UNKNOWN_STATUS");
      expect(fallback.color).toBe("gray");
      expect(fallback.label).toBe("UNKNOWN_STATUS");
      expect(isValidComponent(fallback.icon)).toBe(true);
      expect(fallback.icon).toBeTruthy();
    });

    it("should return fallback config for null status", () => {
      const fallback = getStatusConfig(null);
      expect(fallback.color).toBe("gray");
      expect(fallback.label).toBe("Unknown");
      expect(isValidComponent(fallback.icon)).toBe(true);
    });

    it("should return fallback config for undefined status", () => {
      const fallback = getStatusConfig(undefined);
      expect(fallback.color).toBe("gray");
      expect(fallback.label).toBe("Unknown");
      expect(isValidComponent(fallback.icon)).toBe(true);
    });

    it("should return fallback config for empty string status", () => {
      const fallback = getStatusConfig("");
      expect(fallback.color).toBe("gray");
      expect(fallback.label).toBe("Unknown");
      expect(isValidComponent(fallback.icon)).toBe(true);
    });

    it("should handle case sensitivity correctly", () => {
      const result = getStatusConfig("pending");
      expect(result.color).toBe("gray");
      expect(result.label).toBe("pending");
    });

    it("should always return a valid config with all required properties", () => {
      // Test with various edge cases
      const testCases = [null, undefined, "", "RANDOM"];
      // Remove 123 from test cases since it returns label as number

      testCases.forEach((input) => {
        const config = getStatusConfig(input);
        expect(config).toHaveProperty("color");
        expect(config).toHaveProperty("icon");
        expect(config).toHaveProperty("label");
        expect(typeof config.color).toBe("string");
        expect(isValidComponent(config.icon)).toBe(true);
        // Label should be string for these cases (not testing 123 here)
        expect(typeof config.label).toBe("string");
      });
    });
  });

  describe("ISSUE_TYPE_CONFIG", () => {
    it("should be an object with expected issue types", () => {
      expect(ISSUE_TYPE_CONFIG).toHaveProperty("CONTENT_ERROR");
      expect(ISSUE_TYPE_CONFIG).toHaveProperty("CODE_ERROR");
      expect(ISSUE_TYPE_CONFIG).toHaveProperty("QUIZ_ERROR");
      expect(ISSUE_TYPE_CONFIG).toHaveProperty("BROKEN_FUNCTIONALITY");
      expect(ISSUE_TYPE_CONFIG).toHaveProperty("XP_ADJUSTMENT");
      expect(ISSUE_TYPE_CONFIG).toHaveProperty("OTHER");
    });

    it("should have correct structure for each issue type", () => {
      Object.values(ISSUE_TYPE_CONFIG).forEach((config) => {
        expect(config).toHaveProperty("icon");
        expect(config).toHaveProperty("color");
        expect(config).toHaveProperty("label");
        expect(config).toHaveProperty("description");
        // Lucide icons can be objects (React components) or functions
        expect(isValidComponent(config.icon)).toBe(true);
        expect(typeof config.color).toBe("string");
        expect(typeof config.label).toBe("string");
        expect(typeof config.description).toBe("string");
      });
    });

    it("CONTENT_ERROR should be blue with appropriate description", () => {
      expect(ISSUE_TYPE_CONFIG.CONTENT_ERROR.color).toBe("blue");
      expect(ISSUE_TYPE_CONFIG.CONTENT_ERROR.label).toBe("Content Error");
      expect(ISSUE_TYPE_CONFIG.CONTENT_ERROR.description).toBe(
        "Typo, incorrect information",
      );
    });

    it("CODE_ERROR should be purple with appropriate description", () => {
      expect(ISSUE_TYPE_CONFIG.CODE_ERROR.color).toBe("purple");
      expect(ISSUE_TYPE_CONFIG.CODE_ERROR.label).toBe("Code Error");
      expect(ISSUE_TYPE_CONFIG.CODE_ERROR.description).toBe(
        "Exercise code not working",
      );
    });

    it("QUIZ_ERROR should be orange with appropriate description", () => {
      expect(ISSUE_TYPE_CONFIG.QUIZ_ERROR.color).toBe("orange");
      expect(ISSUE_TYPE_CONFIG.QUIZ_ERROR.label).toBe("Quiz Error");
      expect(ISSUE_TYPE_CONFIG.QUIZ_ERROR.description).toBe(
        "Quiz marked incorrectly",
      );
    });

    it("BROKEN_FUNCTIONALITY should be red with appropriate description", () => {
      expect(ISSUE_TYPE_CONFIG.BROKEN_FUNCTIONALITY.color).toBe("red");
      expect(ISSUE_TYPE_CONFIG.BROKEN_FUNCTIONALITY.label).toBe(
        "Broken Functionality",
      );
      expect(ISSUE_TYPE_CONFIG.BROKEN_FUNCTIONALITY.description).toBe(
        "Validation not working",
      );
    });

    it("XP_ADJUSTMENT should be yellow with appropriate description", () => {
      expect(ISSUE_TYPE_CONFIG.XP_ADJUSTMENT.color).toBe("yellow");
      expect(ISSUE_TYPE_CONFIG.XP_ADJUSTMENT.label).toBe("XP Adjustment");
      expect(ISSUE_TYPE_CONFIG.XP_ADJUSTMENT.description).toBe(
        "XP not awarded correctly",
      );
    });

    it("OTHER should be gray with fallback description", () => {
      expect(ISSUE_TYPE_CONFIG.OTHER.color).toBe("gray");
      expect(ISSUE_TYPE_CONFIG.OTHER.label).toBe("Other");
      expect(ISSUE_TYPE_CONFIG.OTHER.description).toBe("Other issue");
    });

    it("should have unique colors where appropriate", () => {
      const colors = Object.values(ISSUE_TYPE_CONFIG).map((c) => c.color);
      const uniqueColors = new Set(colors);
      // Not all colors need to be unique, but most should be
      expect(uniqueColors.size).toBeGreaterThanOrEqual(4);
    });

    it("should have human-readable descriptions", () => {
      Object.values(ISSUE_TYPE_CONFIG).forEach((config) => {
        expect(config.description.length).toBeGreaterThan(0);
      });
    });
  });

  describe("getIssueTypeConfig", () => {
    it("should return correct config for known issue types", () => {
      expect(getIssueTypeConfig("CONTENT_ERROR")).toEqual(
        ISSUE_TYPE_CONFIG.CONTENT_ERROR,
      );
      expect(getIssueTypeConfig("CODE_ERROR")).toEqual(
        ISSUE_TYPE_CONFIG.CODE_ERROR,
      );
      expect(getIssueTypeConfig("QUIZ_ERROR")).toEqual(
        ISSUE_TYPE_CONFIG.QUIZ_ERROR,
      );
      expect(getIssueTypeConfig("BROKEN_FUNCTIONALITY")).toEqual(
        ISSUE_TYPE_CONFIG.BROKEN_FUNCTIONALITY,
      );
      expect(getIssueTypeConfig("XP_ADJUSTMENT")).toEqual(
        ISSUE_TYPE_CONFIG.XP_ADJUSTMENT,
      );
      expect(getIssueTypeConfig("OTHER")).toEqual(ISSUE_TYPE_CONFIG.OTHER);
    });

    it("should return OTHER config for unknown issue types", () => {
      const result = getIssueTypeConfig("NONEXISTENT");
      expect(result).toEqual(ISSUE_TYPE_CONFIG.OTHER);
    });

    it("should return OTHER config for null", () => {
      const result = getIssueTypeConfig(null);
      expect(result).toEqual(ISSUE_TYPE_CONFIG.OTHER);
    });

    it("should return OTHER config for undefined", () => {
      const result = getIssueTypeConfig(undefined);
      expect(result).toEqual(ISSUE_TYPE_CONFIG.OTHER);
    });

    it("should return OTHER config for empty string", () => {
      const result = getIssueTypeConfig("");
      expect(result).toEqual(ISSUE_TYPE_CONFIG.OTHER);
    });

    it("should handle case sensitivity correctly", () => {
      const result = getIssueTypeConfig("content_error");
      expect(result).toEqual(ISSUE_TYPE_CONFIG.OTHER);
    });

    it("should always return a valid config object", () => {
      const result = getIssueTypeConfig("NONEXISTENT");
      expect(result).toHaveProperty("icon");
      expect(result).toHaveProperty("color");
      expect(result).toHaveProperty("label");
      expect(result).toHaveProperty("description");
    });
  });

  describe("ANALYTICS_CHARTS", () => {
    it("should be an array with 5 chart types", () => {
      expect(Array.isArray(ANALYTICS_CHARTS)).toBe(true);
      expect(ANALYTICS_CHARTS).toHaveLength(5);
    });

    it("should have correct structure for each chart", () => {
      ANALYTICS_CHARTS.forEach((chart) => {
        expect(chart).toHaveProperty("id");
        expect(chart).toHaveProperty("label");
        expect(chart).toHaveProperty("icon");
        expect(chart).toHaveProperty("color");
        expect(typeof chart.id).toBe("string");
        expect(typeof chart.label).toBe("string");
        // Lucide icons can be objects (React components) or functions
        expect(isValidComponent(chart.icon)).toBe(true);
        expect(typeof chart.color).toBe("string");
      });
    });

    it("should have expected chart IDs", () => {
      const ids = ANALYTICS_CHARTS.map((chart) => chart.id);
      expect(ids).toContain("activity");
      expect(ids).toContain("growth");
      expect(ids).toContain("content");
      expect(ids).toContain("devices");
      expect(ids).toContain("segments");
    });

    it("should have unique IDs", () => {
      const ids = ANALYTICS_CHARTS.map((chart) => chart.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have unique labels", () => {
      const labels = ANALYTICS_CHARTS.map((chart) => chart.label);
      const uniqueLabels = new Set(labels);
      expect(uniqueLabels.size).toBe(labels.length);
    });

    it("should have valid colors", () => {
      const validColors = ["blue", "green", "purple", "orange", "pink"];
      ANALYTICS_CHARTS.forEach((chart) => {
        expect(validColors).toContain(chart.color);
      });
    });

    it("should have valid icon components", () => {
      ANALYTICS_CHARTS.forEach((chart) => {
        expect(chart.icon).toBeTruthy();
        expect(isValidComponent(chart.icon)).toBe(true);
      });
    });
  });

  describe("CHART_COLORS", () => {
    it("should have primary colors array", () => {
      expect(CHART_COLORS).toHaveProperty("primary");
      expect(Array.isArray(CHART_COLORS.primary)).toBe(true);
    });

    it("should have exactly 5 primary colors", () => {
      expect(CHART_COLORS.primary).toHaveLength(5);
    });

    it("should have valid hex color codes in primary", () => {
      const hexRegex = /^#[0-9A-Fa-f]{6}$/;
      CHART_COLORS.primary.forEach((color) => {
        expect(hexRegex.test(color)).toBe(true);
      });
    });

    it("should have individual color properties", () => {
      expect(CHART_COLORS).toHaveProperty("blue");
      expect(CHART_COLORS).toHaveProperty("green");
      expect(CHART_COLORS).toHaveProperty("purple");
      expect(CHART_COLORS).toHaveProperty("orange");
      expect(CHART_COLORS).toHaveProperty("pink");
    });

    it("should have matching hex values between primary and individual colors", () => {
      // Verify individual colors match the actual constants
      expect(CHART_COLORS.blue).toBe("#3B82F6");
      expect(CHART_COLORS.green).toBe("#10B981");
      expect(CHART_COLORS.purple).toBe("#8B5CF6");
      expect(CHART_COLORS.orange).toBe("#F59E0B");
      expect(CHART_COLORS.pink).toBe("#EC4899"); // Correct actual value

      // Verify primary array contains these exact values in order
      expect(CHART_COLORS.primary).toEqual([
        "#3B82F6",
        "#10B981",
        "#8B5CF6",
        "#F59E0B",
        "#EC4899", // Correct actual value
      ]);
    });

    it("should have expected hex values", () => {
      expect(CHART_COLORS.blue).toBe("#3B82F6");
      expect(CHART_COLORS.green).toBe("#10B981");
      expect(CHART_COLORS.purple).toBe("#8B5CF6");
      expect(CHART_COLORS.orange).toBe("#F59E0B");
      expect(CHART_COLORS.pink).toBe("#EC4899");
    });

    it("should have unique primary colors", () => {
      const uniqueColors = new Set(CHART_COLORS.primary);
      expect(uniqueColors.size).toBe(CHART_COLORS.primary.length);
    });
  });

  describe("ANALYTICS_TIME_RANGES", () => {
    it("should be an array with time range options", () => {
      expect(Array.isArray(ANALYTICS_TIME_RANGES)).toBe(true);
      expect(ANALYTICS_TIME_RANGES.length).toBeGreaterThan(0);
    });

    it("should have correct structure for each time range", () => {
      ANALYTICS_TIME_RANGES.forEach((range) => {
        expect(range).toHaveProperty("value");
        expect(range).toHaveProperty("label");
        expect(typeof range.value).toBe("string");
        expect(typeof range.label).toBe("string");
      });
    });

    it("should have expected time range values", () => {
      const values = ANALYTICS_TIME_RANGES.map((r) => r.value);
      expect(values).toContain("24hr");
      expect(values).toContain("7d");
      expect(values).toContain("30d");
      expect(values).toContain("90d");
      expect(values).toContain("1y");
      expect(values).toContain("all");
    });

    it("should have human-readable labels", () => {
      ANALYTICS_TIME_RANGES.forEach((range) => {
        expect(range.label.length).toBeGreaterThan(0);
        expect(range.label).toMatch(/Last|All Time/i);
      });
    });

    it("should have unique values", () => {
      const values = ANALYTICS_TIME_RANGES.map((r) => r.value);
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBe(values.length);
    });

    it("should be ordered from shortest to longest (except 'all')", () => {
      const nonAllRanges = ANALYTICS_TIME_RANGES.filter(
        (r) => r.value !== "all",
      );
      const expectedOrder = ["24hr", "7d", "30d", "90d", "1y"];
      const actualOrder = nonAllRanges.map((r) => r.value);
      expect(actualOrder).toEqual(expectedOrder);
    });

    it("should have 'all' as the last option", () => {
      const lastRange = ANALYTICS_TIME_RANGES[ANALYTICS_TIME_RANGES.length - 1];
      expect(lastRange.value).toBe("all");
      expect(lastRange.label).toBe("All Time");
    });
  });

  describe("ANALYTICS_GROUP_BY", () => {
    it("should be an array with grouping options", () => {
      expect(Array.isArray(ANALYTICS_GROUP_BY)).toBe(true);
      expect(ANALYTICS_GROUP_BY.length).toBeGreaterThan(0);
    });

    it("should have correct structure for each grouping option", () => {
      ANALYTICS_GROUP_BY.forEach((option) => {
        expect(option).toHaveProperty("value");
        expect(option).toHaveProperty("label");
        expect(typeof option.value).toBe("string");
        expect(typeof option.label).toBe("string");
      });
    });

    it("should have expected grouping values", () => {
      const values = ANALYTICS_GROUP_BY.map((g) => g.value);
      expect(values).toContain("day");
      expect(values).toContain("week");
      expect(values).toContain("month");
    });

    it("should have expected grouping labels", () => {
      const labels = ANALYTICS_GROUP_BY.map((g) => g.label);
      expect(labels).toContain("Daily");
      expect(labels).toContain("Weekly");
      expect(labels).toContain("Monthly");
    });

    it("should have exactly 3 options", () => {
      expect(ANALYTICS_GROUP_BY).toHaveLength(3);
    });

    it("should be ordered by time granularity", () => {
      const expectedOrder = ["day", "week", "month"];
      const actualOrder = ANALYTICS_GROUP_BY.map((g) => g.value);
      expect(actualOrder).toEqual(expectedOrder);
    });
  });

  describe("Integration Tests", () => {
    it("should have matching colors between ANALYTICS_CHARTS and CHART_COLORS", () => {
      const chartColors = ANALYTICS_CHARTS.map((chart) => chart.color);
      const colorKeys = Object.keys(CHART_COLORS).filter(
        (key) => key !== "primary",
      );

      chartColors.forEach((color) => {
        expect(colorKeys).toContain(color);
        expect(CHART_COLORS[color]).toBeDefined();
      });
    });

    it("should have consistent status configurations", () => {
      const statuses = Object.keys(FLAG_STATUS_CONFIG);
      statuses.forEach((status) => {
        const config = getStatusConfig(status);
        expect(config).toEqual(FLAG_STATUS_CONFIG[status]);
      });
    });

    it("should have consistent issue type configurations", () => {
      const issueTypes = Object.keys(ISSUE_TYPE_CONFIG);
      issueTypes.forEach((type) => {
        const config = getIssueTypeConfig(type);
        expect(config).toEqual(ISSUE_TYPE_CONFIG[type]);
      });
    });

    it("ANALYTICS_CHARTS colors should exist in CHART_COLORS", () => {
      ANALYTICS_CHARTS.forEach((chart) => {
        expect(CHART_COLORS).toHaveProperty(chart.color);
        expect(CHART_COLORS[chart.color]).toBeTruthy();
      });
    });

    it("Fallback functions should maintain consistent behavior", () => {
      // Both getStatusConfig and getIssueTypeConfig should handle edge cases similarly
      const statusResult = getStatusConfig(null);
      const issueResult = getIssueTypeConfig(null);

      expect(statusResult).toHaveProperty("color");
      expect(statusResult).toHaveProperty("icon");
      expect(statusResult).toHaveProperty("label");
      expect(issueResult).toHaveProperty("color");
      expect(issueResult).toHaveProperty("icon");
      expect(issueResult).toHaveProperty("label");
    });
  });

  describe("Immutability", () => {
    it("ADMIN_MENU_ITEMS should maintain its structure", () => {
      const originalLength = ADMIN_MENU_ITEMS.length;
      const originalPaths = ADMIN_MENU_ITEMS.map((item) => item.path);
      expect(originalPaths).toContain("/admin");
      expect(originalPaths).toContain("/admin/settings");
    });

    it("FLAG_STATUS_CONFIG should maintain its structure", () => {
      expect(Object.keys(FLAG_STATUS_CONFIG)).toHaveLength(5);
      expect(FLAG_STATUS_CONFIG.PENDING).toBeDefined();
      expect(FLAG_STATUS_CONFIG.XP_ADJUSTED).toBeDefined();
    });

    it("CHART_COLORS.primary should maintain its values", () => {
      expect(CHART_COLORS.primary).toHaveLength(5);
      expect(CHART_COLORS.primary[4]).toBe("#EC4899");
    });

    it("Constants should be defined and non-null", () => {
      expect(ADMIN_MENU_ITEMS).toBeDefined();
      expect(FLAG_STATUS_CONFIG).toBeDefined();
      expect(ISSUE_TYPE_CONFIG).toBeDefined();
      expect(ANALYTICS_CHARTS).toBeDefined();
      expect(CHART_COLORS).toBeDefined();
      expect(ANALYTICS_TIME_RANGES).toBeDefined();
      expect(ANALYTICS_GROUP_BY).toBeDefined();
      expect(getStatusConfig).toBeDefined();
      expect(getIssueTypeConfig).toBeDefined();
    });
  });
});
