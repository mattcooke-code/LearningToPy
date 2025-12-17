// AdminPageHeader.jsx
import PropTypes from "prop-types";

const AdminPageHeader = ({ title, description, action, className = "" }) => {
  return (
    <div className={`flex justify-between items-center ${className}`}>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-gray-600 dark:text-gray-400">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
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
