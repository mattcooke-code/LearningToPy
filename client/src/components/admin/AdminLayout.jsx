import { useState, useEffect } from "react";
import { Outlet, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";
import AdminSidebar from "./AdminSidebar";

const AdminLayout = ({ children }) => {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Redirect non-admin users
  if (!user || !user.isAdmin) {
    showToast("Admin access required", "error");
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    if (!document.getElementById("modal-root")) {
      const modalRoot = document.createElement("div");
      modalRoot.id = "modal-root";
      document.body.appendChild(modalRoot);
    }

    return () => {
      const modalRoot = document.getElementById("modal-root");
      if (modalRoot) {
        document.body.removeChild(modalRoot);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentPath={location.pathname}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Top bar - Fixed */}
        <div className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                {/* Mobile menu button */}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden mr-4 p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>

                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    Admin Dashboard
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Welcome back, {user.username} 👋
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user.email}
                  </p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Admin
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 ">{children || <Outlet />}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
