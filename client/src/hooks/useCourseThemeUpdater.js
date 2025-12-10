// useCourseThemeUpdater.js
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTheme, apiClient } from "../context";

const DEFAULT_PATHS = ["/", "/login", "/register"];

export const useCourseThemeUpdater = (apiClient, isAuthenticated) => {
  const location = useLocation();
  const { updateThemeFromCourseProgress, setDefaultTheme } = useTheme();

  useEffect(() => {
    const pathname = location.pathname;

    // Check if current path is default color
    if (DEFAULT_PATHS.includes(pathname)) {
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
