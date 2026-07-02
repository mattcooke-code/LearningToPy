// /src/modals/ModuleEditorModal.jsx
import { useState, useEffect, useMemo, useCallback } from "react";
import { BaseModal } from "../components/ui";
import { useNotification } from "../context";
import { adminApiClient } from "../services";
import {
  X,
  Save,
  FileText,
  Trophy,
  Hash,
  Tag,
  MoveVertical,
  ArrowRight,
  Search,
  Plus,
  Minus,
  BookOpen,
  Shield,
  Zap,
} from "lucide-react";

// Hooks & Utilities
import { useConfirmActions } from "../hooks";
import {
  DEFAULT_MODULE_FORM_DATA,
  mapModuleToFormData,
  normalizeModuleForAPI,
  calculateModuleEditorStats,
} from "../utils";

// Icons
import { ICON_MAP } from "../components/icons/ModuleIconMap";

/**
 * @fileoverview
 * Comprehensive module editor modal with lesson management and statistics calculation.
 * This component provides a full-featured module editing experience with lesson ordering,
 * statistics tracking, tag management, and publication controls. Features efficient data
 * management with memoized calculations, drag-and-drop lesson reordering, and comprehensive
 * form validation for module content organization.
 */

/**
 * Comprehensive module editor modal with lesson management and statistics calculation.
 *
 * This component creates a powerful module editing interface that manages module metadata,
 * lesson organization, and statistical calculations. Features include drag-and-drop lesson
 * reordering, real-time statistics updates, tag management, and publication controls.
 * The modal handles both creation and editing modes with efficient data management using
 * memoized calculations and optimized data fetching to prevent N+1 API calls.
 *
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to close the modal
 * @param {Object|null} props.module - Existing module data for editing mode, null for creation
 * @param {Function} props.onSave - Callback function to refresh parent components after save
 * @returns {JSX.Element} Comprehensive module editing interface with lesson management
 */
