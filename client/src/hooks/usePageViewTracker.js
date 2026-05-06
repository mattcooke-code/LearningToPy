// /client/src/hooks/usePageViewTracker.js
/**
 * @fileoverview Page view analytics tracking hook.
 *
 * Fires a POST to `/api/analytics/page-view` on every route change while the
 * user is authenticated. Failures are silently swallowed (console.debug only).
 *
 * Should be mounted once in the app layout.
 *
 * @module hooks/usePageViewTracker
 * @requires react
 * @requires react-router-dom
 * @requires ../context (useAuth)
 */

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context";

/**
 * Track page views for authenticated users.
 *
 * Posts `{ path, timestamp }` to the analytics endpoint on every pathname
 * change. No-op when the user is not authenticated.
 */
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
