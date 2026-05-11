//useDashboardData.js
import { useState, useEffect } from "react";
import { apiClient } from "../services";

/**
 * @fileoverview
 * Custom hook for aggregating and managing user dashboard data.
 * Handles concurrent API requests for progress, leaderboard, and achievements.
 */

/**
 * A custom hook that fetches and manages a user's dashboard-related data.
 * * This hook synchronizes multiple data streams (Current Progress, Leaderboard, and Badges)
 * and updates the application theme based on the user's course progress percentage.
 *
 * @hook
 * @param {Object} user - The current authenticated user object.
 * @param {boolean} isAuthenticated - Flag indicating if the user is currently logged in.
 * @param {boolean} authLoading - Flag indicating if the authentication state is still being resolved.
 * @param {string} locationPathname - The current URL path, used to trigger re-fetches on navigation.
 * @param {Function} updateTheme - Callback function that accepts a percentage (0-100) to update global styles.
 * * @returns {Object} dashboardData
 * @returns {Object|null} dashboardData.userProgress - Object containing XP, level, and module progress.
 * @returns {Object|null} dashboardData.surroundingLeaderboard - Object containing user's relative rank and neighbors.
 * @returns {string[]} dashboardData.earnedBadgeIds - Array of strings representing the IDs of unlocked badges.
 * @returns {boolean} dashboardData.loading - True if any of the API requests are currently in flight.
 * @returns {Error|null} dashboardData.error - Contains the error object if any API request fails.
 *
 * @example
 * const { userProgress, loading } = useDashboardData(user, true, false, '/profile', setProgressTheme);
 */

export const useDashboardData = (
  user,
  isAuthenticated,
  authLoading,
  locationPathname,
  updateTheme,
) => {
  const [data, setData] = useState({
    userProgress: null,
    surroundingLeaderboard: null,
    earnedBadgeIds: [],
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (authLoading || !isAuthenticated || !user) return;

    const fetchData = async () => {
      setData((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const [progress, leaderboard, achievements] = await Promise.all([
          apiClient.get("/progress/current"),
          apiClient.get("/progress/leaderboard/around-me"),
          apiClient.get("/progress/achievements"),
        ]);

        updateTheme(progress.courseProgressPercentage);
        setData({
          userProgress: progress,
          surroundingLeaderboard: leaderboard,
          earnedBadgeIds: (achievements.earnedBadges || []).map((b) => b.id),
          loading: false,
          error: null,
        });
      } catch (err) {
        setData((prev) => ({ ...prev, loading: false, error: err }));
      }
    };

    fetchData();
  }, [user, isAuthenticated, authLoading, locationPathname]);

  return data;
};
