// ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context";
import { Spinner } from "../ui";

/**
 * Route protection component that requires user authentication.
 *
 * Shows a full-page spinner during the initial auth check. Once the auth
 * state is resolved, either renders children or redirects to /login.
 *
 * The intended destination is preserved in location state so the login
 * page can redirect the user back after successful authentication.
 *
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render if user is authenticated
 * @returns {JSX.Element} Protected route or redirect to login
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Spinner className="min-h-screen" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
};

export default ProtectedRoute;
