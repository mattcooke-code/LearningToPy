import { useState, useEffect, useMemo } from "react";
import { adminApiClient, useNotification } from "../../context";
import { LessonEditorModal, ModuleEditorModal } from "../../modals";
import { useContentFilter } from "../../hooks";
import { useConfirmActions, calculateContentStats } from "../../utils";
import { BackToTopButton } from "../ui";
import {
  Search,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  FileText,
  BookOpen,
  Plus,
  ChevronUp,
  ChevronDown,
  Clock,
  Trophy,
  Grid,
  List,
  Copy,
  MoveVertical,
  Tag,
  Hash,
  Calendar,
  Zap,
  Layers,
} from "lucide-react";

const ContentManagementTable = () => {
  const [content, setContent] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'grid'
  const [groupByModule, setGroupByModule] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [bulkAction, setBulkAction] = useState("");
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [modalKey, setModalKey] = useState(0);

  const confirm = useConfirmActions();
  const { showToast } = useNotification();
  const {
    filters,
    setFilters,
    sortConfig,
    handleSort,
    filteredContent,
    clearFilters,
  } = useContentFilter(content);

  const stats = useMemo(() => {
    if (content.length === 0) {
      return {
        totalLessons: 0,
        totalModules: 0,
        publishedLessons: 0,
        publishedModules: 0,
        draftLessons: 0,
        draftModules: 0,
      };
    }
    return calculateContentStats(content);
  }, [content]);

  useEffect(() => {
    fetchContent();
  }, [filters.status, filters.difficulty, filters.moduleId, filters.type]);

  useEffect(() => {
    setSelectedItems([]);
  }, [filters.status, filters.difficulty, filters.moduleId, filters.type]);

  // Update the fetchContent function
  const fetchContent = async () => {
    try {
      setLoading(true);

      // Build query params
      const lessonParams = {
        limit: 1000,
      };

      if (filters.type === "lesson" || filters.type === "all") {
        if (filters.status && filters.status !== "all") {
          lessonParams.status = filters.status;
        }
        if (filters.difficulty && filters.difficulty !== "all") {
          lessonParams.difficulty = filters.difficulty;
        }
        if (filters.moduleId && filters.moduleId !== "") {
          lessonParams.moduleId = filters.moduleId;
        }
      }

      const moduleParams = {
        limit: 1000,
      };

      if (filters.type === "module" || filters.type === "all") {
        if (filters.status && filters.status !== "all") {
          moduleParams.status = filters.status;
        }
      }

      const [lessonsRes, modulesRes] = await Promise.all([
        adminApiClient.get("/content/lessons", { params: lessonParams }),
        adminApiClient.get("/content/modules", { params: moduleParams }),
      ]);

      const lessons = (lessonsRes?.lessons || []).map((lesson) => ({
        ...lesson,
        type: "lesson",
        moduleTitle: lesson.moduleId?.title || "Unknown",
        moduleOrder: lesson.moduleId?.order || 0,
      }));

      const modulesData = (modulesRes?.modules || []).map((module) => ({
        ...module,
        type: "module",
      }));

      setModules(modulesData);

      // Combine and sort
      let combined = [...lessons, ...modulesData];

      // Apply search filter client-side for better performance
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        combined = combined.filter(
          (item) =>
            item.title.toLowerCase().includes(searchLower) ||
            item._id.toLowerCase().includes(searchLower),
        );
      }

      setContent(combined);
    } catch (error) {
      showToast("Failed to load content", "error");
      console.error("Content fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const togglePublish = async (itemId, itemType, currentlyPublished) => {
    try {
      await adminApiClient.patch(`/content/${itemType}s/${itemId}/publish`, {
        publish: !currentlyPublished,
      });

      showToast(
        `${itemType} ${
          currentlyPublished ? "unpublished" : "published"
        } successfully`,
        "success",
      );

      setContent((prev) =>
        prev.map((item) =>
          item._id === itemId
            ? { ...item, isPublished: !currentlyPublished }
            : item,
        ),
      );
    } catch (error) {
      showToast(
        `Failed to ${currentlyPublished ? "unpublish" : "publish"} ${itemType}`,
        "error",
      );
    }
  };

  const handleEdit = (item) => {
    console.log("handleEdit called", item.type, item._id);
    setEditingItem(item);
    setModalKey((k) => k + 1);
    if (item.type === "lesson") {
      setShowLessonModal(true);
      setShowModuleModal(false);
    } else {
      setShowModuleModal(true);
      setShowLessonModal(false);
    }
  };

  const handleDelete = async (itemId, itemType) => {
    const confirmed = await confirm.confirmDelete(itemType);
    if (!confirmed) return;

    try {
      await adminApiClient.delete(`/content/${itemType}s/${itemId}`);
      setContent((prev) => prev.filter((item) => item._id !== itemId));

      // If it's a module, also update modules state
      if (itemType === "module") {
        setModules((prev) => prev.filter((m) => m._id !== itemId));
      }

      // If the deleted item was selected, remove it from selectedItems
      setSelectedItems((prev) => prev.filter((item) => item._id !== itemId));

      showToast(`${itemType} deleted successfully`, "success");
    } catch (error) {
      showToast(`Failed to delete ${itemType}`, "error");
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedItems.length === 0) return;

    const confirmed = await confirm.confirmAction(
      "Confirm Bulk Action",
      `Are you sure you want to ${bulkAction} ${selectedItems.length} items? This cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      await Promise.all(
        selectedItems.map((item) => {
          if (bulkAction === "delete") {
            return adminApiClient.delete(`/content/${item.type}s/${item._id}`);
          }
          return adminApiClient.patch(
            `/content/${item.type}s/${item._id}/publish`,
            {
              publish: bulkAction === "publish",
            },
          );
        }),
      );

      showToast(`Bulk ${bulkAction} completed successfully`, "success");
      fetchContent();
      setSelectedItems([]);
      setBulkAction("");
    } catch (error) {
      showToast("Some items failed to update", "error");
    }
  };

  const duplicateItem = async (item) => {
    try {
      const response = await adminApiClient.post(
        `/content/${item.type}s/${item._id}/duplicate`,
      );

      const duplicatedItem = response[item.type];

      if (!duplicatedItem || !duplicatedItem._id) {
        throw new Error("Invalid response from server");
      }

      showToast(`${item.type} duplicated successfully`, "success");
      setContent((prev) => [...prev, { ...duplicatedItem, type: item.type }]);

      if (item.type === "module") {
        setModules((prev) => [...prev, duplicatedItem]);
      }
    } catch (error) {
      showToast("Failed to duplicate item", "error");
    }
  };

  const SortIcon = ({ field }) => {
    if (sortConfig.field !== field)
      return <ChevronUp className="h-4 w-4 opacity-30" />;
    return sortConfig.direction === "ascend" ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  const getDifficultyBadge = (difficulty) => {
    const config = {
      beginner: { color: "green", label: "Beginner" },
      intermediate: { color: "yellow", label: "Intermediate" },
      advanced: { color: "red", label: "Advanced" },
    }[difficulty] || { color: "gray", label: "Unknown" };

    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800 dark:bg-${config.color}-900 dark:text-${config.color}-200`}
      >
        {config.label}
      </span>
    );
  };

  const getTypeIcon = (type) => {
    return type === "lesson" ? FileText : BookOpen;
  };

  // Get module title by ID
  const getModuleTitle = (moduleId) => {
    const module = modules.find((m) => m._id === moduleId);
    return module
      ? `M${module.order || "?"} ${module.title}`
      : "Unknown Module";
  };

  // Group content by module for lessons view
  const getGroupedContent = useMemo(() => {
    if (!groupByModule) return null;

    const lessonsOnly = filteredContent.filter(
      (item) => item.type === "lesson",
    );
    const grouped = {};

    lessonsOnly.forEach((lesson) => {
      const moduleId = lesson.moduleId;
      if (!grouped[moduleId]) {
        const module = modules.find((m) => m._id === moduleId);
        grouped[moduleId] = {
          module: module,
          lessons: [],
        };
      }
      grouped[moduleId].lessons.push(lesson);
    });

    // Sort modules by order
    return Object.entries(grouped).sort((a, b) => {
      const orderA = a[1].module?.order || 0;
      const orderB = b[1].module?.order || 0;
      return orderA - orderB;
    });
  }, [groupByModule, filteredContent, modules]);

  const renderGroupedView = () => {
    if (!getGroupedContent) return null;

    return (
      <div className="space-y-6">
        {getGroupedContent.map(([moduleId, { module, lessons }]) => (
          <div
            key={moduleId}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                    {module ? (
                      <>
                        <span className="text-sm font-mono text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded mr-2">
                          M{module.order || "—"}
                        </span>
                        {module.title}
                      </>
                    ) : (
                      "Unknown Module"
                    )}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {lessons.length}{" "}
                    {lessons.length === 1 ? "lesson" : "lessons"}
                  </p>
                </div>
                {module && (
                  <button
                    onClick={() => {
                      handleEdit(module);
                    }}
                    className="px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Edit Module
                  </button>
                )}
              </div>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {lessons
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((lesson) => (
                  <div
                    key={lesson._id}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <span className="text-sm font-mono text-gray-400 w-12">
                          #{lesson.order || "—"}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {lesson.title}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs ${
                                lesson.isPublished
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                                  : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400"
                              }`}
                            >
                              {lesson.isPublished ? "Published" : "Draft"}
                            </span>
                            {lesson.difficulty && (
                              <span className="text-xs text-gray-500">
                                {getDifficultyBadge(lesson.difficulty)}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            ID: {lesson._id?.slice(-8)} • XP:{" "}
                            {lesson.xpReward || 0}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            togglePublish(
                              lesson._id,
                              "lesson",
                              lesson.isPublished,
                            )
                          }
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title={lesson.isPublished ? "Unpublish" : "Publish"}
                        >
                          {lesson.isPublished ? (
                            <EyeOff className="h-4 w-4 text-gray-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-500" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            handleEdit(lesson);
                          }}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4 text-blue-500" />
                        </button>
                        <button
                          onClick={() => duplicateItem(lesson)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="Duplicate"
                        >
                          <Copy className="h-4 w-4 text-green-500" />
                        </button>
                        <button
                          onClick={() => handleDelete(lesson._id, "lesson")}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTableView = () => (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <input
                type="checkbox"
                checked={
                  selectedItems.length === filteredContent.length &&
                  filteredContent.length > 0
                }
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedItems([...filteredContent]);
                  } else {
                    setSelectedItems([]);
                  }
                }}
                className="h-4 w-4 text-blue-600 rounded"
              />
            </th>
            {[
              { key: "title", label: "Title", sortable: true },
              { key: "type", label: "Type", sortable: true },
              { key: "status", label: "Status", sortable: false },
              { key: "difficulty", label: "Difficulty", sortable: true },
              { key: "xpReward", label: "XP", sortable: true },
              { key: "order", label: "Order", sortable: true },
              { key: "updatedAt", label: "Updated", sortable: true },
              { key: "actions", label: "Actions", sortable: false },
            ].map((column) => (
              <th
                key={column.key}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                <button
                  onClick={() => column.sortable && handleSort(column.key)}
                  className={`flex items-center space-x-1 ${
                    column.sortable
                      ? "cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                      : ""
                  }`}
                >
                  <span>{column.label}</span>
                  {column.sortable && <SortIcon field={column.key} />}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
          {filteredContent.map((item) => {
            const TypeIcon = getTypeIcon(item.type);
            const isSelected = selectedItems.some(
              (selected) => selected._id === item._id,
            );

            return (
              <tr
                key={item._id}
                className={`hover:bg-gray-50 dark:hover:bg-gray-800 ${
                  isSelected ? "bg-blue-50 dark:bg-blue-900/20" : ""
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedItems([...selectedItems, item]);
                      } else {
                        setSelectedItems(
                          selectedItems.filter(
                            (selected) => selected._id !== item._id,
                          ),
                        );
                      }
                    }}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div
                      className={`h-10 w-10 rounded-lg flex items-center justify-center mr-3 ${
                        item.type === "lesson"
                          ? "bg-blue-100 dark:bg-blue-900"
                          : "bg-purple-100 dark:bg-purple-900"
                      }`}
                    >
                      <TypeIcon
                        className={`h-5 w-5 ${
                          item.type === "lesson"
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-purple-600 dark:text-purple-400"
                        }`}
                      />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 mr-2">
                          {item.type === "lesson" ? "📖" : "📦"} #
                          {item.order || "—"}
                        </span>
                        {item.title}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        ID: {item._id?.slice(-8)}
                        {item.type === "lesson" && item.moduleId && (
                          <span className="ml-2">
                            • {getModuleTitle(item.moduleId)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.type === "lesson"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                    }`}
                  >
                    <TypeIcon className="h-3 w-3 mr-1" />
                    {item.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() =>
                      togglePublish(item._id, item.type, item.isPublished)
                    }
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      item.isPublished
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                    }`}
                  >
                    {item.isPublished ? (
                      <>
                        <Eye className="h-3 w-3 mr-1" />
                        Published
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3 w-3 mr-1" />
                        Draft
                      </>
                    )}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getDifficultyBadge(item.difficulty)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Trophy className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="font-medium">{item.xpReward || 0}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm">
                      #{item.order || 0}
                    </span>
                    <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                      <MoveVertical className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {new Date(item.updatedAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        handleEdit(item);
                      }}
                      className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => duplicateItem(item)}
                      className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                      title="Duplicate"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id, item.type)}
                      className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredContent.map((item) => {
        const TypeIcon = getTypeIcon(item.type);
        const isSelected = selectedItems.some(
          (selected) => selected._id === item._id,
        );

        return (
          <div
            key={item._id}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow border hover:shadow-lg transition-shadow ${
              isSelected
                ? "border-blue-500 ring-2 ring-blue-500"
                : "border-gray-200 dark:border-gray-700"
            }`}
          >
            <div className="p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                    item.type === "lesson"
                      ? "bg-blue-100 dark:bg-blue-900"
                      : "bg-purple-100 dark:bg-purple-900"
                  }`}
                >
                  <TypeIcon
                    className={`h-6 w-6 ${
                      item.type === "lesson"
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-purple-600 dark:text-purple-400"
                    }`}
                  />
                </div>
                <div className="flex items-center space-x-1">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedItems([...selectedItems, item]);
                      } else {
                        setSelectedItems(
                          selectedItems.filter(
                            (selected) => selected._id !== item._id,
                          ),
                        );
                      }
                    }}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                  <button
                    onClick={() =>
                      togglePublish(item._id, item.type, item.isPublished)
                    }
                    className={`p-1 rounded ${
                      item.isPublished
                        ? "text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                        : "text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300"
                    }`}
                  >
                    {item.isPublished ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Content */}
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 mr-2">
                  {item.type === "lesson" ? "📖" : "📦"} #{item.order || "—"}
                </span>
                {item.title}
              </h3>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                {item.description || "No description"}
              </p>

              {/* Module info for lessons */}
              {item.type === "lesson" && item.moduleId && (
                <div className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                  <BookOpen className="h-3 w-3 inline mr-1" />
                  {getModuleTitle(item.moduleId)}
                </div>
              )}

              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {item.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                  {item.tags.length > 3 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      +{item.tags.length - 3} more
                    </span>
                  )}
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="flex items-center text-sm">
                  <Trophy className="h-4 w-4 text-yellow-500 mr-1" />
                  <span className="font-medium">{item.xpReward || 0}</span>
                  <span className="text-gray-500 dark:text-gray-400 ml-1">
                    XP
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <Hash className="h-4 w-4 text-gray-500 mr-1" />
                  <span>#{item.order || 0}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Zap className="h-4 w-4 text-orange-500 mr-1" />
                  <span>{getDifficultyBadge(item.difficulty)}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 text-gray-500 mr-1" />
                  <span>{new Date(item.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    handleEdit(item);
                  }}
                  className="px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                  <Edit className="h-4 w-4 inline mr-1" />
                  Edit
                </button>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => duplicateItem(item)}
                    className="p-1.5 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                    title="Duplicate"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item._id, item.type)}
                    className="p-1.5 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  if (loading && content.length === 0) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="shrink-0">
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalLessons}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Lessons
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">
                {stats.publishedLessons} published
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="shrink-0">
              <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalModules}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Modules
              </p>
              <div className="text-xs text-gray-500 mt-1">
                {modules
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map((m) => `M${m.order}`)
                  .join(", ")}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="shrink-0">
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <Eye className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.publishedLessons + stats.publishedModules}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Published Items
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                {(
                  ((stats.publishedLessons + stats.publishedModules) /
                    (stats.totalLessons + stats.totalModules)) *
                  100
                ).toFixed(1)}
                % published
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="shrink-0">
              <div className="h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.draftLessons + stats.draftModules}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Drafts</p>
              <p className="text-xs text-yellow-600 dark:text-yellow-400">
                Ready for review
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* Left Side - Search and Filters */}
          <div className="flex-1 space-y-4 md:space-y-0 md:flex md:items-center md:space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                placeholder="Search content..."
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <select
                value={filters.type}
                onChange={(e) =>
                  setFilters({ ...filters, type: e.target.value })
                }
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              >
                <option value="all">All Types</option>
                <option value="lesson">Lessons</option>
                <option value="module">Modules</option>
              </select>

              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>

              <select
                value={filters.difficulty}
                onChange={(e) =>
                  setFilters({ ...filters, difficulty: e.target.value })
                }
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              >
                <option value="all">All Difficulties</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>

              {filters.type !== "module" && (
                <select
                  value={filters.moduleId || ""}
                  onChange={(e) =>
                    setFilters({ ...filters, moduleId: e.target.value })
                  }
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                >
                  <option value="">All Modules</option>
                  {modules
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .map((module) => (
                      <option key={module._id} value={module._id}>
                        M{module.order || "—"} {module.title}
                      </option>
                    ))}
                </select>
              )}
            </div>
          </div>

          {/* Right Side - Actions and View */}
          <div className="flex items-center space-x-3">
            {/* View Toggle */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => {
                  setViewMode("table");
                  setGroupByModule(false);
                }}
                className={`p-2 rounded ${
                  viewMode === "table" && !groupByModule
                    ? "bg-white dark:bg-gray-800 shadow"
                    : ""
                }`}
                title="Table View"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  setViewMode("grid");
                  setGroupByModule(false);
                }}
                className={`p-2 rounded ${
                  viewMode === "grid" && !groupByModule
                    ? "bg-white dark:bg-gray-800 shadow"
                    : ""
                }`}
                title="Grid View"
              >
                <Grid className="h-4 w-4" />
              </button>
              {filters.type !== "module" && (
                <button
                  onClick={() => {
                    setGroupByModule(true);
                    setViewMode(null);
                  }}
                  className={`p-2 rounded ${
                    groupByModule ? "bg-white dark:bg-gray-800 shadow" : ""
                  }`}
                  title="Group by Module"
                >
                  <Layers className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Bulk Actions */}
            {selectedItems.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedItems.length} selected
                </span>
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                >
                  <option value="">Bulk Actions</option>
                  <option value="publish">Publish Selected</option>
                  <option value="unpublish">Unpublish Selected</option>
                  <option value="delete">Delete Selected</option>
                </select>
                <button
                  onClick={handleBulkAction}
                  disabled={!bulkAction}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Apply
                </button>
              </div>
            )}

            {/* Add New */}
            <div className="relative">
              <button
                onClick={() => setShowAddMenu(!showAddMenu)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New
              </button>
              {showAddMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowAddMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
                    <button
                      onClick={() => {
                        setEditingItem(null);
                        setShowLessonModal(true);
                        setShowAddMenu(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
                    >
                      <FileText className="h-4 w-4 mr-3" />
                      New Lesson
                    </button>
                    <button
                      onClick={() => {
                        setEditingItem(null);
                        setShowModuleModal(true);
                        setShowAddMenu(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg"
                    >
                      <BookOpen className="h-4 w-4 mr-3" />
                      New Module
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div>
        {filteredContent.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No content found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {filters.search
                ? "Try a different search term"
                : "No content matches your filters"}
            </p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredContent.length} of {content.length} items
              {filters.search && ` for "${filters.search}"`}
              {groupByModule && " • Grouped by module"}
            </div>

            {/* Content View */}
            {groupByModule
              ? renderGroupedView()
              : viewMode === "table"
                ? renderTableView()
                : renderGridView()}
          </>
        )}
      </div>

      {/* Modals */}
      {showLessonModal && (
        <LessonEditorModal
          isOpen={showLessonModal}
          key={modalKey}
          lesson={editingItem}
          modules={modules}
          onClose={() => {
            setShowLessonModal(false);
            setEditingItem(null);
          }}
          onSave={() => {
            fetchContent();
          }}
        />
      )}

      {showModuleModal && (
        <ModuleEditorModal
          isOpen={showModuleModal}
          key={modalKey}
          module={editingItem}
          onClose={() => {
            setShowModuleModal(false);
            setEditingItem(null);
          }}
          onSave={() => {
            fetchContent();
          }}
        />
      )}

      {/* Back to Top Button */}
      <BackToTopButton />
    </div>
  );
};

export default ContentManagementTable;
