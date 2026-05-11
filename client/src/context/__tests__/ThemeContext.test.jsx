import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { ThemeProvider, useTheme } from "../ThemeContext";

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock matchMedia for system preference detection
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe("ThemeContext", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();

    // Reset document.documentElement classes
    document.documentElement.classList.remove("dark");

    // Reset window.resetTheme
    window.resetTheme = null;
  });

  afterEach(() => {
    window.resetTheme = null;
  });

  describe("useTheme throws outside provider", () => {
    it("throws error when used outside ThemeProvider", () => {
      expect(() => {
        renderHook(() => useTheme());
      }).toThrow("useTheme must be used within a ThemeProvider");
    });
  });

  describe("Default Values", () => {
    it("provides default light UI theme", () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      expect(result.current.uiTheme).toBe("light");
      expect(result.current.isDarkMode).toBe(false);
    });

    it("provides default theme color", () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      expect(result.current.themeColor).toBeDefined();
      expect(typeof result.current.themeColor).toBe("string");
    });

    it("provides default code theme (dark)", () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      expect(result.current.codeTheme).toBe("dark");
      expect(result.current.isCodeDark).toBe(true);
    });
  });

  describe("localStorage Restoration", () => {
    it("restores UI theme from localStorage", () => {
      localStorageMock.setItem("uiTheme", "dark");

      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      expect(result.current.uiTheme).toBe("dark");
      expect(result.current.isDarkMode).toBe(true);
    });

    it("restores theme color from localStorage", () => {
      localStorageMock.setItem("themeColor", "#ff0000");

      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      expect(result.current.themeColor).toBe("#ff0000");
    });

    it("restores code theme from localStorage", () => {
      localStorageMock.setItem("codeTheme", "light");

      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      expect(result.current.codeTheme).toBe("light");
      expect(result.current.isCodeDark).toBe(false);
    });

    it("ignores invalid UI theme values", () => {
      localStorageMock.setItem("uiTheme", "invalid");

      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      expect(result.current.uiTheme).toBe("light"); // Falls back to default
    });
  });

  describe("Dark Mode Toggle", () => {
    it("toggles from light to dark", () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      act(() => {
        result.current.toggleDarkMode();
      });

      expect(result.current.uiTheme).toBe("dark");
      expect(result.current.isDarkMode).toBe(true);
      expect(document.documentElement.classList.contains("dark")).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith("uiTheme", "dark");
    });

    it("toggles from dark to light", () => {
      localStorageMock.setItem("uiTheme", "dark");

      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      act(() => {
        result.current.toggleDarkMode();
      });

      expect(result.current.uiTheme).toBe("light");
      expect(result.current.isDarkMode).toBe(false);
      expect(document.documentElement.classList.contains("dark")).toBe(false);
    });

    it("can toggle multiple times", () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      act(() => result.current.toggleDarkMode());
      expect(result.current.isDarkMode).toBe(true);

      act(() => result.current.toggleDarkMode());
      expect(result.current.isDarkMode).toBe(false);

      act(() => result.current.toggleDarkMode());
      expect(result.current.isDarkMode).toBe(true);
    });
  });

  describe("Set UI Theme Explicitly", () => {
    it("sets theme to dark explicitly", () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      act(() => {
        result.current.setUiTheme("dark");
      });

      expect(result.current.uiTheme).toBe("dark");
    });

    it("sets theme to light explicitly", () => {
      localStorageMock.setItem("uiTheme", "dark");

      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      act(() => {
        result.current.setUiTheme("light");
      });

      expect(result.current.uiTheme).toBe("light");
    });

    it("ignores invalid theme values", () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      act(() => {
        result.current.setUiTheme("invalid");
      });

      expect(result.current.uiTheme).toBe("light"); // Unchanged
    });
  });

  describe("Code Theme", () => {
    it("toggles code theme from dark to light", () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      act(() => {
        result.current.toggleCodeTheme();
      });

      expect(result.current.codeTheme).toBe("light");
      expect(result.current.isCodeDark).toBe(false);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "codeTheme",
        "light",
      );
    });

    it("toggles code theme from light to dark", () => {
      localStorageMock.setItem("codeTheme", "light");

      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      act(() => {
        result.current.toggleCodeTheme();
      });

      expect(result.current.codeTheme).toBe("dark");
      expect(result.current.isCodeDark).toBe(true);
    });

    it("sets code theme explicitly", () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      act(() => {
        result.current.setCodeTheme("light");
      });

      expect(result.current.codeTheme).toBe("light");
    });

    it("ignores invalid code theme values", () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      act(() => {
        result.current.setCodeTheme("invalid");
      });

      expect(result.current.codeTheme).toBe("dark"); // Unchanged
    });
  });

  describe("Update Theme from Course Progress", () => {
    it("updates theme color based on progress", () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      act(() => {
        result.current.updateThemeFromCourseProgress(50);
      });

      expect(result.current.themeColor).toBeDefined();
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "themeColor",
        expect.any(String),
      );
    });

    it("persists theme color to localStorage", () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      act(() => {
        result.current.updateThemeFromCourseProgress(75);
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "themeColor",
        result.current.themeColor,
      );
    });
  });

  describe("Get Module Theme Color", () => {
    it("returns red for 0-25% progress", () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      expect(result.current.getModuleThemeColor(0)).toBeDefined();
      expect(result.current.getModuleThemeColor(25)).toBeDefined();
      // Color should be the same for both (both in 0-25% range)
      expect(result.current.getModuleThemeColor(0)).toBe(
        result.current.getModuleThemeColor(25),
      );
    });

    it("returns green for 86-100% progress", () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      expect(result.current.getModuleThemeColor(86)).toBeDefined();
      expect(result.current.getModuleThemeColor(100)).toBeDefined();
      expect(result.current.getModuleThemeColor(86)).toBe(
        result.current.getModuleThemeColor(100),
      );
    });

    it("returns different colors for different ranges", () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      const lowColor = result.current.getModuleThemeColor(10);
      const midColor = result.current.getModuleThemeColor(50);
      const highColor = result.current.getModuleThemeColor(90);

      // Different progress ranges should give different colors
      expect(lowColor).not.toBe(midColor);
      expect(midColor).not.toBe(highColor);
    });
  });

  describe("Reset Theme", () => {
    it("resets all themes to defaults", () => {
      localStorageMock.setItem("uiTheme", "dark");
      localStorageMock.setItem("themeColor", "#123456");
      localStorageMock.setItem("codeTheme", "light");

      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      act(() => {
        result.current.resetTheme();
      });

      expect(result.current.uiTheme).toBe("light");
      expect(result.current.codeTheme).toBe("dark");
      expect(result.current.isDarkMode).toBe(false);
      expect(result.current.isCodeDark).toBe(true);

      expect(localStorageMock.removeItem).toHaveBeenCalledWith("themeColor");
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("codeTheme");
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("uiTheme");
    });

    it("exposes resetTheme on window", () => {
      renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      expect(window.resetTheme).toBeDefined();
      expect(typeof window.resetTheme).toBe("function");
    });

    it("cleans up window.resetTheme on unmount", () => {
      const { unmount } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      unmount();

      expect(window.resetTheme).toBeNull();
    });
  });

  describe("Set Default Theme", () => {
    it("resets only theme color to default", () => {
      localStorageMock.setItem("themeColor", "#123456");

      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      const currentUiTheme = result.current.uiTheme;
      const currentCodeTheme = result.current.codeTheme;

      act(() => {
        result.current.setDefaultTheme();
      });

      // Theme color should change
      expect(result.current.themeColor).not.toBe("#123456");

      // UI and code themes should remain unchanged
      expect(result.current.uiTheme).toBe(currentUiTheme);
      expect(result.current.codeTheme).toBe(currentCodeTheme);
    });
  });

  describe("Constants Export", () => {
    it("exposes THEME_COLORS", () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      expect(result.current.THEME_COLORS).toBeDefined();
      expect(typeof result.current.THEME_COLORS).toBe("object");
    });

    it("exposes UI_THEMES", () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      expect(result.current.UI_THEMES).toBeDefined();
      expect(result.current.UI_THEMES.LIGHT).toBe("light");
      expect(result.current.UI_THEMES.DARK).toBe("dark");
    });

    it("exposes CODE_THEMES", () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      expect(result.current.CODE_THEMES).toBeDefined();
      expect(result.current.CODE_THEMES.DARK).toBe("dark");
      expect(result.current.CODE_THEMES.LIGHT).toBe("light");
    });
  });

  describe("Persistence", () => {
    it("saves UI theme to localStorage on change", () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      act(() => {
        result.current.toggleDarkMode();
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith("uiTheme", "dark");
    });

    it("saves code theme to localStorage on change", () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      act(() => {
        result.current.toggleCodeTheme();
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "codeTheme",
        "light",
      );
    });

    it("saves theme color to localStorage on change", () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      act(() => {
        result.current.updateThemeFromCourseProgress(50);
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "themeColor",
        expect.any(String),
      );
    });
  });

  describe("DOM Manipulation", () => {
    it("adds dark class to documentElement when dark mode", () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      act(() => {
        result.current.toggleDarkMode();
      });

      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });

    it("removes dark class from documentElement when light mode", () => {
      localStorageMock.setItem("uiTheme", "dark");

      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      // Should start with dark class
      expect(document.documentElement.classList.contains("dark")).toBe(true);

      act(() => {
        result.current.toggleDarkMode();
      });

      expect(document.documentElement.classList.contains("dark")).toBe(false);
    });
  });
});
