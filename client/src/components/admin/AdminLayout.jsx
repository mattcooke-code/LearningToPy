// AdminLayout.jsx
import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AdminSidebar from "./AdminSidebar";
import { BackToTopButton, LoadingState } from "../ui";
import { Menu } from "lucide-react";

/**
 * Layout wrapper for admin pages with sidebar navigation and responsive design.
 * Provides consistent admin interface structure with mobile responsiveness.
 *
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render in the main content area
 * @returns {JSX.Element} Admin layout with sidebar and main content area
 */

const AdminLayout = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  if (authLoading) {
    return <LoadingState message="Loading admin dashboard..." />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-300 dark:bg-gray-900 flex overflow-x-hidden">
      {/* Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentPath={location.pathname}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {" "}
        {/* added min-w-0 to prevent layout shift */}
        {/* Top bar - Fixed */}
        <div className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                {/* Mobile menu button - Now always visible or lg:hidden based on preference */}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden mr-4 p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none ring-2 ring-transparent focus:ring-blue-500"
                  aria-label="Toggle sidebar"
                >
                  <Menu />
                </button>

                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    Admin
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Welcome, {user.username}
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
        <div className="flex-1" role="region" aria-label="Admin content">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="max-w-7xl mx-auto">
              {children || <Outlet />}
            </div>{" "}
          </div>
        </div>
      </div>
      <BackToTopButton />
    </div>
  );
};

export default AdminLayout;
