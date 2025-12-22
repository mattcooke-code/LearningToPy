// useThemeColor.js
import { useLocation } from "react-router-dom";
import { useTheme } from "../context";
import { PYTHON_BLUE } from "../constants/themeConstants";

/**
 * Hook to get the appropriate theme color for the current page
 * @returns {string} Hex color code for the current page
 *
 * Rules:
 * - Homepage, Login, Register, All Admin pages: Always Python blue (#3776AB)
 * - Module Lessons pages: Use module progress color
 * - All other pages: Use course progress color
 */

export const useThemeColor = () => {
  const location = useLocation();
  const { themeColor } = useTheme();

  const pathname = location.pathname;

  // Python blue override for default pages

  const shouldUseDefaultColor =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname.startsWith("/admin");

  if (shouldUseDefaultColor) {
    return PYTHON_BLUE;
  } else {
    return themeColor;
  }
};
