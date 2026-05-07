// ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context";
import { Spinner } from "../ui";

/**
 * Route protection component that requires user authentication.
 * Redirects unauthenticated users to login page and shows loading state during auth check.
 * 
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render if user is authenticated
 * @returns {JSX.Element} Protected route or redirect to login
 */

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Show loading state first
  if (loading) {
    return <Spinner className="min-h-screen" />;
  }

  // Redirect unauthenticated users
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
