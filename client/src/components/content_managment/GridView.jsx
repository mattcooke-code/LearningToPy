// GridView.jsx
import {
  Trophy,
  Hash,
  Zap,
  Calendar,
  Tag,
  BookOpen,
  FileText,
} from "lucide-react";
import {
  PublishToggleButton,
  EditButton,
  ContentActionBar,
} from "./ActionButtons";
import { DifficultyBadge } from "./ContentBadges";

const TYPE_ICONS = {
  lesson: FileText,
  module: BookOpen,
};

/**
 * Grid view for content management with cards and inline actions.
 *
 * @component
 * @param {Object} props
 * @param {Array} props.content - Content items to display
 * @param {Array} props.selectedItems - Currently selected items
 * @param {Function} props.onSelectionChange - Selection change handler
 * @param {Function} props.onEdit - Edit action handler
 * @param {Function} props.onTogglePublish - Publish toggle handler
 * @param {Function} props.onDuplicate - Duplicate action handler
 * @param {Function} props.onDelete - Delete action handler
 * @param {Function} props.getModuleTitle - Function to get module title by ID
 */
const GridView = ({
  content,
  selectedItems,
  onSelectionChange,
  onEdit,
  onTogglePublish,
  onDuplicate,
  onDelete,
  getModuleTitle,
}) => {
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
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      role="list"
      aria-label="Content grid view"
    >
      {content.map((item) => {
        const TypeIcon = TYPE_ICONS[item.type];
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
            role="listitem"
            aria-selected={isSelected}
            aria-label={`${item.type}: ${item.title}`}
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
                  aria-hidden="true"
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
                    onChange={(e) => handleSelectItem(item, e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded"
                    aria-label={`Select ${item.title}`}
                  />
                  <PublishToggleButton
                    isPublished={item.isPublished}
                    onClick={() =>
                      onTogglePublish(item._id, item.type, item.isPublished)
                    }
                    label={`${item.isPublished ? "Unpublish" : "Publish"} ${item.title}`}
                  />
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
                  <BookOpen
                    className="h-3 w-3 inline mr-1"
                    aria-hidden="true"
                  />
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
                      <Tag className="h-3 w-3 mr-1" aria-hidden="true" />
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
                  <Trophy
                    className="h-4 w-4 text-yellow-500 mr-1"
                    aria-hidden="true"
                  />
                  <span className="font-medium dark:text-gray-200">
                    {item.xpReward || 0}
                  </span>
                  <span className="text-gray-500 dark:text-gray-300 ml-1">
                    XP
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <Hash
                    className="h-4 w-4 text-gray-500 dark:text-purple-400 mr-1"
                    aria-hidden="true"
                  />
                  <span className="dark:text-purple-300">
                    {item.order || 0}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <Zap
                    className="h-4 w-4 text-orange-500 mr-1"
                    aria-hidden="true"
                  />
                  <span>
                    <DifficultyBadge difficulty={item.difficulty} />
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <Calendar
                    className="h-4 w-4 text-gray-500 dark:text-gray-200 mr-1"
                    aria-hidden="true"
                  />
                  <span className="dark:text-gray-300">
                    {new Date(item.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                <EditButton
                  onClick={() => onEdit(item)}
                  label={`Edit ${item.title}`}
                  className="px-3 py-1.5 text-sm font-medium"
                />
                <ContentActionBar
                  item={item}
                  onEdit={onEdit}
                  onDuplicate={onDuplicate}
                  onDelete={onDelete}
                  size="md"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GridView;
