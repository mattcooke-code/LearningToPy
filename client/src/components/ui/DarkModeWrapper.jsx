import { useTheme } from "../../context";

// DarkModeWrapper.jsx
export const DarkModeWrapper = ({ children }) => {
  const { isDarkMode } = useTheme();

  return <div className={isDarkMode ? "dark" : ""}>{children}</div>;
};
