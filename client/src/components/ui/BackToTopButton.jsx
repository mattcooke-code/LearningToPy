// BackToTopButton.jsx
import { useState, useEffect, useCallback, memo } from "react";
import { ArrowUp } from "lucide-react";

const BackToTopButton = memo(function BackToTopButton({
  scrollThreshold = 600,
  className = "p-4 m-6",
}) {
  const [showButton, setShowButton] = useState(false);

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

  // RENDER LOGIC
  if (!showButton) {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
      className={`
        // Base positioning and display:
        fixed z-50 bottom-0 right-0
        // Sizing, background, and hover effects:
        bg-python-blue text-white rounded-full 
        // Flex utilities to center the icon:
        flex items-center justify-center
        // Transition for smooth effects and elevation on hover:
        transition-all duration-300 ease-in-out hover:bg-python-yellow hover:text-black hover:shadow-xl hover:-translate-y-1
        // Apply the custom spacing from the prop/default:
        ${className}
      `}
      aria-label="Back to top"
    >
      <ArrowUp size={30} />
    </button>
  );
});

export default BackToTopButton;
