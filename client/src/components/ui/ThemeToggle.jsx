import { useTheme } from "../../context";
import { Sun, Moon } from "lucide-react";

const ThemeToggle = () => {
  const { isDarkMode, setUiTheme, UI_THEMES } = useTheme();

  const toggleTheme = () => {
    // Toggle between light and dark
    setUiTheme(isDarkMode ? UI_THEMES.LIGHT : UI_THEMES.DARK);
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg transition-colors"
      title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {isDarkMode ? (
        <Sun className="h-5 w-5 text-python-light hover:text-python-yellow" />
      ) : (
        <Moon className="h-5 w-5 text-python-light hover:text-python-yellow" />
      )}
    </button>
  );
};

export default ThemeToggle;
