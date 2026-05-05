// server/utils/generalUtils.js

/**
 * Convert a string to a URL-friendly slug
 * @param {string} value - The string to slugify
 * @returns {string} The slugified string
 */
const slugify = (value) =>
  (value || "")
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

/**
 * Convert various ID formats to string
 * @param {*} value - MongoDB ObjectId, string, or other value
 * @returns {string|null} String ID or null
 */
const toStringId = (value) => {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (value.toString) return value.toString();
  return null;
};

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
 * Normalize a date to midnight UTC timestamp (milliseconds).
 * Used for day-level comparisons in streak tracking.
 * Mutates the date — sets hours, minutes, seconds, ms to 0.
 *
 * @param   {Date|string} date - Date to normalize
 * @returns {number} Midnight UTC timestamp in milliseconds
 */
const checkDate = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

/**
 * Check if two dates are on the same calendar day
 * @param {Date|string|number} dateA - First date
 * @param {Date|string|number} dateB - Second date
 * @returns {boolean} True if same day
 */
const isSameDay = (dateA, dateB) => {
  const a = normalizeDate(dateA);
  const b = normalizeDate(dateB);
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
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

/**
 * Normalize tags array to lowercase and remove empty values
 */
const normalizeTags = (tags) => {
  if (!tags) return [];
  return Array.isArray(tags)
    ? tags.map((tag) => (tag || "").toLowerCase().trim()).filter(Boolean)
    : [];
};

module.exports = {
  slugify,
  toStringId,
  normalizeDate,
  normalizeTags,
  checkDate,
  isSameDay,
  getDateKey,
};
