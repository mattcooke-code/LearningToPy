// useHallOfFame.js
import { useState, useEffect, useCallback } from "react";
import { apiClient } from "../services";

/**
 * Fetches Hall of Fame data for snapshots and modals.
 *
 * @param {boolean} enabled - Whether to fetch (only when modal open or section visible)
 * @param {number}  [limit=5] - Number of members to fetch for snapshot view
 * @returns {{ members: Array, totalInducted: number, loading: boolean, error: string|null, refetch: Function }}
 */
export const useHallOfFame = (enabled = true, limit = 5) => {
  const [members, setMembers] = useState([]);
  const [totalInducted, setTotalInducted] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHallOfFame = useCallback(async () => {
    if (!enabled) return;

    try {
      setLoading(true);
      setError(null);

      const data = await apiClient.get(
        `/progress/hall-of-fame?limit=${limit}&page=1`,
      );

      setMembers(data.members || []);
      setTotalInducted(data.totalInducted || 0);
    } catch (err) {
      setError(err.message || "Failed to load Hall of Fame");
    } finally {
      setLoading(false);
    }
  }, [enabled, limit]);

  useEffect(() => {
    fetchHallOfFame();
  }, [fetchHallOfFame]);

  return { members, totalInducted, loading, error, refetch: fetchHallOfFame };
};
