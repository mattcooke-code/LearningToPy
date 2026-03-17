// QuizComponent.jsx - SIMPLIFIED VERSION
import { useEffect, useState } from "react";
import {
  CheckCircle,
  HelpCircle,
  RotateCcw,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { apiClient, useNotification } from "../../context";
import { MarkdownRenderer } from "../ui";
import {
  areAllQuestionsAnswered,
  resetQuestionState,
  processModuleQuizResults,
  getOptionButtonClass,
  isLessonQuizComplete,
} from "../../utils/quizUtils";

const QuizComponent = ({
  quizArray,
  lessonId,
  moduleId,
  onAnswerSubmit,
  isModuleQuiz = false,
  onQuizComplete,
}) => {
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverFeedback, setServerFeedback] = useState({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [attempts, setAttempts] = useState({});

  const { showToast } = useNotification();

  // Check if lesson quiz is complete whenever results change
  useEffect(() => {
    if (isModuleQuiz) return;

    const isComplete = isLessonQuizComplete(quizArray, results);

    if (isComplete && !quizCompleted) {
      setQuizCompleted(true);
      if (onQuizComplete) {
        onQuizComplete(true);
      }
    }
  }, [results, quizArray, isModuleQuiz, quizCompleted, onQuizComplete]);

  const handleSelect = (questionId, optionIndex) => {
    // Don't allow changes if already answered correctly
    if (results[questionId]?.completed) return;

    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const checkSingleAnswer = async (questionId, index) => {
    const selected = answers[questionId];
    if (selected === undefined) return;

    setIsSubmitting(true);
    try {
      const data = await apiClient.post(`/content/lessons/${lessonId}/submit`, {
        answer: selected,
        questionIndex: index,
        attemptNumber: (attempts[questionId] || 0) + 1,
      });

      // Update attempts counter
      setAttempts((prev) => ({
        ...prev,
        [questionId]: (prev[questionId] || 0) + 1,
      }));

      // Update results for this question
      setResults((prev) => ({
        ...prev,
        [questionId]: {
          show: true,
          isCorrect: data.isCorrect,
          // Only mark as completed if correct
          completed: data.isCorrect,
        },
      }));

      if (data.isCorrect && data.xpEarned > 0) {
        showToast(`+${data.xpEarned} XP earned! 🎯`, "success");
      }

      // Store server feedback
      setServerFeedback((prev) => ({
        ...prev,
        [questionId]: data.feedback,
      }));

      // If the backend says the lesson is completed, trigger callback
      if (data.completed && onQuizComplete) {
        setQuizCompleted(true);
        onQuizComplete(true);
      }
    } catch (err) {
      console.error("Submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const data = await apiClient.post(
        `/content/modules/${moduleId}/submit-quiz`,
        {
          answers: answers,
        },
      );

      // Process and set results
      const newResults = processModuleQuizResults(data.results);
      setResults(newResults);

      // Store feedback for each question
      const newFeedback = {};
      data.results.forEach((res) => {
        newFeedback[res.questionId] = res.explanation;
      });
      setServerFeedback(newFeedback);

      // If passed, notify parent component
      if (data.passed && onAnswerSubmit) {
        onAnswerSubmit(data);
      }
    } catch (err) {
      console.error("Module quiz submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetQuestion = (questionId) => {
    resetQuestionState(questionId, setAnswers, setResults);
    setQuizCompleted(false);
  };

  const allAnswered = areAllQuestionsAnswered(quizArray, answers);

  // Helper function to determine what feedback to show
  const getFeedbackContent = (questionId, questionData) => {
    const currentAttempts = attempts[questionId] || 0;
    const isCorrect = results[questionId]?.isCorrect;

    if (isCorrect) {
      // Show full explanation when answer is correct
      return (
        serverFeedback[questionId] || questionData.explanation || "Correct!"
      );
    } else if (currentAttempts === 1) {
      // First wrong attempt - minimal feedback
      return "Not quite. Try again! Think about what each option means.";
    } else if (currentAttempts >= 2) {
      // After 2+ attempts - show correct answer
      return (
        serverFeedback[questionId] ||
        questionData.explanation ||
        `The correct answer is: ${questionData.options[questionData.correctAnswer]}`
      );
    } else {
      return "Try again!";
    }
  };

  // Helper function to determine if we should show the correct answer
  const shouldShowCorrectAnswer = (questionId) => {
    const currentAttempts = attempts[questionId] || 0;
    const isCorrect = results[questionId]?.isCorrect;

    // Show correct answer if:
    // 1. Answer is correct
    // 2. User has made 2+ attempts
    return isCorrect || currentAttempts >= 2;
  };

  return (
    <div className="space-y-8 my-8">
      <div className="flex items-center space-x-2 border-b border-gray-200 pb-4">
        <HelpCircle className="text-blue-600" size={28} />
        <h2 className="text-2xl font-bold text-gray-800">
          {isModuleQuiz ? "Final Module Quiz" : "Lesson Quiz"}
        </h2>
      </div>

      {quizArray.map((q, qIdx) => {
        const qKey = q._id || q.id;
        const result = results[qKey];
        const currentAttempts = attempts[qKey] || 0;
        const isCorrect = result?.isCorrect;

        return (
          <div
            key={qKey}
            className={`p-6 rounded-xl border transition-all ${
              result?.show
                ? isCorrect
                  ? "bg-green-50 border-green-200"
                  : currentAttempts >= 2
                    ? "bg-orange-50 border-orange-200"
                    : "bg-red-50 border-red-200"
                : "bg-white border-gray-200 shadow-sm"
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-bold uppercase tracking-wider text-blue-500">
                  Question {qIdx + 1}
                </span>
                {currentAttempts > 0 && (
                  <span className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded-full">
                    Attempt {currentAttempts}
                  </span>
                )}
              </div>
              {result?.show &&
                (isCorrect ? (
                  <CheckCircle className="text-green-600" size={24} />
                ) : (
                  <AlertCircle className="text-red-600" size={24} />
                ))}
            </div>

            <div className="text-lg font-medium text-gray-900 mb-6">
              <MarkdownRenderer content={q.question} />
            </div>

            <div className="grid grid-cols-1 gap-3">
              {q.options.map((option, oIdx) => {
                const isSelected = answers[qKey] === oIdx;
                const showResults = result?.show;
                const isCorrectAnswer = oIdx === q.correctAnswer;

                // Only show correct answer marker if we should reveal it
                const showAsCorrect =
                  showResults &&
                  shouldShowCorrectAnswer(qKey) &&
                  isCorrectAnswer;

                let btnClass = getOptionButtonClass(
                  isSelected,
                  showResults,
                  result?.isCorrect,
                );

                // Override for showing correct answer
                if (showAsCorrect) {
                  btnClass =
                    "border-2 border-green-500 bg-green-100 text-green-800";
                }

                return (
                  <button
                    key={oIdx}
                    onClick={() => handleSelect(qKey, oIdx)}
                    disabled={showResults || isSubmitting}
                    className={`text-left p-4 rounded-lg border-2 transition-all ${btnClass}`}
                  >
                    <MarkdownRenderer content={option} isDark={false} />
                    {showAsCorrect && (
                      <div className="mt-2 text-xs font-bold text-green-600 flex items-center">
                        <CheckCircle size={12} className="mr-1" />
                        Correct Answer
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Lesson Mode Check Button */}
            {!isModuleQuiz && !result?.completed && (
              <button
                onClick={() => checkSingleAnswer(qKey, qIdx)}
                disabled={answers[qKey] === undefined || isSubmitting}
                className="mt-6 flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-bold disabled:opacity-50 hover:bg-blue-700 transition-all"
              >
                {isSubmitting && <Loader2 className="animate-spin" size={18} />}
                <span>Check Answer</span>
              </button>
            )}

            {/* Feedback display - CONDITIONAL LOGIC */}
            {result?.show && (
              <div
                className={`mt-4 p-3 rounded border ${
                  isCorrect
                    ? "bg-green-50 border-green-200"
                    : currentAttempts >= 2
                      ? "bg-orange-50 border-orange-200"
                      : "bg-red-50 border-red-200"
                }`}
              >
                <div className="text-sm italic">
                  <MarkdownRenderer content={getFeedbackContent(qKey, q)} />
                </div>

                {!isCorrect && !isModuleQuiz && (
                  <button
                    onClick={() => resetQuestion(qKey)}
                    className="mt-2 flex items-center text-blue-600 font-bold hover:underline"
                  >
                    <RotateCcw size={14} className="mr-1" /> Try Again
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Module Quiz Submit Button */}
      {isModuleQuiz && allAnswered && (
        <div className="text-center p-6 bg-blue-50 rounded-2xl border-2 border-blue-200">
          <button
            onClick={handleFinalSubmit}
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-10 py-4 rounded-xl font-black text-xl hover:bg-blue-700 shadow-lg transition-all disabled:opacity-50"
          >
            {isSubmitting ? "Submitting Quiz..." : "Submit Final Quiz"}
          </button>
        </div>
      )}

      {/* Quiz Completion Message */}
      {!isModuleQuiz && quizCompleted && (
        <div className="p-6 bg-green-50 border-2 border-green-200 rounded-2xl text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <CheckCircle className="text-green-600" size={24} />
            <h3 className="text-lg font-bold text-green-800">
              Quiz Completed! 🎉
            </h3>
          </div>
          <p className="text-green-700">
            All questions answered correctly! The lesson is now marked as
            complete.
          </p>
        </div>
      )}
    </div>
  );
};

export default QuizComponent;
