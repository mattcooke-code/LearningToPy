// ContentManagementTable.jsx
import { useState, useEffect, useMemo, useCallback } from "react";
import { useNotification } from "../../context";
import { LessonEditorModal, ModuleEditorModal } from "../../modals";
import { useContentFilter, useConfirmActions } from "../../hooks";
import { adminApiClient } from "../../services";
import { calculateContentStats } from "../../utils";
import { ContentStats, ContentToolbar, EmptyState } from "../content_managment";
import { TableView } from "./components/ContentViews/TableView";
import { GridView } from "./components/ContentViews/GridView";
import { GroupedView } from "./components/ContentViews/GroupedView";

/**
 * Comprehensive content management interface for lessons and modules with filtering and bulk operations.
 * Supports table/grid views, bulk actions, content editing, and module organization.
 *
 * @component
 * @returns {JSX.Element} Content management interface with filtering and actions
 */
const ContentManagementTable = () => {
  const [content, setContent] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("table");
  const [groupByModule, setGroupByModule] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [bulkAction, setBulkAction] = useState("");
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [modalKey, setModalKey] = useState(0);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" && window.innerWidth < 768,
  );

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

  // Stats calculation
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

  // Module range calculation
  const moduleRange = useMemo(() => {
    if (modules.length === 0) return "No modules";
    const orders = modules
      .map((m) => m.order)
      .filter((o) => o !== undefined && o !== null);
    if (orders.length === 0) return "No order set";
    const minOrder = Math.min(...orders);
    const maxOrder = Math.max(...orders);
    return `M${minOrder}-M${maxOrder}`;
  }, [modules]);

  // Responsive view handling
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const effectiveViewMode = isMobile ? "grid" : viewMode;
  const effectiveGroupByModule = isMobile ? false : groupByModule;

  // Reset selections when filters change
  useEffect(() => {
    setSelectedItems([]);
  }, [filters.status, filters.difficulty, filters.moduleId, filters.type]);

  // Fetch content
  const fetchContent = useCallback(async () => {
    try {
      setLoading(true);

      const lessonParams = { limit: 1000 };
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

      const moduleParams = { limit: 1000 };
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

      let combined = [...lessons, ...modulesData];

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
  }, [filters, showToast]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  // Content actions
  const togglePublish = useCallback(
    async (itemId, itemType, currentlyPublished) => {
      try {
        await adminApiClient.patch(`/content/${itemType}s/${itemId}/publish`, {
          publish: !currentlyPublished,
        });

        showToast(
          `${itemType} ${currentlyPublished ? "unpublished" : "published"} successfully`,
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
    },
    [showToast],
  );

  const handleEdit = useCallback((item) => {
    setEditingItem(item);
    setModalKey((k) => k + 1);
    if (item.type === "lesson") {
      setShowLessonModal(true);
      setShowModuleModal(false);
    } else {
      setShowModuleModal(true);
      setShowLessonModal(false);
    }
  }, []);

  const handleDelete = useCallback(
    async (itemId, itemType) => {
      const confirmed = await confirm.confirmDelete(itemType);
      if (!confirmed) return;

      try {
        await adminApiClient.delete(`/content/${itemType}s/${itemId}`);
        setContent((prev) => prev.filter((item) => item._id !== itemId));

        if (itemType === "module") {
          setModules((prev) => prev.filter((m) => m._id !== itemId));
        }

        setSelectedItems((prev) => prev.filter((item) => item._id !== itemId));
        showToast(`${itemType} deleted successfully`, "success");
      } catch (error) {
        showToast(`Failed to delete ${itemType}`, "error");
      }
    },
    [confirm, showToast],
  );

  const duplicateItem = useCallback(
    async (item) => {
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
    },
    [showToast],
  );

  const handleBulkAction = useCallback(async () => {
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
            { publish: bulkAction === "publish" },
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
  }, [bulkAction, selectedItems, confirm, showToast, fetchContent]);

  // Grouped content for module view
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

    return Object.entries(grouped).sort((a, b) => {
      const orderA = a[1].module?.order || 0;
      const orderB = b[1].module?.order || 0;
      return orderA - orderB;
    });
  }, [groupByModule, filteredContent, modules]);

  // Loading state
  if (loading && content.length === 0) {
    return (
      <div className="flex justify-center items-center h-96">
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"
          role="status"
        >
          <span className="sr-only">Loading content...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <ContentStats stats={stats} moduleRange={moduleRange} />

      {/* Toolbar */}
      <ContentToolbar
        filters={filters}
        setFilters={setFilters}
        modules={modules}
        selectedItems={selectedItems}
        bulkAction={bulkAction}
        setBulkAction={setBulkAction}
        onBulkAction={handleBulkAction}
        viewMode={viewMode}
        setViewMode={setViewMode}
        groupByModule={groupByModule}
        setGroupByModule={setGroupByModule}
        onAddLesson={() => {
          setEditingItem(null);
          setModalKey((k) => k + 1);
          setShowLessonModal(true);
        }}
        onAddModule={() => {
          setEditingItem(null);
          setModalKey((k) => k + 1);
          setShowModuleModal(true);
        }}
      />

      {/* Content Area */}
      <div>
        {filteredContent.length === 0 ? (
          <EmptyState
            hasSearch={!!filters.search}
            onClearFilters={clearFilters}
          />
        ) : (
          <>
            {/* Summary */}
            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredContent.length} of {content.length} items
              {filters.search && ` for "${filters.search}"`}
              {groupByModule && " • Grouped by module"}
            </div>

            {/* Content Views */}
            {effectiveGroupByModule ? (
              <GroupedView
                groupedContent={getGroupedContent}
                onEdit={handleEdit}
                onTogglePublish={togglePublish}
                onDuplicate={duplicateItem}
                onDelete={handleDelete}
              />
            ) : effectiveViewMode === "table" ? (
              <TableView
                content={filteredContent}
                sortConfig={sortConfig}
                onSort={handleSort}
                selectedItems={selectedItems}
                onSelectionChange={setSelectedItems}
                onEdit={handleEdit}
                onTogglePublish={togglePublish}
                onDuplicate={duplicateItem}
                onDelete={handleDelete}
                getModuleTitle={(moduleId) => {
                  const module = modules.find((m) => m._id === moduleId);
                  return module
                    ? `M${module.order || "?"} ${module.title}`
                    : "Unknown Module";
                }}
              />
            ) : (
              <GridView
                content={filteredContent}
                selectedItems={selectedItems}
                onSelectionChange={setSelectedItems}
                onEdit={handleEdit}
                onTogglePublish={togglePublish}
                onDuplicate={duplicateItem}
                onDelete={handleDelete}
                getModuleTitle={(moduleId) => {
                  const module = modules.find((m) => m._id === moduleId);
                  return module
                    ? `M${module.order || "?"} ${module.title}`
                    : "Unknown Module";
                }}
              />
            )}
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
    </div>
  );
};

export default ContentManagementTable;
