// AppLayout.jsx
import { Outlet } from "react-router-dom";
import { useTheme } from "../../context";

/**
 * Main application layout wrapper with theme support and responsive design.
 * Provides consistent layout structure with dark mode integration.
 * 
 * @component
 * @returns {JSX.Element} Application layout with theme-aware styling
 */

const AppLayout = () => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? "dark" : ""}`}>
      <main className="flex-grow bg-gray-300 dark:bg-gray-900">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
