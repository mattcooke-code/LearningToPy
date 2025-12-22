// ThemeContext.jsx
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { resolveCourseThemeColor, THEME_COLORS } from "../utils";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

// Code theme constants
const CODE_THEMES = {
  DARK: "dark",
  LIGHT: "light",
};

export const ThemeProvider = ({ children }) => {
  // Initialize from localStorage if available
  const [themeColor, setThemeColor] = useState(() => {
    const saved = localStorage.getItem("themeColor");
    return saved || THEME_COLORS.DEFAULT;
  });

  // Initialize code theme from localStorage or default to dark
  const [codeTheme, setCodeTheme] = useState(() => {
    const saved = localStorage.getItem("codeTheme");
    return saved || CODE_THEMES.DARK;
  });

  // Persist theme color to localStorage
  useEffect(() => {
    localStorage.setItem("themeColor", themeColor);
  }, [themeColor]);

  // Persist code theme to localStorage
  useEffect(() => {
    localStorage.setItem("codeTheme", codeTheme);
  }, [codeTheme]);

  /**
   * Update global theme color based on overall progress (dashboard-wide usage)
   */
  const updateThemeFromCourseProgress = useCallback(
    (courseProgressPercentage) => {
      setThemeColor(resolveCourseThemeColor(courseProgressPercentage));
    },
    [resolveCourseThemeColor]
  );

  /**
   * Get an accent color for module/lesson level progress visuals
   * without mutating the global theme.
   */
  const getModuleThemeColor = useCallback((moduleLessonProgress) => {
    if (moduleLessonProgress <= 25) {
      return THEME_COLORS.RED;
    }
    if (moduleLessonProgress <= 40) {
      return THEME_COLORS.ORANGE;
    }
    if (moduleLessonProgress <= 55) {
      return THEME_COLORS.AMBER;
    }
    if (moduleLessonProgress <= 70) {
      return THEME_COLORS.YELLOW;
    }
    if (moduleLessonProgress <= 85) {
      return THEME_COLORS.LIME;
    }
    return THEME_COLORS.GREEN;
  }, []);

  /**
   * Toggle code theme between dark and light
   */
  const toggleCodeTheme = useCallback(() => {
    setCodeTheme((prev) =>
      prev === CODE_THEMES.DARK ? CODE_THEMES.LIGHT : CODE_THEMES.DARK
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
   * Reset theme to default Python blue
   * Called on logout via window.resetTheme
   */
  const resetTheme = useCallback(() => {
    setThemeColor(THEME_COLORS.DEFAULT);
    setCodeTheme(CODE_THEMES.DARK); // Reset code theme to dark
    localStorage.removeItem("themeColor");
    localStorage.removeItem("codeTheme");
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

    // Code theme
    codeTheme,
    toggleCodeTheme,
    setCodeTheme: setCodeThemeExplicit,
    isCodeDark: codeTheme === CODE_THEMES.DARK,
    CODE_THEMES, // Export constants for components to use
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
