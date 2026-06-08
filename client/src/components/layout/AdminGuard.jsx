// AdminGuard.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context";
import { LoadingState } from "../ui";

/**
 * Route guard component that restricts access to admin-only routes.
 *
 * Redirects non-admin users to the specified path and passes
 * `{ adminBlocked: true }` in location state so the destination page
 * can display an "Admin access required" notification.
 *
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render if user is admin
 * @param {string} [props.redirectTo="/"] - URL to redirect non-admin users to
 * @returns {JSX.Element} Protected admin route or redirect
 */
const AdminGuard = ({ children, redirectTo = "/dashboard" }) => {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return <LoadingState message="Checking permissions..." />;
  }

  if (!user || !user.isAdmin) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default AdminGuard;
