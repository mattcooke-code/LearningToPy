import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../context";

const CodeThemeToggle = () => {
  const { codeTheme, toggleCodeTheme, isCodeDark } = useTheme();

  return (
    <button
      onClick={toggleCodeTheme}
      className="flex items-center space-x-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 px-3 py-1 rounded-lg transition text-sm"
      title={`Switch to ${isCodeDark ? "light" : "dark"} code theme`}
    >
      {isCodeDark ? (
        <>
          <Sun className="text-yellow-500" size={14} />
          <span>Light</span>
        </>
      ) : (
        <>
          <Moon className="text-blue-400" size={14} />
          <span>Dark</span>
        </>
      )}
    </button>
  );
};

export default CodeThemeToggle;
