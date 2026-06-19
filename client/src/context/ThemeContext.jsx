// ThemeContext.jsx
/**
 * @fileoverview Theme context provider and hooks.
 *
 * Manages three independent theme dimensions:
 *
 * 1. **UI Theme** (light / dark) — controls the `dark` class on
 *    `document.documentElement` and persists to localStorage. Falls back to
 *    the system `prefers-color-scheme` media query when no explicit choice
 *    has been made.
 *
 * 2. **Theme Color** — a single accent colour (hex or named) derived from the
 *    user's overall course progress. Used to tint UI elements (buttons, links,
 *    progress bars) to reflect the current "level colour" (red → orange →
 *    amber → yellow → lime → green).
 *
 * 3. **Code Theme** (dark / light) — controls the colour scheme of code
 *    editors and syntax-highlighted blocks, independent of the UI theme.
 *    Persisted to localStorage.
 *
 * Also exposes progression-based helpers: `updateThemeFromCourseProgress`
 * maps a percentage to a theme colour, and `getModuleThemeColor` maps a
 * module-level percentage to a colour band.
 *
 * @module ThemeContext
 * @requires react
 * @requires ../constants/themeConstants
 * @requires ../utils
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { THEME_COLORS } from "../constants/themeConstants";
import {
  resolveCourseThemeColor,
  getStoredThemeColor,
  setStoredThemeColor,
  resetStoredThemeColor,
  applyThemeColor,
  DEFAULT_THEME_COLOR,
} from "../utils";

// ---------------------------------------------------------------------------
// Context Definition
// ---------------------------------------------------------------------------

/**
 * React Context holding all theme state and actions.
 *
 * @type {React.Context<object|null>}
 */
const ThemeContext = createContext();

// ---------------------------------------------------------------------------
// Consumer Hook (declared early so the provider can reference it if needed)
// ---------------------------------------------------------------------------

/**
 * Access the theme context. Must be called from a component wrapped in
 * `<ThemeProvider>`.
 *
 * @returns {object} The theme context value (see provider JSDoc for shape).
 * @throws {Error} If called outside of a ThemeProvider.
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Available UI theme modes.
 *
 * @enum {string}
 */
const UI_THEMES = {
  LIGHT: "light",
  DARK: "dark",
};

/**
 * Available code editor colour schemes.
 *
 * @enum {string}
 */
const CODE_THEMES = {
  DARK: "dark",
  LIGHT: "light",
};

// ---------------------------------------------------------------------------
// ThemeProvider Component
// ---------------------------------------------------------------------------

/**
 * Provider that manages UI theme, accent colour, and code theme.
 *
 * All three preferences are persisted to localStorage and rehydrated on mount.
 *
 * **State managed:**
 * - `uiTheme` — `"light"` or `"dark"`
 * - `themeColor` — an accent colour from `THEME_COLORS`
 * - `codeTheme` — `"dark"` or `"light"` for code blocks
 * - `isDarkMode` — derived boolean for quick dark/light checks
 *
 * **Actions exposed via context:**
 * - `updateThemeFromCourseProgress(percentage)` — set theme colour by overall progress
 * - `getModuleThemeColor(percentage)` — get a colour band for module-level progress
 * - `setUiTheme(theme)` — explicitly set light/dark
 * - `toggleDarkMode()` — flip between light and dark
 * - `setCodeTheme(theme)` — explicitly set code theme
 * - `toggleCodeTheme()` — flip code theme
 * - `resetTheme()` — restore all defaults and clear localStorage
 * - `setDefaultTheme()` — reset only the theme colour to default
 *
 * Also exposes the raw `THEME_COLORS`, `UI_THEMES`, and `CODE_THEMES`
 * constant objects for consumers that need to reference the full palettes.
 *
 * @param {{ children: React.ReactNode }} props
 * @returns {JSX.Element}
 */
