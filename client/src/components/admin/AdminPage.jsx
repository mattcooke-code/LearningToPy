// AdminPage.jsx
import PropTypes from "prop-types";
import AdminPageHeader from "./AdminPageHeader";

/**
 * Wrapper component for admin pages with optional header and consistent layout.
 * Provides standardized page structure with title, description, and action areas.
 * 
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Page content to render
 * @param {string} props.title - Page title displayed in the header
 * @param {string} [props.description] - Optional description displayed below the title
 * @param {boolean} [props.showHeader=true] - Whether to show the page header
 * @param {React.ReactNode} [props.headerAction] - Optional action component for the header
 * @param {string} [props.className=""] - Additional CSS classes to apply
 * @returns {JSX.Element} Admin page wrapper with optional header
 */

const AdminPage = ({
  children,
  title,
  description,
  showHeader = true,
  headerAction,
  className = "",
}) => {
  return (
    <div className={`flex flex-col space-y-10 pb-12 ${className}`}>
      {showHeader && (
        <AdminPageHeader
          title={title}
          description={description}
          action={headerAction}
        />
      )}
      <div className="px-4 md:px-0">{children}</div>
    </div>
  );
};

AdminPage.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  description: PropTypes.string,
  showHeader: PropTypes.bool,
  headerAction: PropTypes.node,
  className: PropTypes.string,
};

export default AdminPage;
