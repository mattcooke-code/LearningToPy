// components/admin/SaveStatusIndicator.jsx
import { Save } from "lucide-react";
import PropTypes from "prop-types";

/**
 * Floating indicator showing the number of unsaved changes in settings panels.
 * Provides visual feedback for pending changes with user impact warnings.
 * 
 * @component
 * @param {Object} props
 * @param {number} props.changesCount - Number of unsaved changes to display
 * @returns {JSX.Element|null} Floating indicator or null when no changes
 */

const SaveStatusIndicator = ({ changesCount }) => {
  if (changesCount === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            <Save className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              {changesCount} unsaved change{changesCount !== 1 ? "s" : ""}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Changes will affect all users
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

SaveStatusIndicator.propTypes = {
  changesCount: PropTypes.number.isRequired,
};

export default SaveStatusIndicator;
