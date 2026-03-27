import { useState, useEffect } from "react";
import { BaseModal } from "../components/ui";
import { adminApiClient, useNotification } from "../context";
import {
  FileText,
  Settings,
  Code,
  Save,
  X,
  Plus,
  Minus,
  Trophy,
  Clock,
  Hash,
  Tag,
} from "lucide-react";

// Utilities
import {
  DEFAULT_LESSON_FORM_DATA,
  mapLessonToFormData,
  normalizeLessonForAPI,
} from "../utils/lessonFormUtils";

// Icons for tabs
const TABS = [
  { id: "content", label: "Content", icon: FileText },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "advanced", label: "Advanced", icon: Code },
];

const LessonEditorModal = ({ isOpen, onClose, lesson, onSave }) => {
  const isEditing = !!lesson;
  const { showToast, showConfirm } = useNotification();

  const [formData, setFormData] = useState(DEFAULT_LESSON_FORM_DATA);
  const [modules, setModules] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [saving, setSaving] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [newHint, setNewHint] = useState("");
  const [activeTab, setActiveTab] = useState("content");

  // Initialize form data
  useEffect(() => {
    if (isOpen) {
      if (lesson) {
        setFormData(mapLessonToFormData(lesson));
      } else {
        setFormData(JSON.parse(JSON.stringify(DEFAULT_LESSON_FORM_DATA)));
      }
      fetchModules();
      fetchLessons();
    }
  }, [isOpen, lesson?._id]);

  const fetchModules = async () => {
    try {
      const data = await adminApiClient.get("/content/modules?limit=1000");
      setModules(data?.modules || []);
    } catch (error) {
      console.error("Failed to fetch modules:", error);
      showToast("Failed to load modules", "error");
    }
  };

  const fetchLessons = async () => {
    try {
      const data = await adminApiClient.get("/content/lessons?limit=1000");
      setLessons(data?.lessons || []);
    } catch (error) {
      console.error("Failed to fetch lessons:", error);
      showToast("Failed to load lessons", "error");
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
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

  const handleAddHint = () => {
    if (newHint.trim()) {
      setFormData((prev) => ({
        ...prev,
        hints: [...prev.hints, newHint.trim()],
      }));
      setNewHint("");
    }
  };

  const handleRemoveHint = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      hints: prev.hints.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.moduleId) return;

    if (formData.contentType === "exercise") {
      try {
        if (formData.testCases) JSON.parse(formData.testCases);
      } catch (err) {
        return showToast("Invalid JSON format in Test Cases", "error");
      }
    }

    setSaving(true);
    try {
      const payload = normalizeLessonForAPI(formData);

      if (isEditing) {
        await adminApiClient.patch(`/content/lessons/${lesson._id}`, payload);
        showToast("Lesson updated successfully", "success");
      } else {
        await adminApiClient.post("/content/lessons", payload);
        showToast("Lesson created successfully", "success");
      }

      onSave?.();
      onClose();
    } catch (error) {
      showToast(`Failed to ${isEditing ? "update" : "create"} lesson`, "error");
      console.error("Save error:", error);
    } finally {
      setSaving(false);
    }
  };

  // Updated handleDelete with confirmation modal
  const handleDelete = () => {
    showConfirm({
      title: "Delete Lesson",
      message: `Are you sure you want to delete "${lesson?.title}"? This action cannot be undone.`,
      confirmText: "Delete Lesson",
      type: "danger",
      onConfirm: async () => {
        try {
          await adminApiClient.delete(`/content/lessons/${lesson._id}`);
          showToast("Lesson deleted successfully", "success");
          onSave?.();
          onClose();
        } catch (error) {
          showToast("Failed to delete lesson", "error");
          console.error("Delete error:", error);
        }
      },
    });
  };

  // ===== RENDER FUNCTIONS =====

  const renderContentTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleChange("title", e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          rows="3"
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Content (Markdown) *
        </label>
        <textarea
          value={formData.content}
          onChange={(e) => handleChange("content", e.target.value)}
          rows="10"
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 font-mono text-sm"
          placeholder="# Lesson Title..."
          required
        />
        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Supports Markdown, code blocks, and embedded content
        </div>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Content Type *
            </label>
            <select
              value={formData.contentType}
              onChange={(e) => handleChange("contentType", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            >
              <option value="theory">Theory/Lesson</option>
              <option value="exercise">Code Exercise</option>
              <option value="quiz">Quiz/Assessment</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Difficulty *
            </label>
            <select
              value={formData.difficulty}
              onChange={(e) => handleChange("difficulty", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              XP Reward *
            </label>
            <div className="relative">
              <Trophy className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-yellow-500" />
              <input
                type="number"
                value={formData.xpReward}
                onChange={(e) =>
                  handleChange("xpReward", parseInt(e.target.value) || 0)
                }
                min="0"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Estimated Time (minutes)
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input
                type="number"
                value={formData.estimatedTime}
                onChange={(e) =>
                  handleChange("estimatedTime", parseInt(e.target.value) || 0)
                }
                min="1"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Module *
            </label>
            <select
              value={formData.moduleId}
              onChange={(e) => handleChange("moduleId", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              required
            >
              <option value="">Select a module</option>
              {modules.map((module) => (
                <option key={module._id} value={module._id}>
                  {module.title} {!module.isPublished && "(Draft)"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Order in Module *
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input
                type="number"
                value={formData.order}
                onChange={(e) =>
                  handleChange("order", parseInt(e.target.value) || 0)
                }
                min="0"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Prerequisite Lessons
            </label>
            <select
              multiple
              value={formData.prerequisiteLessonIds || []}
              onChange={(e) => {
                const selected = Array.from(
                  e.target.selectedOptions,
                  (opt) => opt.value,
                );
                handleChange("prerequisiteLessonIds", selected);
              }}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 h-32"
            >
              {lessons
                .filter((l) => l._id !== lesson?._id)
                .map((l) => (
                  <option key={l._id} value={l._id}>
                    {l.title} {l.isPublished ? "" : " (Draft)"} (Order {l.order}
                    )
                  </option>
                ))}
            </select>
            <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Hold Ctrl/Cmd to select multiple
            </div>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Tags
        </label>
        <div className="flex items-center space-x-2 mb-3">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) =>
              e.key === "Enter" && (e.preventDefault(), handleAddTag())
            }
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
            placeholder="Add a tag..."
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="p-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            >
              <Tag className="h-3 w-3 mr-1" />
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Exercise-Specific Fields */}
      {formData.contentType === "exercise" && (
        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Exercise Settings
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Initial Code
              </label>
              <textarea
                value={formData.initialCode}
                onChange={(e) => handleChange("initialCode", e.target.value)}
                rows="6"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-900 text-white font-mono text-sm"
                placeholder="# Starter code for students..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Solution Code
              </label>
              <textarea
                value={formData.solution}
                onChange={(e) => handleChange("solution", e.target.value)}
                rows="6"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-900 text-white font-mono text-sm"
                placeholder="# Complete solution..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Test Cases (JSON)
              </label>
              <textarea
                value={formData.testCases}
                onChange={(e) => handleChange("testCases", e.target.value)}
                rows="6"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-900 text-white font-mono text-sm"
                placeholder='[{ "input": "", "expected": "Hello", "description": "Basic" }]'
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Hints
              </label>
              <div className="space-y-2">
                {formData.hints.map((hint, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
                  >
                    <span className="text-gray-700 dark:text-gray-300">
                      Hint {index + 1}: {hint}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveHint(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newHint}
                    onChange={(e) => setNewHint(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), handleAddHint())
                    }
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                    placeholder="Add a hint..."
                  />
                  <button
                    type="button"
                    onClick={handleAddHint}
                    className="p-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderAdvancedTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Challenge Group
          </label>
          <input
            type="text"
            value={formData.challengeGroup}
            onChange={(e) => handleChange("challengeGroup", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg"
            placeholder="e.g., 'week-1-challenges'"
          />
          <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Group lessons together for challenge tracking
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Publish Status
          </label>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => handleChange("isPublished", !formData.isPublished)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.isPublished
                  ? "bg-green-500"
                  : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.isPublished ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span
              className={`text-sm font-medium ${
                formData.isPublished ? "text-green-600" : "text-gray-500"
              }`}
            >
              {formData.isPublished ? "Published" : "Draft"}
            </span>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      {isEditing && (
        <div className="pt-6 border-t border-red-200 dark:border-red-800">
          <h3 className="text-lg font-medium text-red-800 dark:text-red-300 mb-4">
            Danger Zone
          </h3>
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-red-800 dark:text-red-300">
                  Delete Lesson
                </p>
                <p className="text-sm text-red-700 dark:text-red-400">
                  This action cannot be undone.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Delete Lesson
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ===== MODAL FOOTER =====
  const modalFooter = (
    <div className="flex justify-between items-center w-full">
      <div className="text-sm text-gray-500 dark:text-gray-400">
        {isEditing && lesson?.updatedAt
          ? `Last updated: ${new Date(lesson.updatedAt).toLocaleDateString()}`
          : "New lesson"}
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
          form="lesson-form"
          disabled={saving || !formData.title.trim() || !formData.moduleId}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
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
              <Save className="h-4 w-4 inline mr-2" />
              {isEditing ? "Update Lesson" : "Create Lesson"}
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
      title={isEditing ? "Edit Lesson" : "Create New Lesson"}
      size="6xl"
      closeOnOverlayClick
      closeOnEscape
      footer={modalFooter}
      footerAlign="between"
    >
      {/* Subtitle */}
      <p className="text-sm text-gray-500 mb-6">
        {isEditing
          ? `Editing: ${lesson.title}`
          : "Create a new learning lesson"}
      </p>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="flex space-x-8">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                <Icon className="h-4 w-4 inline mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Form */}
      <form
        id="lesson-form"
        onSubmit={handleSubmit}
        className="max-h-[60vh] overflow-y-auto pr-2"
      >
        {activeTab === "content" && renderContentTab()}
        {activeTab === "settings" && renderSettingsTab()}
        {activeTab === "advanced" && renderAdvancedTab()}
      </form>
    </BaseModal>
  );
};

export default LessonEditorModal;
