// QuizComponent.jsx
import { useEffect, useState } from "react";
import {
  CheckCircle,
  HelpCircle,
  RotateCcw,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useNotification } from "../../context";
import { apiClient } from "../../services";
import { MarkdownRenderer } from "../ui";
import {
  areAllQuestionsAnswered,
  resetQuestionState,
  processModuleQuizResults,
  getOptionButtonClass,
  isLessonQuizComplete,
} from "../../utils/quizUtils";

/**
 * @fileoverview
 * Interactive quiz component handling both lesson and module quizzes with comprehensive
 * progress evaluation and feedback systems. Manages answer submission, attempt tracking,
 * and completion detection. Features real-time feedback, XP rewards, and adaptive
 * question states. Integrates with backend APIs for validation and progress tracking.
 */

/**
 * Interactive quiz component for lesson and module assessments with progress evaluation.
 *
 * This component handles both individual lesson quizzes and comprehensive module quizzes,
 * managing the complete quiz lifecycle from answer selection to completion detection.
 * Features real-time answer validation, attempt tracking, adaptive feedback systems,
 * and XP reward integration. The component evaluates user progress through server-side
 * validation and triggers appropriate callbacks for lesson/module completion.
 *
 * @component
 * @param {Object} props - Component props
 * @param {Array} props.quizArray - Array of quiz questions with options and correct answers
 * @param {string} props.lessonId - Lesson ID for API submissions
 * @param {string} props.moduleId - Module ID for module quiz submissions
 * @param {Function} [props.onAnswerSubmit] - Callback for answer submission results
 * @param {boolean} [props.isModuleQuiz=false] - Whether this is a module quiz
 * @param {Function} [props.onQuizComplete] - Callback when quiz is completed
 * @returns {JSX.Element} Interactive quiz interface with progress tracking
 *
 * @progressEvaluation
 * - Lesson quizzes: Individual question validation with immediate feedback
 * - Module quizzes: Batch submission with comprehensive results processing
 * - Completion detection through isLessonQuizComplete() utility
 * - Attempt tracking for each question with progressive feedback
 * - Server-side validation ensures accuracy and prevents cheating
 *
 * @feedbackSystem
 * - First attempt: Generic "Try again" message
 * - Second attempt: Detailed explanation or correct answer reveal
 * - Correct answers: Server feedback or question explanation
 * - Visual feedback through color-coded question states
 * - XP rewards for correct answers with toast notifications
 *
 * @answerSubmissionFlow
 * 1. User selects answer option
 * 2. Answer submitted to API with attempt number
 * 3. Server validates answer and returns results
 * 4. Local state updated with results and feedback
 * 5. UI updated to show correct/incorrect status
 * 6. XP awarded for correct answers
 * 7. Completion checked and callbacks triggered
 *
 * @stateManagement
 * - answers: User's selected answers for each question
 * - results: Validation results and completion status for each question
 * - attempts: Number of attempts per question
 * - serverFeedback: Detailed feedback from server for each question
 * - quizCompleted: Overall quiz completion status
 * - isSubmitting: Loading state during API calls
 *
 * @questionStates
 * - Unanswered: Default state with selectable options
 * - Correct: Green highlighting with checkmark and feedback
 * - Incorrect (1st attempt): Red highlighting with retry option
 * - Incorrect (2nd+ attempt): Orange highlighting with correct answer shown
 * - Completed: Disabled state preventing further changes
 *
 * @apiIntegration
 * - Lesson quizzes: POST to /content/lessons/{lessonId}/submit
 * - Module quizzes: POST to /content/modules/{moduleId}/submit-quiz
 * - Response handling for validation results and XP calculations
 * - Error handling for network issues and server errors
 * - Progress tracking through completion callbacks
 *
 * @userExperience
 * - Immediate feedback on answer selection
 * - Progressive hint system revealing correct answers after multiple attempts
 * - Visual progress indicators through color coding
 * - Smooth transitions and micro-interactions
 * - Accessibility considerations for screen readers
 */
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
  const [attempts, setAttempts] = useState({});
  const [quizCompleted, setQuizCompleted] = useState(false);

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

      setAttempts((prev) => ({
        ...prev,
        [questionId]: (prev[questionId] || 0) + 1,
      }));

      // Update results
      const newResult = {
        show: true,
        isCorrect: data.isCorrect,
        completed: data.isCorrect,
      };

      setResults((prev) => {
        const updated = {
          ...prev,
          [questionId]: newResult,
        };

        // Check completion with the NEW results object
        const allCorrect = quizArray.every((q) => {
          const qKey = q._id || q.id;
          return updated[qKey]?.isCorrect === true;
        });

        if (allCorrect && !quizCompleted && onQuizComplete) {
          // Use setTimeout to avoid state update during render
          setTimeout(() => {
            setQuizCompleted(true);
            onQuizComplete(true);
          }, 0);
        }

        return updated;
      });

      if (data.isCorrect && data.xpEarned > 0) {
        showToast(`+${data.xpEarned} XP earned! 🎯`, "success");
      }

      setServerFeedback((prev) => ({
        ...prev,
        [questionId]: data.feedback,
      }));

      // When the lesson is fully completed by this answer, pass data up
      if (data.completed) {
        setQuizCompleted(true);
        if (onQuizComplete) {
          onQuizComplete(true);
        }
        // If there's an onAnswerSubmit callback, pass the full completion data
        if (onAnswerSubmit) {
          onAnswerSubmit(data);
        }
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
      return (
        serverFeedback[questionId] || questionData.explanation || "Correct!"
      );
    } else if (currentAttempts === 1) {
      return "Not quite. Try again! Think about what each option means.";
    } else if (currentAttempts >= 2) {
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
    return isCorrect || currentAttempts >= 2;
  };

  return (
    <div className="space-y-8 my-8">
      <div className="flex items-center space-x-2 border-b border-gray-200 dark:border-gray-700 pb-4">
        <HelpCircle
          className="text-python-blue dark:text-python-yellow"
          size={28}
        />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          {isModuleQuiz ? "Final Module Quiz" : "Lesson Quiz"}
        </h2>
      </div>

      {quizArray.map((q, qIdx) => {
        const qKey = q._id || q.id;
        const result = results[qKey];
        const currentAttempts = attempts[qKey] || 0;
        const isCorrect = result?.isCorrect;

        // Determine question card background based on state
        const getQuestionCardClass = () => {
          if (!result?.show) {
            return "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm";
          }
          if (isCorrect) {
            return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
          }
          if (currentAttempts >= 2) {
            return "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800";
          }
          return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
        };

        return (
          <div
            key={qKey}
            className={`p-6 rounded-xl border transition-all ${getQuestionCardClass()}`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-bold uppercase tracking-wider text-python-blue dark:text-python-yellow">
                  Question {qIdx + 1}
                </span>
                {currentAttempts > 0 && (
                  <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                    Attempt {currentAttempts}
                  </span>
                )}
              </div>
              {result?.show &&
                (isCorrect ? (
                  <CheckCircle
                    className="text-green-600 dark:text-green-400"
                    size={24}
                  />
                ) : (
                  <AlertCircle
                    className="text-red-600 dark:text-red-400"
                    size={24}
                  />
                ))}
            </div>

            <div className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
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
                    "border-2 border-green-500 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300";
                }

                return (
                  <button
                    key={oIdx}
                    onClick={() => handleSelect(qKey, oIdx)}
                    disabled={showResults || isSubmitting}
                    className={`text-left p-4 rounded-lg border-2 transition-all ${btnClass}`}
                  >
                    <MarkdownRenderer content={option} />
                    {showAsCorrect && (
                      <div className="mt-2 text-xs font-bold text-green-600 dark:text-green-400 flex items-center">
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
                className="mt-6 flex items-center justify-center space-x-2 bg-python-dark hover:bg-python-yellow dark:bg-python-yellow dark:hover:bg-python-blue text-white hover:text-gray-800 dark:text-gray-800 dark:hover:text-white  px-6 py-2 rounded-lg font-bold disabled:opacity-50 transition-all"
              >
                {isSubmitting && <Loader2 className="animate-spin" size={18} />}
                <span>Check Answer</span>
              </button>
            )}

            {/* Feedback display */}
            {result?.show && (
              <div
                className={`mt-4 p-3 rounded border ${
                  isCorrect
                    ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                    : currentAttempts >= 2
                      ? "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800"
                      : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                }`}
              >
                <div className="text-sm italic text-gray-700 dark:text-gray-300">
                  <MarkdownRenderer content={getFeedbackContent(qKey, q)} />
                </div>

                {!isCorrect && !isModuleQuiz && (
                  <button
                    onClick={() => resetQuestion(qKey)}
                    className="mt-2 flex items-center text-python-blue dark:text-python-light font-bold hover:underline"
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
        <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border-2 border-blue-200 dark:border-blue-800">
          <button
            onClick={handleFinalSubmit}
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-10 py-4 rounded-xl font-black text-xl shadow-lg transition-all disabled:opacity-50"
          >
            {isSubmitting ? "Submitting Quiz..." : "Submit Final Quiz"}
          </button>
        </div>
      )}

      {/* Quiz Completion Message */}
      {!isModuleQuiz && quizCompleted && (
        <div className="p-6 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-2xl text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <CheckCircle
              className="text-green-600 dark:text-green-400"
              size={24}
            />
            <h3 className="text-lg font-bold text-green-800 dark:text-green-300">
              Quiz Completed! 🎉
            </h3>
          </div>
          <p className="text-green-700 dark:text-green-400">
            All questions answered correctly! The lesson is now marked as
            complete.
          </p>
        </div>
      )}
    </div>
  );
};

export default QuizComponent;
