// components/layout/Footer.jsx
import { Link } from "react-router-dom";

/**
 * Footer component with navigation links, resources, and brand information.
 * Provides comprehensive site navigation and legal information with responsive design.
 *
 * @component
 * @returns {JSX.Element} Site footer with navigation and branding
 */

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="bg-gray-900 text-white dark:bg-python-dark"
      aria-label="Site footer"
    >
      <h2 className="sr-only">Footer Navigation</h2>
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-python-blue dark:bg-python-light rounded-full flex items-center justify-center">
                <span className="text-white dark:text-python-blue font-bold text-sm">
                  Py
                </span>
              </div>
              <Link to="/" className="text-xl font-bold text-white">
                Learning To Py
              </Link>
            </div>
            <p className="text-gray-300 text-sm mb-4">
              Master Python programming through interactive lessons, hands-on
              exercises, and gamified learning.
            </p>
          </div>

          {/* Curriculum Column */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">
              Learning Path
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/curriculum"
                  className="text-gray-300 hover:text-python-yellow transition-colors text-sm font-medium"
                >
                  Explore the Curriculum
                </Link>
              </li>
              <li className="text-gray-300 text-xs italic pt-2 border-t border-gray-600">
                Includes: Python Basics, Data Structures, OOP, and more.
              </li>
            </ul>
          </div>

          {/* Resources & Support Column */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://docs.python.org/3/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-python-yellow transition-colors text-sm"
                >
                  Official Python Docs
                </a>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-gray-300 hover:text-python-yellow transition-colors text-sm"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  to="/support"
                  className="text-gray-300 hover:text-python-yellow transition-colors text-sm"
                >
                  Get Help / Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/support?tab=feedback"
                  className="text-gray-300 hover:text-python-yellow transition-colors text-sm"
                >
                  Give Feedback
                </Link>
              </li>
            </ul>
          </div>

          {/* Community Column */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">
              Join the Community
            </h3>
            <p className="text-gray-300 text-sm mb-4">
              Follow our journey and connect with other learners.
            </p>
            <div className="flex space-x-4">
              {/* Replace '#' with actual links when ready */}
              <a
                href="#"
                className="text-gray-300 hover:text-python-yellow transition-colors"
                title="Follow us on X"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.045 4.126H5.078z" />
                </svg>
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-python-yellow transition-colors"
                title="Star us on GitHub"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-300 text-xs mb-4 md:mb-0">
              © {currentYear} Learning To Py.
              <span className="mx-2">|</span>
              <Link
                to="/privacy"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
              <span className="mx-2">|</span>
              <Link
                to="/terms"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Terms of Service
              </Link>
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <span className="text-gray-300">Made with</span>
              <div className="flex items-center space-x-1 text-red-500">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>and</span>
                <svg
                  className="w-4 h-4 text-python-blue dark:text-python-light"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                <span>Python</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
