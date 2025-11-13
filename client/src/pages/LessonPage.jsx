// client/src/pages/LessonPage.jsx
import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiClient, useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNotification } from "../context/NotificationContext";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Star,
  BookOpen,
  Lightbulb,
  Code2,
  HelpCircle,
  RefreshCw,
} from "lucide-react";

const CodeBlock = ({ code, language = "python" }) => {
  return (
    <div className="bg-gray-900 rounded-lg p-4 my-4 overflow-x-auto">
      <pre className="text-green-400 text-sm font-mono">
        <code>{code}</code>
      </pre>
    </div>
  );
};

const QuizComponent = ({
  quiz,
  onAnswerSubmit,
  isReviewMode,
  correctAnswer,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(isReviewMode);

  // In review mode, show the correct answer immediately
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
        {quiz.options.map((option, index) => (
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

const ExerciseComponent = ({
  exercise,
  onCodeSubmit,
  isReviewMode,
  solution,
}) => {
  const [userCode, setUserCode] = useState(
    isReviewMode ? solution || exercise.starterCode : exercise.starterCode
  );
  const [showHints, setShowHints] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  const handleSubmit = () => {
    if (!isReviewMode) {
      onCodeSubmit(userCode);
    } else {
      setShowSolution(true);
    }
  };

  const resetExercise = () => {
    setUserCode(exercise.starterCode);
    setShowSolution(false);
    setShowHints(false);
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 my-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Code2 className="text-yellow-600" size={24} />
          <h3 className="text-lg font-semibold text-yellow-800">
            Try It Yourself {isReviewMode && "(Review)"}
          </h3>
        </div>
        {isReviewMode && (
          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
            Review Mode
          </span>
        )}
      </div>

      <p className="text-gray-800 mb-4">{exercise.instructions}</p>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Code:
        </label>
        <textarea
          value={userCode}
          onChange={(e) => setUserCode(e.target.value)}
          className="w-full h-40 font-mono text-sm p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
          placeholder="Write your Python code here..."
          readOnly={isReviewMode && showSolution}
        />
      </div>

      {isReviewMode && showSolution && solution && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
          <h4 className="font-semibold text-green-800 mb-2">Solution:</h4>
          <CodeBlock code={solution} />
        </div>
      )}

      <div className="flex flex-wrap gap-4 mt-4">
        <button
          onClick={handleSubmit}
          className={`px-6 py-2 rounded-lg font-semibold transition ${
            isReviewMode
              ? "bg-gray-600 text-white hover:bg-gray-700"
              : "bg-yellow-600 text-white hover:bg-yellow-700"
          }`}
        >
          {isReviewMode ? "Check Solution" : "Run Code"}
        </button>

        {isReviewMode && solution && (
          <button
            onClick={() => setShowSolution(!showSolution)}
            className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            {showSolution ? "Hide Solution" : "Show Solution"}
          </button>
        )}

        {isReviewMode && (
          <button
            onClick={resetExercise}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center space-x-2"
          >
            <RefreshCw size={16} />
            <span>Reset</span>
          </button>
        )}

        <button
          onClick={() => setShowHints(!showHints)}
          className="bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-700 transition"
        >
          {showHints ? "Hide Hints" : "Show Hints"}
        </button>
      </div>

      {showHints && exercise.hints && (
        <div className="mt-4 p-4 bg-white rounded-lg border">
          <h4 className="font-semibold text-gray-800 mb-2">Hints:</h4>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            {exercise.hints.map((hint, index) => (
              <li key={index}>{hint}</li>
            ))}
          </ul>
        </div>
      )}

      {isReviewMode && (
        <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded">
          <p className="text-yellow-800 text-sm">
            💡 <strong>Review Mode:</strong> Practice as many times as you want!
            Your progress won't be affected.
          </p>
        </div>
      )}
    </div>
  );
};

const LessonPage = () => {
  const { id: lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { themeColor } = useTheme();
  const { showToast } = useNotification();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false);

  // Fetch lesson content
  const fetchLesson = useCallback(async () => {
    if (!lessonId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(`/content/lessons/${lessonId}`);
      const lessonData = response.data.data;

      setLesson(lessonData);

      // Auto-enable review mode for completed lessons
      if (lessonData.isCompleted) {
        setIsReviewMode(true);
      }
    } catch (err) {
      console.error("Failed to fetch lesson:", err);
      setError("Failed to load lesson content. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    fetchLesson();
  }, [fetchLesson]);

  // Handle lesson completion and update local state
  const handleLessonCompletion = useCallback(
    (responseData) => {
      const { xpEarned, moduleCompleted, progress } = responseData;

      // Show appropriate success message
      let message = `🎉 Lesson completed! +${xpEarned} XP earned!`;
      if (moduleCompleted) {
        message = `🎊 Module completed! Bonus XP earned! Total: +${xpEarned} XP`;
      }
      showToast(message, "success");

      // Update lesson state to show completion
      setLesson((prev) => ({
        ...prev,
        isCompleted: true,
      }));

      // Switch to review mode
      setIsReviewMode(true);

      // Optional: Log progress data for debugging
      console.log("Updated progress:", progress);

      // The user's XP/progress will be automatically refreshed when they
      // navigate back to the dashboard or when the dashboard fetches data
    },
    [showToast]
  );

  const handleAnswerSubmit = async (answer) => {
    if (!lesson || isReviewMode) return;

    setIsSubmitting(true);
    try {
      const response = await apiClient.post(
        `/content/lessons/${lessonId}/submit`,
        { answer }
      );

      const { data } = response.data;

      if (data.completed) {
        handleLessonCompletion(data);
      } else {
        showToast(data.feedback, data.isCorrect ? "success" : "error");
      }
    } catch (err) {
      console.error("Failed to submit answer:", err);
      showToast("Failed to submit answer. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCodeSubmit = async (code) => {
    if (!lesson || isReviewMode) return;

    setIsSubmitting(true);
    try {
      const response = await apiClient.post(
        `/content/lessons/${lessonId}/submit`,
        { code }
      );

      const { data } = response.data;

      if (data.completed) {
        handleLessonCompletion(data);
      } else {
        showToast(data.feedback, data.isCorrect ? "success" : "error");
      }
    } catch (err) {
      console.error("Failed to submit code:", err);
      showToast("Failed to submit code. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const markTheoryComplete = async () => {
    if (!lesson || lesson.contentType !== "theory" || isReviewMode) return;

    setIsSubmitting(true);
    try {
      const response = await apiClient.post(
        `/content/lessons/${lessonId}/submit`,
        {}
      );

      const { data } = response.data;

      if (data.completed) {
        handleLessonCompletion(data);
      }
    } catch (err) {
      console.error("Failed to mark lesson complete:", err);
      showToast("Failed to mark lesson complete. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleReviewMode = () => {
    setIsReviewMode(!isReviewMode);
    if (!isReviewMode) {
      showToast(
        "🔍 Now in review mode - your progress won't be affected",
        "info"
      );
    } else {
      showToast("📚 Back to learning mode", "info");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-python-blue mx-auto mb-4"></div>
            <p className="text-gray-600">Loading lesson content...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => navigate("/modules")}
            className="mt-4 bg-python-blue text-white px-4 py-2 rounded-lg hover:bg-python-dark transition"
          >
            Back to Modules
          </button>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Lesson Not Found
          </h2>
          <button
            onClick={() => navigate("/modules")}
            className="bg-python-blue text-white px-4 py-2 rounded-lg hover:bg-python-dark transition"
          >
            Back to Modules
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition mb-4"
        >
          <ArrowLeft size={20} />
          <span>Back to Lessons</span>
        </button>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
                {lesson.isCompleted && (
                  <CheckCircle className="text-green-500" size={24} />
                )}
                <h1 className="text-3xl font-bold text-gray-800">
                  {lesson.title}
                </h1>
              </div>

              <p className="text-gray-600 text-lg mb-4">
                {lesson.shortDescription}
              </p>

              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Clock size={16} />
                  <span>{lesson.duration} min</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star size={16} />
                  <span>{lesson.xpReward} XP</span>
                </div>
                <div className="flex items-center space-x-1">
                  <BookOpen size={16} />
                  <span className="capitalize">{lesson.contentType}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end space-y-2">
              {lesson.isCompleted && (
                <>
                  <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold">
                    Completed ✅
                  </div>
                  <button
                    onClick={toggleReviewMode}
                    className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold hover:bg-blue-200 transition flex items-center space-x-2"
                  >
                    <RefreshCw size={16} />
                    <span>
                      {isReviewMode ? "Exit Review" : "Practice Again"}
                    </span>
                  </button>
                </>
              )}
              {isReviewMode && !lesson.isCompleted && (
                <span className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full font-semibold text-sm">
                  Practice Mode
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lesson Content */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
        {/* Markdown-like content rendering */}
        <div className="prose prose-lg max-w-none">
          {lesson.content.split("\n").map((paragraph, index) => {
            if (paragraph.startsWith("# ")) {
              return (
                <h1
                  key={index}
                  className="text-2xl font-bold text-gray-800 mb-4"
                >
                  {paragraph.substring(2)}
                </h1>
              );
            } else if (paragraph.startsWith("## ")) {
              return (
                <h2
                  key={index}
                  className="text-xl font-semibold text-gray-800 mb-3 mt-6"
                >
                  {paragraph.substring(3)}
                </h2>
              );
            } else if (paragraph.startsWith("### ")) {
              return (
                <h3
                  key={index}
                  className="text-lg font-semibold text-gray-800 mb-2 mt-4"
                >
                  {paragraph.substring(4)}
                </h3>
              );
            } else if (paragraph.trim() === "") {
              return <br key={index} />;
            } else if (paragraph.includes("```")) {
              // Simple code block detection
              const codeMatch = paragraph.match(/```(?:\w+)?\n([\s\S]*?)```/);
              if (codeMatch) {
                return <CodeBlock key={index} code={codeMatch[1]} />;
              }
              return (
                <p key={index} className="text-gray-700 mb-4">
                  {paragraph}
                </p>
              );
            } else {
              return (
                <p key={index} className="text-gray-700 mb-4">
                  {paragraph}
                </p>
              );
            }
          })}
        </div>

        {/* Code Example */}
        {lesson.codeExample && (
          <div className="mt-8">
            <div className="flex items-center space-x-2 mb-4">
              <Lightbulb className="text-blue-600" size={20} />
              <h3 className="text-lg font-semibold text-gray-800">Example</h3>
            </div>
            <CodeBlock code={lesson.codeExample.code} />
            <p className="text-gray-600 text-sm mt-2">
              {lesson.codeExample.explanation}
            </p>
          </div>
        )}

        {/* Interactive Components */}
        {lesson.quiz && (
          <QuizComponent
            quiz={lesson.quiz}
            onAnswerSubmit={handleAnswerSubmit}
            isReviewMode={isReviewMode}
            correctAnswer={lesson.quiz.correctAnswer}
          />
        )}

        {lesson.exercise && (
          <ExerciseComponent
            exercise={lesson.exercise}
            onCodeSubmit={handleCodeSubmit}
            isReviewMode={isReviewMode}
            solution={lesson.exercise.solution}
          />
        )}

        {/* Theory Lesson Completion */}
        {lesson.contentType === "theory" &&
          !lesson.isCompleted &&
          !isReviewMode && (
            <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg text-center">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Ready to mark this lesson complete?
              </h3>
              <p className="text-green-700 mb-4">
                You'll earn {lesson.xpReward} XP for completing this lesson.
              </p>
              <button
                onClick={markTheoryComplete}
                disabled={isSubmitting}
                className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-green-300 transition"
              >
                {isSubmitting ? "Marking..." : "Mark Lesson Complete"}
              </button>
            </div>
          )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition"
        >
          <ArrowLeft size={20} />
          <span>Back to Lessons</span>
        </button>

        {lesson.isCompleted && !isReviewMode && (
          <div className="text-green-600 font-semibold flex items-center space-x-2">
            <CheckCircle size={20} />
            <span>Lesson Completed!</span>
          </div>
        )}
        {isReviewMode && (
          <div className="text-blue-600 font-semibold flex items-center space-x-2">
            <RefreshCw size={20} />
            <span>Practice Mode Active</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonPage;
