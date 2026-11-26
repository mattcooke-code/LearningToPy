// utils/dateUtils.js

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Normalize a value to a valid Date object
 * @param {Date|string|number} value - Date value to normalize
 * @returns {Date|null} Valid Date object or null
 */
const normalizeDate = (value) => {
  if (!value) {
    return null;
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date;
};

/**
 * Midnight (00:00:00.000) UTC of the day containing `date`, as a millisecond
 * timestamp. Used for day-level comparisons in streak tracking.
 *
 * Pure arithmetic: the result does not depend on the server's timezone and
 * the input is never mutated.
 *
 * @param   {Date|string|number} date - Date to normalize
 * @returns {number} Midnight UTC timestamp in milliseconds (NaN if invalid)
 */
const startOfUtcDay = (date) =>
  Math.floor(new Date(date).getTime() / DAY_MS) * DAY_MS;

/**
 * Check if two dates fall on the same UTC calendar day
 * @param {Date|string|number} dateA - First date
 * @param {Date|string|number} dateB - Second date
 * @returns {boolean} True if same UTC day
 */
const isSameDay = (dateA, dateB) => {
  const a = normalizeDate(dateA);
  const b = normalizeDate(dateB);
  if (!a || !b) return false;
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
};

/**
 * Get date string in YYYY-MM-DD format
 * @param {Date|string|number} date - Date to format
 * @returns {string|null} Formatted date string or null
 */
const getDateKey = (date) => {
  const normalized = normalizeDate(date);
  if (!normalized) return null;
  return normalized.toISOString().split("T")[0];
};

module.exports = {
  DAY_MS,
  normalizeDate,
  startOfUtcDay,
  isSameDay,
  getDateKey,
};
