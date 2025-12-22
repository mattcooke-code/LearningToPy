// useCourseThemeUpdater.js
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTheme, useAuth } from "../context";
import {
  DEFAULT_THEME_PATHS,
  ADMIN_PATH_PREFIX,
} from "../constants/themeConstants";

export const useCourseThemeUpdater = () => {
  const location = useLocation();
  const { apiClient, isAuthenticated } = useAuth();
  const { updateThemeFromCourseProgress, setDefaultTheme } = useTheme();

  useEffect(() => {
    const pathname = location.pathname;

    // Check if current path should use default theme
    const isDefaultPath =
      DEFAULT_THEME_PATHS.includes(pathname) ||
      pathname.startsWith(ADMIN_PATH_PREFIX);

    if (isDefaultPath) {
      setDefaultTheme();
      return;
    }

    // If dynamic theme required
    if (isAuthenticated) {
      async function fetchAndUpdateTheme() {
        try {
          const response = await apiClient.get("/progress/current");
          const progress = response.data.data.courseProgressPercentage;

          if (progress !== undefined) {
            updateThemeFromCourseProgress(progress);
          }
        } catch (err) {
          console.error("Could not fetch progress for theme:", err);
          setDefaultTheme();
        }
      }
      fetchAndUpdateTheme();
    } else {
      setDefaultTheme();
    }
  }, [
    location.pathname,
    isAuthenticated,
    updateThemeFromCourseProgress,
    setDefaultTheme,
    apiClient,
  ]);
};
