// /client/src/utils/moduleFormUtils.js
/**
 * @fileoverview Module form data transformation utilities.
 *
 * Provides default form state, API-to-form mapping (including populated-ID
 * unwrapping for lessons and prerequisites), and form-to-API normalisation
 * (field trimming, conditional order/moduleNumber inclusion).
 *
 * Used primarily by `ModuleEditorModal.jsx` for the admin module editor.
 *
 * @module utils/moduleFormUtils
 */

/**
 * Default form state for module creation/editing.
 *
 * @type {object}
 */
export const DEFAULT_MODULE_FORM_DATA = {
  title: "",
  shortDescription: "",
  description: "",
  icon: "book", // key from ICON_MAP
  color: "blue", // default theme colour
  isPublished: false,
  order: null,
  moduleNumber: "",
  tags: [],
  lessons: [], // array of lesson IDs (strings)
  prerequisites: [], // array of module IDs
  estimatedDuration: 60, // minutes
  difficulty: "BEGINNER",
  badgeId: "", // optional
  xpReward: 200,
};

/**
 * Map an API module object to form-compatible data.
 *
 * Handles:
 * - Providing defaults for all fields via spread over `DEFAULT_MODULE_FORM_DATA`.
 * - Unwrapping populated `lessons` and `prerequisites` arrays (Mongoose
 *   objects → ID strings).
 * - Casting `isPublished` to boolean.
 * - Ensuring `tags` is always an array.
 * - Falling back `moduleNumber` from `module.order` when not explicitly set.
 *
 * @param {object} [module={}] - The module object from the API (may be sparse).
 * @returns {object} A complete form data object with all defaults filled.
 */
export const mapModuleToFormData = (module = {}) => {
  return {
    ...DEFAULT_MODULE_FORM_DATA,
    title: module.title || "",
    shortDescription: module.shortDescription || "",
    description: module.description || "",
    icon: module.icon || "book",
    color: module.color || "blue",
    isPublished: Boolean(module.isPublished),
    order: module.order !== undefined ? module.order : null,
    moduleNumber: module.moduleNumber || module.order?.toString() || "",
    tags: Array.isArray(module.tags) ? [...module.tags] : [],
    lessons: Array.isArray(module.lessons)
      ? module.lessons.map((l) => l._id || l)
      : [],
    prerequisites: Array.isArray(module.prerequisites)
      ? module.prerequisites.map((p) => p._id || p)
      : [],
    estimatedDuration: module.estimatedDuration || 60,
    difficulty: module.difficulty || "BEGINNER",
    badgeId: module.badgeId || "",
    xpReward: module.xpReward || 200,
  };
};

/**
 * Normalise form data for API submission.
 *
 * - Trims whitespace from `title`, `shortDescription`, and `description`.
 * - Conditionally includes `order` (only when > 0 and not null/undefined).
 * - Conditionally includes `moduleNumber` (only when non-empty after trim).
 * - Strips `badgeId` when it's an empty string (sends `undefined`).
 *
 * @param {object} formData - The raw form data from the editor.
 * @returns {object} A cleaned payload suitable for PUT/POST to the API.
 */
export const normalizeModuleForAPI = (formData) => {
  const payload = {
    title: formData.title.trim(),
    shortDescription: formData.shortDescription?.trim() || "",
    description: formData.description.trim(),
    icon: formData.icon,
    color: formData.color,
    isPublished: formData.isPublished,
    tags: formData.tags,
    lessons: formData.lessons,
    prerequisites: formData.prerequisites,
    estimatedDuration: formData.estimatedDuration,
    difficulty: formData.difficulty,
    badgeId: formData.badgeId || undefined,
    xpReward: formData.xpReward,
  };

  if (
    formData.order !== null &&
    formData.order !== undefined &&
    formData.order > 0
  ) {
    payload.order = formData.order;
  }

  if (formData.moduleNumber && formData.moduleNumber.trim()) {
    payload.moduleNumber = formData.moduleNumber.trim();
  }

  return payload;
};
