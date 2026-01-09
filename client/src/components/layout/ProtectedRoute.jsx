// ProtectedRoute.jsx - UPDATED
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context";
import { Spinner } from "../ui";
import { useTutorial } from "../../hooks";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const { hasCompletedTutorial } = useTutorial();
  const location = useLocation();

  // Show loading state first
  if (loading) {
    return <Spinner className="min-h-screen" />;
  }

  // Redirect unauthenticated users
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Define which paths should trigger tutorial redirect
  const learningPaths = ["/modules", "/modules/*", "/lesson/*"];

  const isLearningPath = learningPaths.some((path) => {
    if (path.includes("*")) {
      // Handle wildcard paths
      const basePath = path.replace("/*", "");
      return location.pathname.startsWith(basePath);
    }
    return location.pathname === path;
  });

  // Only redirect from learning paths, not from profile/settings/etc.
  if (
    !hasCompletedTutorial &&
    isLearningPath &&
    location.pathname !== "/getting-started"
  ) {
    return <Navigate to="/getting-started" replace />;
  }

  return children;
};

export default ProtectedRoute;
