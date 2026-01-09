import { useState, useEffect } from "react";
import { CheckCircle, HelpCircle, ChevronRight, RotateCcw } from "lucide-react";

const QuizComponent = ({
  quizArray, // Passing the full array now
  onAnswerSubmit,
  isReviewMode,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // The specific question object for the current step
  const currentQuiz = quizArray[currentStep];

  // Reset state when entering Review Mode or switching lessons
  useEffect(() => {
    if (isReviewMode) {
      setShowResult(true);
      setSelectedAnswer(currentQuiz?.correctAnswer);
    } else {
      resetStep();
    }
  }, [isReviewMode, currentStep, currentQuiz]);

  const resetStep = () => {
    setSelectedAnswer(null);
    setShowResult(false);
    setIsCorrect(false);
  };

  const handleCheckAnswer = () => {
    if (selectedAnswer === null) return;

    const correct = selectedAnswer === currentQuiz.correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);

    // If it's correct AND it's the last (or only) question, tell the parent
    if (correct && currentStep === quizArray.length - 1 && !isReviewMode) {
      onAnswerSubmit(selectedAnswer);
    }
  };

  const handleNext = () => {
    if (currentStep < quizArray.length - 1) {
      setCurrentStep((prev) => prev + 1);
      resetStep();
    }
  };

  if (!currentQuiz) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 my-6 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <HelpCircle className="text-blue-600" size={24} />
          <h3 className="text-lg font-semibold text-blue-800">
            Quick Quiz{" "}
            {quizArray.length > 1 && `(${currentStep + 1}/${quizArray.length})`}
          </h3>
        </div>
        {isReviewMode && (
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
            Review Mode
          </span>
        )}
      </div>

      {/* Question Text */}
      <p className="text-gray-800 mb-4 font-medium text-lg">
        {currentQuiz.question}
      </p>

      {/* Options */}
      <div className="space-y-3">
        {currentQuiz.options.map((option, index) => {
          const isThisCorrect = index === currentQuiz.correctAnswer;
          const isThisSelected = index === selectedAnswer;

          let variantClass =
            "bg-white border-gray-200 hover:bg-gray-50 text-gray-700";

          if (showResult) {
            if (isThisCorrect) {
              variantClass =
                "bg-green-100 border-green-400 text-green-700 font-semibold";
            } else if (isThisSelected && !isThisCorrect) {
              variantClass =
                "bg-red-100 border-red-400 text-red-700 font-semibold";
            }
          } else if (isThisSelected) {
            variantClass = "bg-blue-100 border-blue-400 text-blue-700";
          }

          return (
            <label
              key={index}
              className={`flex items-center space-x-3 p-4 rounded-lg border transition-all cursor-pointer ${variantClass}`}
            >
              <input
                type="radio"
                name="quiz-option"
                checked={isThisSelected}
                onChange={() => !showResult && setSelectedAnswer(index)}
                disabled={showResult}
                className="hidden"
              />
              <span className="flex-1">{option}</span>
              {showResult && isThisCorrect && (
                <CheckCircle size={20} className="text-green-600" />
              )}
              {showResult && isThisSelected && !isThisCorrect && (
                <span className="text-red-600 font-bold">✕</span>
              )}
            </label>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="mt-6">
        {!showResult ? (
          <button
            onClick={handleCheckAnswer}
            disabled={selectedAnswer === null}
            className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-blue-200 disabled:cursor-not-allowed transition-colors"
          >
            Check Answer
          </button>
        ) : (
          <div className="space-y-4">
            <div
              className={`p-4 rounded-lg border ${
                isCorrect
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <p className="text-gray-800 italic">{currentQuiz.explanation}</p>
            </div>

            <div className="flex space-x-4">
              {/* If wrong, allow retry */}
              {!isCorrect && !isReviewMode && (
                <button
                  onClick={resetStep}
                  className="flex items-center space-x-2 text-blue-600 font-semibold hover:underline"
                >
                  <RotateCcw size={18} />
                  <span>Try Again</span>
                </button>
              )}

              {/* If correct and more questions exist, show Next */}
              {isCorrect && currentStep < quizArray.length - 1 && (
                <button
                  onClick={handleNext}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700"
                >
                  <span>Next Question</span>
                  <ChevronRight size={18} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizComponent;
