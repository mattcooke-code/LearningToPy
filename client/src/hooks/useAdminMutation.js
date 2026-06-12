import { useState, useCallback } from "react";
import { useNotification } from "../context";
import { getAdminErrorMessage, getSuccessMessage } from "../utils";

/**
 * Create a standardised mutation handler for admin operations.
 *
 * @param {Function} mutationFn - The async function that performs the mutation
 *   (receives `variables` as its only argument).
 * @param {object} [options={}] - Configuration options.
 * @param {string} [options.defaultErrorMessage="Operation failed"] - Fallback
 *   error message.
 * @param {boolean} [options.showToastOnError=true] - Show a toast on failure.
 * @param {boolean} [options.showToastOnSuccess=true] - Show a toast on success.
 * @param {string} [options.successAction="save"] - Action key passed to
 *   `getSuccessMessage`.
 * @param {string} [options.successResource="item"] - Resource name passed to
 *   `getSuccessMessage`.
 * @param {Function|null} [options.onBeforeMutate=null] - Async pre-mutation
 *   check. If it returns `false`, the mutation is cancelled.
 * @param {boolean} [options.requireConfirmation=false] - Show a confirmation
 *   dialog before executing.
 * @param {object} [options.confirmationOptions={}] - Overrides for the
 *   confirmation dialog (title, message, confirmText, cancelText, type).
 * @returns {{ mutate: Function, loading: boolean, error: string|null,
 *   data: any, reset: Function, isError: boolean, isSuccess: boolean,
 *   isLoading: boolean }}
 */
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

  // Destructure confirmation options for stable dependency references
  const {
    title: confirmTitle = "Confirm Action",
    message: confirmMessage = "Are you sure you want to perform this action?",
    confirmText = "Confirm",
    cancelText = "Cancel",
    type: confirmType = "info",
  } = confirmationOptions;

  const mutate = useCallback(
    async (variables) => {
      if (requireConfirmation) {
        const confirmed = await new Promise((resolve) => {
          showConfirm({
            title: confirmTitle,
            message: confirmMessage,
            confirmText,
            cancelText,
            type: confirmType,
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
            "success",
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
      showConfirm,
      defaultErrorMessage,
      showToastOnError,
      showToastOnSuccess,
      successAction,
      successResource,
      onBeforeMutate,
      requireConfirmation,
      confirmTitle,
      confirmMessage,
      confirmText,
      cancelText,
      confirmType,
    ],
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
