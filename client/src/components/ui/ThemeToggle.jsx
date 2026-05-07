import { useTheme } from "../../context";
import { Sun, Moon } from "lucide-react";

/**
 * A theme toggle button that switches between light and dark modes.
 * 
 * This component provides a simple toggle interface for switching between
 * application themes. It uses the global theme context and displays appropriate
 * icons based on the current theme state.
 * 
 * @component
 * @example
 * ```jsx
 * <ThemeToggle />
 * ```
 * 
 * @returns {JSX.Element} A button with sun/moon icons for theme switching
 * 
 * @themeIntegration
 * - Uses `useTheme()` hook to access global theme state
 * - Leverages `UI_THEMES` constants for theme values
 * - Automatically updates icon based on current theme
 * - Persists theme preference through context
 * 
 * @accessibility
 * - Includes tooltip with descriptive text
 * - Semantic button element with proper labeling
 * - Clear visual feedback with icon changes
 * - Hover states for interactive feedback
 * 
 * @visualDesign
 * - Sun icon appears in dark mode (indicating switch to light)
 * - Moon icon appears in light mode (indicating switch to dark)
 * - Smooth color transitions on hover
 * - Consistent sizing and spacing
 */
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
        <Sun className="h-5 w-5 text-white hover:text-black" />
      ) : (
        <Moon className="h-5 w-5 text-white hover:text-black" />
      )}
    </button>
  );
};

export default ThemeToggle;
