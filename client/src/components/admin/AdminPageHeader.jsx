// AdminPageHeader.jsx
import PropTypes from "prop-types";

/**
 * Header component for admin pages with title, description, and optional action.
 * Provides consistent page heading structure with responsive layout.
 * 
 * @component
 * @param {Object} props
 * @param {string} props.title - Header title
 * @param {string} [props.description] - Optional description below the title
 * @param {React.ReactNode} [props.action] - Optional action component on the right side
 * @param {string} [props.className=""] - Additional CSS classes to apply
 * @returns {JSX.Element} Admin page header with title and optional elements
 */

const AdminPageHeader = ({ title, description, action, className = "" }) => {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 px-4 md:px-0 ${className}`}
    >
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          {title}
        </h1>
        {description && (
          <p className="mt-1 md:mt-2 text-sm md:text-base text-gray-600 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
};

AdminPageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  action: PropTypes.node,
  className: PropTypes.string,
};

export default AdminPageHeader;
