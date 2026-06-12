import { useState, useCallback, useEffect, useRef } from "react";
import { useNotification } from "../context";
import {
  getAdminErrorMessage,
  getErrorMessage,
} from "../utils/getErrorMessage";

/**
 * Custom hook for fetching admin data with standardized error handling,
 * auto-retry, and toast notifications.
 *
 * **Important:** The `fetcher` function MUST be wrapped in `useCallback` by
 * the caller to prevent infinite re-fetch loops. The hook includes `fetcher`
 * in its effect dependencies.
 *
 * @param {Function} fetcher - Async function that returns Axios responses
 *   (must be stable — wrap in useCallback).
 * @param {Array} dependencies - Effect dependencies (typically [dateRange, groupBy]).
 * @param {Object} options - Configuration options
 * @param {string} [options.defaultErrorMessage="Failed to fetch data"]
 * @param {boolean} [options.showToastOnError=false]
 * @param {boolean} [options.autoRetry=false]
 * @param {number} [options.maxRetries=3]
 * @param {number} [options.retryDelay=1000]
 * @param {string} [options.context="admin"]
 * @returns {Object} { data, loading, error, refetch, setData, clearError }
 */
export const useAdminData = (fetcher, dependencies = [], options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showToast } = useNotification();
  const mountedRef = useRef(true);

  const {
    defaultErrorMessage = "Failed to fetch data",
    showToastOnError = false,
    autoRetry = false,
    maxRetries = 3,
    retryDelay = 1000,
    context = "admin",
  } = options;

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchData = useCallback(
    async (retryCount = 0) => {
      if (!mountedRef.current) return;

      try {
        // Only set loading on initial fetch, not retries (avoids flash)
        if (retryCount === 0) {
          setLoading(true);
        }
        setError(null);

        const result = await fetcher();

        if (mountedRef.current) {
          setData(result);
        }
      } catch (err) {
        if (!mountedRef.current) return;

        console.error("Data fetch error:", err);

        const errorMessage =
          context === "admin"
            ? getAdminErrorMessage(err, defaultErrorMessage)
            : getErrorMessage(err, defaultErrorMessage);

        // Auto-retry logic for network/server errors
        if (autoRetry && retryCount < maxRetries) {
          const isNetworkError = !err.response;
          const isServerError = err.response?.status >= 500;

          if (isNetworkError || isServerError) {
            setTimeout(() => {
              if (mountedRef.current) {
                fetchData(retryCount + 1);
              }
            }, retryDelay);
            return; // Don't set error or loading=false during retry window
          }
        }

        setError(errorMessage);

        // Optional toast notification
        if (showToastOnError) {
          showToast(errorMessage, "error");
        }
      } finally {
        if (mountedRef.current && retryCount === 0) {
          setLoading(false);
        }
        // On retries, loading stays true until final attempt
        if (mountedRef.current && retryCount >= maxRetries) {
          setLoading(false);
        }
      }
    },

    [
      fetcher,
      showToast,
      defaultErrorMessage,
      autoRetry,
      maxRetries,
      retryDelay,
      showToastOnError,
      context,
    ],
  );

  useEffect(() => {
    fetchData();
  }, [fetchData, ...dependencies]);

  const refetch = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { data, loading, error, refetch, setData, clearError };
};
