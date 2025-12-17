import { Link } from "react-router-dom";
import {
  BarChart3,
  Users,
  BookOpen,
  Flag,
  Settings,
  FileText,
  PieChart,
  ShieldCheck,
  ChevronRight,
  X,
} from "lucide-react";

const menuItems = [
  { path: "/admin", label: "Dashboard", icon: BarChart3 },
  { path: "/admin/users", label: "User Management", icon: Users },
  { path: "/admin/content", label: "Content Management", icon: BookOpen },
  { path: "/admin/flagged", label: "Flagged Content", icon: Flag, badge: true },
  { path: "/admin/analytics", label: "Analytics", icon: PieChart },
  { path: "/admin/settings", label: "Settings", icon: Settings },
];

const AdminSidebar = ({ isOpen, onClose, currentPath }) => {
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 dark:bg-gray-800 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:z-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Mobile close button */}
        <div className="lg:hidden absolute top-4 right-4">
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Logo/Brand */}
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <ShieldCheck className="h-8 w-8 text-blue-500" />
            <span className="text-xl font-bold text-white">
              LearningToPy Admin
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-4">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                currentPath === item.path ||
                (item.path !== "/admin" && currentPath.startsWith(item.path));

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.label}
                  {item.badge && (
                    <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-500 text-white">
                      3
                    </span>
                  )}
                  {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
                </Link>
              );
            })}
          </div>

          {/* Quick Stats - Fixed position */}
          <div className="mt-8 px-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Quick Stats
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Active Users</span>
                <span className="text-white font-medium">1,234</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Pending Flags</span>
                <span className="text-red-400 font-medium">12</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Published Lessons</span>
                <span className="text-green-400 font-medium">156</span>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
};

export default AdminSidebar;
