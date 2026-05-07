// RefreshButton.jsx
import { RefreshCw } from "lucide-react";

/**
 * A refresh button component with loading state and customizable content.
 * 
 * This component provides a standardized refresh action with visual feedback
 * during loading operations. The icon spins during loading to indicate
 * active processing, and the button is properly disabled during this state.
 * 
 * @component
 * @example
 * ```jsx
 * // Basic usage
 * <RefreshButton onClick={handleRefresh} />
 * 
 * // Custom text and styling
 * <RefreshButton 
 *   onClick={handleRefresh}
 *   isLoading={isRefreshing}
 *   className="ml-4"
 * >
 *   Reload Data
 * </RefreshButton>
 * ```
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onClick - Callback function triggered when the button is clicked
 * @param {string} [props.className=""] - Additional CSS classes to apply to the button
 * @param {boolean} [props.isLoading=false] - If true, disables the button and shows spinning icon to indicate loading state
 * @param {React.ReactNode} [props.children="Refresh"] - Content to display inside the button (text or other elements)
 * 
 * @returns {JSX.Element} A button with refresh icon and loading state handling
 * 
 * @loadingBehavior
 * - When isLoading=true: Button is disabled, icon spins continuously, opacity reduced
 * - When isLoading=false: Button is interactive, icon is static, full opacity
 * - Loading state prevents multiple concurrent refresh actions
 * 
 * @visualFeedback
 * - RefreshCw icon from lucide-react (4x4 size)
 * - Icon positioned to the left of text content
 * - Spinning animation using animate-spin utility class
 * - Consistent styling with other form controls
 * 
 * @accessibility
 * - Disabled state prevents interaction during loading
 * - Visual loading indicator provides clear feedback
 * - Semantic button element with proper states
 * - Hover states only when not loading
 */
const RefreshButton = ({
  onClick,
  className = "",
  isLoading = false,
  children = "Refresh",
}) => {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <RefreshCw
        className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
      />
      {children}
    </button>
  );
};

export default RefreshButton;
