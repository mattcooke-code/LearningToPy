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

export const ThemeProvider = ({ children }) => {
  // Initialize from localStorage if available
  const [themeColor, setThemeColor] = useState(() => {
    const saved = localStorage.getItem("themeColor");
    return saved || THEME_COLORS.DEFAULT;
  });

  // Persist theme color to localStorage
  useEffect(() => {
    localStorage.setItem("themeColor", themeColor);
  }, [themeColor]);

  const resolveOverallColor = useCallback((progressPercentage) => {
    // Match visual perception of the gauge
    if (progressPercentage <= 25) {
      return THEME_COLORS.RED; // Clearly in red zone
    }
    if (progressPercentage <= 45) {
      return "#f97316"; // Orange-red transition
    }
    if (progressPercentage <= 65) {
      return THEME_COLORS.YELLOW; // Clearly in yellow zone
    }
    if (progressPercentage <= 85) {
      return "#84cc16"; // Lime green-yellow transition
    }
    return THEME_COLORS.GREEN; // Clearly in green zone
  }, []);

  /**
   * Update global theme color based on overall progress (dashboard-wide usage)
   */
  const updateThemeFromProgress = useCallback(
    (progressPercentage) => {
      setThemeColor(resolveOverallColor(progressPercentage));
    },
    [resolveOverallColor]
  );

  /**
   * Get an accent color for module/lesson level progress visuals
   * without mutating the global theme.
   */
  const getModuleThemeColor = useCallback((progressPercentage) => {
    if (progressPercentage <= 33) {
      return THEME_COLORS.RED;
    }
    if (progressPercentage <= 66) {
      return THEME_COLORS.ORANGE;
    }
    if (progressPercentage < 100) {
      return THEME_COLORS.YELLOW;
    }
    return THEME_COLORS.GREEN;
  }, []);

  /**
   * Reset theme to default Python blue
   * Called on logout via window.resetTheme
   */
  const resetTheme = useCallback(() => {
    setThemeColor(THEME_COLORS.DEFAULT);
    localStorage.removeItem("themeColor");
  }, []);

  // Expose resetTheme globally for logout
  useEffect(() => {
    window.resetTheme = resetTheme;
    return () => {
      window.resetTheme = null;
    };
  }, [resetTheme]);

  const value = {
    themeColor,
    updateThemeFromProgress,
    getModuleThemeColor,
    resetTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
