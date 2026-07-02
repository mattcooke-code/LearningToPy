// ContentToolbar.jsx
import {
  Search,
  Plus,
  FileText,
  BookOpen,
  List,
  Grid,
  Layers,
} from "lucide-react";
import { useState } from "react";
import { BulkActions } from "./BulkActions";
import { SearchableSelect } from "../ui";

export const ContentToolbar = ({
  filters,
  setFilters,
  modules,
  selectedItems,
  bulkAction,
  setBulkAction,
  onBulkAction,
  viewMode,
  setViewMode,
  groupByModule,
  setGroupByModule,
  onAddLesson,
  onAddModule,
}) => {
  const [showAddMenu, setShowAddMenu] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6">
      <div className="flex flex-col space-y-4">
        {/* Search + Add New */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
            <label htmlFor="content-search" className="sr-only">
              Search content
            </label>
            <input
              id="content-search"
              type="text"
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-gray-200"
              placeholder="Search content..."
            />
          </div>

          <div className="relative shrink-0">
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="px-3 md:px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center whitespace-nowrap"
              aria-expanded={showAddMenu}
              aria-haspopup="true"
              aria-label="Add new content"
            >
              <Plus className="h-4 w-4 md:mr-2" aria-hidden="true" />
              <span className="hidden md:inline">Add New</span>
            </button>
            {showAddMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowAddMenu(false)}
                />
                <div
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20"
                  role="menu"
                >
                  <button
                    onClick={() => {
                      onAddLesson();
                      setShowAddMenu(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
                    role="menuitem"
                  >
                    <FileText className="h-4 w-4 mr-3" aria-hidden="true" />
                    New Lesson
                  </button>
                  <button
                    onClick={() => {
                      onAddModule();
                      setShowAddMenu(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg"
                    role="menuitem"
                  >
                    <BookOpen className="h-4 w-4 mr-3" aria-hidden="true" />
                    New Module
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Filters + View Toggle + Bulk Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-2 flex-1 min-w-0">
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-gray-200"
              aria-label="Filter by content type"
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
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-gray-200"
              aria-label="Filter by publication status"
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
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-gray-200"
              aria-label="Filter by difficulty level"
            >
              <option value="all">All Difficulties</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>

            {filters.type !== "module" && (
              <SearchableSelect
                value={filters.moduleId || ""}
                onChange={(value) =>
                  setFilters({ ...filters, moduleId: value })
                }
                options={[
                  { value: "", label: "All Modules" },
                  ...modules
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .map((module) => ({
                      value: module._id,
                      label: `M${module.order || "—"} ${module.title}${!module.isPublished ? " (Draft)" : ""}`,
                    })),
                ]}
                placeholder="Select module..."
                className="w-[220px]"
                aria-label="Filter by module"
              />
            )}
          </div>

          {/* View Toggle */}
          <div
            className="hidden md:flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1 shrink-0"
            role="group"
            aria-label="View mode"
          >
            <button
              onClick={() => {
                setViewMode("table");
                setGroupByModule(false);
              }}
              className={`p-2 rounded ${viewMode === "table" && !groupByModule ? "bg-white dark:bg-gray-800 shadow" : ""}`}
              aria-label="Table view"
              aria-pressed={viewMode === "table" && !groupByModule}
            >
              <List className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              onClick={() => {
                setViewMode("grid");
                setGroupByModule(false);
              }}
              className={`p-2 rounded ${viewMode === "grid" && !groupByModule ? "bg-white dark:bg-gray-800 shadow" : ""}`}
              aria-label="Grid view"
              aria-pressed={viewMode === "grid" && !groupByModule}
            >
              <Grid className="h-4 w-4" aria-hidden="true" />
            </button>
            {filters.type !== "module" && (
              <button
                onClick={() => {
                  setGroupByModule(true);
                  setViewMode(null);
                }}
                className={`p-2 rounded ${groupByModule ? "bg-white dark:bg-gray-800 shadow" : ""}`}
                aria-label="Group by module view"
                aria-pressed={groupByModule}
              >
                <Layers className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>

          <BulkActions
            selectedCount={selectedItems.length}
            bulkAction={bulkAction}
            setBulkAction={setBulkAction}
            onApply={onBulkAction}
          />
        </div>
      </div>
    </div>
  );
};
