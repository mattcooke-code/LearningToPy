// Pagination.jsx
/**
 * A simple pagination component with previous/next navigation and page information.
 * 
 * This component provides basic pagination functionality with a clean, consistent
 * design. It automatically hides when there's only one page of content and
 * includes proper disabled states for boundary conditions.
 * 
 * @component
 * @example
 * ```jsx
 * const [currentPage, setCurrentPage] = useState(1);
 * 
 * <Pagination
 *   page={currentPage}
 *   total={10}
 *   onPageChange={setCurrentPage}
 * />
 * ```
 * 
 * @param {Object} props - Component props
 * @param {number} props.page - Current page number (1-based indexing)
 * @param {number} props.total - Total number of pages available
 * @param {Function} props.onPageChange - Callback function called when page changes. Receives the new page number as argument
 * 
 * @returns {JSX.Element|null} Pagination controls or null when total pages <= 1
 * 
 * @behaviorNotes
 * - Automatically renders null when total pages is 1 or less
 * - Previous button disabled when on first page
 * - Next button disabled when on last page
 * - Uses 1-based page numbering (more user-friendly than 0-based)
 * - Responsive design with proper spacing and hover states
 * 
 * @accessibility
 * - Disabled buttons have reduced opacity and no hover effects
 * - Clear visual feedback for current page position
 * - Semantic button elements with proper states
 */
const Pagination = ({ page, total, onPageChange }) => {
  if (total <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
      <p className="text-sm text-gray-700 dark:text-gray-300">
        Page <span className="font-medium">{page}</span> of{" "}
        <span className="font-medium">{total}</span>
      </p>
      <div className="flex space-x-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="px-4 py-2 text-sm font-medium border rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === total}
          className="px-4 py-2 text-sm font-medium border rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
