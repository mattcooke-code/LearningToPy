// TableView.jsx
import {
  ChevronUp,
  ChevronDown,
  MoveVertical,
  Trophy,
  FileText,
  BookOpen,
} from "lucide-react";
import { PublishStatusBadge } from "./PublishToggle";
import { ContentActionBar } from "./ActionButtons";
import { getDifficultyBadge } from "../../utils";

const SortIcon = ({ field, sortConfig }) => {
  if (sortConfig.field !== field)
    return <ChevronUp className="h-4 w-4 opacity-30" aria-hidden="true" />;
  return sortConfig.direction === "ascend" ? (
    <ChevronUp className="h-4 w-4" aria-hidden="true" />
  ) : (
    <ChevronDown className="h-4 w-4" aria-hidden="true" />
  );
};

const TYPE_ICONS = {
  lesson: FileText,
  module: BookOpen,
};

const TABLE_COLUMNS = [
  { key: "title", label: "Title", sortable: true },
  { key: "type", label: "Type", sortable: true },
  { key: "status", label: "Status", sortable: false },
  { key: "difficulty", label: "Difficulty", sortable: true },
  { key: "xpReward", label: "XP", sortable: true },
  { key: "order", label: "Order", sortable: true },
  { key: "updatedAt", label: "Updated", sortable: true },
  { key: "actions", label: "Actions", sortable: false },
];

/**
 * Table view for content management with sorting, selection, and inline actions.
 *
 * @component
 * @param {Object} props
 * @param {Array} props.content - Content items to display
 * @param {Object} props.sortConfig - Current sort configuration {field, direction}
 * @param {Function} props.onSort - Sort handler function
 * @param {Array} props.selectedItems - Currently selected items
 * @param {Function} props.onSelectionChange - Selection change handler
 * @param {Function} props.onEdit - Edit action handler
 * @param {Function} props.onTogglePublish - Publish toggle handler
 * @param {Function} props.onDuplicate - Duplicate action handler
 * @param {Function} props.onDelete - Delete action handler
 * @param {Function} props.getModuleTitle - Function to get module title by ID
 */
