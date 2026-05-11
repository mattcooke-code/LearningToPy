//useDashboardData.js
import { useState, useEffect } from "react";
import { apiClient } from "../services";

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
