// /client/src/hooks/useAdminData.js
/**
 * @fileoverview Generic admin data fetching hook with error handling, auto-retry,
 * and toast notifications.
 *
 * Wraps any async fetcher function with loading/error state, optional toast
 * alerts on failure, and configurable retry logic for network and server errors.
 *
 * @module hooks/useAdminData
 * @requires react
 * @requires ../context (useNotification)
 * @requires ../utils/getErrorMessage
 */

import { useState, useCallback, useEffect } from "react";
import { useNotification } from "../context";
import {
  getAdminErrorMessage,
  getErrorMessage,
} from "../utils/getErrorMessage";

/**
 * Custom hook for fetching admin data with standardized error handling
 *
 * @param {Function} fetcher - Async function that returns Axios responses
 * @param {Array} dependencies - Effect dependencies
 * @param {Object} options - Configuration options
 * @returns {Object} { data, loading, error, refetch, setData, clearError }
 */
export const useAdminData = (fetcher, dependencies = [], options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showToast } = useNotification();

  const {
    defaultErrorMessage = "Failed to fetch data",
    showToastOnError = false,
    autoRetry = false,
    maxRetries = 3,
    retryDelay = 1000,
    context = "admin",
  } = options;

  const fetchData = useCallback(
    async (retryCount = 0) => {
      try {
        setLoading(true);
        setError(null);

        const result = await fetcher();

        setData(result);
      } catch (err) {
        console.error("Data fetch error:", err);

        const errorMessage =
          context === "admin"
            ? getAdminErrorMessage(err, defaultErrorMessage)
            : getErrorMessage(err, defaultErrorMessage);

        setError(errorMessage);

        // Auto-retry logic for network/server errors
        if (autoRetry && retryCount < maxRetries) {
          const isNetworkError = !err.response;
          const isServerError = err.response?.status >= 500;

          if (isNetworkError || isServerError) {
            setTimeout(() => {
              fetchData(retryCount + 1);
            }, retryDelay);
            return;
          }
        }

        // Optional toast notification
        if (showToastOnError) {
          showToast(errorMessage, "error");
        }
      } finally {
        setLoading(false);
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
  }, dependencies);

  const refetch = () => {
    return fetchData();
  };

  const clearError = () => {
    setError(null);
  };

  return { data, loading, error, refetch, setData, clearError };
};