export const ThemeProvider = ({ children }) => {
  // ---------------------------------------------------------------------------
  // State (all lazily initialised from localStorage)
  // ---------------------------------------------------------------------------

  /**
   * UI theme: "light" or "dark".
   * Initialised from localStorage; falls back to `UI_THEMES.LIGHT`.
   *
   * @type {[string, Function]}
   */
  const [uiTheme, setUiTheme] = useState(() => {
    const saved = localStorage.getItem("uiTheme");
    if (saved && Object.values(UI_THEMES).includes(saved)) {
      return saved;
    }
    return UI_THEMES.LIGHT;
  });

  /**
   * Accent colour used across the UI.
   * Initialised from localStorage; falls back to `THEME_COLORS.DEFAULT`.
   *
   * @type {[string, Function]}
   */
  const [themeColor, setThemeColor] = useState(getStoredThemeColor);

  /**
   * Code editor colour scheme: "dark" or "light".
   * Initialised from localStorage; falls back to `CODE_THEMES.DARK`.
   *
   * @type {[string, Function]}
   */
  const [codeTheme, setCodeTheme] = useState(() => {
    const saved = localStorage.getItem("codeTheme");
    return saved || CODE_THEMES.DARK;
  });

  /**
   * Derived boolean — true when the UI is in dark mode.
   *
   * @type {[boolean, Function]}
   */
  const [isDarkMode, setIsDarkMode] = useState(false);

  // ---------------------------------------------------------------------------
  // System Preference Detection
  // ---------------------------------------------------------------------------

  /**
   * Check whether the operating system / browser is set to dark mode.
   *
   * @returns {boolean} True if the system `prefers-color-scheme` is "dark".
   */
  const checkSystemPreference = useCallback(() => {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }, []);

  // ---------------------------------------------------------------------------
  // DOM Manipulation
  // ---------------------------------------------------------------------------

  /**
   * Apply or remove the `dark` class on the root `<html>` element and update
   * the `isDarkMode` state.
   *
   * @param {string} theme - One of `UI_THEMES.LIGHT` or `UI_THEMES.DARK`.
   */
  const applyTheme = useCallback((theme) => {
    const root = document.documentElement;
    const shouldBeDark = theme === UI_THEMES.DARK;

    if (shouldBeDark) {
      root.classList.add("dark");
      setIsDarkMode(true);
    } else {
      root.classList.remove("dark");
      setIsDarkMode(false);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Persistence Effects
  // ---------------------------------------------------------------------------

  /**
   * Re-apply the theme class and persist to localStorage whenever `uiTheme`
   * changes.
   */
  useEffect(() => {
    applyTheme(uiTheme);
    localStorage.setItem("uiTheme", uiTheme);
  }, [uiTheme, applyTheme]);

  /**
   * Persist `themeColor` and sync it to the DOM (as `--theme-color` /
   * `--theme-hover-color` CSS custom properties) whenever it changes.
   */
  useEffect(() => {
    setStoredThemeColor(themeColor);
  }, [themeColor]);

  /**
   * Persist `codeTheme` to localStorage on change.
   */
  useEffect(() => {
    localStorage.setItem("codeTheme", codeTheme);
  }, [codeTheme]);

  // ---------------------------------------------------------------------------
  // Public API — Theme Color
  // ---------------------------------------------------------------------------

  /**
   * Derive and set the global theme colour from the user's overall course
   * completion percentage.
   *
   * Delegates to `resolveCourseThemeColor` in /utils, which maps percentage
   * bands to the appropriate colour constant.
   *
   * @param {number} courseProgressPercentage - A value between 0 and 100.
   */
  const updateThemeFromCourseProgress = useCallback(
    (courseProgressPercentage) => {
      setThemeColor(resolveCourseThemeColor(courseProgressPercentage));
    },
    [],
  );

  /**
   * Get a theme colour constant for a module-level or lesson-level progress
   * percentage. Unlike `updateThemeFromCourseProgress` this does not set
   * global state — it simply returns the appropriate colour for local use
   * (e.g. tinting a module card).
   *
   * **Mapping:**
   * - 0–25%  → `THEME_COLORS.RED`
   * - 26–40% → `THEME_COLORS.ORANGE`
   * - 41–55% → `THEME_COLORS.AMBER`
   * - 56–70% → `THEME_COLORS.YELLOW`
   * - 71–85% → `THEME_COLORS.LIME`
   * - 86–100% → `THEME_COLORS.GREEN`
   *
   * @param {number} moduleLessonProgress - A value between 0 and 100.
   * @returns {string} A theme colour constant.
   */
  const getModuleThemeColor = useCallback((moduleLessonProgress) => {
    if (moduleLessonProgress <= 25) return THEME_COLORS.RED;
    if (moduleLessonProgress <= 40) return THEME_COLORS.ORANGE;
    if (moduleLessonProgress <= 55) return THEME_COLORS.AMBER;
    if (moduleLessonProgress <= 70) return THEME_COLORS.YELLOW;
    if (moduleLessonProgress <= 85) return THEME_COLORS.LIME;
    return THEME_COLORS.GREEN;
  }, []);

  /**
   * Reset the theme colour to its default value without affecting UI or code
   * theme preferences.
   */
  const setDefaultTheme = useCallback(() => {
    setThemeColor(DEFAULT_THEME_COLOR);
    resetStoredThemeColor();
  }, []);

  // ---------------------------------------------------------------------------
  // Public API — UI Theme (Light / Dark)
  // ---------------------------------------------------------------------------

  /**
   * Explicitly set the UI theme to `"light"` or `"dark"`.
   *
   * Values outside `UI_THEMES` are silently ignored.
   *
   * @param {string} theme - `UI_THEMES.LIGHT` or `UI_THEMES.DARK`.
   */
  const setUiThemeExplicit = useCallback((theme) => {
    if (Object.values(UI_THEMES).includes(theme)) {
      setUiTheme(theme);
    }
  }, []);

  /**
   * Toggle the UI theme between light and dark.
   *
   * Note: this ignores system preference. After toggling the theme is locked
   * to the user's explicit choice.
   */
  const toggleDarkMode = useCallback(() => {
    setUiTheme((prev) =>
      prev === UI_THEMES.DARK ? UI_THEMES.LIGHT : UI_THEMES.DARK,
    );
  }, []);

  // ---------------------------------------------------------------------------
  // Public API — Code Theme
  // ---------------------------------------------------------------------------

  /**
   * Toggle the code editor theme between dark and light.
   */
  const toggleCodeTheme = useCallback(() => {
    setCodeTheme((prev) =>
      prev === CODE_THEMES.DARK ? CODE_THEMES.LIGHT : CODE_THEMES.DARK,
    );
  }, []);

  /**
   * Explicitly set the code theme.
   *
   * Values outside `CODE_THEMES` are silently ignored.
   *
   * @param {string} theme - `CODE_THEMES.DARK` or `CODE_THEMES.LIGHT`.
   */
  const setCodeThemeExplicit = useCallback((theme) => {
    if (Object.values(CODE_THEMES).includes(theme)) {
      setCodeTheme(theme);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Public API — Reset
  // ---------------------------------------------------------------------------

  /**
   * Reset all theme settings to their defaults and clear all theme-related
   * localStorage keys.
   *
   * Used primarily during logout to ensure the next user sees the default
   * theme.
   */
  const resetTheme = useCallback(() => {
    setThemeColor(DEFAULT_THEME_COLOR);
    setCodeTheme(CODE_THEMES.DARK);
    setUiTheme(UI_THEMES.LIGHT);
    localStorage.removeItem("themeColor");
    localStorage.removeItem("codeTheme");
    localStorage.removeItem("uiTheme");
    applyThemeColor(DEFAULT_THEME_COLOR);
  }, []);

  /**
   * Attach `resetTheme` to the global `window` object so the AuthContext
   * logout flow can call it without importing ThemeContext (which would
   * create a circular dependency risk).
   *
   * Cleaned up on unmount.
   */
  useEffect(() => {
    window.resetTheme = resetTheme;
    return () => {
      window.resetTheme = null;
    };
  }, [resetTheme]);

  // ---------------------------------------------------------------------------
  // Context Value
  // ---------------------------------------------------------------------------

  /**
   * The complete set of values and functions exposed to consumers via
   * `useTheme()`.
   *
   * @type {object}
   */
  const value = {
    // Main theme colour
    /** @type {string} Current accent colour */
    themeColor,
    /** @type {Function} updateThemeFromCourseProgress(percentage) */
    updateThemeFromCourseProgress,
    /** @type {Function} getModuleThemeColor(percentage) */
    getModuleThemeColor,
    /** @type {Function} resetTheme() */
    resetTheme,
    /** @type {Function} setDefaultTheme() */
    setDefaultTheme,
    /** @type {object} Full colour constants object */
    THEME_COLORS,

    // UI Theme (dark / light mode)
    /** @type {string} Current UI theme — "light" or "dark" */
    uiTheme,
    /** @type {boolean} Convenience flag for dark mode checks */
    isDarkMode,
    /** @type {Function} setUiTheme(theme) */
    setUiTheme: setUiThemeExplicit,
    /** @type {Function} toggleDarkMode() */
    toggleDarkMode,
    /** @type {object} UI_THEMES constants */
    UI_THEMES,

    // Code theme
    /** @type {string} Current code theme — "dark" or "light" */
    codeTheme,
    /** @type {Function} toggleCodeTheme() */
    toggleCodeTheme,
    /** @type {Function} setCodeTheme(theme) */
    setCodeTheme: setCodeThemeExplicit,
    /** @type {boolean} Convenience flag: true when code theme is dark */
    isCodeDark: codeTheme === CODE_THEMES.DARK,
    /** @type {object} CODE_THEMES constants */
    CODE_THEMES,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
