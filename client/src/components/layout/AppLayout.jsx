// AppLayout.jsx
import { Outlet } from "react-router-dom";
import { useTheme } from "../../context";

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
