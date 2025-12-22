// RefreshButton.jsx
import { RefreshCw } from "lucide-react";

const RefreshButton = ({ onClick, className = "" }) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 transition-colors flex  items-center ${className}`}
    >
      <RefreshCw className="h-4 w-4 mr-2" />
      Refresh
    </button>
  );
};

export default RefreshButton;

// components/ui/RefreshButton.jsx
/*import { RefreshCw } from "lucide-react";

const RefreshButton = ({ onClick, className = "" }) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center ${className}`}
    >
      <RefreshCw className="h-4 w-4 mr-2" />
      Refresh
    </button>
  );
};

export default RefreshButton;*/
