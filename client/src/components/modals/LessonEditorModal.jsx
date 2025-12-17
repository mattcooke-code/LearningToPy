// LessonEditorModal.jsx
import { useState, useEffect } from "react";
import { adminApiClient, useNotification } from "../../context";
import {
  X,
  Save,
  FileText,
  Code,
  Hash,
  Trophy,
  Zap,
  Tag,
  Eye,
  EyeOff,
  Clock,
  Check,
  AlertTriangle,
  HelpCircle,
  BookOpen,
  Link,
  Plus,
  Minus,
  Settings,
} from "lucide-react";

const LessonEditorModal = ({ lesson, onClose, onSave }) => {
  const isEditing = !!lesson;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    difficulty: "beginner",
    xpReward: 100,
    estimatedTime: 15,
    order: 0,
    isPublished: false,
    tags: [],
    moduleId: "",
    prerequisiteLessonIds: [],
    challengeGroup: "",
    contentType: "theory", // 'theory', 'exercise', 'quiz'
    // Exercise specific
    initialCode: "",
    testCases: "",
    solution: "",
    hints: [],
    // Quiz specific
    questions: [],
  });

  const [modules, setModules] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [newHint, setNewHint] = useState("");
  const [activeTab, setActiveTab] = useState("content");
  const { showConfirm } = useNotification();

  useEffect(() => {
    if (lesson) {
      setFormData({
        title: lesson.title || "",
        description: lesson.description || "",
        content: lesson.content || "",
        difficulty: lesson.difficulty || "beginner",
        xpReward: lesson.xpReward || 100,
        estimatedTime: lesson.estimatedTime || 15,
        order: lesson.order || 0,
        isPublished: lesson.isPublished || false,
        tags: lesson.tags || [],
        moduleId: lesson.moduleId || "",
        prerequisiteLessonIds: lesson.prerequisiteLessonIds || [],
        challengeGroup: lesson.challengeGroup || "",
        contentType: lesson.contentType || "theory",
        initialCode: lesson.initialCode || "",
        testCases: lesson.testCases || "",
        solution: lesson.solution || "",
        hints: lesson.hints || [],
        questions: lesson.questions || [],
      });
    }
    fetchModules();
    fetchLessons();
  }, [lesson]);

  const fetchModules = async () => {
    try {
      const response = await adminApiClient.get("/content/modules?limit=1000");
      setModules(response.data.data?.modules || []);
    } catch (error) {
      console.error("Failed to fetch modules:", error);
    }
  };

  const fetchLessons = async () => {
    try {
      const response = await adminApiClient.get("/content/lessons?limit=1000");
      setLessons(response.data.data?.lessons || []);
    } catch (error) {
      console.error("Failed to fetch lessons:", error);
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
    setSaving(true);

    try {
      if (isEditing) {
        await adminApiClient.patch(`/content/lessons/${lesson._id}`, formData);
        showConfirm("Lesson updated successfully", "success");
      } else {
        await adminApiClient.post("/content/lessons", formData);
        showConfirm("Lesson created successfully", "success");
      }

      onSave();
      onClose();
    } catch (error) {
      showConfirm(
        `Failed to ${isEditing ? "update" : "create"} lesson`,
        "error"
      );
      console.error("Save error:", error);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "content", label: "Content", icon: FileText },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "advanced", label: "Advanced", icon: Code },
  ];

  const renderContentTab = () => (
    <div className="space-y-6">
      {/* Title & Description */}
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Brief description of the lesson..."
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
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            placeholder="# Lesson Title

## Introduction
Write your lesson content here using Markdown...

## Examples
```python
print('Hello, World!')

Exercises
Try this...

Challenge: ..."
            required
          />
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Supports Markdown, code blocks, and embedded content
          </div>
        </div>
      </div>{" "}
    </div>
  );
  const renderSettingsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Settings */}
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
                max="1000"
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
                max="240"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
            </div>
          </div>
        </div>

        {/* Module & Order */}
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
                  {module.title} {module.isPublished ? "" : "(Draft)"}
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
              value={formData.prerequisiteLessonIds}
              onChange={(e) => {
                const selected = Array.from(
                  e.target.selectedOptions,
                  (option) => option.value
                );
                handleChange("prerequisiteLessonIds", selected);
              }}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 h-32"
            >
              {lessons
                .filter((l) => l._id !== lesson?._id)
                .map((lesson) => (
                  <option key={lesson._id} value={lesson._id}>
                    {lesson.title} (Level {lesson.order})
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
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            placeholder="Add a tag..."
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
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

      {/* Exercise Specific */}
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
                placeholder="# Starter code for students
            def hello_world():
# Your code here
pass"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Solution Code (Hidden from students)
              </label>
              <textarea
                value={formData.solution}
                onChange={(e) => handleChange("solution", e.target.value)}
                rows="6"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-900 text-white font-mono text-sm"
                placeholder="# Complete solution
            def hello_world():
return 'Hello, World!'"
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
                placeholder='[{
"input": "",
"expected": "Hello, World!",
"description": "Basic test"
}
]'
              />
            </div>
            {/* Hints */}
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
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
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
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    placeholder="Add a hint..."
                  />
                  <button
                    type="button"
                    onClick={handleAddHint}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
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
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
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
                formData.isPublished
                  ? "text-green-600 dark:text-green-400"
                  : "text-gray-500 dark:text-gray-400"
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
          <div className="space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-red-800 dark:text-red-300">
                    Delete Lesson
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-400">
                    Once deleted, this lesson cannot be recovered. Users will
                    lose access.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    if (
                      window.confirm(
                        "Are you sure you want to delete this lesson? This action cannot be undone."
                      )
                    ) {
                      try {
                        await adminApiClient.delete(
                          `/content/lessons/${lesson._id}`
                        );
                        showConfirm("Lesson deleted", "success");
                        onSave();
                        onClose();
                      } catch (error) {
                        showConfirm("Failed to delete lesson", "error");
                      }
                    }
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete Lesson
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />
        {/* Modal panel */}
        <div className="inline-block w-full max-w-6xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-2xl">
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-white">
                    {isEditing ? "Edit Lesson" : "Create New Lesson"}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {isEditing
                      ? `Editing: ${lesson.title}`
                      : "Create a new learning lesson"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
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
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
              {activeTab === "content" && renderContentTab()}
              {activeTab === "settings" && renderSettingsTab()}
              {activeTab === "advanced" && renderAdvancedTab()}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {isEditing
                    ? `Last updated: ${
                        lesson.updatedAt
                          ? new Date(lesson.updatedAt).toLocaleDateString()
                          : "Unknown"
                      }`
                    : "New lesson"}
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LessonEditorModal;
