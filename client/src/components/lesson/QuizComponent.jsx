import { useState, useEffect } from "react";
import { CheckCircle, HelpCircle } from "lucide-react";

const QuizComponent = ({
  quiz,
  onAnswerSubmit,
  isReviewMode,
  correctAnswer,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(isReviewMode);

  useEffect(() => {
    if (isReviewMode) {
      setSelectedAnswer(correctAnswer);
      setShowResult(true);
    }
  }, [isReviewMode, correctAnswer]);

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    setShowResult(true);
    if (!isReviewMode) {
      onAnswerSubmit(selectedAnswer);
    }
  };

  // If quiz data is not available yet, show loading or placeholder
  if (!quiz) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 my-6">
        <div className="flex items-center space-x-2 mb-4">
          <HelpCircle className="text-blue-600" size={24} />
          <h3 className="text-lg font-semibold text-blue-800">Quick Quiz</h3>
        </div>
        <p className="text-gray-600">Quiz content loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 my-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <HelpCircle className="text-blue-600" size={24} />
          <h3 className="text-lg font-semibold text-blue-800">
            Quick Quiz {isReviewMode && "(Review)"}
          </h3>
        </div>
        {isReviewMode && (
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
            Review Mode
          </span>
        )}
      </div>

      <p className="text-gray-800 mb-4 font-medium">{quiz.question}</p>

      <div className="space-y-3">
        {quiz.options &&
          quiz.options.map((option, index) => (
            <label
              key={index}
              className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer ${
                showResult && index === correctAnswer
                  ? "bg-green-100 border-green-300"
                  : "bg-white border-gray-200 hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                name="quiz"
                value={index}
                checked={selectedAnswer === index}
                onChange={() => setSelectedAnswer(index)}
                className="text-blue-600 focus:ring-blue-500"
                disabled={showResult}
              />
              <span
                className={`flex-1 ${
                  showResult && index === correctAnswer
                    ? "text-green-600 font-semibold"
                    : showResult &&
                      index === selectedAnswer &&
                      index !== correctAnswer
                    ? "text-red-600 font-semibold"
                    : "text-gray-700"
                }`}
              >
                {option}
              </span>
              {showResult && index === correctAnswer && (
                <CheckCircle className="text-green-500" size={20} />
              )}
              {showResult &&
                index === selectedAnswer &&
                index !== correctAnswer && (
                  <span className="text-red-500 text-sm">✗</span>
                )}
            </label>
          ))}
      </div>

      {!showResult ? (
        <button
          onClick={handleSubmit}
          disabled={selectedAnswer === null}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition"
        >
          Check Answer
        </button>
      ) : (
        <div className="mt-4 p-4 bg-white rounded-lg border">
          <p
            className={`text-lg font-semibold ${
              isReviewMode
                ? "text-blue-600"
                : selectedAnswer === correctAnswer
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {isReviewMode
              ? "🔍 Review Mode"
              : selectedAnswer === correctAnswer
              ? "✅ Correct!"
              : "❌ Try Again!"}
          </p>
          <p className="text-gray-700 mt-2">{quiz.explanation}</p>
        </div>
      )}

      {isReviewMode && (
        <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded">
          <p className="text-yellow-800 text-sm">
            💡 <strong>Review Mode:</strong> You can practice without affecting
            your progress.
          </p>
        </div>
      )}
    </div>
  );
};

export default QuizComponent;
