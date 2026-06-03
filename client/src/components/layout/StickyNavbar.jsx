// src/components/layout/StickyNavbar.jsx
import { Link } from "react-router-dom";
import { useAuth } from "../../context";
import { Zap } from "lucide-react";

const StickyNavbar = ({ isScrolled }) => {
  const { isAuthenticated } = useAuth();

  const navItems = [
    { label: "Features", href: "/#features" },
    { label: "Methodology", href: "/#methodology" },
    { label: "How it Works", href: "/#how-it-works" },
    { label: "Curriculum", href: "/#curriculum" },
  ];

  return (
    <nav
      className={`w-full transition-all duration-300 shadow-md border-b ${
        isScrolled
          ? "bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-gray-100 dark:border-gray-800"
          : "bg-slate-900 text-white border-transparent"
      }`}
    >
      {/* Mobile layout: anchor links only, evenly distributed across full width */}
      <div className="flex md:hidden items-center justify-around px-2 py-2">
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.href}
            className={`px-2 py-1.5 rounded-md text-xs font-semibold text-center transition-colors ${
              isScrolled
                ? "text-slate-600 dark:text-slate-300 hover:text-python-blue dark:hover:text-python-yellow"
                : "text-slate-200 hover:text-python-yellow"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {/* Desktop layout: unchanged */}
      <div className="hidden md:flex container mx-auto px-6 sm:px-10 items-center justify-between py-3">
        <Link
          to="/#hero"
          className={`flex items-center space-x-2 font-bold text-xl transition-colors ${
            isScrolled
              ? "text-slate-900 dark:text-python-yellow"
              : "text-python-yellow"
          }`}
        >
          <Zap
            size={20}
            className={
              isScrolled
                ? "text-python-blue dark:text-python-yellow"
                : "text-python-yellow"
            }
          />
          <span>Learning To Py</span>
        </Link>

        <div className="flex items-center space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className={`text-sm font-medium transition-colors ${
                isScrolled
                  ? "text-slate-600 dark:text-slate-300 hover:text-python-blue dark:hover:text-python-yellow"
                  : "text-slate-200 hover:text-python-yellow"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <Link
          to={isAuthenticated ? "/dashboard" : "/register"}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${
            isScrolled
              ? "bg-python-blue text-python-yellow hover:bg-python-dark"
              : "bg-python-yellow text-python-dark hover:bg-white"
          }`}
        >
          {isAuthenticated ? "Dashboard" : "Get Started"}
        </Link>
      </div>
    </nav>
  );
};

export default StickyNavbar;
