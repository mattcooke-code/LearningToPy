import { memo, useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth, useTheme } from "../../context";
import { PYTHON_BLUE, PYTHON_DARK } from "../../constants/themeConstants";
import { shouldUseThemeColor } from "../../utils";
import { ThemeToggle } from "../ui";
import {
  BookOpen,
  User,
  LogOut,
  Home,
  Shield,
  Menu,
  X,
  ChevronDown,
  Settings,
} from "lucide-react";

const Navbar = memo(function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { themeColor, isDarkMode } = useTheme();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  // Dropdown items for authenticated users
  const dropdownItems = [
    { to: "/dashboard", icon: Home, label: "Dashboard" },
    { to: "/modules", icon: BookOpen, label: "Learn" },
    { to: "/profile", icon: User, label: "Profile" },
  ];

  // Admin items
  const adminItems = [
    { to: "/admin", icon: Shield, label: "Admin Panel" },
    { to: "/admin/users", icon: Settings, label: "Manage Users" },
  ];

  return (
    <nav
      style={{ backgroundColor: navbarBg }}
      className={`${navbarText} shadow-lg transition-colors duration-500 relative lg:sticky lg:top-0 z-100`}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
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

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-2">
            {isAuthenticated ? (
              <>
                {/* Theme Toggle */}
                <ThemeToggle />

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={toggleDropdown}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-black/10 transition ${isDropdownOpen ? "bg-black/10" : ""}`}
                  >
                    <User className="w-5 h-5" />
                    <span className="font-medium max-w-[120px] truncate">
                      {user?.username}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* Dropdown Menu - Themed to match navbar */}
                  {isDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg border border-white/10 dark:border-gray-700 py-1 z-50"
                      style={{
                        backgroundColor: navbarBg,
                      }}
                    >
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-white/10 dark:border-gray-700">
                        <p className="text-sm font-semibold truncate">
                          {user?.username}
                        </p>
                        <p className="text-xs opacity-80 truncate">
                          {user?.email}
                        </p>
                      </div>

                      {/* Navigation Links */}
                      {dropdownItems.map((item) => (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center space-x-3 px-4 py-2.5 text-sm hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                        >
                          <item.icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </Link>
                      ))}

                      {/* Admin Section */}
                      {user?.isAdmin && (
                        <>
                          <div className="border-t border-white/10 dark:border-gray-700 my-1"></div>
                          {adminItems.map((item) => (
                            <Link
                              key={item.to}
                              to={item.to}
                              onClick={() => setIsDropdownOpen(false)}
                              className="flex items-center space-x-3 px-4 py-2.5 text-sm hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                            >
                              <item.icon className="w-4 h-4" />
                              <span>{item.label}</span>
                            </Link>
                          ))}
                        </>
                      )}

                      {/* Logout */}
                      <div className="border-t border-white/10 dark:border-gray-700 my-1"></div>
                      <button
                        onClick={() => {
                          logout();
                          setIsDropdownOpen(false);
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-white hover:bg-black/10 dark:hover:bg-white/10 transition-colors hover:text-black"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
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

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="lg:hidden p-2 rounded-md hover:bg-black/10 focus:outline-none"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
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
