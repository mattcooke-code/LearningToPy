// utils/sessionId.js

/**
 * Session IDs are client-generated (UUID or hex), so every server-side use must
 * validate them first. The strict pattern also guarantees the value is a plain
 * string, which keeps it safe to use directly in Mongo filters.
 */
const SESSION_ID_PATTERN = /^[a-zA-Z0-9_-]{10,100}$/;

/**
 * @param   {unknown} value
 * @returns {boolean} true if `value` is a well-formed session ID string
 */
const isValidSessionId = (value) =>
  typeof value === "string" && SESSION_ID_PATTERN.test(value);

module.exports = { SESSION_ID_PATTERN, isValidSessionId };
