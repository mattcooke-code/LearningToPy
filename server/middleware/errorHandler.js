// errorHandler.js
const config = require("../config/envConfig");
const AppError = require("../utils/AppError");
const { sendJsonResponse } = require("../utils/responseHelpers");

/**
 * Global Express error-handling middleware.
 *
 * **MUST be registered LAST** in the middleware chain (after all routes).
 * Express identifies error handlers by their 4-parameter signature.
 *
 * **Development behavior:**
 * - Logs full error to console
 * - Sends complete error details via `debug_error` in the response envelope
 *
 * **Production behavior:**
 * - Operational errors (`isOperational: true`): sends the error message to the client
 * - Programming errors (`isOperational: false/undefined`): sends a generic message,
 *   logs the full error for debugging, never exposes internal details
 *
 * @param {Error}    err  - The error object (AppError or native Error)
 * @param {Object}   req  - Express request
 * @param {Object}   res  - Express response
 * @param {Function} next - Express next function (unused, required for signature)
 */
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (config.isDevelopment()) {
    // In development: log full error + send debug details
    console.error("Error 💥", err);

    sendJsonResponse(res, err.statusCode, err.message, {}, err);
  } else {
    // In production: only send operational errors to client
    if (err.isOperational) {
      sendJsonResponse(res, err.statusCode, err.message, {});
    } else {
      console.error("CRITICAL ERROR 💥", err.message, err.stack);

      sendJsonResponse(res, 500, "Something went wrong!", {});
    }
  }
};

module.exports = globalErrorHandler;
