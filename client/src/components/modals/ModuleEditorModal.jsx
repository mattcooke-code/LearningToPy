// ModuleEditorModal.jsx
import { useState, useEffect } from "react";
import { adminApiClient, useNotification } from "../../context";
import {
  X,
  Save,
  BookOpen,
  Hash,
  Trophy,
  Zap,
  Tag,
  Eye,
  EyeOff,
  Clock,
  List,
  Plus,
  Minus,
  MoveVertical,
  ArrowRight,
  ArrowLeft,
  Users,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  FileText,
  Search,
  Filter,
} from "lucide-react";

const ModuleEditorModal = ({ module, onClose, onSave }) => {
  const isEditing = !!module;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    shortDescription: "",
    difficulty: "beginner",
    xpBonus: 500,
    estimatedTotalTime: 60,
    order: 0,
    isPublished: false,
    tags: [],
    themeColor: "#3b82f6",
    icon: "book",
    prerequisites: [],
    lessons: [], // Array of lesson IDs in order
  });

  const [availableLessons, setAvailableLessons] = useState([]);
  const [allLessons, setAllLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [lessonSearch, setLessonSearch] = useState("");
  const [selectedLessons, setSelectedLessons] = useState([]);
  const [moduleLessons, setModuleLessons] = useState([]);
  const { showConfirm } = useNotification();

  const icons = [
    "book",
    "code",
    "database",
    "server",
    "globe",
    "lock",
    "key",
    "shield",
    "zap",
    "cpu",
    "wifi",
    "cloud",
    "box",
    "layers",
    "grid",
    "pie-chart",
    "bar-chart",
    "trending-up",
    "users",
    "user-check",
    "target",
    "award",
    "star",
    "flag",
    "compass",
    "map",
    "rocket",
    "lightbulb",
    "coffee",
  ];

  useEffect(() => {
    if (module) {
      setFormData({
        title: module.title || "",
        description: module.description || "",
        shortDescription: module.shortDescription || "",
        difficulty: module.difficulty || "beginner",
        xpBonus: module.xpBonus || 500,
        estimatedTotalTime: module.estimatedTotalTime || 60,
        order: module.order || 0,
        isPublished: module.isPublished || false,
        tags: module.tags || [],
        themeColor: module.themeColor || "#3b82f6",
        icon: module.icon || "book",
        prerequisites: module.prerequisites || [],
        lessons: module.lessons || [],
      });
      if (module.lessons) {
        setModuleLessons(
          module.lessons.map((id) => ({ id, title: "Loading..." }))
        );
      }
    }
    fetchLessons();
  }, [module]);

  useEffect(() => {
    // Fetch lesson details for module lessons
    const fetchModuleLessonDetails = async () => {
      const lessonPromises = formData.lessons.map((lessonId) =>
        adminApiClient.get(`/content/lessons/${lessonId}`).catch(() => null)
      );
      const results = await Promise.all(lessonPromises);
      const lessons = results
        .filter((res) => res?.data?.data)
        .map((res) => res.data.data);
      setModuleLessons(lessons);
    };

    if (formData.lessons.length > 0) {
      fetchModuleLessonDetails();
    }
  }, [formData.lessons]);

  const fetchLessons = async () => {
    try {
      const response = await adminApiClient.get("/content/lessons?limit=1000");
      const lessons = response.data.data?.lessons || [];
      setAllLessons(lessons);
      setAvailableLessons(
        lessons.filter((lesson) => !formData.lessons.includes(lesson._id))
      );
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

  const handleAddLesson = (lessonId) => {
    if (!formData.lessons.includes(lessonId)) {
      const lesson = allLessons.find((l) => l._id === lessonId);
      setFormData((prev) => ({
        ...prev,
        lessons: [...prev.lessons, lessonId],
      }));
      setModuleLessons((prev) => [...prev, lesson]);
      setAvailableLessons((prev) => prev.filter((l) => l._id !== lessonId));
    }
  };

  const handleRemoveLesson = (lessonId) => {
    const lesson = allLessons.find((l) => l._id === lessonId);
    setFormData((prev) => ({
      ...prev,
      lessons: prev.lessons.filter((id) => id !== lessonId),
    }));
    setModuleLessons((prev) => prev.filter((l) => l._id !== lessonId));
    if (lesson) {
      setAvailableLessons((prev) => [...prev, lesson]);
    }
  };

  const handleReorderLesson = (fromIndex, toIndex) => {
    const newLessons = [...formData.lessons];
    const [movedLesson] = newLessons.splice(fromIndex, 1);
    newLessons.splice(toIndex, 0, movedLesson);

    const newModuleLessons = [...moduleLessons];
    const [movedModuleLesson] = newModuleLessons.splice(fromIndex, 1);
    newModuleLessons.splice(toIndex, 0, movedModuleLesson);

    setFormData((prev) => ({ ...prev, lessons: newLessons }));
    setModuleLessons(newModuleLessons);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (isEditing) {
        await adminApiClient.patch(`/content/modules/${module._id}`, formData);
        showConfirm("Module updated successfully", "success");
      } else {
        await adminApiClient.post("/content/modules", formData);
        showConfirm("Module created successfully", "success");
      }

      onSave();
      onClose();
    } catch (error) {
      showConfirm(
        `Failed to ${isEditing ? "update" : "create"} module`,
        "error"
      );
      console.error("Save error:", error);
    } finally {
      setSaving(false);
    }
  };

  const filteredAvailableLessons = availableLessons.filter(
    (lesson) =>
      lesson.title?.toLowerCase().includes(lessonSearch.toLowerCase()) ||
      lesson.description?.toLowerCase().includes(lessonSearch.toLowerCase())
  );

  const getIconComponent = (iconName) => {
    const iconMap = {
      book: BookOpen,
      code: FileText,
      database: Database,
      server: Server,
      globe: Globe,
      lock: Lock,
      key: Key,
      shield: Shield,
      zap: Zap,
      cpu: Cpu,
      wifi: Wifi,
      cloud: Cloud,
      box: Box,
      layers: Layers,
      grid: Grid,
      "pie-chart": PieChart,
      "bar-chart": BarChart3,
      "trending-up": TrendingUp,
      users: Users,
      "user-check": UserCheck,
      target: Target,
      award: Award,
      star: Star,
      flag: Flag,
      compass: Compass,
      map: Map,
      rocket: Rocket,
      lightbulb: Lightbulb,
      coffee: Coffee,
    };
    return iconMap[iconName] || BookOpen;
  };

  const renderStatsPreview = () => {
    const totalXp =
      moduleLessons.reduce((sum, lesson) => sum + (lesson.xpReward || 0), 0) +
      formData.xpBonus;
    const totalTime = moduleLessons.reduce(
      (sum, lesson) => sum + (lesson.estimatedTime || 15),
      0
    );

    return (
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {moduleLessons.length}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Lessons
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {totalXp}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Total XP
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {totalTime}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Minutes
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {formData.xpBonus}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Bonus XP
          </div>
        </div>
      </div>
    );
  };

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
                <div
                  className="h-10 w-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: formData.themeColor }}
                >
                  {(() => {
                    const Icon = getIconComponent(formData.icon);
                    return <Icon className="h-5 w-5 text-white" />;
                  })()}
                </div>
                <div>
                  <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-white">
                    {isEditing ? "Edit Module" : "Create New Module"}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {isEditing
                      ? `Editing: ${module.title}`
                      : "Create a new learning module"}
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

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Basic Info */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Title & Description */}
                  <div className="space-y-4">
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
                        Short Description *
                      </label>
                      <input
                        type="text"
                        value={formData.shortDescription}
                        onChange={(e) =>
                          handleChange("shortDescription", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Brief description shown in module lists"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Full Description *
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          handleChange("description", e.target.value)
                        }
                        rows="4"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Detailed description of what this module covers..."
                        required
                      />
                    </div>
                  </div>

                  {/* Theme & Icon */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Theme Color
                      </label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          value={formData.themeColor}
                          onChange={(e) =>
                            handleChange("themeColor", e.target.value)
                          }
                          className="h-10 w-20 cursor-pointer rounded border border-gray-300 dark:border-gray-600"
                        />
                        <input
                          type="text"
                          value={formData.themeColor}
                          onChange={(e) =>
                            handleChange("themeColor", e.target.value)
                          }
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                          placeholder="#000000"
                          pattern="^#[0-9A-Fa-f]{6}$"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Icon
                      </label>
                      <div className="relative">
                        <select
                          value={formData.icon}
                          onChange={(e) => handleChange("icon", e.target.value)}
                          className="w-full px-4 py-3 pl-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                        >
                          {icons.map((icon) => {
                            const Icon = getIconComponent(icon);
                            return (
                              <option key={icon} value={icon}>
                                {icon.replace("-", " ")}
                              </option>
                            );
                          })}
                        </select>
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                          {(() => {
                            const Icon = getIconComponent(formData.icon);
                            return <Icon className="h-5 w-5 text-gray-500" />;
                          })()}
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
                          e.key === "Enter" &&
                          (e.preventDefault(), handleAddTag())
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
                </div>

                {/* Right Column - Settings & Stats */}
                <div className="space-y-6">
                  {/* Stats Preview */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Module Stats
                    </h4>
                    {renderStatsPreview()}
                  </div>

                  {/* Settings */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Difficulty *
                      </label>
                      <select
                        value={formData.difficulty}
                        onChange={(e) =>
                          handleChange("difficulty", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        XP Bonus *
                      </label>
                      <div className="relative">
                        <Trophy className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-yellow-500" />
                        <input
                          type="number"
                          value={formData.xpBonus}
                          onChange={(e) =>
                            handleChange(
                              "xpBonus",
                              parseInt(e.target.value) || 0
                            )
                          }
                          min="0"
                          max="5000"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Order *
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
                        Publish Status
                      </label>
                      <div className="flex items-center space-x-3">
                        <button
                          type="button"
                          onClick={() =>
                            handleChange("isPublished", !formData.isPublished)
                          }
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            formData.isPublished
                              ? "bg-green-500"
                              : "bg-gray-300 dark:bg-gray-600"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              formData.isPublished
                                ? "translate-x-6"
                                : "translate-x-1"
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
                </div>
              </div>

              {/* Lessons Management */}
              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Lessons in this Module ({moduleLessons.length})
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Available Lessons */}
                  <div className="lg:col-span-1">
                    <div className="mb-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          value={lessonSearch}
                          onChange={(e) => setLessonSearch(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                          placeholder="Search lessons..."
                        />
                      </div>
                    </div>

                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg max-h-96 overflow-y-auto">
                      {filteredAvailableLessons.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                          No lessons available
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                          {filteredAvailableLessons.map((lesson) => (
                            <div
                              key={lesson._id}
                              className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                              onClick={() => handleAddLesson(lesson._id)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {lesson.title}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {lesson.xpReward} XP • {lesson.difficulty}
                                  </p>
                                </div>
                                <ArrowRight className="h-4 w-4 text-gray-400" />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Module Lessons */}
                  <div className="lg:col-span-2">
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
                      {moduleLessons.length === 0 ? (
                        <div className="p-8 text-center">
                          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            No lessons added
                          </h4>
                          <p className="text-gray-500 dark:text-gray-400">
                            Add lessons from the left panel to build your module
                          </p>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                          {moduleLessons.map((lesson, index) => (
                            <div
                              key={lesson._id}
                              className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4 flex-1">
                                  <div className="flex flex-col space-y-1">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        index > 0 &&
                                        handleReorderLesson(index, index - 1)
                                      }
                                      disabled={index === 0}
                                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                    >
                                      <MoveVertical className="h-4 w-4 rotate-180" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        index < moduleLessons.length - 1 &&
                                        handleReorderLesson(index, index + 1)
                                      }
                                      disabled={
                                        index === moduleLessons.length - 1
                                      }
                                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                    >
                                      <MoveVertical className="h-4 w-4" />
                                    </button>
                                  </div>

                                  <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <span className="text-xs font-mono bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">
                                        #{index + 1}
                                      </span>
                                      <span
                                        className={`text-xs px-2 py-0.5 rounded-full ${
                                          lesson.difficulty === "beginner"
                                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                            : lesson.difficulty ===
                                              "intermediate"
                                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                        }`}
                                      >
                                        {lesson.difficulty}
                                      </span>
                                      {lesson.isPublished && (
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                          Published
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                      {lesson.title}
                                    </p>
                                    <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                                      <span>{lesson.xpReward || 0} XP</span>
                                      <span>•</span>
                                      <span>
                                        {lesson.estimatedTime || 15} min
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleRemoveLesson(lesson._id)}
                                  className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                >
                                  <Minus className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {moduleLessons.length > 0 && (
                      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                        Drag lessons up/down to reorder. Order determines
                        learning sequence.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              {isEditing && (
                <div className="mt-8 pt-8 border-t border-red-200 dark:border-red-800">
                  <h3 className="text-lg font-medium text-red-800 dark:text-red-300 mb-4">
                    Danger Zone
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-red-800 dark:text-red-300">
                            Delete Module
                          </p>
                          <p className="text-sm text-red-700 dark:text-red-400">
                            Once deleted, this module cannot be recovered. All
                            lessons will remain but will be unlinked.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={async () => {
                            if (
                              window.confirm(
                                "Are you sure you want to delete this module? This action cannot be undone."
                              )
                            ) {
                              try {
                                await adminApiClient.delete(
                                  `/content/modules/${module._id}`
                                );
                                showConfirm("Module deleted", "success");
                                onSave();
                                onClose();
                              } catch (error) {
                                showConfirm("Failed to delete module", "error");
                              }
                            }
                          }}
                          className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Delete Module
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {isEditing
                    ? `Last updated: ${
                        module.updatedAt
                          ? new Date(module.updatedAt).toLocaleDateString()
                          : "Unknown"
                      }`
                    : "New module"}
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
                        {isEditing ? "Update Module" : "Create Module"}
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

// Add missing icon components
const Database = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
    />
  </svg>
);

const Server = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
    />
  </svg>
);

const Globe = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
    />
  </svg>
);

const Lock = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
    />
  </svg>
);

const Key = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
    />
  </svg>
);

const Shield = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
  </svg>
);

const Cpu = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
    />
  </svg>
);

const Wifi = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
    />
  </svg>
);

const Cloud = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4 4 0 003 15z"
    />
  </svg>
);

const Box = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
    />
  </svg>
);

const Layers = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
    />
  </svg>
);

const Grid = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
    />
  </svg>
);

const PieChart = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
    />
  </svg>
);

const TrendingUp = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
    />
  </svg>
);

const UserCheck = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
  </svg>
);

const Target = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 19.128A9.38 9.38 0 005.499 9 9.38 9.38 0 019 2.872M9 19.128v.006A9.38 9.38 0 015.499 9a9.38 9.38 0 013.501-6.872M9 19.128v.006A9.38 9.38 0 015.499 9a9.38 9.38 0 013.501-6.872M15 19.128v.006a9.38 9.38 0 003.501-6.872 9.38 9.38 0 00-3.501-6.872M15 19.128v.006a9.38 9.38 0 003.501-6.872 9.38 9.38 0 00-3.501-6.872M12 12a3 3 0 100-6 3 3 0 000 6z"
    />
  </svg>
);

const Award = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const Star = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
    />
  </svg>
);

const Flag = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
    />
  </svg>
);

const Compass = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const Map = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
    />
  </svg>
);

const Rocket = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 10V3L4 14h7v7l9-11h-7z"
    />
  </svg>
);

const Lightbulb = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
    />
  </svg>
);

const Coffee = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
    />
  </svg>
);

export default ModuleEditorModal;
