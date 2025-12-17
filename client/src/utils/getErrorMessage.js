// getErrorMessage.js

export const getErrorMessage = (
  error,
  defaultMessage = "Something went wrong",
  context = "general"
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

export const getAdminErrorMessage = (
  error,
  defaultMessage = "Admin operation failed"
) => {
  return getErrorMessage(error, defaultMessage, "admin");
};

export const getAuthErrorMessage = (
  error,
  defaultMessage = "Authentication failed"
) => {
  if (error?.response?.status === 401) {
    return "Invalid credentials. Please check your email and password.";
  }
  if (error?.response?.status === 403) {
    return "Account not verified. Please check your email.";
  }
  return getErrorMessage(error, defaultMessage);
};
