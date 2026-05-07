import { Spinner } from "../ui";

/**
 * A standardized loading state component that displays a spinner with optional message.
 * 
 * This component provides a consistent loading experience across the application
 * with customizable height, spinner size, and loading message. It's designed to
 * be used during data fetching, form submissions, or any async operation.
 * 
 * @component
 * @example
 * ```jsx
 * // Basic usage
 * <LoadingState />
 * 
 * // Custom message and height
 * <LoadingState 
 *   message="Fetching user data..." 
 *   height="h-96"
 *   spinnerSize="lg"
 * />
 * ```
 * 
 * @param {Object} props - Component props
 * @param {string} [props.message="Loading..."] - Text message displayed below the spinner to inform users what's happening
 * @param {string} [props.height="h-64"] - Tailwind CSS height class for the container. Controls vertical space the loading state occupies
 * @param {string} [props.spinnerSize="md"] - Size of the spinner component. Passed directly to the Spinner component
 * 
 * @returns {JSX.Element} A centered container with spinner and optional loading message
 * 
 * @designNotes
 * - Uses flexbox centering for perfect alignment
 * - Container includes padding for consistent spacing with other content
 * - Height prop allows maintaining layout during loading states
 * - Message is passed to Spinner component for unified styling
 */
const LoadingState = ({
  message = "Loading...",
  height = "h-64",
  spinnerSize = "md",
}) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className={`flex justify-center items-center ${height}`}>
        <Spinner
          size={spinnerSize}
          color="gray"
          showText={true}
          text={message}
        />
      </div>
    </div>
  );
};

export default LoadingState;
