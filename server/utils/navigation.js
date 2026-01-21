// navigation.js
const Module = require("../models/Module");
const Lesson = require("../models/Lesson");
const { slugify } = require("./generalUtils");

// --- CACHING ---
const moduleCache = new Map();
const orderedCache = new Map();

// --- MODULE SLUG CONSTANTS ---
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

/**
 * --- FINDERS (SLUGS & IDS) ---
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

const getModuleIdBySlug = async (slug) => {
  if (!slug) return null;
  if (moduleCache.has(slug)) return moduleCache.get(slug);

  let moduleDoc = await Module.findOne({ slug }).select("_id title").lean();

  // Fallback: search by slugified title if slug field is missing/wrong
  if (!moduleDoc) {
    const allModules = await Module.find().select("_id title slug").lean();
    moduleDoc = allModules.find((mod) => slugify(mod.title) === slug);

    if (moduleDoc) {
      // Repair the slug in DB for next time
      await Module.updateOne({ _id: moduleDoc._id }, { slug });
    }
  }

  const moduleId = moduleDoc ? moduleDoc._id.toString() : null;
  if (moduleId) moduleCache.set(slug, moduleId);
  return moduleId;
};

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

/**
 * --- FLOW CONTROL (NEXT STEP LOGIC) ---
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

const findNextModule = async (module) => {
  const nextModule = await Module.findOne({
    order: module.order + 1,
    isPublished: true,
  }).select("_id");

  return nextModule?._id || null;
};

/**
 * Clear caches when content is updated via admin panel
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