const ModuleEditorModal = ({ isOpen, onClose, module, onSave }) => {
  const isEditing = !!module;
  const { showToast } = useNotification();
  const { confirmDelete } = useConfirmActions();

  // State
  const [formData, setFormData] = useState(DEFAULT_MODULE_FORM_DATA);
  const [allLessons, setAllLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [lessonSearch, setLessonSearch] = useState("");

  // 1. Initialize form and fetch lesson library once
  useEffect(() => {
    if (isOpen) {
      if (module) {
        setFormData(mapModuleToFormData(module));
      } else {
        setFormData({
          ...DEFAULT_MODULE_FORM_DATA,
          order: null,
          moduleNumber: "",
          isPublished: false,
          lessons: [],
          tags: [],
          prerequisites: [],
        });
      }
      fetchLessons();
    }
  }, [isOpen, module]);

  const fetchLessons = async () => {
    setLoading(true);
    try {
      const data = await adminApiClient.get("/content/lessons?limit=1000");
      setAllLessons(data?.lessons || []);
    } catch (error) {
      console.error("Failed to fetch lessons:", error);
      showToast("Failed to load lesson library", "error");
    } finally {
      setLoading(false);
    }
  };

  // 2. Derive Module Lessons from local library (Replaces N+1 API calls)
  const moduleLessons = useMemo(() => {
    return formData.lessons
      .map((id) => allLessons.find((l) => l._id === id))
      .filter(Boolean);
  }, [formData.lessons, allLessons]);

  // 3. Derive Stats (Replaces inline calculation on every render)
  const stats = useMemo(() => {
    return calculateModuleEditorStats(moduleLessons, formData.xpBonus);
  }, [moduleLessons, formData.xpBonus]);

  // 4. Form Handlers
  const handleChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleAddTag = () => {
    const trimmed = newTag.trim();
    if (trimmed && !formData.tags.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, trimmed],
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  // 5. Lesson Selection Logic
  const availableLessons = useMemo(() => {
    const searchLower = lessonSearch.toLowerCase();
    return allLessons
      .filter((lesson) => !formData.lessons.includes(lesson._id))
      .filter(
        (lesson) =>
          lesson.title?.toLowerCase().includes(searchLower) ||
          lesson.description?.toLowerCase().includes(searchLower),
      );
  }, [allLessons, formData.lessons, lessonSearch]);

  const handleAddLesson = (lessonId) => {
    if (!formData.lessons.includes(lessonId)) {
      setFormData((prev) => ({
        ...prev,
        lessons: [...prev.lessons, lessonId],
      }));
    }
  };

  const handleRemoveLesson = (lessonId) => {
    setFormData((prev) => ({
      ...prev,
      lessons: prev.lessons.filter((id) => id !== lessonId),
    }));
  };

  const handleReorderLesson = (fromIndex, toIndex) => {
    const newOrder = [...formData.lessons];
    const [moved] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, moved);
    setFormData((prev) => ({ ...prev, lessons: newOrder }));
  };

  // 6. Persistence Handlers
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.shortDescription.trim()) return;

    setSaving(true);
    try {
      const payload = normalizeModuleForAPI(formData);

      if (isEditing) {
        await adminApiClient.patch(`/content/modules/${module._id}`, payload);
        showToast("Module updated successfully", "success");
      } else {
        await adminApiClient.post("/content/modules", payload);
        showToast("Module created successfully", "success");
      }

      onSave?.();
      onClose();
    } catch (error) {
      showToast(`Failed to ${isEditing ? "update" : "create"} module`, "error");
      console.error("Save error:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = await confirmDelete("Module");

    if (!confirmed) return;

    try {
      await adminApiClient.delete(`/content/modules/${module._id}`);
      showToast("Module deleted", "success");
      onSave?.();
      onClose();
    } catch (error) {
      showToast("Failed to delete module", "error");
      console.error("Delete error:", error);
    }
  };

  // Stats Preview
  const renderStatsPreview = () => (
    <div className="grid grid-cols-4 gap-4">
      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 text-center border border-gray-100 dark:border-gray-800">
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {stats.count}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">Lessons</div>
      </div>
      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 text-center border border-gray-100 dark:border-gray-800">
        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          {stats.totalXp}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">Total XP</div>
      </div>
      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 text-center border border-gray-100 dark:border-gray-800">
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {stats.totalTime}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">Minutes</div>
      </div>
      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 text-center border border-gray-100 dark:border-gray-800">
        <div className="text-2xl font-bold text-yellow-600">
          {stats.bonusXp}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">Bonus XP</div>
      </div>
    </div>
  );

  // ===== MODAL FOOTER =====
  const modalFooter = (
    <div className="flex justify-between items-center w-full">
      <div className="text-sm text-gray-500 dark:text-gray-400">
        {isEditing && module?.updatedAt
          ? `Last updated: ${new Date(module.updatedAt).toLocaleDateString()}`
          : "New module"}
      </div>
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          form="module-form"
          disabled={
            saving ||
            !formData.title?.trim() ||
            !formData.shortDescription?.trim()
          }
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Saving...
            </span>
          ) : (
            <>
              <Save className="h-4 w-4 inline mr-2" aria-hidden="true" />
              {isEditing ? "Update Module" : "Create Module"}
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Module" : "Create New Module"}
      size="6xl"
      closeOnOverlayClick
      closeOnEscape
      footer={modalFooter}
    >
      <form
        id="module-form"
        onSubmit={handleSubmit}
        className="max-h-[70vh] overflow-y-auto pr-2"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Basic Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="module-title"
                  className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
                >
                  Title *
                </label>
                <input
                  id="module-title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="module-short-description"
                  className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
                >
                  Short Description *
                </label>
                <input
                  id="module-short-description"
                  type="text"
                  value={formData.shortDescription}
                  onChange={(e) =>
                    handleChange("shortDescription", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="module-description"
                  className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
                >
                  Full Description
                </label>
                <textarea
                  id="module-description"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Icon & Theme */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="module-icon"
                  className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
                >
                  Module Icon
                </label>
                <div className="relative">
                  <div
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    aria-hidden="true"
                  >
                    {(() => {
                      const Icon = ICON_MAP[formData.icon] || FileText;
                      return <Icon className="h-5 w-5 text-gray-500" />;
                    })()}
                  </div>
                  <select
                    id="module-icon"
                    value={formData.icon}
                    onChange={(e) => handleChange("icon", e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.keys(ICON_MAP).map((key) => (
                      <option key={key} value={key}>
                        {key}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label
                  htmlFor="module-theme-color"
                  className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
                >
                  Theme Color
                </label>
                <div className="flex space-x-2">
                  <input
                    id="module-theme-color"
                    type="color"
                    value={formData.themeColor}
                    onChange={(e) => handleChange("themeColor", e.target.value)}
                    className="h-10 w-12 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                    aria-label="Select theme color"
                  />
                  <input
                    type="text"
                    value={formData.themeColor}
                    onChange={(e) => handleChange("themeColor", e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    aria-label="Theme color hex value"
                  />
                </div>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label
                htmlFor="new-module-tag"
                className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
              >
                Tags
              </label>
              <div className="flex space-x-2 mb-3">
                <div className="relative flex-1">
                  <Tag
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                    aria-hidden="true"
                  />
                  <input
                    id="new-module-tag"
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), handleAddTag())
                    }
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Add a tag..."
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  aria-label="Add tag"
                >
                  <Plus className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200 rounded-full text-xs border border-blue-100 dark:border-blue-800"
                  >
                    <Tag
                      className="h-3 w-3 mr-1.5 opacity-60"
                      aria-hidden="true"
                    />
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 hover:text-red-500 transition-colors"
                      aria-label={`Remove tag: ${tag}`}
                    >
                      <X className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Settings & Stats */}
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                Module Stats
              </h3>
              {renderStatsPreview()}
            </div>
            <div className="space-y-4 bg-gray-50 dark:bg-gray-900/30 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
              <div>
                <label
                  htmlFor="module-xp-bonus"
                  className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
                >
                  XP Bonus
                </label>
                <div className="relative">
                  <Trophy
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-yellow-500"
                    aria-hidden="true"
                  />
                  <input
                    id="module-xp-bonus"
                    type="number"
                    value={formData.xpBonus}
                    onChange={(e) =>
                      handleChange("xpBonus", parseInt(e.target.value) || 0)
                    }
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="module-order"
                  className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
                >
                  Order Index
                </label>
                <div className="relative">
                  <Hash
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                    aria-hidden="true"
                  />
                  <input
                    id="module-order"
                    type="number"
                    value={formData.order === null ? "" : formData.order}
                    onChange={(e) => {
                      const val = e.target.value;
                      handleChange("order", val === "" ? null : parseInt(val));
                    }}
                    placeholder={!isEditing ? "Auto-assigned" : ""}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    disabled={!isEditing}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {isEditing
                    ? "Determines module order in the curriculum"
                    : "Will be automatically assigned the next available number"}
                </p>
              </div>
              <div>
                <label
                  htmlFor="module-number"
                  className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
                >
                  Module Number
                </label>
                <div className="relative">
                  <Hash
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                    aria-hidden="true"
                  />
                  <input
                    id="module-number"
                    type="text"
                    value={formData.moduleNumber || ""}
                    onChange={(e) =>
                      handleChange("moduleNumber", e.target.value)
                    }
                    placeholder={!isEditing ? "Auto-generated from order" : ""}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    disabled={!isEditing}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {isEditing
                    ? "Module identifier (e.g., M1, M2, M3)"
                    : "Will be automatically generated (e.g., M21)"}
                </p>
              </div>
              <div>
                <label
                  htmlFor="module-difficulty"
                  className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
                >
                  Difficulty
                </label>
                <select
                  id="module-difficulty"
                  value={formData.difficulty}
                  onChange={(e) => handleChange("difficulty", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Lessons Management */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
              <BookOpen
                className="h-5 w-5 mr-2 text-blue-500"
                aria-hidden="true"
              />
              Module Lessons ({moduleLessons.length})
            </h3>
            {loading && (
              <span
                className="text-xs text-blue-500 animate-pulse font-medium"
                role="status"
              >
                Updating Library...
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Library Selection */}
            <div className="lg:col-span-1">
              <div className="relative mb-4">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                  aria-hidden="true"
                />
                <label htmlFor="lesson-search" className="sr-only">
                  Search lesson library
                </label>
                <input
                  id="lesson-search"
                  type="text"
                  placeholder="Search lesson library..."
                  value={lessonSearch}
                  onChange={(e) => setLessonSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div
                className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar"
                tabIndex={0}
                role="listbox"
                aria-label="Available lessons"
              >
                {availableLessons.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                    No lessons available
                  </div>
                ) : (
                  availableLessons.map((lesson) => (
                    <div
                      key={lesson._id}
                      onClick={() => handleAddLesson(lesson._id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleAddLesson(lesson._id);
                        }
                      }}
                      className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:border-blue-500 hover:shadow-md transition-all group"
                      role="option"
                      aria-selected={false}
                      tabIndex={0}
                    >
                      <div className="flex justify-between items-center">
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold truncate text-gray-900 dark:text-white">
                            {lesson.title}
                          </div>
                          <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">
                            {lesson.contentType} • {lesson.xpReward} XP
                          </div>
                        </div>
                        <ArrowRight
                          className="h-4 w-4 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all"
                          aria-hidden="true"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Current Module Content */}
            <div className="lg:col-span-2 space-y-3">
              {moduleLessons.length === 0 ? (
                <div className="h-full min-h-[200px] border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl flex flex-col items-center justify-center text-gray-400">
                  <Plus
                    className="h-8 w-8 mb-2 opacity-20"
                    aria-hidden="true"
                  />
                  <p className="text-sm">
                    Click lessons on the left to add them
                  </p>
                </div>
              ) : (
                moduleLessons.map((lesson, index) => (
                  <div
                    key={lesson._id}
                    className="group flex items-center p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col mr-4 border-r border-gray-100 dark:border-gray-700 pr-3">
                      <button
                        type="button"
                        onClick={() => handleReorderLesson(index, index - 1)}
                        disabled={index === 0}
                        className="text-gray-400 disabled:opacity-10 hover:text-blue-500 transition-colors"
                        aria-label={`Move ${lesson.title} up`}
                      >
                        <MoveVertical
                          className="h-4 w-4 rotate-180"
                          aria-hidden="true"
                        />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReorderLesson(index, index + 1)}
                        disabled={index === moduleLessons.length - 1}
                        className="text-gray-400 disabled:opacity-10 hover:text-blue-500 transition-colors"
                        aria-label={`Move ${lesson.title} down`}
                      >
                        <MoveVertical className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>

                    <div
                      className="h-10 w-10 rounded-lg bg-gray-50 dark:bg-gray-700/50 flex items-center justify-center mr-4 shrink-0 border border-gray-100 dark:border-gray-600"
                      aria-hidden="true"
                    >
                      {(() => {
                        const IconComponent = ICON_MAP[lesson.icon] || FileText;
                        return (
                          <IconComponent className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        );
                      })()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span
                          className="text-[10px] font-mono font-bold text-gray-400 bg-gray-50 dark:bg-gray-900 px-1.5 py-0.5 rounded border border-gray-100 dark:border-gray-800"
                          aria-label={`Position ${index + 1}`}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                          {lesson.title}
                        </h3>
                      </div>
                      <div className="flex items-center mt-1 space-x-3 text-[11px] text-gray-500">
                        <span className="flex items-center">
                          <Zap
                            className="h-3 w-3 mr-1 text-yellow-500 fill-yellow-500"
                            aria-hidden="true"
                          />{" "}
                          {lesson.xpReward} XP
                        </span>
                        <span
                          className="w-1 h-1 bg-gray-300 rounded-full"
                          aria-hidden="true"
                        />
                        <span className="capitalize">{lesson.difficulty}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveLesson(lesson._id)}
                      className="ml-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                      aria-label={`Remove ${lesson.title} from module`}
                    >
                      <Minus className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Delete Module Section */}
        {isEditing && (
          <div className="mt-16 p-6 border border-red-100 dark:border-red-900/20 bg-red-50/50 dark:bg-red-900/5 rounded-2xl flex justify-between items-center">
            <div className="flex items-start space-x-3">
              <div
                className="p-2 bg-red-100 dark:bg-red-900/40 rounded-lg"
                aria-hidden="true"
              >
                <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-red-900 dark:text-red-200 font-bold">
                  Delete this Module?
                </p>
                <p className="text-xs text-red-700 dark:text-red-400 mt-0.5">
                  This will unlink all lessons but won't delete the lessons from
                  your library.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDelete}
              className="px-5 py-2.5 bg-red-600 text-white font-semibold rounded-xl text-sm hover:bg-red-700 shadow-sm shadow-red-200 transition-all"
            >
              Confirm Delete
            </button>
          </div>
        )}
      </form>
    </BaseModal>
  );
};

export default ModuleEditorModal;
