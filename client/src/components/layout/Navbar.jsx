import { memo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
//import { useTheme } from "../../context/ThemeContext";
import { BookOpen, User, LogOut, Home } from "lucide-react";
//import { useCallback, useState } from "react";

const Navbar = memo(function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  //  const { themeColor } = useTheme();

  // Responsive Adjustments
  /* const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  
  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prevState) => !prevState);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);*/

  return (
    <nav
      // style={{ backgroundColor: themeColor }}
      className="bg-python-blue text-white p-4 shadow-lg transition-colors duration-500"
    >
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link
          to={isAuthenticated ? "/dashboard" : "/"}
          className="flex items-center space-x-2"
        >
          <BookOpen className="w-8 h-8" />
          <span className="text-2xl font-bold">Learning To Py</span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center space-x-6">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="hover:text-python-yellow transition flex items-center space-x-1"
              >
                <Home className="w-5 h-5" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/profile"
                className="hover:text-python-yellow transition flex items-center space-x-1"
              >
                <User className="w-5 h-5" />
                <span>Profile</span>
              </Link>
              <button
                onClick={logout}
                className="hover:text-python-yellow transition flex items-center space-x-1"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-python-yellow transition">
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
    </nav>
  );
});

export default Navbar;
