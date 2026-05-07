// ErrorState.jsx
/**
 * A standardized error display component with recovery action.
 * 
 * This component provides a consistent error presentation across the application
 * with a clear error message and a recovery button. It's designed to handle
 * error states in a user-friendly way with visual feedback and an escape path.
 * 
 * @component
 * @example
 * ```jsx
 * <ErrorState 
 *   error="Failed to load module data. Please try again later."
 *   onBack={() => navigate('/modules')}
 * />
 * ```
 * 
 * @param {Object} props - Component props
 * @param {string} props.error - Error message to display to the user. Should be user-friendly and descriptive
 * @param {Function} props.onBack - Callback function triggered when the user clicks the recovery button. Typically navigates back or retries the operation
 * 
 * @returns {JSX.Element} A centered error container with message and recovery button
 * 
 * @designNotes
 * - Uses red color scheme for clear error indication
 * - Consistent spacing and typography with other components
 * - Container includes padding and border for visual separation
 * - Button uses primary brand color for clear action emphasis
 * - Responsive container with proper margins
 * 
 * @accessibility
 * - Clear visual hierarchy with error message prominence
 * - Descriptive button text indicating recovery action
 * - Semantic HTML structure for screen readers
 * - Proper contrast ratios for error states
 */
const ErrorState = ({ error, onBack }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-700">{error}</p>
        <button
          onClick={onBack}
          className="mt-4 bg-python-blue text-white px-4 py-2 rounded-lg hover:bg-python-dark transition"
        >
          Back to Modules
        </button>
      </div>
    </div>
  );
};

export default ErrorState;
