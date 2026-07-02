// ActionButtons.jsx
import { Edit, Copy, Trash2, Eye, EyeOff, MoreVertical } from "lucide-react";

/**
 * Standardized action buttons for content management.
 * Automatically handles accessibility labels and consistent styling.
 */
export const EditButton = ({ onClick, label, className = "" }) => (
  <button
    onClick={onClick}
    className={`p-1 text-blue-600 hover:text-blue-800 dark:text-python-light 
      dark:hover:text-yellow-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 
      rounded transition-colors ${className}`}
    aria-label={label || "Edit item"}
    title="Edit"
  >
    <Edit className="h-4 w-4" aria-hidden="true" />
  </button>
);

export const DuplicateButton = ({ onClick, label, className = "" }) => (
  <button
    onClick={onClick}
    className={`p-1 text-green-600 hover:text-green-800 dark:text-green-400 
      dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 
      rounded transition-colors ${className}`}
    aria-label={label || "Duplicate item"}
    title="Duplicate"
  >
    <Copy className="h-4 w-4" aria-hidden="true" />
  </button>
);

export const DeleteButton = ({ onClick, label, className = "" }) => (
  <button
    onClick={onClick}
    className={`p-1 text-red-600 hover:text-red-800 dark:text-red-500 
      dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 
      rounded transition-colors ${className}`}
    aria-label={label || "Delete item"}
    title="Delete"
  >
    <Trash2 className="h-4 w-4" aria-hidden="true" />
  </button>
);

export const PublishToggleButton = ({
  isPublished,
  onClick,
  label,
  className = "",
}) => (
  <button
    onClick={onClick}
    className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg 
      transition-colors ${className}`}
    aria-label={label || (isPublished ? "Unpublish item" : "Publish item")}
    title={isPublished ? "Unpublish" : "Publish"}
  >
    {isPublished ? (
      <EyeOff
        className="h-4 w-4 text-gray-500 dark:text-gray-200"
        aria-hidden="true"
      />
    ) : (
      <Eye
        className="h-4 w-4 text-gray-500 dark:text-gray-200"
        aria-hidden="true"
      />
    )}
  </button>
);

export const ContentActionBar = ({
  item,
  onEdit,
  onDuplicate,
  onDelete,
  size = "sm",
}) => {
  const label = item.title || item._id;
  const sizeClass = size === "sm" ? "p-1" : "p-1.5";

  return (
    <>
      <EditButton
        onClick={() => onEdit(item)}
        label={`Edit ${label}`}
        className={sizeClass}
      />
      <DuplicateButton
        onClick={() => onDuplicate(item)}
        label={`Duplicate ${label}`}
        className={sizeClass}
      />
      <DeleteButton
        onClick={() => onDelete(item._id, item.type)}
        label={`Delete ${label}`}
        className={sizeClass}
      />
    </>
  );
};
