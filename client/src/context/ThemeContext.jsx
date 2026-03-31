import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { THEME_COLORS } from "../constants/themeConstants";
import { resolveCourseThemeColor } from "../utils";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

// UI Theme modes
const UI_THEMES = {
  LIGHT: "light",
  DARK: "dark",
};

// Code theme constants
const CODE_THEMES = {
  DARK: "dark",
  LIGHT: "light",
};

export const ThemeProvider = ({ children }) => {
  // Initialize UI theme from localStorage or system preference
  const [uiTheme, setUiTheme] = useState(() => {
    const saved = localStorage.getItem("uiTheme");
    if (saved && Object.values(UI_THEMES).includes(saved)) {
      return saved;
    }
    return UI_THEMES.LIGHT;
  });

  // Initialize theme color from localStorage
  const [themeColor, setThemeColor] = useState(() => {
    const saved = localStorage.getItem("themeColor");
    return saved || THEME_COLORS.DEFAULT;
  });

  // Initialize code theme from localStorage
  const [codeTheme, setCodeTheme] = useState(() => {
    const saved = localStorage.getItem("codeTheme");
    return saved || CODE_THEMES.DARK;
  });

  // Track if dark mode is active (considering system preference)
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check system preference
  const checkSystemPreference = useCallback(() => {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }, []);

  // Apply theme to document
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

  // Update theme when uiTheme changes
  useEffect(() => {
    applyTheme(uiTheme);
    localStorage.setItem("uiTheme", uiTheme);
  }, [uiTheme, applyTheme]);

  // Persist theme color to localStorage
  useEffect(() => {
    localStorage.setItem("themeColor", themeColor);
  }, [themeColor]);

  // Persist code theme to localStorage
  useEffect(() => {
    localStorage.setItem("codeTheme", codeTheme);
  }, [codeTheme]);

  /**
   * Update global theme color based on overall progress
   */
  const updateThemeFromCourseProgress = useCallback(
    (courseProgressPercentage) => {
      setThemeColor(resolveCourseThemeColor(courseProgressPercentage));
    },
    [],
  );

  /**
   * Get an accent color for module/lesson level progress
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
   * Set UI theme (light/dark/system)
   */
  const setUiThemeExplicit = useCallback((theme) => {
    if (Object.values(UI_THEMES).includes(theme)) {
      setUiTheme(theme);
    }
  }, []);

  /**
   * Toggle between light and dark (ignores system)
   */
  const toggleDarkMode = useCallback(() => {
    setUiTheme((prev) =>
      prev === UI_THEMES.DARK ? UI_THEMES.LIGHT : UI_THEMES.DARK,
    );
  }, []);

  /**
   * Toggle code theme
   */
  const toggleCodeTheme = useCallback(() => {
    setCodeTheme((prev) =>
      prev === CODE_THEMES.DARK ? CODE_THEMES.LIGHT : CODE_THEMES.DARK,
    );
  }, []);

  /**
   * Set code theme explicitly
   */
  const setCodeThemeExplicit = useCallback((theme) => {
    if (Object.values(CODE_THEMES).includes(theme)) {
      setCodeTheme(theme);
    }
  }, []);

  /**
   * Reset theme to defaults
   */
  const resetTheme = useCallback(() => {
    setThemeColor(THEME_COLORS.DEFAULT);
    setCodeTheme(CODE_THEMES.DARK);
    setUiTheme(UI_THEMES.SYSTEM);
    localStorage.removeItem("themeColor");
    localStorage.removeItem("codeTheme");
    localStorage.removeItem("uiTheme");
  }, []);

  // Expose resetTheme globally for logout
  useEffect(() => {
    window.resetTheme = resetTheme;
    return () => {
      window.resetTheme = null;
    };
  }, [resetTheme]);

  const setDefaultTheme = useCallback(() => {
    setThemeColor(THEME_COLORS.DEFAULT);
  }, []);

  const value = {
    // Main theme
    themeColor,
    updateThemeFromCourseProgress,
    getModuleThemeColor,
    resetTheme,
    setDefaultTheme,
    THEME_COLORS,

    // UI Theme (dark/light mode)
    uiTheme,
    isDarkMode,
    setUiTheme: setUiThemeExplicit,
    toggleDarkMode,
    UI_THEMES,

    // Code theme
    codeTheme,
    toggleCodeTheme,
    setCodeTheme: setCodeThemeExplicit,
    isCodeDark: codeTheme === CODE_THEMES.DARK,
    CODE_THEMES,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
