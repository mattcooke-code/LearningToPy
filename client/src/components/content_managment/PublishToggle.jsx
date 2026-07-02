// PublishToggle.jsx
import { Eye, EyeOff } from "lucide-react";

export const PublishStatusBadge = ({ isPublished, onClick, label }) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
      isPublished
        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
    }`}
    aria-label={`${isPublished ? "Unpublish" : "Publish"} ${label}`}
  >
    {isPublished ? (
      <>
        <Eye className="h-3 w-3 mr-1" aria-hidden="true" /> Published
      </>
    ) : (
      <>
        <EyeOff className="h-3 w-3 mr-1" aria-hidden="true" /> Draft
      </>
    )}
  </button>
);
