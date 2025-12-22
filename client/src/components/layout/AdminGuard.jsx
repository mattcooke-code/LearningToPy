// AdminGuard.jsx
import { Navigate } from "react-router-dom";
import { useAuth, useNotification } from "../../context";
import { LoadingState } from "../ui";

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
