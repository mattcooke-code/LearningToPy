import { useState, useEffect } from "react";
import { apiClient } from "../services";

export const useDashboardData = (
  user,
  isAuthenticated,
  authLoading,
  _locationPathname, // Accepted but unused — remount handles refresh
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

      const [progressResult, leaderboardResult, achievementsResult] =
        await Promise.allSettled([
          apiClient.get("/progress/current"),
          apiClient.get("/progress/leaderboard/around-me"),
          apiClient.get("/progress/achievements"),
        ]);

      const progress =
        progressResult.status === "fulfilled" ? progressResult.value : null;
      const leaderboard =
        leaderboardResult.status === "fulfilled"
          ? leaderboardResult.value
          : null;
      const achievements =
        achievementsResult.status === "fulfilled"
          ? achievementsResult.value
          : null;

      if (progress?.courseProgressPercentage !== undefined) {
        updateTheme(progress.courseProgressPercentage);
      }

      setData({
        userProgress: progress,
        surroundingLeaderboard: leaderboard,
        earnedBadgeIds: achievements
          ? (achievements.earnedBadges || []).map((b) => b.id)
          : [],
        loading: false,
        error:
          !progress && !leaderboard && !achievements
            ? "Failed to load dashboard data"
            : null,
      });
    };

    fetchData();
  }, [user, isAuthenticated, authLoading, updateTheme]);

  return data;
};
