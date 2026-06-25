/**
 * A loading spinner that rotates the site's ouroboros logo, for use in place
 * of (or alongside) the plain ring `Spinner` component wherever a more
 * on-brand loading indicator is wanted.
 *
 * Mirrors the prop API of `Spinner.jsx` (`size`, `className`, `center`,
 * `showText`, `text`) so it can be swapped in as a drop-in alternative,
 * with two additions specific to an animated image: `speed` and `reverse`.
 *
 * @component
 * @example
 * ```jsx
 * // Basic ouroboros spinner
 * <OuroborosSpinner />
 *
 * // Large, slower, with text
 * <OuroborosSpinner size="lg" speed="slow" showText text="Loading modules..." />
 * ```
 *
 * @param {Object} props - Component props
 * @param {string} [props.size="md"] - Spinner size preset: "sm" (32px), "md" (56px), or "lg" (96px)
 * @param {string} [props.speed="normal"] - Rotation speed preset: "slow" (3.5s), "normal" (2s), or "fast" (1s)
 * @param {boolean} [props.reverse=false] - If true, the snake appears to chase its tail in the opposite direction
 * @param {string} [props.className=""] - Additional CSS classes to apply to the image element
 * @param {boolean} [props.center=true] - If true, centers the spinner using flexbox. If false, spinner uses inline positioning
 * @param {boolean} [props.showText=false] - If true, displays text alongside the spinner
 * @param {string} [props.text="Loading..."] - Text to display when showText is true
 *
 * @returns {JSX.Element} A spinning ouroboros image with optional text and centering
 *
 * @sizePresets
 * - "sm" - h-8 w-8 (32px × 32px)
 * - "md" - h-14 w-14 (56px × 56px)
 * - "lg" - h-24 w-24 (96px × 96px)
 *
 * @animation
 * Uses a CSS keyframe rotation rather than Tailwind's `animate-spin` so the
 * speed can vary by preset; respects `prefers-reduced-motion`.
 */
const OuroborosSpinner = ({
  size = "md",
  speed = "normal",
  reverse = false,
  className = "",
  center = true,
  showText = false,
  text = "Loading...",
}) => {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-14 w-14",
    lg: "h-24 w-24",
  };

  const speedDuration = {
    slow: "3.5s",
    normal: "2s",
    fast: "1s",
  };

  const textColorClasses = "text-python-blue dark:text-python-blue";

  const spinner = (
    <img
      src="/ouroboros-spinner.png"
      alt="Loading"
      role="status"
      className={`ouroboros-spinner ${sizeClasses[size]} ${className}`}
      style={{
        animationDuration: speedDuration[speed],
        animationDirection: reverse ? "reverse" : "normal",
      }}
    />
  );

  const content = showText ? (
    <div className={`flex items-center ${center ? "justify-center" : ""}`}>
      {spinner}
      <span className={`ml-2 text-sm font-medium ${textColorClasses}`}>
        {text}
      </span>
    </div>
  ) : center ? (
    <div className="flex justify-center items-center">{spinner}</div>
  ) : (
    spinner
  );

  return (
    <>
      <style>{`
        @keyframes ouroboros-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .ouroboros-spinner {
          animation-name: ouroboros-rotate;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .ouroboros-spinner {
            animation-duration: 6s;
          }
        }
      `}</style>
      {content}
    </>
  );
};

export default OuroborosSpinner;
