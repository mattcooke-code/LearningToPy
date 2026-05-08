// src/constants/__tests__/uiColors.test.js
import { describe, it, expect } from "vitest";
import { STAT_COLOR_MAP } from "@/constants/uiColors";

describe("uiColors", () => {
  describe("STAT_COLOR_MAP Structure", () => {
    it("should be an object", () => {
      expect(typeof STAT_COLOR_MAP).toBe("object");
      expect(STAT_COLOR_MAP).not.toBeNull();
    });

    it("should have all expected color keys", () => {
      expect(STAT_COLOR_MAP).toHaveProperty("yellow");
      expect(STAT_COLOR_MAP).toHaveProperty("green");
      expect(STAT_COLOR_MAP).toHaveProperty("orange");
      expect(STAT_COLOR_MAP).toHaveProperty("purple");
      expect(STAT_COLOR_MAP).toHaveProperty("blue");
      expect(STAT_COLOR_MAP).toHaveProperty("indigo");
    });

    it("should have 6 color mappings", () => {
      expect(Object.keys(STAT_COLOR_MAP)).toHaveLength(6);
    });

    it("should have bg and text properties for each color", () => {
      Object.values(STAT_COLOR_MAP).forEach((mapping) => {
        expect(mapping).toHaveProperty("bg");
        expect(mapping).toHaveProperty("text");
        expect(typeof mapping.bg).toBe("string");
        expect(typeof mapping.text).toBe("string");
      });
    });
  });

  describe("Tailwind Class Format", () => {
    it("should use valid Tailwind background classes", () => {
      const bgRegex = /^bg-\w+-100 dark:bg-\w+-900$/;

      Object.values(STAT_COLOR_MAP).forEach((mapping) => {
        expect(bgRegex.test(mapping.bg)).toBe(true);
      });
    });

    it("should use valid Tailwind text classes", () => {
      const textRegex = /^text-\w+-600 dark:text-\w+-400$/;

      Object.values(STAT_COLOR_MAP).forEach((mapping) => {
        expect(textRegex.test(mapping.text)).toBe(true);
      });
    });

    it("should have consistent color names between bg and text", () => {
      Object.entries(STAT_COLOR_MAP).forEach(([colorName, mapping]) => {
        // Extract color from classes
        const bgColor = mapping.bg.match(/bg-(\w+)-/)[1];
        const textColor = mapping.text.match(/text-(\w+)-/)[1];

        // The color name should match the key
        expect(bgColor).toBe(colorName);
        expect(textColor).toBe(colorName);
      });
    });

    it("should use light background (100) and dark background (900) variants", () => {
      Object.values(STAT_COLOR_MAP).forEach((mapping) => {
        expect(mapping.bg).toContain("-100");
        expect(mapping.bg).toContain("-900");
      });
    });

    it("should use medium text (600) and light text (400) for dark mode", () => {
      Object.values(STAT_COLOR_MAP).forEach((mapping) => {
        expect(mapping.text).toContain("-600");
        expect(mapping.text).toContain("-400");
      });
    });

    it("should support dark mode with dark: prefix", () => {
      Object.values(STAT_COLOR_MAP).forEach((mapping) => {
        expect(mapping.bg).toContain("dark:");
        expect(mapping.text).toContain("dark:");
      });
    });
  });

  describe("Color Key Naming", () => {
    it("should use lowercase color names", () => {
      Object.keys(STAT_COLOR_MAP).forEach((key) => {
        expect(key).toBe(key.toLowerCase());
      });
    });

    it("should use standard Tailwind color names", () => {
      const validTailwindColors = [
        "yellow",
        "green",
        "orange",
        "purple",
        "blue",
        "indigo",
      ];

      Object.keys(STAT_COLOR_MAP).forEach((key) => {
        expect(validTailwindColors).toContain(key);
      });
    });

    it("should not have duplicate color keys", () => {
      const keys = Object.keys(STAT_COLOR_MAP);
      const uniqueKeys = new Set(keys);
      expect(uniqueKeys.size).toBe(keys.length);
    });
  });

  describe("Dark Mode Support", () => {
    it("should have contrasting dark mode backgrounds", () => {
      Object.values(STAT_COLOR_MAP).forEach((mapping) => {
        // Light mode: -100 (very light), Dark mode: -900 (very dark)
        const bgParts = mapping.bg.split(" ");
        expect(bgParts[1]).toContain("dark:");
      });
    });

    it("should have readable dark mode text colors", () => {
      Object.values(STAT_COLOR_MAP).forEach((mapping) => {
        // Light mode: -600 (medium dark for contrast on light bg)
        // Dark mode: -400 (lighter for readability on dark bg)
        const textParts = mapping.text.split(" ");
        expect(textParts[1]).toContain("dark:");
      });
    });

    it("should have appropriate contrast ratios conceptually", () => {
      // Background -100 (very light) + text -600 (medium dark) = good contrast in light mode
      // Background -900 (very dark) + text -400 (medium light) = good contrast in dark mode
      Object.entries(STAT_COLOR_MAP).forEach(([color, mapping]) => {
        expect(mapping.bg).toMatch(/-100/);
        expect(mapping.bg).toMatch(/dark:.*-900/);
        expect(mapping.text).toMatch(/-600/);
        expect(mapping.text).toMatch(/dark:.*-400/);
      });
    });
  });

  describe("Specific Color Mappings", () => {
    it("should have correct yellow mapping", () => {
      expect(STAT_COLOR_MAP.yellow).toEqual({
        bg: "bg-yellow-100 dark:bg-yellow-900",
        text: "text-yellow-600 dark:text-yellow-400",
      });
    });

    it("should have correct green mapping", () => {
      expect(STAT_COLOR_MAP.green).toEqual({
        bg: "bg-green-100 dark:bg-green-900",
        text: "text-green-600 dark:text-green-400",
      });
    });

    it("should have correct orange mapping", () => {
      expect(STAT_COLOR_MAP.orange).toEqual({
        bg: "bg-orange-100 dark:bg-orange-900",
        text: "text-orange-600 dark:text-orange-400",
      });
    });

    it("should have correct purple mapping", () => {
      expect(STAT_COLOR_MAP.purple).toEqual({
        bg: "bg-purple-100 dark:bg-purple-900",
        text: "text-purple-600 dark:text-purple-400",
      });
    });

    it("should have correct blue mapping", () => {
      expect(STAT_COLOR_MAP.blue).toEqual({
        bg: "bg-blue-100 dark:bg-blue-900",
        text: "text-blue-600 dark:text-blue-400",
      });
    });

    it("should have correct indigo mapping", () => {
      expect(STAT_COLOR_MAP.indigo).toEqual({
        bg: "bg-indigo-100 dark:bg-indigo-900",
        text: "text-indigo-600 dark:text-indigo-400",
      });
    });
  });

  describe("Usage Scenarios", () => {
    it("should support status badge rendering pattern", () => {
      // Simulating how this would be used in a component
      const status = "green";
      const colorConfig = STAT_COLOR_MAP[status];

      expect(colorConfig).toBeDefined();
      expect(colorConfig.bg).toBe("bg-green-100 dark:bg-green-900");
      expect(colorConfig.text).toBe("text-green-600 dark:text-green-400");

      // Typical class usage
      const badgeClasses = `${colorConfig.bg} ${colorConfig.text}`;
      expect(badgeClasses).toContain("bg-green-100");
      expect(badgeClasses).toContain("text-green-600");
      expect(badgeClasses).toContain("dark:bg-green-900");
      expect(badgeClasses).toContain("dark:text-green-400");
    });

    it("should handle all flag status colors from adminConstants", () => {
      // These should match the colors used in FLAG_STATUS_CONFIG
      const statusColors = ["yellow", "blue", "green", "red", "purple"];

      statusColors.forEach((color) => {
        if (color === "red") {
          // Red isn't in STAT_COLOR_MAP, but could be added
          expect(STAT_COLOR_MAP[color]).toBeUndefined();
        } else {
          expect(STAT_COLOR_MAP[color]).toBeDefined();
        }
      });
    });

    it("should provide proper classes for dynamic color selection", () => {
      const testColors = [
        "yellow",
        "green",
        "blue",
        "purple",
        "orange",
        "indigo",
      ];

      testColors.forEach((color) => {
        const mapping = STAT_COLOR_MAP[color];
        expect(mapping).toBeDefined();
        expect(mapping.bg.split(" ")).toHaveLength(2);
        expect(mapping.text.split(" ")).toHaveLength(2);
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle missing color gracefully (consumer responsibility)", () => {
      // This tests that consumers need to handle undefined
      const nonExistentColor = "red";
      const mapping = STAT_COLOR_MAP[nonExistentColor];

      expect(mapping).toBeUndefined();

      // Consumer should have fallback like:
      const fallbackBg = mapping?.bg || "bg-gray-100 dark:bg-gray-900";
      expect(fallbackBg).toBe("bg-gray-100 dark:bg-gray-900");
    });

    it("should have consistent class spacing (single space between classes)", () => {
      Object.values(STAT_COLOR_MAP).forEach((mapping) => {
        // Should have exactly one space between light and dark classes
        expect(mapping.bg.split(" ")).toHaveLength(2);
        expect(mapping.text.split(" ")).toHaveLength(2);
        expect(mapping.bg).not.toContain("  ");
        expect(mapping.text).not.toContain("  ");
      });
    });

    it("should not contain unexpected whitespace", () => {
      Object.values(STAT_COLOR_MAP).forEach((mapping) => {
        expect(mapping.bg).toBe(mapping.bg.trim());
        expect(mapping.text).toBe(mapping.text.trim());
      });
    });
  });

  describe("Integration", () => {
    it("should complement themeConstants color progression", () => {
      // uiColors provides Tailwind classes, themeConstants provides hex values
      // They should use consistent color naming
      const statColors = Object.keys(STAT_COLOR_MAP);

      // These are implementation-focused (how to display)
      expect(statColors).toContain("yellow");
      expect(statColors).toContain("green");
      expect(statColors).toContain("blue");
      expect(statColors).toContain("purple");
      expect(statColors).toContain("orange");

      // Indigo is additional color not in base theme colors
      expect(statColors).toContain("indigo");
    });

    it("should be extensible for future colors", () => {
      // The pattern is consistent and can be extended
      const newColorMapping = {
        bg: "bg-red-100 dark:bg-red-900",
        text: "text-red-600 dark:text-red-400",
      };

      // Verify the pattern matches
      expect(newColorMapping.bg).toMatch(/^bg-\w+-100 dark:bg-\w+-900$/);
      expect(newColorMapping.text).toMatch(/^text-\w+-600 dark:text-\w+-400$/);
    });
  });

  describe("Immutability", () => {
    it("should maintain consistent structure", () => {
      expect(Object.keys(STAT_COLOR_MAP)).toHaveLength(6);
      expect(STAT_COLOR_MAP.blue.bg).toBe("bg-blue-100 dark:bg-blue-900");
      expect(STAT_COLOR_MAP.blue.text).toBe("text-blue-600 dark:text-blue-400");
    });
  });
});
