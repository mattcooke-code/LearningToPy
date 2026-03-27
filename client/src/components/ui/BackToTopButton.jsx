// BackToTopButton.jsx
import { useState, useEffect, useCallback, memo } from "react";
import { useLocation } from "react-router-dom";
import { useTheme } from "../../context";
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
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  const shouldUseThemeColor = () => {
    const pathname = location.pathname;
    return (
      pathname === "/modules" ||
      pathname.includes("/modules/") ||
      pathname.includes("/lessons/") ||
      pathname === "/dashboard" ||
      pathname === "/profile"
    );
  };

  const getButtonColor = () => {
    if (shouldUseThemeColor()) {
      return themeColor;
    }
    if (isDarkMode) {
      return "#ffd43b";
    }
    return "#3776ab";
  };

  const getHoverColor = (baseColor) => {
    if (baseColor === "#ffd43b") return "#3776ab";
    if (baseColor === "#3776ab") return "#ffd43b";
    return baseColor;
  };

  const getHoverArrow = () => {
    if (shouldUseThemeColor()) {
      return "text-white";
    }
    return isDarkMode
      ? "text-black hover:text-white"
      : "text-white hover:text-black";
  };

  const buttonColor = getButtonColor();
  const hoverColor = getHoverColor(buttonColor);

  if (!showButton) {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
      style={{
        backgroundColor: buttonColor,
        transition: "all 0.3s ease-in-out",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = hoverColor;
        e.currentTarget.style.transform = "translateY(-4px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = buttonColor;
        e.currentTarget.style.transform = "translateY(0)";
      }}
      className={`
        fixed z-50 bottom-0 right-0
       rounded-full
        flex items-center justify-center
        transition-all duration-300 ease-in-out
        hover:shadow-xl ${getHoverArrow()}
        ${className}
      `}
      aria-label="Back to top"
    >
      <ArrowUp size={30} />
    </button>
  );
});

export default BackToTopButton;
