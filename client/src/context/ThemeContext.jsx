// ThemeContext.jsx
import { createContext, useState } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeColor, setThemeColor] = useState("#3776AB");

  const updateTheme = (progressPercentage) => {
    const newColor = getProgressColor(progressPercentage);
    setThemeColor(newColor);
  };

  return (
    <ThemeContext.Provider value={{ themeColor, updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
