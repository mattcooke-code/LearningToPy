// BackToTopButton.jsx
import { useState, useEffect, useCallback, memo } from "react";
import { useLocation } from "react-router-dom";
import { useTheme } from "../../context";
import { PYTHON_BLUE, PYTHON_YELLOW } from "../../constants/themeConstants";
import { shouldUseThemeColor } from "../../utils";
import { ArrowUp } from "lucide-react";

const BackToTopButton = memo(function BackToTopButton({
  scrollThreshold = 600,
  className = "p-4 m-6",
}) {
  const [showButton, setShowButton] = useState(false);
  const { themeColor, isDarkMode } = useTheme();
  const location = useLocation();

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleScroll = useCallback(() => {
    setShowButton(window.scrollY > scrollThreshold);
  }, [scrollThreshold]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const useThemeColor = shouldUseThemeColor(location.pathname);

  // Background colours
  const baseColor = useThemeColor
    ? themeColor
    : isDarkMode
      ? PYTHON_YELLOW
      : PYTHON_BLUE;

  const hoverColor = useThemeColor
    ? getComputedStyle(document.documentElement)
        .getPropertyValue("--theme-hover-color")
        .trim() || themeColor
    : isDarkMode
      ? PYTHON_BLUE
      : PYTHON_YELLOW;

  // Arrow colours — swap with background for contrast
  const baseArrow = useThemeColor
    ? "white"
    : isDarkMode
      ? "#1e415e" // python-dark on yellow bg
      : "white"; // white on blue bg

  const hoverArrow = useThemeColor
    ? "white"
    : isDarkMode
      ? "white" // white on blue bg
      : "#1e415e"; // python-dark on yellow bg

  if (!showButton) return null;

  return (
    <aside aria-label="Back to top navigation" role="complementary">
      <button
        onClick={scrollToTop}
        style={{
          "--btn-bg": baseColor,
          "--btn-hover-bg": hoverColor,
          "--btn-arrow": baseArrow,
          "--btn-hover-arrow": hoverArrow,
        }}
        className={`
  fixed z-50 bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8
  rounded-full flex items-center justify-center
  transition-all duration-300 ease-in-out
  hover:shadow-xl hover:-translate-y-1
  p-3 sm:p-4 md:p-5
  ${className}
  bg-(--btn-bg)
  hover:bg-(--btn-hover-bg)
  text-(--btn-arrow)
  hover:text-(--btn-hover-arrow)
`}
        aria-label="Back to top"
      >
        <ArrowUp size={30} />
      </button>
    </aside>
  );
});

export default BackToTopButton;
