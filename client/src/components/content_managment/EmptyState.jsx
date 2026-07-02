// EmptyState.jsx
import { FileText } from "lucide-react";

export const EmptyState = ({ hasSearch, onClearFilters }) => (
  <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
    <FileText
      className="h-12 w-12 text-gray-400 mx-auto mb-4"
      aria-hidden="true"
    />
    <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
      No content found
    </h2>
    <p className="text-gray-500 dark:text-gray-400 mb-4">
      {hasSearch
        ? "Try a different search term"
        : "No content matches your filters"}
    </p>
    <button
      onClick={onClearFilters}
      className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
    >
      Clear all filters
    </button>
  </div>
);
