// ThemeToggle.jsx
import { useTheme } from "../../context";
import { Sun, Moon, Monitor } from "lucide-react";

const ThemeToggle = () => {
  const { uiTheme, setUiTheme, isDarkMode, UI_THEMES } = useTheme();

  const getIcon = () => {
    if (uiTheme === UI_THEMES.LIGHT) return <Sun className="h-5 w-5" />;
    if (uiTheme === UI_THEMES.DARK) return <Moon className="h-5 w-5" />;
    return <Monitor className="h-5 w-5" />;
  };

  const getTooltip = () => {
    if (uiTheme === UI_THEMES.LIGHT) return "Switch to Dark Mode";
    if (uiTheme === UI_THEMES.DARK) return "Switch to Light Mode";
    return "Switch to System Preference";
  };

  const handleToggle = () => {
    if (uiTheme === UI_THEMES.LIGHT) {
      setUiTheme(UI_THEMES.DARK);
    } else if (uiTheme === UI_THEMES.DARK) {
      setUiTheme(UI_THEMES.SYSTEM);
    } else {
      setUiTheme(UI_THEMES.LIGHT);
    }
  };

  return (
    <button
      onClick={handleToggle}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      title={getTooltip()}
    >
      {getIcon()}
    </button>
  );
};

export default ThemeToggle;
