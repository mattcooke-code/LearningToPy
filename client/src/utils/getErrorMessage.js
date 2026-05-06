// /client/src/utils/getErrorMessage.js
/**
 * @fileoverview Error message extraction utilities.
 *
 * Provides a consistent, user-friendly error message from various error
 * shapes: strings, Axios HTTP responses, network errors, and generic
 * JavaScript errors. Includes context-specific variants for admin and
 * authentication flows.
 *
 * @module utils/getErrorMessage
 */

/**
 * Extract a human-readable error message from an error value.
 *
 * Handles the following error shapes in priority order:
 * 1. Plain strings (returned as-is)
 * 2. HTTP error responses with status codes (context-aware messages for admin)
 * 3. Backend error envelope (`response.data.message` or `response.data.error`)
 * 4. Standard `Error.message`
 * 5. Axios network errors (`ERR_NETWORK`)
 * 6. Falls back to `defaultMessage`
 *
 * @param {*} error - The caught error. Can be a string, Error object, Axios
 *   error, or unknown shape.
 * @param {string} [defaultMessage="Something went wrong"] - Fallback message
 *   when no specific error can be extracted.
 * @param {string} [context="general"] - Context for status-code messages.
 *   Use `"admin"` for admin-specific phrasing.
 * @returns {string} A user-facing error message.
 */
export const getErrorMessage = (
  error,
  defaultMessage = "Something went wrong",
  context = "general",
) => {
  if (typeof error === "string") return error;

  // HTTP Status Codes
  if (error?.response?.status) {
    const status = error.response.status;

    if (context === "admin") {
      switch (status) {
        case 401:
          return "Your session has expired. Please log in again.";
        case 403:
          return "You don't have permission to access this resource.";
        case 404:
          return "The requested resource was not found.";
        case 429:
          return "Too many requests. Please try again later.";
        case 500:
          return "Server error. Our team has been notified.";
        case 503:
          return "Service temporarily unavailable. Please try again later.";
      }
    }
  }

  // Message Extraction - Common Error Formats
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.response?.data?.error) return error.response.data.error;
  if (error?.message) return error.message;

  // Network Errors
  if (error?.code === "ERR_NETWORK") {
    return "Network error. Please check your connection.";
  }

  return defaultMessage;
};

/**
 * Extract an error message with admin-appropriate phrasing.
 *
 * Convenience wrapper around `getErrorMessage` with `context = "admin"` and
 * a default message of `"Admin operation failed"`.
 *
 * @param {*} error - The caught error.
 * @param {string} [defaultMessage="Admin operation failed"] - Fallback message.
 * @returns {string} A user-facing error message.
 */
export const getAdminErrorMessage = (
  error,
  defaultMessage = "Admin operation failed",
) => {
  return getErrorMessage(error, defaultMessage, "admin");
};

/**
 * Extract an error message appropriate for authentication failures.
 *
 * Provides specific messages for 401 (invalid credentials) and 403
 * (unverified account) before falling through to the generic extractor.
 *
 * @param {*} error - The caught error (typically from login/register requests).
 * @param {string} [defaultMessage="Authentication failed"] - Fallback message.
 * @returns {string} A user-facing error message.
 */
export const getAuthErrorMessage = (
  error,
  defaultMessage = "Authentication failed",
) => {
  if (error?.response?.status === 401) {
    return "Invalid credentials. Please check your email and password.";
  }
  if (error?.response?.status === 403) {
    return "Account not verified. Please check your email.";
  }
  return getErrorMessage(error, defaultMessage);
};
