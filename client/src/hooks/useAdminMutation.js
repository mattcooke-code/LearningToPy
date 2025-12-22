// hooks/useAdminMutation.js
import { useState, useCallback } from "react";
import { useNotification } from "../context";
import { getAdminErrorMessage, getSuccessMessage } from "../utils";

export const useAdminMutation = (mutationFn, options = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const { showToast, showConfirm } = useNotification();

  const {
    defaultErrorMessage = "Operation failed",
    showToastOnError = true,
    showToastOnSuccess = true,
    successAction = "save",
    successResource = "item",
    onBeforeMutate = null,
    requireConfirmation = false,
    confirmationOptions = {},
  } = options;

  const mutate = useCallback(
    async (variables) => {
      if (requireConfirmation) {
        const confirmed = await new Promise((resolve) => {
          showConfirm({
            title: confirmationOptions.title || "Confirm Action",
            message:
              confirmationOptions.message ||
              "Are you sure you want to perform this action?",
            confirmText: confirmationOptions.confirmText || "Confirm",
            cancelText: confirmationOptions.cancelText || "Cancel",
            onConfirm: () => resolve(true),
            onCancel: () => resolve(false),
          });
        });

        if (!confirmed) {
          return;
        }
      }

      if (onBeforeMutate) {
        try {
          const shouldProceed = await onBeforeMutate(variables);
          if (shouldProceed === false) {
            return;
          }
        } catch (preMutationError) {
          console.warn("Pre-mutation check failed:", preMutationError);
          return;
        }
      }

      try {
        setLoading(true);
        setError(null);

        const result = await mutationFn(variables);
        setData(result);

        if (showToastOnSuccess) {
          showToast(
            getSuccessMessage(successAction, successResource),
            "success"
          );
        }

        return result;
      } catch (err) {
        const errorMessage = getAdminErrorMessage(err, defaultErrorMessage);
        setError(errorMessage);

        if (showToastOnError) {
          showToast(errorMessage, "error");
        }
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [
      mutationFn,
      showToast,
      defaultErrorMessage,
      showToastOnError,
      showToastOnSuccess,
      successAction,
      successResource,
      onBeforeMutate,
      requireConfirmation,
      confirmationOptions.title,
      confirmationOptions.message,
      confirmationOptions.confirmText,
      confirmationOptions.cancelText,
    ]
  );

  const reset = useCallback(() => {
    setError(null);
    setData(null);
  }, []);

  return {
    mutate,
    loading,
    error,
    data,
    reset,
    isError: !!error,
    isSuccess: !!data && !error,
    isLoading: loading,
  };
};
