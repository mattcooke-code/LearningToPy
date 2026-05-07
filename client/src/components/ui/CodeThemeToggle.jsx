import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../context";

/**
 * A toggle button for switching between light and dark code editor themes.
 * 
 * This component provides a compact interface for controlling the code editor
 * theme independently of the main UI theme. It displays the current state with
 * appropriate icons and text labels.
 * 
 * @component
 * @example
 * ```jsx
 * <CodeThemeToggle />
 * ```
 * 
 * @returns {JSX.Element} A toggle button with theme icons and labels
 * 
 * @themeIntegration
 * - Uses `useTheme()` hook to access code theme state
 * - Toggles between light and dark code themes
 * - Independent from main UI theme setting
 * - Persists code theme preference through context
 * 
 * @visualStates
 * Dark code theme:
 * - Sun icon (yellow) indicating switch to light
 * - "Light" text label
 * 
 * Light code theme:
 * - Moon icon (blue) indicating switch to dark
 * - "Dark" text label
 * 
 * @stylingFeatures
 * - Compact button design with horizontal layout
 * - Icon and text side-by-side with spacing
 * - Gray background with hover effects
 * - Smooth transitions for all interactions
 * - Responsive sizing with small text and 14px icons
 * 
 * @accessibility
 * - Semantic button element
 * - Descriptive tooltip showing action
 * - Clear visual feedback for current state
 * - High contrast icons and text
 * - Keyboard accessible
 */
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
