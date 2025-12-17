// AdminPage.jsx
import PropTypes from "prop-types";
import { ErrorState, LoadingState } from "../ui";
import { AdminPageHeader, AdminLayout } from "../admin";

const AdminPage = ({
  children,
  title,
  description,
  loading = false,
  error = null,
  onRetry,
  showHeader = true,
  headerAction,
  className = "",
}) => {
  if (loading) {
    return (
      <AdminLayout>
        <LoadingState />
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <ErrorState error={error} onRetry={onRetry} />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className={`space-y-6 ${className}`}>
        {showHeader && (
          <AdminPageHeader
            title={title}
            description={description}
            action={headerAction}
          />
        )}{" "}
        {children}
      </div>
    </AdminLayout>
  );
};

AdminPage.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  description: PropTypes.string,
  loading: PropTypes.bool,
  error: PropTypes.string,
  onRetry: PropTypes.func,
  showHeader: PropTypes.bool,
  headerAction: PropTypes.node,
  className: PropTypes.string,
};

export default AdminPage;
