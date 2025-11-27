// ErrorState.jsx
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
