import { memo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth, useTheme } from "../../context";
import { PYTHON_BLUE, PYTHON_DARK } from "../../constants/themeConstants";
import { shouldUseThemeColor } from "../../utils";
import { ThemeToggle } from "../ui";
import { BookOpen, User, LogOut, Home, Shield, Menu, X } from "lucide-react";

const Navbar = memo(function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { themeColor, isDarkMode } = useTheme();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Resolve navbar background — theme on learning pages, static Python colours elsewhere
  const navbarBg = shouldUseThemeColor(location.pathname)
    ? "var(--theme-color)"
    : isDarkMode
      ? PYTHON_DARK
      : PYTHON_BLUE;

  const navbarText = shouldUseThemeColor(location.pathname)
    ? "text-white"
    : isDarkMode
      ? "text-python-light"
      : "text-white";

  const linkHoverClass =
    "hover:text-python-yellow hover:bg-black/10 transition px-3 py-2 rounded-md";

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav
      style={{ backgroundColor: navbarBg }}
      className={`${navbarText} shadow-lg transition-colors duration-500 relative lg:sticky lg:top-0 z-100`}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2 shrink-0">
              <img
                src="/Logo.png"
                className="w-18 h-16"
                alt="Learning To Py Logo"
              />
              <span className="text-xl sm:text-2xl font-bold tracking-tight">
                Learning To Py
              </span>
            </Link>
          </div>

          <div className="hidden lg:flex items-center space-x-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className={`flex items-center space-x-1 ${linkHoverClass}`}
                >
                  <Home className="w-5 h-5" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/modules"
                  className={`flex items-center space-x-1 ${linkHoverClass}`}
                >
                  <BookOpen className="w-5 h-5" />
                  <span>Learn</span>
                </Link>
                <Link
                  to="/profile"
                  className={`flex items-center space-x-1 ${linkHoverClass}`}
                >
                  <User className="w-5 h-5" />
                  <span>Profile</span>
                </Link>
                {user?.isAdmin && (
                  <Link
                    to="/admin"
                    className={`flex items-center space-x-1 ${linkHoverClass}`}
                  >
                    <Shield className="w-5 h-5" />
                    <span>Admin</span>
                  </Link>
                )}
                <ThemeToggle />
                <button
                  onClick={() => logout()}
                  className={`flex items-center space-x-1 ${linkHoverClass}`}
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={linkHoverClass}>
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-python-yellow text-python-dark px-5 py-2 rounded-lg font-bold hover:bg-yellow-400 transition ml-2"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          <button
            onClick={toggleMenu}
            className="lg:hidden p-2 rounded-md hover:bg-black/10 focus:outline-none"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      <div
        className={`lg:hidden transition-all duration-300 overflow-hidden ${isOpen ? "max-h-500px border-t border-black/10" : "max-h-0"}`}
      >
        <div className="px-4 pt-2 pb-6 space-y-2 bg-black/5">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                onClick={toggleMenu}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-black/10"
              >
                <Home size={20} /> <span>Dashboard</span>
              </Link>
              <Link
                to="/modules"
                onClick={toggleMenu}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-black/10"
              >
                <BookOpen size={20} /> <span>Learn</span>
              </Link>
              <Link
                to="/profile"
                onClick={toggleMenu}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-black/10"
              >
                <User size={20} /> <span>Profile</span>
              </Link>
              {user?.isAdmin && (
                <Link
                  to="/admin"
                  onClick={toggleMenu}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-black/10"
                >
                  <Shield className="w-5 h-5" />
                  <span>Admin</span>
                </Link>
              )}
              <button
                onClick={() => {
                  logout();
                  toggleMenu();
                }}
                className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-black/10 text-left"
              >
                <LogOut size={20} /> <span>Logout</span>
              </button>
            </>
          ) : (
            <div className="flex flex-col space-y-3 pt-2">
              <Link
                to="/login"
                onClick={toggleMenu}
                className="p-3 text-center rounded-lg border border-white/20"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={toggleMenu}
                className="p-3 text-center bg-python-yellow text-python-dark rounded-lg font-bold"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
});

export default Navbar;
