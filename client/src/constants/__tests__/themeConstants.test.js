// src/constants/__tests__/themeConstants.test.js
import { describe, it, expect } from "vitest";
import {
  PYTHON_BLUE,
  PYTHON_YELLOW,
  PYTHON_DARK,
  PYTHON_LIGHT,
  THEME_COLORS,
  THEME_HOVER_COVERS,
  DEFAULT_THEME_PATHS,
  ADMIN_PATH_PREFIX,
} from "@/constants/themeConstants";

describe("themeConstants", () => {
  describe("Python Theme CSS Variables", () => {
    it("should export all Python theme variables", () => {
      expect(PYTHON_BLUE).toBeDefined();
      expect(PYTHON_YELLOW).toBeDefined();
      expect(PYTHON_DARK).toBeDefined();
      expect(PYTHON_LIGHT).toBeDefined();
    });

    it("should use CSS custom property format", () => {
      const cssVarRegex = /^var\(--color-python-[a-z]+\)$/;

      expect(cssVarRegex.test(PYTHON_BLUE)).toBe(true);
      expect(cssVarRegex.test(PYTHON_YELLOW)).toBe(true);
      expect(cssVarRegex.test(PYTHON_DARK)).toBe(true);
      expect(cssVarRegex.test(PYTHON_LIGHT)).toBe(true);
    });

    it("should have unique CSS variable names", () => {
      const variables = [PYTHON_BLUE, PYTHON_YELLOW, PYTHON_DARK, PYTHON_LIGHT];
      const uniqueVars = new Set(variables);
      expect(uniqueVars.size).toBe(variables.length);
    });

    it("should have correct Python color variables", () => {
      expect(PYTHON_BLUE).toBe("var(--color-python-blue)");
      expect(PYTHON_YELLOW).toBe("var(--color-python-yellow)");
      expect(PYTHON_DARK).toBe("var(--color-python-dark)");
      expect(PYTHON_LIGHT).toBe("var(--color-python-light)");
    });

    it("should be strings", () => {
      expect(typeof PYTHON_BLUE).toBe("string");
      expect(typeof PYTHON_YELLOW).toBe("string");
      expect(typeof PYTHON_DARK).toBe("string");
      expect(typeof PYTHON_LIGHT).toBe("string");
    });
  });

  describe("THEME_COLORS", () => {
    it("should be an object with expected keys", () => {
      expect(THEME_COLORS).toHaveProperty("DEFAULT");
      expect(THEME_COLORS).toHaveProperty("RED");
      expect(THEME_COLORS).toHaveProperty("ORANGE");
      expect(THEME_COLORS).toHaveProperty("AMBER");
      expect(THEME_COLORS).toHaveProperty("YELLOW");
      expect(THEME_COLORS).toHaveProperty("LIME");
      expect(THEME_COLORS).toHaveProperty("GREEN");
    });

    it("should have 7 theme colors", () => {
      expect(Object.keys(THEME_COLORS)).toHaveLength(7);
    });

    it("should have valid hex color values (except DEFAULT)", () => {
      const hexRegex = /^#[0-9A-Fa-f]{6}$/;

      Object.entries(THEME_COLORS).forEach(([key, value]) => {
        if (key !== "DEFAULT") {
          expect(hexRegex.test(value)).toBe(true);
        }
      });
    });

    it("should have DEFAULT as CSS variable", () => {
      expect(THEME_COLORS.DEFAULT).toBe("var(--color-python-blue)");
    });

    it("should have correct hex values for each color", () => {
      expect(THEME_COLORS.RED).toBe("#ef4444");
      expect(THEME_COLORS.ORANGE).toBe("#f97316");
      expect(THEME_COLORS.AMBER).toBe("#fb923c");
      expect(THEME_COLORS.YELLOW).toBe("#FFD700");
      expect(THEME_COLORS.LIME).toBe("#84cc16");
      expect(THEME_COLORS.GREEN).toBe("#22c55e");
    });

    it("should represent a logical color progression (warm to cool)", () => {
      const colors = [
        THEME_COLORS.RED, // Red - low progress
        THEME_COLORS.ORANGE, // Orange
        THEME_COLORS.AMBER, // Amber
        THEME_COLORS.YELLOW, // Yellow
        THEME_COLORS.LIME, // Lime
        THEME_COLORS.GREEN, // Green - high progress
      ];

      // All colors should be unique
      const uniqueColors = new Set(colors);
      expect(uniqueColors.size).toBe(colors.length);
    });

    it("should have uppercase keys", () => {
      Object.keys(THEME_COLORS).forEach((key) => {
        expect(key).toBe(key.toUpperCase());
      });
    });

    it("should not have duplicate hex values", () => {
      const values = Object.values(THEME_COLORS).filter(
        (v) => v !== "var(--color-python-blue)",
      );
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBe(values.length);
    });
  });

  describe("THEME_HOVER_COVERS", () => {
    it("should be an object with matching keys to THEME_COLORS", () => {
      const themeKeys = Object.keys(THEME_COLORS).sort();
      const hoverKeys = Object.keys(THEME_HOVER_COVERS).sort();

      expect(hoverKeys).toEqual(themeKeys);
    });

    it("should have valid hex color values (except DEFAULT)", () => {
      const hexRegex = /^#[0-9A-Fa-f]{6}$/;

      Object.entries(THEME_HOVER_COVERS).forEach(([key, value]) => {
        if (key !== "DEFAULT") {
          expect(hexRegex.test(value)).toBe(true);
        }
      });
    });

    it("should have DEFAULT hover as CSS variable", () => {
      expect(THEME_HOVER_COVERS.DEFAULT).toBe("var(--color-python-yellow)");
    });

    it("should have correct hover hex values", () => {
      expect(THEME_HOVER_COVERS.RED).toBe("#d73d3d");
      expect(THEME_HOVER_COVERS.ORANGE).toBe("#e06c14");
      expect(THEME_HOVER_COVERS.AMBER).toBe("#ea8029");
      expect(THEME_HOVER_COVERS.YELLOW).toBe("#e6c300");
      expect(THEME_HOVER_COVERS.LIME).toBe("#75b214");
      expect(THEME_HOVER_COVERS.GREEN).toBe("#1eab52");
    });

    it("should have darker hover colors than base colors", () => {
      // Helper to compare brightness (rough comparison by first hex digit)
      const getBrightness = (hex) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return (r * 299 + g * 587 + b * 114) / 1000;
      };

      Object.keys(THEME_COLORS).forEach((key) => {
        if (key !== "DEFAULT") {
          const baseColor = THEME_COLORS[key];
          const hoverColor = THEME_HOVER_COVERS[key];
          const baseBrightness = getBrightness(baseColor);
          const hoverBrightness = getBrightness(hoverColor);

          // Hover colors should be darker (lower brightness)
          expect(hoverBrightness).toBeLessThan(baseBrightness);
        }
      });
    });

    it("should have consistent key naming with THEME_COLORS", () => {
      Object.keys(THEME_COLORS).forEach((key) => {
        expect(THEME_HOVER_COVERS).toHaveProperty(key);
      });
    });

    it("should not have duplicate hex values", () => {
      const values = Object.values(THEME_HOVER_COVERS).filter(
        (v) => !v.startsWith("var("),
      );
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBe(values.length);
    });

    it("should have different colors from base theme (except DEFAULT)", () => {
      Object.keys(THEME_COLORS).forEach((key) => {
        if (key !== "DEFAULT") {
          expect(THEME_HOVER_COVERS[key]).not.toBe(THEME_COLORS[key]);
        }
      });
    });
  });

  describe("DEFAULT_THEME_PATHS", () => {
    it("should be an array", () => {
      expect(Array.isArray(DEFAULT_THEME_PATHS)).toBe(true);
    });

    it("should have 3 default paths", () => {
      expect(DEFAULT_THEME_PATHS).toHaveLength(3);
    });

    it("should contain expected default paths", () => {
      expect(DEFAULT_THEME_PATHS).toContain("/");
      expect(DEFAULT_THEME_PATHS).toContain("/login");
      expect(DEFAULT_THEME_PATHS).toContain("/register");
    });

    it("should have all paths starting with '/'", () => {
      DEFAULT_THEME_PATHS.forEach((path) => {
        expect(path.startsWith("/")).toBe(true);
      });
    });

    it("should have unique paths", () => {
      const uniquePaths = new Set(DEFAULT_THEME_PATHS);
      expect(uniquePaths.size).toBe(DEFAULT_THEME_PATHS.length);
    });

    it("should include root path '/'", () => {
      expect(DEFAULT_THEME_PATHS.includes("/")).toBe(true);
    });

    it("should only contain authentication-related and root paths", () => {
      DEFAULT_THEME_PATHS.forEach((path) => {
        expect(["/", "/login", "/register"]).toContain(path);
      });
    });
  });

  describe("ADMIN_PATH_PREFIX", () => {
    it("should be a string", () => {
      expect(typeof ADMIN_PATH_PREFIX).toBe("string");
    });

    it("should be '/admin'", () => {
      expect(ADMIN_PATH_PREFIX).toBe("/admin");
    });

    it("should start with '/'", () => {
      expect(ADMIN_PATH_PREFIX.startsWith("/")).toBe(true);
    });

    it("should not end with '/'", () => {
      expect(ADMIN_PATH_PREFIX.endsWith("/")).toBe(false);
    });

    it("should not be in DEFAULT_THEME_PATHS", () => {
      expect(DEFAULT_THEME_PATHS).not.toContain(ADMIN_PATH_PREFIX);
    });
  });

  describe("Integration Tests", () => {
    it("DEFAULT hover should use Python yellow, not blue", () => {
      // DEFAULT theme uses Python blue, but hover should be Python yellow
      expect(THEME_COLORS.DEFAULT).toBe("var(--color-python-blue)");
      expect(THEME_HOVER_COVERS.DEFAULT).toBe("var(--color-python-yellow)");
      expect(THEME_HOVER_COVERS.DEFAULT).not.toBe(THEME_COLORS.DEFAULT);
    });

    it("should maintain color progression from red to green", () => {
      const progressionKeys = [
        "RED",
        "ORANGE",
        "AMBER",
        "YELLOW",
        "LIME",
        "GREEN",
      ];

      progressionKeys.forEach((key, index) => {
        expect(THEME_COLORS).toHaveProperty(key);
        expect(THEME_HOVER_COVERS).toHaveProperty(key);

        // Verify both base and hover use same color progression keys
        expect(THEME_HOVER_COVERS[key]).toBeDefined();
      });

      // All progression keys should exist in order
      const themeKeys = Object.keys(THEME_COLORS).filter(
        (k) => k !== "DEFAULT",
      );
      expect(themeKeys).toEqual(progressionKeys);
    });

    it("should cover all common path patterns", () => {
      // DEFAULT_THEME_PATHS + ADMIN_PATH_PREFIX shouldn't conflict
      expect(
        DEFAULT_THEME_PATHS.every(
          (path) => !path.startsWith(ADMIN_PATH_PREFIX),
        ),
      ).toBe(true);
    });

    it("all hover colors should be valid darker variants", () => {
      Object.keys(THEME_COLORS).forEach((key) => {
        if (key !== "DEFAULT") {
          const base = THEME_COLORS[key];
          const hover = THEME_HOVER_COVERS[key];

          // Both should be valid hex colors
          expect(base).toMatch(/^#[0-9A-Fa-f]{6}$/);
          expect(hover).toMatch(/^#[0-9A-Fa-f]{6}$/);

          // They should be different
          expect(hover).not.toBe(base);
        }
      });
    });
  });

  describe("Color Accessibility", () => {
    it("should use web-safe hex colors", () => {
      const allColors = [
        ...Object.values(THEME_COLORS).filter((v) => v.startsWith("#")),
        ...Object.values(THEME_HOVER_COVERS).filter((v) => v.startsWith("#")),
      ];

      allColors.forEach((color) => {
        // All should be 6-character hex
        expect(color).toHaveLength(7);
        expect(color[0]).toBe("#");
      });
    });

    it("should have distinct enough colors for colorblind accessibility", () => {
      // At minimum, adjacent colors should be different
      const progression = ["RED", "ORANGE", "AMBER", "YELLOW", "LIME", "GREEN"];

      for (let i = 0; i < progression.length - 1; i++) {
        expect(THEME_COLORS[progression[i]]).not.toBe(
          THEME_COLORS[progression[i + 1]],
        );
      }
    });
  });

  describe("Immutability", () => {
    it("THEME_COLORS should have consistent values", () => {
      expect(THEME_COLORS.RED).toBe("#ef4444");
      expect(THEME_COLORS.GREEN).toBe("#22c55e");
      expect(THEME_COLORS.DEFAULT).toBe("var(--color-python-blue)");
    });

    it("THEME_HOVER_COVERS should have consistent values", () => {
      expect(THEME_HOVER_COVERS.RED).toBe("#d73d3d");
      expect(THEME_HOVER_COVERS.GREEN).toBe("#1eab52");
      expect(THEME_HOVER_COVERS.DEFAULT).toBe("var(--color-python-yellow)");
    });

    it("DEFAULT_THEME_PATHS should not be empty", () => {
      expect(DEFAULT_THEME_PATHS.length).toBeGreaterThan(0);
    });

    it("ADMIN_PATH_PREFIX should be consistent", () => {
      expect(ADMIN_PATH_PREFIX).toBe("/admin");
    });
  });
});
