// AdminSidebar.jsx
import { useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { X, ShieldCheck, ChevronRight } from "lucide-react";
import { ADMIN_MENU_ITEMS } from "../../constants/adminConstants";
import { adminApiClient } from "../../services";
import { useAdminData } from "../../hooks";

// Custom hook for active path detection
const useActivePath = (currentPath, menuPath, exact = false) => {
  if (exact) return currentPath === menuPath;
  return (
    currentPath.startsWith(menuPath) || currentPath.startsWith(menuPath + "/")
  );
};

/**
 * Navigation sidebar for admin interface with menu items and badge counts.
 * Provides mobile-responsive navigation with real-time notification badges.
 *
 * @component
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the sidebar is currently open
 * @param {Function} props.onClose - Function to call when closing the sidebar
 * @returns {JSX.Element} Admin sidebar with navigation menu and badges
 */

const AdminSidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const fetchStats = useCallback(() => adminApiClient.get("/stats"), []);
  const { data: stats } = useAdminData(fetchStats, [], {
    autoRetry: false,
    showToastOnError: false,
  });

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 dark:bg-gray-800 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:z-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Admin navigation"
      >
        {/* Mobile close button */}
        <div className="lg:hidden absolute top-4 right-4">
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close sidebar"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Logo/Brand */}
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <ShieldCheck className="h-8 w-8 text-blue-500" aria-hidden="true" />
            <span className="text-xl font-bold text-white">
              LearningToPy Admin
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav
          className="flex-1 overflow-y-auto py-4 px-4"
          aria-label="Main navigation"
        >
          <ul className="space-y-1">
            {ADMIN_MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = useActivePath(
                currentPath,
                item.path,
                item.exact,
              );

              // Get dynamic badge count
              let badgeCount = item.badgeCount || 0;
              if (item.badge && stats) {
                if (item.path === "/admin/flagged") {
                  badgeCount = stats.flaggedContent || 0;
                }
                // Add other badge mappings as needed
              }

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={onClose}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    }`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon
                      className="h-5 w-5 mr-3 flex-shrink-0"
                      aria-hidden="true"
                    />
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge && (
                      <span
                        className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-500 text-white"
                        aria-label={`${badgeCount} pending items`}
                      >
                        {badgeCount}
                      </span>
                    )}
                    {isActive && (
                      <ChevronRight
                        className="h-4 w-4 ml-2 flex-shrink-0"
                        aria-hidden="true"
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default AdminSidebar;
