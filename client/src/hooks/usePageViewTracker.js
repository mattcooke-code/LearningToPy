// usePageViewTracker.js
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context";

export const usePageViewTracker = () => {
  const location = useLocation();
  const { apiClient, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !apiClient) return;

    // Track page view
    apiClient
      .post("/analytics/page-view", {
        path: location.pathname,
        timestamp: new Date().toISOString(),
      })
      .catch((err) => {
        console.debug("Page view tracking failed:", err.message);
      });
  }, [location.pathname, isAuthenticated]);
};