const TableView = ({
  content,
  sortConfig,
  onSort,
  selectedItems,
  onSelectionChange,
  onEdit,
  onTogglePublish,
  onDuplicate,
  onDelete,
  getModuleTitle,
}) => {
  const isAllSelected =
    content.length > 0 && selectedItems.length === content.length;

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      onSelectionChange([...content]);
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectItem = (item, isChecked) => {
    if (isChecked) {
      onSelectionChange([...selectedItems, item]);
    } else {
      onSelectionChange(
        selectedItems.filter((selected) => selected._id !== item._id),
      );
    }
  };

  return (
    <div
      className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 
        [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-gray-100 
        dark:[&::-webkit-scrollbar-track]:bg-gray-700 
        [&::-webkit-scrollbar-thumb]:bg-gray-400 
        dark:[&::-webkit-scrollbar-thumb]:bg-gray-500 
        [&::-webkit-scrollbar-thumb]:rounded"
      style={{ overflowX: "auto", scrollbarGutter: "stable" }}
      role="grid"
      aria-label="Content management table"
    >
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr role="row">
            <th
              className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              role="columnheader"
              aria-label="Select all"
            >
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={handleSelectAll}
                className="h-4 w-4 text-blue-600 rounded"
                aria-label="Select all items"
              />
            </th>
            {TABLE_COLUMNS.map((column) => (
              <th
                key={column.key}
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap"
                role="columnheader"
                aria-sort={
                  sortConfig.field === column.key
                    ? sortConfig.direction === "ascend"
                      ? "ascending"
                      : "descending"
                    : "none"
                }
              >
                {column.key !== "actions" ? (
                  <button
                    onClick={() => column.sortable && onSort(column.key)}
                    className={`flex items-center space-x-1 ${
                      column.sortable
                        ? "cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                        : ""
                    }`}
                    disabled={!column.sortable}
                  >
                    <span>{column.label}</span>
                    {column.sortable && (
                      <SortIcon field={column.key} sortConfig={sortConfig} />
                    )}
                  </button>
                ) : (
                  <span>{column.label}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y dark:text-gray-200 divide-gray-200 dark:divide-gray-800">
          {content.map((item) => {
            const TypeIcon = TYPE_ICONS[item.type];
            const isSelected = selectedItems.some(
              (selected) => selected._id === item._id,
            );

            return (
              <tr
                key={item._id}
                className={`hover:bg-gray-50 dark:hover:bg-gray-800 ${
                  isSelected ? "bg-blue-50 dark:bg-blue-900/20" : ""
                }`}
                role="row"
                aria-selected={isSelected}
              >
                {/* Checkbox */}
                <td className="px-3 py-3 whitespace-nowrap" role="gridcell">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => handleSelectItem(item, e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded"
                    aria-label={`Select ${item.title}`}
                  />
                </td>

                {/* Title */}
                <td
                  className="px-3 py-3 whitespace-nowrap max-w-[220px]"
                  role="gridcell"
                >
                  <div className="flex items-center">
                    <div
                      className={`h-8 w-8 rounded-lg flex items-center justify-center mr-2 shrink-0 ${
                        item.type === "lesson"
                          ? "bg-blue-100 dark:bg-blue-900"
                          : "bg-purple-100 dark:bg-purple-900"
                      }`}
                      aria-hidden="true"
                    >
                      <TypeIcon
                        className={`h-4 w-4 ${
                          item.type === "lesson"
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-purple-600 dark:text-purple-400"
                        }`}
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900 dark:text-white text-sm truncate max-w-[160px]">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 mr-1">
                          {item.type === "lesson" ? "📖" : "📦"} #
                          {item.order || "—"}
                        </span>
                        {item.title}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[160px]">
                        ID: {item._id?.slice(-8)}
                        {item.type === "lesson" && item.moduleId && (
                          <span className="ml-1">
                            • {getModuleTitle(item.moduleId)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Type */}
                <td className="px-3 py-3 whitespace-nowrap" role="gridcell">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      item.type === "lesson"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                    }`}
                    role="status"
                  >
                    <TypeIcon className="h-3 w-3 mr-1" aria-hidden="true" />
                    {item.type}
                  </span>
                </td>

                {/* Status */}
                <td className="px-3 py-3 whitespace-nowrap" role="gridcell">
                  <PublishStatusBadge
                    isPublished={item.isPublished}
                    onClick={() =>
                      onTogglePublish(item._id, item.type, item.isPublished)
                    }
                    label={item.title}
                  />
                </td>

                {/* Difficulty */}
                <td className="px-3 py-3 whitespace-nowrap" role="gridcell">
                  {getDifficultyBadge(item.difficulty)}
                </td>

                {/* XP */}
                <td className="px-3 py-3 whitespace-nowrap" role="gridcell">
                  <div className="flex items-center">
                    <Trophy
                      className="h-4 w-4 text-yellow-500 mr-1"
                      aria-hidden="true"
                    />
                    <span className="font-medium text-sm">
                      {item.xpReward || 0}
                    </span>
                  </div>
                </td>

                {/* Order */}
                <td className="px-3 py-3 whitespace-nowrap" role="gridcell">
                  <div className="flex items-center space-x-1">
                    <span className="font-bold text-sm text-purple-700 dark:text-purple-300">
                      #{item.order || 0}
                    </span>
                    <button
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                      aria-label={`Reorder ${item.title}`}
                    >
                      <MoveVertical
                        className="h-4 w-4 text-purple-700 dark:text-purple-300"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </td>

                {/* Updated */}
                <td
                  className="px-3 py-3 whitespace-nowrap text-xs text-gray-500 dark:text-gray-200"
                  role="gridcell"
                >
                  {new Date(item.updatedAt).toLocaleDateString()}
                </td>

                {/* Actions */}
                <td
                  className="px-3 py-3 whitespace-nowrap text-right text-sm font-medium"
                  role="gridcell"
                >
                  <div className="flex items-center space-x-1">
                    <ContentActionBar
                      item={item}
                      onEdit={onEdit}
                      onDuplicate={onDuplicate}
                      onDelete={onDelete}
                      size="sm"
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TableView;
