// BulkActions.jsx
export const BulkActions = ({
  selectedCount,
  bulkAction,
  setBulkAction,
  onApply,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
        {selectedCount} selected
      </span>
      <select
        value={bulkAction}
        onChange={(e) => setBulkAction(e.target.value)}
        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
        aria-label="Bulk action selection"
      >
        <option value="">Bulk Actions</option>
        <option value="publish">Publish Selected</option>
        <option value="unpublish">Unpublish Selected</option>
        <option value="delete">Delete Selected</option>
      </select>
      <button
        onClick={onApply}
        disabled={!bulkAction}
        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        Apply
      </button>
    </div>
  );
};
