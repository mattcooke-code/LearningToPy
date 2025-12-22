// errorHandler.js
const AppError = require("../utils/AppError");
const { sendJsonResponse } = require("../utils/responseHelpers");

const globalErrorHandler = (err, req, res, next) => {
  // Ensure every error has a statusCode
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // Operational errors = trusted errors (e.g., validation, auth)
  // Programming errors = bugs (e.g., undefined function, DB crash)
  if (process.env.NODE_ENV === "development") {
    // In development: log full error + send debug details
    console.error("Error 💥", err);

    sendJsonResponse(
      res,
      err.statusCode,
      err.message,
      {}, // No data on error
      err // This becomes `debug_error` in development
    );
  } else {
    // In production: only send operational errors to client
    if (err.isOperational) {
      sendJsonResponse(
        res,
        err.statusCode,
        err.message,
        {} // No data on error
        // No debugDetails in production
      );
    } else {
      // Log programming errors (never expose to client)
      console.error("CRITICAL ERROR 💥", err);

      sendJsonResponse(
        res,
        500,
        "Something went wrong!",
        {} // Generic message, no details
      );
    }
  }
};

module.exports = globalErrorHandler;
