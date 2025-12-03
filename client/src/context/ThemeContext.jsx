// ThemeContext.jsx
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

// Color theme constants
const THEME_COLORS = {
  DEFAULT: "#3776AB", // Python blue
  RED: "#ef4444", // 0-20% or 0-33%
  ORANGE: "#f97316", // 20-30% or 33-66%
  YELLOW: "#FFD700", // 30-70% or 66-99%
  LIME: "#84cc16", // 70-80%
  GREEN: "#22c55e", // 80-100% or 100%
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

  const resolveCourseThemeColor = useCallback((courseProgressPercentage) => {
    // Match visual perception of the gauge
    if (courseProgressPercentage <= 25) {
      return THEME_COLORS.RED; // Clearly in red zone
    }
    if (courseProgressPercentage <= 45) {
      return "#f97316"; // Orange-red transition
    }
    if (courseProgressPercentage <= 65) {
      return THEME_COLORS.YELLOW; // Clearly in yellow zone
    }
    if (courseProgressPercentage <= 85) {
      return "#84cc16"; // Lime green-yellow transition
    }
    return THEME_COLORS.GREEN; // Clearly in green zone
  }, []);

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
    if (moduleLessonProgress <= 33) {
      return THEME_COLORS.RED;
    }
    if (moduleLessonProgress <= 66) {
      return THEME_COLORS.ORANGE;
    }
    if (moduleLessonProgress < 100) {
      return THEME_COLORS.YELLOW;
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

  const value = {
    // Main theme
    themeColor,
    updateThemeFromCourseProgress,
    getModuleThemeColor,
    resetTheme,

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
