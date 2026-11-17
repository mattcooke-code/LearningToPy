// adminUtils.js

// ─────────────── STRING/SEARCH HELPERS ───────────────
/** Escape a string for safe use inside a RegExp / `$regex`. */
const escapeRegex = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Build a case-insensitive `$or` clause matching `term` in any `fields`. */
const buildSearchOr = (fields, term) => {
  const pattern = escapeRegex(term);
  return fields.map((field) => ({
    [field]: { $regex: pattern, $options: "i" },
  }));
};

// ─────────────── VALIDATION HELPERS ───────────────
/**
 * Throw 400 if an admin is trying to modify their own account.
 *
 * @param {string|Object} targetUserId
 * @param {Object} actor - { id, ip, userAgent }
 * @param {string} what  - e.g. "XP", "status", "progress", "admin status"
 * @throws {AppError} 400
 */
const assertNotSelf = (targetUserId, actor, what) => {
  if (String(targetUserId) === String(actor.id)) {
    throw new AppError(`Cannot modify your own ${what}`, 400);
  }
};

/**
 * Throw 400 unless `id` is an ObjectId or a 24-character hex string.
 *
 * Stricter than `ObjectId.isValid` / `mongoose.isValidObjectId`, which also
 * accept any 12-character string (and numbers).
 *
 * @param {any} id
 * @param {string} label - Used in the message: `Invalid ${label}`
 * @throws {AppError} 400
 */
const assertValidObjectId = (id, label) => {
  const valid =
    id instanceof mongoose.Types.ObjectId || /^[0-9a-f]{24}$/i.test(String(id));
  if (!valid) throw new AppError(`Invalid ${label}`, 400);
};

/**
 * Validate a `badgeIds` payload and drop duplicates.
 *
 * @param {any} badgeIds
 * @returns {string[]}
 * @throws {AppError} 400 - Not an array
 */
const normalizeBadgeIds = (badgeIds) => {
  if (!Array.isArray(badgeIds)) {
    throw new AppError("badgeIds must be an array", 400);
  }
  return [...new Set(badgeIds)];
};

// ─────────────── PAGINATION HELPERS ───────────────
/**
 * Parse `page` / `limit` query values into safe numbers.
 *
 * Non-numeric or < 1 values fall back to defaults; `limit` is capped at
 * `maxLimit`.
 *
 * @param {{ page?: any, limit?: any }} input
 * @param {{ defaultLimit: number, maxLimit: number }} limits
 * @returns {{ pageNum: number, limitNum: number, skip: number }}
 */
const parsePagination = ({ page, limit }, { defaultLimit, maxLimit }) => {
  const parsedPage = parseInt(page, 10);
  const parsedLimit = parseInt(limit, 10);

  const pageNum = parsedPage >= 1 ? parsedPage : 1;
  const limitNum =
    parsedLimit >= 1 ? Math.min(parsedLimit, maxLimit) : defaultLimit;

  return { pageNum, limitNum, skip: (pageNum - 1) * limitNum };
};

/** Build the standard `pagination` response block. */
const buildPagination = (pageNum, limitNum, total) => ({
  page: pageNum,
  limit: limitNum,
  total,
  totalPages: Math.ceil(total / limitNum),
});

// ─────────────── DATABASE/MONGOOSE WRAPPERS ───────────────

module.exports = {
  escapeRegex,
  buildSearchOr,
  assertNotSelf,
  assertValidObjectId,
  normalizeBadgeIds,
  parsePagination,
  buildPagination,
};
