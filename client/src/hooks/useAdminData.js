// useAdminData.js
import { useState, useCallback, useEffect } from "react";
import { useNotification } from "../context";
import {
  getAdminErrorMessage,
  getErrorMessage,
} from "../utils/getErrorMessage";

const useAdminData = (fetchFn, dependencies = [], options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showToast } = useNotification();

  const {
    defaultErrorMessage = "Failed to fetch data",
    showToastOnError = true,
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
        const result = await fetchFn();
        setData(result);
      } catch (err) {
        console.error("Data fetch error:", err);
        const errorMessage =
          context === "admin"
            ? getAdminErrorMessage(err, defaultErrorMessage)
            : getErrorMessage(err, defaultErrorMessage);

        setError(errorMessage);

        // Auto retry
        if (autoRetry && retryCount < maxRetries) {
          const isNetworkError = !err.response;
          const isServerError = err.response?.status >= 500;

          if (isNetworkError || isServerError) {
            console.log(`Retrying... (${retryCount + 1}/${maxRetries})`);
            setTimeout(() => {
              fetchData(retryCount + 1);
            }, retryDelay);
            return;
          }
        }

        if (showToastOnError) {
          showToast(errorMessage, "error");
        }

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [
      fetchFn,
      showToast,
      defaultErrorMessage,
      autoRetry,
      maxRetries,
      retryDelay,
      showToastOnError,
      context,
    ]
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

export default useAdminData;
