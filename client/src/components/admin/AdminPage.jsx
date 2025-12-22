// AdminPage.jsx
import PropTypes from "prop-types";
import AdminPageHeader from "./AdminPageHeader";

const AdminPage = ({
  children,
  title,
  description,
  showHeader = true,
  headerAction,
  className = "",
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {showHeader && (
        <AdminPageHeader
          title={title}
          description={description}
          action={headerAction}
        />
      )}
      {children}
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
