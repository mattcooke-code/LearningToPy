// responseHelpers.js
/**
 * Sends a standardized JSON response with a consistent envelope.
 *
 * Response format:
 * {
 *   success: boolean,
 *   message: string,
 *    any           // payload (never null/undefined)
 *   debug_error?: any // only in development for non-success responses
 * }
 *
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code (e.g. 200, 400, 500)
 * @param {string} message - Human-readable message for the client
 * @param {any} data - The response payload (will be placed under `data` key)
 * @param {any} debugDetails - Optional: full error object for debugging (internal use only)
 */
const sendJsonResponse = (
  res,
  statusCode,
  message,
  data = {},
  debugDetails = null
) => {
  const isProduction = process.env.NODE_ENV === "production";

  // Ensure `data` is never null or undefined (arrays and objects are both valid)
  const safeData = data ?? {};

  const responsePayload = {
    success: statusCode >= 200 && statusCode < 300,
    message,
    data: safeData,
  };

  // In development, attach debug info for non-success responses
  if (!responsePayload.success && !isProduction && debugDetails) {
    responsePayload.debug_error = debugDetails;
  }

  return res.status(statusCode).json(responsePayload);
};

module.exports = { sendJsonResponse };
