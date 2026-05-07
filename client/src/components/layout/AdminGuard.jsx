// AdminGuard.jsx
import { Navigate } from "react-router-dom";
import { useAuth, useNotification } from "../../context";
import { LoadingState } from "../ui";

/**
 * Route guard component that restricts access to admin-only routes.
 * Redirects non-admin users and shows loading state during authentication check.
 * 
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render if user is admin
 * @param {string} [props.redirectTo="/"] - URL to redirect non-admin users to
 * @returns {JSX.Element} Protected admin route or redirect
 */

const AdminGuard = ({ children, redirectTo = "/" }) => {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useNotification();

  if (authLoading) {
    return <LoadingState message="Checking permissions..." />;
  }

  if (!user || !user.isAdmin) {
    if (showToast) return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default AdminGuard;
