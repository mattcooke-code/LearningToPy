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
 * Generate a URL-friendly slug that is guaranteed unique within the given
 * Mongoose model's collection.
 *
 * Uses a single database query to fetch all existing matching slugs, then
 * appends a numeric suffix (`-2`, `-3`, etc.) if the base slug is taken.
 * Avoids the O(k) sequential-query pattern where k is the collision count.
 *
 * @param {import('mongoose').Model} Model - The Mongoose model to check against
 * @param {string} title - The title to derive the slug from
 * @param {*} [existingId] - The document's own _id (excluded from uniqueness check)
 * @returns {Promise<string>} A unique slug string
 */
const generateUniqueSlug = async (Model, title, existingId) => {
  const baseSlug = slugify(title);

  const escaped = baseSlug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const slugPattern = new RegExp(`^${escaped}(-\\d+)?$`);

  const existingSlugs = await Model.find(
    { slug: slugPattern, _id: { $ne: existingId } },
    { slug: 1, _id: 0 },
  ).lean();

  const existingSet = new Set(existingSlugs.map((doc) => doc.slug));

  if (!existingSet.has(baseSlug)) return baseSlug;

  let suffix = 1;
  let candidate;
  do {
    candidate = `${baseSlug}-${suffix++}`;
  } while (existingSet.has(candidate));

  return candidate;
};

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
 * Normalize tags array to lowercase and remove empty values
 */
const normalizeTags = (tags) => {
  if (!tags) return [];
  return Array.isArray(tags)
    ? tags.map((tag) => (tag || "").toLowerCase().trim()).filter(Boolean)
    : [];
};

/**
 * Escape HTML special characters for safe interpolation into HTML strings.
 * Returns an empty string for falsy input.
 *
 * @param   {string} str
 * @returns {string}
 */
const escapeHtml = (str) => {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};
module.exports = {
  slugify,
  generateUniqueSlug,
  toStringId,
  normalizeTags,
  escapeHtml,
};
