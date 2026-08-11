// hooks/useCourseCompletion.js
import { useState, useEffect } from "react";
import { apiClient } from "../services";
import { useAuth } from "../context";

export const useCourseCompletion = () => {
  const { user, isAuthenticated } = useAuth();
  const [completionData, setCompletionData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id || !isAuthenticated) {
      setLoading(false);
      return;
    }

    const fetchCompletionStatus = async () => {
      try {
        const data = await apiClient.get("/progress/course-completion");
        setCompletionData(data);
      } catch (err) {
        console.error("Failed to fetch course completion status:", err);
        setCompletionData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCompletionStatus();
  }, [user?._id, isAuthenticated]);

  const optInToHoF = async () => {
    try {
      const data = await apiClient.post("/progress/hall-of-fame/opt-in");
      // Refresh completion data after opt-in
      const updatedData = await apiClient.get("/progress/course-completion");
      setCompletionData(updatedData);
      return data;
    } catch (err) {
      console.error("Failed to opt into Hall of Fame:", err);
      throw err;
    }
  };

  return { completionData, loading, optInToHoF };
};
