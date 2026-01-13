// ModuleQuizPage.jsx
import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiClient, useAuth, useNotification, useTheme } from "../context";
import { LoadingState, ErrorState, BackToTopButton } from "../components/ui";
import { getErrorMessage } from "../utils";
import {
  Trophy,
  CheckCircle,
  XCircle,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

const ModuleQuizPage = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { themeColor, updateThemeFromCourseProgress } = useTheme();
  const { showToast } = useNotification();

  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [shuffledOptions, setShuffledOptions] = useState({});

  // Fetch module data
  const fetchModule = useCallback(async () => {
    if (!moduleId) return;

    try {
      setLoading(true);
      setError(null);

      const moduleData = await apiClient.get(`/content/modules/${moduleId}`);
      setModule(moduleData);

      if (!moduleData.allLessonsComplete) {
        setError("Complete all lessons before taking the module quiz");
        return;
      }

      if (moduleData.quizCompleted) {
        // Could fetch previous attempt results here if you store them
      }
    } catch (err) {
      console.error("Failed to fetch module:", err);
      setError(getErrorMessage(err, "Failed to load module quiz"));
    } finally {
      setLoading(false);
    }
  }, [moduleId]);

  useEffect(() => {
    fetchModule();
  }, [fetchModule]);

  // Function to shuffle array (Fisher-Yates algorithm)
  // Possible utils file refactor?
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  useEffect(() => {
    if (module?.moduleQuiz?.questions) {
      // Shuffle Questions
      const shuffledQs = shuffleArray([...module.moduleQuiz.questions]);
      setShuffledQuestions(shuffledQs);
      setCurrentQuestionIndex(0);

      // Shuffle Answer Options - Keeping track of correct answer
      const optionsMap = {};
      shuffledQs.forEach((question) => {
        if (question.options && Array.isArray(question.options)) {
          const indices = question.options.map((_, i) => i);
          const shuffledIndices = shuffleArray(indices);

          optionsMap[question._id] = {
            shuffledIndices,
            originalOptions: question.options,
            correctAnswer: question.correctAnswer,
          };
        }
      });
      setShuffledOptions(optionsMap);
    }
  }, [module]);

  const handleAnswerSelect = (questionId, displayIndex) => {
    // displayIndex is the index in the displayed/shuffled options
    // We need to map it back to the original index
    const optionsMapping = shuffledOptions[questionId];
    let actualIndex;

    if (optionsMapping && optionsMapping.shuffledIndices) {
      // Map display index to original index
      actualIndex = optionsMapping.shuffledIndices[displayIndex];
    } else {
      // No shuffling, use display index directly
      actualIndex = displayIndex;
    }

    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: actualIndex,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!shuffledQuestions.length) return;

    const unansweredCount =
      shuffledQuestions.length - Object.keys(userAnswers).length;
    if (unansweredCount > 0) {
      showToast(
        `Please answer all questions (${unansweredCount} remaining)`,
        "error"
      );
      return;
    }

    setIsSubmitting(true);
    try {
      // Convert any string answers into numbers for backend to process
      const numericAnswers = {};
      Object.entries(userAnswers).forEach(([questionId, answer]) => {
        if (typeof answer === "string") {
          numericAnswers[questionId] = answer.charCodeAt(0) - 65;
        } else {
          numericAnswers[questionId] = answer;
        }
      });

      const result = await apiClient.post(
        `/content/modules/${moduleId}/submit-quiz`,
        {
          answers: numericAnswers,
          questionOrder: shuffledQuestions.map((q) => q._id),
        }
      );

      setQuizResults(result);
      setQuizSubmitted(true);

      if (result.passed) {
        showToast(
          `🎊 Module completed! +${result.xpEarned} XP earned!`,
          "success"
        );

        if (result.progress?.courseProgressPercentage !== undefined) {
          updateThemeFromCourseProgress(
            result.progress.courseProgressPercentage
          );
        }
      } else {
        showToast(
          `Quiz score: ${result.score}%. Need ${result.passingScore}% to pass.`,
          "error"
        );
      }
    } catch (err) {
      console.error("Failed to submit quiz:", err);
      showToast(
        getErrorMessage(err, "Failed to submit quiz. Please try again."),
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetakeQuiz = () => {
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setQuizSubmitted(false);
    setQuizResults(null);
  };

  const handleContinue = () => {
    if (quizResults?.nextModuleId) {
      navigate(`/modules/${quizResults.nextModuleId}/lessons`);
    } else {
      navigate("/modules");
    }
  };

  if (loading) return <LoadingState />;
  if (error)
    return <ErrorState error={error} onBack={() => navigate("/modules")} />;
  if (!module || !module.moduleQuiz) {
    return (
      <ErrorState
        error="Module quiz not found"
        onBack={() => navigate("/modules")}
      />
    );
  }

  const currentQuestion =
    shuffledQuestions[currentQuestionIndex] || shuffledQuestions[0];
  const totalQuestions = shuffledQuestions.length;
  const progress =
    totalQuestions > 0
      ? ((currentQuestionIndex + 1) / totalQuestions) * 100
      : 0;

  // Results View
  if (quizSubmitted && quizResults) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Results Header */}
          <div className="text-center mb-8">
            {quizResults.passed ? (
              <>
                <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-green-600 mb-2">
                  Congratulations! 🎉
                </h1>
                <p className="text-xl text-gray-700">
                  You've completed {module.title}!
                </p>
              </>
            ) : (
              <>
                <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-red-600 mb-2">
                  Keep Trying!
                </h1>
                <p className="text-xl text-gray-700">
                  You can retake the quiz after reviewing the material
                </p>
              </>
            )}
          </div>

          {/* Score Display */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">Your Score:</span>
              <span
                className={`text-3xl font-bold ${
                  quizResults.passed ? "text-green-600" : "text-red-600"
                }`}
              >
                {quizResults.score}%
              </span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>
                Correct: {quizResults.correctAnswers}/{totalQuestions}
              </span>
              <span>Passing Score: {quizResults.passingScore}%</span>
            </div>
          </div>

          {/* XP Earned */}
          {quizResults.passed && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
              <p className="text-blue-700 font-semibold">
                🌟 +{quizResults.xpEarned} XP earned!
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => navigate(`/modules/${moduleId}/lessons`)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition"
            >
              <ArrowLeft size={20} />
              <span>Back to Module</span>
            </button>

            {quizResults.passed ? (
              <button
                onClick={handleContinue}
                style={{ backgroundColor: themeColor }}
                className="flex items-center space-x-2 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
              >
                <span>Continue Learning</span>
                <ArrowRight size={20} />
              </button>
            ) : (
              <button
                onClick={handleRetakeQuiz}
                style={{ backgroundColor: themeColor }}
                className="flex items-center space-x-2 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
              >
                <span>Retake Quiz</span>
                <ArrowRight size={20} />
              </button>
            )}
          </div>
        </div>
        <BackToTopButton />
      </div>
    );
  }

  // Quiz View
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {module.title} - Final Quiz
            </h1>
            <p className="text-gray-600 mt-1">
              Test your knowledge of this module
            </p>
          </div>
          <Trophy className="w-12 h-12 text-yellow-500" />
        </div>

        {/* Progress Bar */}
        <div className="mb-2">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              style={{
                width: `${progress}%`,
                backgroundColor: themeColor,
              }}
              className="h-2 rounded-full transition-all duration-300"
            />
          </div>
        </div>
      </div>

      {shuffledQuestions.length > 0 ? (
        // Question Card
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            {currentQuestion.question}
          </h2>

          {/* Answer Options - Now using shuffled options if available */}
          <div className="space-y-3">
            {(() => {
              const questionId = currentQuestion._id;
              const optionsMapping = shuffledOptions[questionId];

              // Use shuffled options if available, otherwise use original order
              const optionsToDisplay = optionsMapping
                ? optionsMapping.shuffledIndices.map(
                    (idx) => currentQuestion.options[idx]
                  )
                : currentQuestion.options;

              return optionsToDisplay.map((option, displayIndex) => {
                const optionKey = String.fromCharCode(65 + displayIndex); // A, B, C, D

                // For selection highlighting, we need to check if this display index corresponds to selected answer
                const optionsMapping = shuffledOptions[questionId];
                let isSelected = false;

                if (optionsMapping && optionsMapping.shuffledIndices) {
                  // Check if the selected answer corresponds to this display position
                  const selectedOriginalIndex = userAnswers[questionId];
                  const displayIndexOfSelected =
                    optionsMapping.shuffledIndices.indexOf(
                      selectedOriginalIndex
                    );
                  isSelected = displayIndexOfSelected === displayIndex;
                } else {
                  isSelected = userAnswers[questionId] === displayIndex;
                }

                return (
                  <button
                    key={displayIndex}
                    onClick={() => handleAnswerSelect(questionId, displayIndex)} // Pass display index
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start">
                      <span className="font-semibold text-gray-700 mr-3">
                        {optionKey}.
                      </span>
                      <span className="text-gray-800">{option}</span>
                      {isSelected && (
                        <CheckCircle
                          className="ml-auto text-blue-500"
                          size={20}
                        />
                      )}
                    </div>
                  </button>
                );
              });
            })()}
          </div>
        </div>
      ) : (
        <div className="text-center p-8">
          <p className="text-gray-500">Loading questions...</p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft size={20} />
          <span>Previous</span>
        </button>

        {currentQuestionIndex === totalQuestions - 1 ? (
          <button
            onClick={handleSubmitQuiz}
            disabled={isSubmitting}
            style={{ backgroundColor: themeColor }}
            className="flex items-center space-x-2 text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Submitting...</span>
            ) : (
              <>
                <span>Submit Quiz</span>
                <CheckCircle size={20} />
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleNext}
            style={{ backgroundColor: themeColor }}
            className="flex items-center space-x-2 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
          >
            <span>Next</span>
            <ArrowRight size={20} />
          </button>
        )}
      </div>

      {/* Question Grid (optional - shows which questions are answered) */}
      <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Question Progress
        </h3>
        <div className="grid grid-cols-10 gap-2">
          {shuffledQuestions.map((q, idx) => {
            const isAnswered = userAnswers[q._id];
            const isCurrent = idx === currentQuestionIndex;

            return (
              <button
                key={q._id}
                onClick={() => setCurrentQuestionIndex(idx)}
                className={`w-10 h-10 rounded-lg font-semibold transition ${
                  isCurrent ? "ring-2 ring-blue-500" : ""
                } ${
                  isAnswered
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      <BackToTopButton />
    </div>
  );
};

export default ModuleQuizPage;
