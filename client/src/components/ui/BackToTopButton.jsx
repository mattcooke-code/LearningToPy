// BackToTopButton.jsx
import { useState, useEffect, useCallback, memo } from "react";
import { useLocation } from "react-router-dom";
import { useTheme } from "../../context";
import { PYTHON_BLUE, PYTHON_YELLOW } from "../../constants/themeConstants";
import { shouldUseThemeColor } from "../../utils";
import { ArrowUp } from "lucide-react";

/**
 * A floating back-to-top button that appears after scrolling and adapts to theme context.
 * 
 * This component provides smooth scroll-to-top functionality with intelligent
 * theming based on route context and user preferences. It uses performance
 * optimizations and complex color logic for consistent visual integration.
 * 
 * @component
 * @example
 * ```jsx
 * <BackToTopButton scrollThreshold={400} className="custom-styles" />
 * ```
 * 
 * @param {Object} props - Component props
 * @param {number} [props.scrollThreshold=600] - Scroll distance (in pixels) after which the button becomes visible
 * @param {string} [props.className="p-4 m-6"] - Additional CSS classes to apply to the button
 * 
 * @returns {JSX.Element|null} Floating button or null when below scroll threshold
 * 
 * @performanceOptimizations
 * - Uses React.memo to prevent unnecessary re-renders
 * - Passive scroll event listener for better performance
 * - useCallback hooks to stabilize function references
 * - Efficient scroll threshold checking
 * 
 * @themeLogic
 * The button color is determined by multiple factors:
 * 1. Route-specific theming via `shouldUseThemeColor()`
 * 2. Dark/light mode preference
 * 3. Fallback to brand colors (PYTHON_BLUE/PYTHON_YELLOW)
 * 
 * Hover behavior includes color swapping and transform effects:
 * - PYTHON_YELLOW ↔ PYTHON_BLUE color swap
 * - Vertical translation on hover (-4px)
 * - Smooth transitions for all interactions
 * 
 * @responsiveDesign
 * - Responsive positioning: bottom/right values change by screen size
 * - Responsive padding: p-3 on mobile, p-4 on tablet, p-5 on desktop
 * - Fixed positioning with high z-index (z-50)
 * - Consistent icon sizing (30px)
 * 
 * @accessibility
 * - Semantic button with aria-label="Back to top"
 * - Smooth scroll behavior for better UX
 * - Keyboard accessible
 * - Clear visual feedback for interactive states
 * 
 * @internalLogic
 * Scroll Detection:
 * - Uses window.scrollY to track scroll position
 * - Compares against scrollThreshold to control visibility
 * - Event listener properly cleaned up on unmount
 * 
 * Color Resolution:
 * - `getButtonColor()` determines base color from theme context
 * - `getHoverColor()` calculates complementary hover color
 * - `getHoverArrow()` determines text color for contrast
 * - Inline styles used for dynamic color changes
 */
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

  const getButtonColor = () => {
    if (shouldUseThemeColor(location.pathname)) {
      return themeColor;
    }
    if (isDarkMode) {
      return PYTHON_YELLOW;
    }
    return PYTHON_BLUE;
  };

  const getHoverColor = (baseColor) => {
    if (baseColor === PYTHON_YELLOW) return PYTHON_BLUE;
    if (baseColor === PYTHON_BLUE) return PYTHON_YELLOW;
    return baseColor;
  };

  const getHoverArrow = () => {
    if (shouldUseThemeColor(location.pathname)) {
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
        fixed z-50 bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 rounded-full
        flex items-center justify-center
        transition-all duration-300 ease-in-out
        hover:shadow-xl ${getHoverArrow()}
        p-3 sm:p-4 md:p-5
        ${className}
      `}
      aria-label="Back to top"
    >
      <ArrowUp size={30} />
    </button>
  );
});

export default BackToTopButton;
