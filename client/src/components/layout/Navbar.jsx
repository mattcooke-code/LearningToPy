import { memo } from "react";
import { Link } from "react-router-dom";
import { useAuth, useTheme } from "../../context";
import { ThemeToggle } from "../ui";
import { BookOpen, User, LogOut, Home, Shield } from "lucide-react";

const Navbar = memo(function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { themeColor } = useTheme();

  return (
    <nav
      style={{ backgroundColor: themeColor }}
      className="text-white p-4 shadow-lg transition-colors duration-500"
    >
      <div className="flex items-center space-x-2">
        <ThemeToggle />
        <div className="container mx-auto flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <BookOpen className="w-8 h-8" />
            <span className="text-2xl font-bold">Learning To Py</span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-1 hover:text-python-yellow hover:bg-black hover:bg-opacity-10 transition px-2 py-1 rounded"
                >
                  <Home className="w-5 h-5" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/modules"
                  className="flex items-center space-x-1 hover:text-python-yellow hover:bg-black hover:bg-opacity-10 transition px-2 py-1 rounded"
                >
                  <BookOpen className="w-5 h-5" />
                  <span>Learn</span>
                </Link>

                {/* Admin Link - Only show for admin users */}
                {user?.isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center space-x-1 hover:text-python-yellow hover:bg-black hover:bg-opacity-10 transition px-2 py-1 rounded relative group"
                  >
                    <Shield className="w-5 h-5" />
                    <span>Admin</span>
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>

                    {/* Tooltip */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                      Admin Dashboard
                    </div>
                  </Link>
                )}

                <Link
                  to="/profile"
                  className="flex items-center space-x-1 hover:text-python-yellow hover:bg-black hover:bg-opacity-10 transition px-2 py-1 rounded"
                >
                  <User className="w-5 h-5" />
                  <span>Profile</span>
                </Link>
                <button
                  onClick={() => logout()}
                  className="flex items-center space-x-1 hover:text-python-yellow hover:bg-black hover:bg-opacity-10 transition px-2 py-1 rounded"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hover:text-python-yellow hover:bg-black hover:bg-opacity-10 transition px-2 py-1 rounded"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-python-yellow text-python-dark px-4 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
});

export default Navbar;
