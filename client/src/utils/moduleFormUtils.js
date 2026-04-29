// /src/utils/moduleFormUtils.js
import {
  BookOpen,
  FileText,
  Database,
  Puzzle,
  Code,
  Rocket,
  Zap,
  Lightbulb,
  Palette,
  Cog,
  Star,
  Trophy,
  Flame,
  Leaf,
  Heart,
  Shield,
  Globe,
} from "lucide-react";

/**
 * Default form state for module creation/editing
 */
export const DEFAULT_MODULE_FORM_DATA = {
  title: "",
  shortDescription: "",
  description: "",
  icon: "book", // key from ICON_MAP
  color: "blue", // default theme color
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
 * Maps API module data to form-compatible state
 * @param {Object} module - Module from API
 * @returns {Object} Form-ready data
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
 * Normalizes form data for API submission
 * Ensures arrays are clean and removes UI-only fields
 * @param {Object} formData - Form state
 * @returns {Object} API-ready payload
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
    lessons: formData.lessons, // array of lesson IDs
    prerequisites: formData.prerequisites, // array of module IDs
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
