// /client/src/hooks/useCourseThemeUpdater.js
/**
 * @fileoverview Course theme synchronisation hook.
 *
 * Listens to route changes and authentication state, then updates the global
 * theme colour based on the user's course progress. On default paths (home,
 * login, register, admin) it resets to the default theme. On learning paths
 * it fetches progress from the API and maps the percentage to a theme colour.
 *
 * Should be mounted once in the app layout (e.g., App.jsx or AppLayout).
 *
 * @module hooks/useCourseThemeUpdater
 * @requires react
 * @requires react-router-dom
 * @requires ../context (useTheme, useAuth)
 * @requires ../constants/themeConstants
 * @requires ../services (apiClient)
 */

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTheme, useAuth } from "../context";
import {
  DEFAULT_THEME_PATHS,
  ADMIN_PATH_PREFIX,
} from "../constants/themeConstants";
import { apiClient } from "../services";

/**
 * Keep the theme colour in sync with the user's course progress.
 *
 * Behaviour by route:
 * - **Default paths** (/, /login, /register, /admin/*) — sets default theme.
 * - **Authenticated learning paths** — fetches `/progress/current` and calls
 *   `updateThemeFromCourseProgress`.
 * - **Unauthenticated paths** — sets default theme.
 *
 * No-op while auth is still loading to avoid flash-of-wrong-theme.
 */
export const useCourseThemeUpdater = () => {
  const location = useLocation();
  const { isAuthenticated, loading } = useAuth();
  const { updateThemeFromCourseProgress, setDefaultTheme } = useTheme();

  useEffect(() => {
    if (loading) return;

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
          const progressData = await apiClient.get("/progress/current");
          const progress = progressData?.courseProgressPercentage;

          if (progress !== undefined) {
            updateThemeFromCourseProgress(progress);
          }
        } catch (err) {
          console.error("Could not fetch progress for theme:", err);
        }
      }
      fetchAndUpdateTheme();
    } else {
      setDefaultTheme();
    }
  }, [
    loading,
    isAuthenticated,
    updateThemeFromCourseProgress,
    setDefaultTheme,
  ]);
};
