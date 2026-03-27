import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiClient, useAuth, useNotification, useTheme } from "../context";
import {
  LoadingState,
  ErrorState,
  BackToTopButton,
  MarkdownRenderer,
} from "../components/ui";
import { getErrorMessage } from "../utils";
import {
  Trophy,
  CheckCircle,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Eye,
  RotateCcw,
} from "lucide-react";

const ModuleQuizPage = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { themeColor, updateThemeFromCourseProgress, isDarkMode } = useTheme();
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

  // Review mode state
  const [reviewMode, setReviewMode] = useState(false);
  const [selectedReviewQuestion, setSelectedReviewQuestion] = useState(null);

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

  // Shuffle helper (Fisher-Yates)
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Initialize shuffled questions/options
  useEffect(() => {
    if (module?.moduleQuiz?.questions) {
      const shuffledQs = shuffleArray([...module.moduleQuiz.questions]);
      setShuffledQuestions(shuffledQs);
      setCurrentQuestionIndex(0);

      // Shuffle answer options while tracking correct answer index
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

  // Handle answer selection
  const handleAnswerSelect = (questionId, displayIndex) => {
    const optionsMapping = shuffledOptions[questionId];
    let actualIndex;
    if (optionsMapping?.shuffledIndices) {
      actualIndex = optionsMapping.shuffledIndices[displayIndex];
    } else {
      actualIndex = displayIndex;
    }

    setUserAnswers((prev) => ({ ...prev, [questionId]: actualIndex }));
  };

  // Handle next question
  const handleNext = () => {
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  // Submit quiz to backend
  const handleSubmitQuiz = async () => {
    const unansweredCount =
      shuffledQuestions.length - Object.keys(userAnswers).length;
    if (unansweredCount > 0) {
      showToast(
        `Please answer all questions (${unansweredCount} remaining)`,
        "error",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const numericAnswers = {};
      Object.entries(userAnswers).forEach(([questionId, answer]) => {
        numericAnswers[questionId] =
          typeof answer === "string" ? answer.charCodeAt(0) - 65 : answer;
      });

      const result = await apiClient.post(
        `/content/modules/${moduleId}/submit-quiz`,
        {
          answers: numericAnswers,
          questionOrder: shuffledQuestions.map((q) => q._id),
        },
      );

      setQuizResults(result);
      setQuizSubmitted(true);

      if (result.passed) {
        showToast(
          `🎊 Module completed! +${result.xpEarned} XP earned!`,
          "success",
        );
        if (result.progress?.courseProgressPercentage !== undefined) {
          updateThemeFromCourseProgress(
            result.progress.courseProgressPercentage,
          );
        }
      } else {
        showToast(
          `Quiz score: ${result.score}%. Review your answers and try again.`,
          "error",
        );
      }
    } catch (err) {
      console.error("Failed to submit quiz:", err);
      showToast(
        getErrorMessage(err, "Failed to submit quiz. Please try again."),
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle retake (resets all state)
  const handleRetakeQuiz = () => {
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setQuizSubmitted(false);
    setQuizResults(null);
    setReviewMode(false);
    setSelectedReviewQuestion(null);
  };

  // Handle continue to next module or modules page
  const handleContinue = () => {
    if (quizResults?.nextModuleId) {
      navigate(`/modules/${quizResults.nextModuleId}/lessons`);
    } else {
      navigate("/modules", { replace: true });
      window.location.reload();
    }
  };

  // Open review modal for a specific question
  const openReviewQuestion = (questionResult) => {
    setSelectedReviewQuestion(questionResult);
  };

  // Close review modal
  const closeReviewQuestion = () => {
    setSelectedReviewQuestion(null);
  };

  // Loading/Error states
  if (loading) return <LoadingState message="Loading quiz..." />;
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

  const currentQuestion = shuffledQuestions[currentQuestionIndex];
  const totalQuestions = shuffledQuestions.length;
  const progress =
    totalQuestions > 0
      ? ((currentQuestionIndex + 1) / totalQuestions) * 100
      : 0;

  // ============ RESULTS VIEW ============
  if (quizSubmitted && quizResults) {
    const incorrectQuestions =
      quizResults.results?.filter((r) => !r.isCorrect) || [];
    const correctQuestions =
      quizResults.results?.filter((r) => r.isCorrect) || [];

    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
          {quizResults.passed ? (
            <>
              <Trophy className="mx-auto h-16 w-16 text-yellow-500 dark:text-yellow-400 mb-4" />
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                Congratulations! 🎉
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                You've completed {module.title}!
              </p>
            </>
          ) : (
            <>
              <XCircle className="mx-auto h-16 w-16 text-red-500 dark:text-red-400 mb-4" />
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                Keep Trying!
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                Review your answers below, then try again.
              </p>
            </>
          )}

          {/* Score Display */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                Your Score:
              </span>
              <span
                className={`text-3xl font-bold ${
                  quizResults.passed
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {quizResults.score}%
              </span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>
                Correct: {quizResults.correctAnswers}/{totalQuestions}
              </span>
              <span>Passing Score: {quizResults.passingScore}%</span>
            </div>
          </div>

          {/* XP Earned */}
          {quizResults.passed && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 dark:border-blue-400 p-4 mb-6">
              <p className="text-blue-700 dark:text-blue-300 font-semibold">
                🌟 +{quizResults.xpEarned} XP earned!
              </p>
            </div>
          )}

          {/* Enhanced Review Section */}
          {!quizResults.passed && incorrectQuestions.length > 0 && (
            <div className="mb-6">
              <button
                onClick={() => setReviewMode(!reviewMode)}
                className="flex items-center space-x-2 mx-auto text-python-blue dark:text-python-yellow hover:underline font-medium"
              >
                <Eye size={18} />
                <span>
                  {reviewMode ? "Hide" : "Review"} Incorrect Answers (
                  {incorrectQuestions.length})
                </span>
              </button>

              {reviewMode && (
                <div className="mt-4 space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Click a question to review:
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {quizResults.results?.map((result, idx) => {
                      if (!result.isCorrect) {
                        return (
                          <button
                            key={result.questionId}
                            onClick={() => openReviewQuestion(result)}
                            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition text-sm"
                          >
                            <XCircle size={14} />
                            <span>Question {idx + 1}</span>
                          </button>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => navigate(`/modules/${moduleId}/lessons`)}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition"
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
                <RotateCcw size={20} />
                <span>Retake Quiz</span>
              </button>
            )}
          </div>
        </div>

        {/* Review Modal */}
        {selectedReviewQuestion && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={closeReviewQuestion}
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Question Review
                </h3>
                <button
                  onClick={closeReviewQuestion}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* Question */}
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Question:
                  </p>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <MarkdownRenderer
                      content={selectedReviewQuestion.question}
                      moduleId={moduleId}
                    />
                  </div>
                </div>

                {/* User's Answer */}
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Your Answer:
                  </p>
                  <div
                    className={`p-4 rounded-lg border-2 ${
                      selectedReviewQuestion.isCorrect
                        ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300"
                        : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300"
                    }`}
                  >
                    {selectedReviewQuestion.options?.[
                      selectedReviewQuestion.userAnswer
                    ] ||
                      `Option ${String.fromCharCode(65 + selectedReviewQuestion.userAnswer)}`}
                  </div>
                </div>

                {/* Correct Answer */}
                {!selectedReviewQuestion.isCorrect && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      Correct Answer:
                    </p>
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg text-green-800 dark:text-green-300">
                      {selectedReviewQuestion.options?.[
                        selectedReviewQuestion.correctAnswer
                      ] ||
                        `Option ${String.fromCharCode(65 + selectedReviewQuestion.correctAnswer)}`}
                    </div>
                  </div>
                )}

                {/* Explanation */}
                {selectedReviewQuestion.explanation && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      Explanation:
                    </p>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-800 dark:text-blue-300">
                      <MarkdownRenderer
                        content={selectedReviewQuestion.explanation}
                        moduleId={moduleId}
                      />
                    </div>
                  </div>
                )}

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={closeReviewQuestion}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <BackToTopButton />
      </div>
    );
  }

  // ============ QUIZ VIEW ============
  if (!currentQuestion || shuffledQuestions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <LoadingState message="Loading quiz questions..." />
        <BackToTopButton />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          {module.title} - Final Quiz
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Test your knowledge of this module
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-2">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
          <span>
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            style={{ width: `${progress}%`, backgroundColor: themeColor }}
            className="h-2 rounded-full transition-all duration-300"
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6">
          <MarkdownRenderer
            content={currentQuestion.question}
            moduleId={moduleId}
          />
        </h2>

        {/* Answer Options */}
        <div className="space-y-3">
          {(() => {
            const questionId = currentQuestion._id;
            const optionsMapping = shuffledOptions[questionId];
            const optionsToDisplay = optionsMapping?.shuffledIndices
              ? optionsMapping.shuffledIndices.map(
                  (idx) => currentQuestion.options[idx],
                )
              : currentQuestion.options;

            return optionsToDisplay.map((option, displayIndex) => {
              const optionKey = String.fromCharCode(65 + displayIndex);
              const isSelected = userAnswers[questionId] !== undefined;

              let isThisOptionSelected = false;
              if (optionsMapping?.shuffledIndices) {
                const selectedOriginalIndex = userAnswers[questionId];
                const displayIndexOfSelected =
                  optionsMapping.shuffledIndices.indexOf(selectedOriginalIndex);
                isThisOptionSelected = displayIndexOfSelected === displayIndex;
              } else {
                isThisOptionSelected = userAnswers[questionId] === displayIndex;
              }

              return (
                <button
                  key={displayIndex}
                  onClick={() => handleAnswerSelect(questionId, displayIndex)}
                  disabled={isSelected}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? isThisOptionSelected
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-gray-800 dark:text-gray-200"
                        : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 opacity-50"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-800 dark:text-gray-200"
                  }`}
                >
                  <div className="flex items-start">
                    <span className="font-semibold text-gray-700 dark:text-gray-400 mr-3 min-w-5">
                      {optionKey}.
                    </span>
                    <div className="flex-1">
                      <MarkdownRenderer content={option} moduleId={moduleId} />
                    </div>
                    {isSelected && isThisOptionSelected && (
                      <CheckCircle
                        className="ml-auto text-blue-500 dark:text-blue-400"
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

      {/* Navigation */}
      <div className="flex justify-end">
        {currentQuestionIndex === totalQuestions - 1 ? (
          <button
            onClick={handleSubmitQuiz}
            disabled={
              isSubmitting || Object.keys(userAnswers).length < totalQuestions
            }
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

      {/* Question Grid Navigation */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Question Progress
        </h3>
        <div className="grid grid-cols-10 gap-2">
          {shuffledQuestions.map((q, idx) => {
            const isAnswered = userAnswers[q._id] !== undefined;
            const isCurrent = idx === currentQuestionIndex;
            const isCorrect = quizResults?.results?.find(
              (r) => r.questionId === q._id,
            )?.isCorrect;

            return (
              <button
                key={q._id}
                onClick={() => setCurrentQuestionIndex(idx)}
                disabled={!isAnswered && !quizSubmitted}
                className={`w-10 h-10 rounded-lg font-semibold transition ${
                  isCurrent
                    ? "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-800"
                    : ""
                } ${
                  isAnswered
                    ? isCorrect
                      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                      : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
                title={`Question ${idx + 1}`}
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
