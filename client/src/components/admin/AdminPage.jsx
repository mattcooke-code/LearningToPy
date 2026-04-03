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
