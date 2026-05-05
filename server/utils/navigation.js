// navigation.js
const Module = require("../models/Module");
const Lesson = require("../models/Lesson");
const { slugify } = require("./generalUtils");

// --- CACHING ---
/**
 * In-memory caches to avoid repeated DB lookups for module data.
 * Cleared via `clearNavigationCaches()` when content is updated.
 * @see clearNavigationCaches
 */
const moduleCache = new Map();
const orderedCache = new Map();

// --- MODULE SLUG CONSTANTS ---
/**
 * Human-readable slug constants for known modules.
 * Used for URL generation and slug-based lookups.
 */
const MODULE_SLUGS = {
  PYTHON_FUNDAMENTALS: "python-fundamentals",
  CONTROL_FLOW_CONDITIONAL: "control-flow-conditionals",
  ITERATION: "iteration",
  FUNCTIONS: "functions",
  ADVANCED_FUNCTIONS: "advanced-functions",
  OOP_I: "oop-i-classes-and-objects",
  OOP_II: "oop-ii-inheritance-and-polymorphism",
  DATETIME_MANIPULATION: "datetime-manipulation",
  REGEX_MASTERY: "regular-expressions",
  HTTP_REQUESTS_AND_APIS: "http-requests-and-apis",
  DATA_SCIENCE_INTRO: "introduction-to-data-science",
};

// --- FINDERS (SLUGS & IDS) ---

/**
 * Fetch a module by its MongoDB ID with caching.
 * Subsequent calls for the same ID within the cache lifetime return the cached value.
 *
 * @param   {string} moduleId - Module ID
 * @returns {Promise<Object|null>} Module document (lean) or null
 */
const getModuleById = async (moduleId) => {
  const cacheKey = `module_${moduleId}`;
  if (moduleCache.has(cacheKey)) {
    return moduleCache.get(cacheKey);
  }

  const module = await Module.findById(moduleId)
    .select("_id slug title order")
    .lean();

  if (module) {
    moduleCache.set(cacheKey, module);
  }

  return module;
};

/**
 * Resolve a URL slug to a module ID.
 *
 * First checks the slug field directly. If not found, searches all modules
 * by slugified title as a fallback and repairs the missing slug in the database.
 *
 * @param   {string} slug - URL slug (e.g., "python-fundamentals")
 * @returns {Promise<string|null>} Module ID or null
 */
const getModuleIdBySlug = async (slug) => {
  if (!slug) return null;
  if (moduleCache.has(slug)) return moduleCache.get(slug);

  let moduleDoc = await Module.findOne({ slug }).select("_id title").lean();

  if (!moduleDoc) {
    const allModules = await Module.find().select("_id title slug").lean();
    moduleDoc = allModules.find((mod) => slugify(mod.title) === slug);

    if (moduleDoc) {
      await Module.updateOne({ _id: moduleDoc._id }, { slug });
    }
  }

  const moduleId = moduleDoc ? moduleDoc._id.toString() : null;
  if (moduleId) moduleCache.set(slug, moduleId);
  return moduleId;
};

/**
 * Get all published module IDs in curriculum order.
 * Results are cached indefinitely (cleared on content updates).
 *
 * @param   {string|number} [limit="all"] - Max IDs to return ("all" or a number)
 * @returns {Promise<string[]>} Ordered module IDs
 */
const getOrderedModuleIds = async (limit = "all") => {
  if (orderedCache.has(limit)) return orderedCache.get(limit);

  const modules = await Module.find({ isPublished: true })
    .select("_id")
    .sort({ order: 1 })
    .lean();

  const ids = modules.map((m) => m._id.toString());
  const result = limit === "all" ? ids : ids.slice(0, limit);

  orderedCache.set(limit, result);
  return result;
};

// --- FLOW CONTROL (NEXT STEP LOGIC) ---

/**
 * Find the next published lesson in the same module.
 *
 * Checks the lesson's `nextLessonId` field first, then falls back to
 * finding the lesson with the next sequential order number.
 *
 * @param   {Object} lesson - Current lesson document
 * @returns {Promise<string|null>} Next lesson ID or null
 */
const findNextLesson = async (lesson) => {
  if (lesson.nextLessonId) return lesson.nextLessonId;

  const nextLesson = await Lesson.findOne({
    moduleId: lesson.moduleId,
    order: lesson.order + 1,
    isPublished: true,
  }).select("_id");

  return nextLesson?._id || null;
};

/**
 * Find the next published module in curriculum order.
 *
 * @param   {Object} module - Current module document
 * @returns {Promise<string|null>} Next module ID or null
 */
const findNextModule = async (module) => {
  const nextModule = await Module.findOne({
    order: module.order + 1,
    isPublished: true,
  }).select("_id");

  return nextModule?._id || null;
};

/**
 * Get the next module ID for a given module order
 * This is used to determine what module should be unlocked after completing the current one
 */
const getNextModuleId = async (currentOrder) => {
  const nextModule = await Module.findOne({
    order: currentOrder + 1,
    isPublished: true,
  }).select("_id");

  return nextModule?._id || null;
};

/**
 * Clear all in-memory navigation caches.
 * Called after content changes (create, update, delete, reorder) via admin panel.
 */
const clearNavigationCaches = () => {
  moduleCache.clear();
  orderedCache.clear();
};

module.exports = {
  MODULE_SLUGS,
  getModuleById,
  getModuleIdBySlug,
  getOrderedModuleIds,
  findNextLesson,
  findNextModule,
  clearNavigationCaches,
};
