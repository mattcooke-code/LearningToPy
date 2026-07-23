// LessonPage.jsx
import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth, useNotification, useTheme } from "../context";
import { LoadingState, ErrorState, BackToTopButton } from "../components/ui";
import {
  LessonHeader,
  LessonContent,
  LessonNavigation,
} from "../components/lesson";
import { apiClient } from "../services";
import { ReportModal } from "../modals";
import { getErrorMessage, calculateNextLessonManually } from "../utils";

/**
 * @fileoverview
 * Individual lesson page component with comprehensive state management for lesson completion,
 * exercise submission, quiz handling, and navigation. This is the most complex learning page
 * with multiple interaction modes, progress tracking, theme integration, and content reporting.
 *
 * Implements sophisticated completion logic with automatic progression, review mode toggling,
 * and real-time UI updates based on user interactions. Handles both theory and practical lesson
 * types with different completion criteria and submission flows.
 */

/**
 * Individual lesson page component with comprehensive learning interaction capabilities.
 *
 * This component manages lesson content display, exercise submissions, quiz completion,
 * progress tracking, and navigation. Features review mode, automatic theme updates,
 * completion state management, and content reporting functionality. Handles both
 * theory and practical lesson types with different interaction patterns.
 *
 * @component
 * @returns {JSX.Element} Complete lesson page with header, content, navigation, and modals
 *
 * @stateManagement
 * - lesson: Current lesson data with content and completion status
 * - module: Parent module information for navigation context
 * - nextLesson: Next lesson data for progression navigation
 * - isSubmitting: Submission state for exercise and quiz actions
 * - isReviewMode: Toggle between learning and review modes
 * - exerciseCompleted: Exercise completion state for practical lessons
 * - quizCompleted: Quiz completion state for theory lessons
 * - showReportModal: Modal state for content reporting
 *
 * @completionLogic
 * - Theory lessons: Require quiz completion + manual completion
 * - Practical lessons: Require exercise completion + manual completion
 * - Review mode: Disables completion and submission actions
 * - Automatic progression: Fetches next lesson on completion
 * - Theme updates: Updates theme based on course progress
 *
 * @dataFlow
 * 1. Fetches lesson data with module context
 * 2. Determines review mode based on completion status
 * 3. Fetches next lesson data for navigation
 * 4. Handles various submission types (code, quiz, manual)
 * 5. Updates UI state and theme on completion
 *
 * @interactionHandlers
 * - markLessonComplete: Manual completion with server sync
 * - handleCodeSubmit: Exercise submission with validation
 * - handleQuizComplete: Quiz completion tracking
 * - toggleReviewMode: Switches between learning/review modes
 *
 * @navigationLogic
 * - Calculates next lesson using API or manual fallback
 * - Handles last lesson detection for completion flow
 * - Provides module-level navigation context
 * - Updates theme colors based on progress
 *
 * @errorHandling
 * - Comprehensive error states for all API calls
 * - Graceful fallback for missing lesson data
 * - User feedback via toast notifications
 * - Navigation fallbacks on errors
 */
const LessonPage = () => {
  const { id: lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { themeColor, textThemeColor, updateThemeFromCourseProgress } =
    useTheme();
  const { showToast } = useNotification();
  const isCompletingRef = useRef(false);

  // --- State ---
  const [lesson, setLesson] = useState(null);
  const [module, setModule] = useState(null);
  const [nextLesson, setNextLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [exerciseCompleted, setExerciseCompleted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Report modal state
  const [showReportModal, setShowReportModal] = useState(false);

  // --- 1. Helper: Fetch Next Lesson Data ---
  const fetchNextLessonData = useCallback(
    async (targetId, currentModuleId) => {
      try {
        if (targetId) {
          const data = await apiClient.get(`/content/lessons/${targetId}`);
          setNextLesson(data);
        } else {
          const manualNext = await calculateNextLessonManually(
            lessonId,
            currentModuleId,
          );
          if (manualNext) setNextLesson(manualNext);
        }
      } catch (err) {
        console.log("Next lesson not found or unavailable");
      }
    },
    [lessonId],
  );

  // --- 2. Helper: Handle UI Updates on Completion ---
  const handleLessonCompletionUI = useCallback(
    async (responseData) => {
      const {
        xpEarned,
        moduleCompleted,
        progress,
        nextLessonId,
        newlyCompleted,
      } = responseData;

      if (newlyCompleted === false) return;

      const message = moduleCompleted
        ? `🎊 Module completed! +${xpEarned} XP`
        : `🎉 Lesson completed! +${xpEarned} XP`;

      showToast(message, "success");

      if (nextLessonId) {
        try {
          const data = await apiClient.get(`/content/lessons/${nextLessonId}`);
          setNextLesson(data);
        } catch (err) {
          console.log("Next lesson not found");
        }
      }

      setLesson((prev) => ({ ...prev, isCompleted: true }));

      if (progress?.courseProgressPercentage !== undefined) {
        updateThemeFromCourseProgress(progress.courseProgressPercentage);
      }

      fetchNextLessonData(nextLessonId, lesson?.moduleId);
    },
    [
      showToast,
      updateThemeFromCourseProgress,
      lesson?.moduleId,
      fetchNextLessonData,
    ],
  );

  // --- 3. Core Action: Submit Completion ---
  const markLessonComplete = useCallback(async () => {
    if (
      !lesson ||
      isReviewMode ||
      lesson.isCompleted ||
      isCompletingRef.current
    )
      return;

    isCompletingRef.current = true;
    setIsSubmitting(true);

    try {
      const result = await apiClient.post(
        `/content/lessons/${lessonId}/submit`,
        { manualCompletion: true },
      );

      if (result.completed && result.newlyCompleted !== false) {
        handleLessonCompletionUI(result);
      } else {
        showToast("Lesson not fully finished yet.", "warning");
      }
    } catch (err) {
      console.error("Completion call failed:", err);
    } finally {
      setIsSubmitting(false);
      isCompletingRef.current = false;
    }
  }, [lesson, lessonId, isReviewMode, handleLessonCompletionUI]);

  // --- 4. Main Fetcher ---
  const fetchLesson = useCallback(async () => {
    if (!lessonId) return;
    try {
      setLoading(true);
      setError(null);
      const lessonData = await apiClient.get(`/content/lessons/${lessonId}`);
      setLesson(lessonData);

      if (lessonData.moduleId) {
        const moduleData = await apiClient.get(
          `/content/modules/${lessonData.moduleId}`,
        );
        setModule(moduleData);
      }

      setIsReviewMode(!!lessonData.isCompleted);

      if (lessonData.nextLessonId || lessonData.isCompleted) {
        fetchNextLessonData(lessonData.nextLessonId, lessonData.moduleId);
      }
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load lesson."));
    } finally {
      setLoading(false);
    }
  }, [lessonId, fetchNextLessonData]);

  // --- 5. Interaction Handlers ---
  const handleQuizComplete = useCallback((isCompleted) => {
    setQuizCompleted(isCompleted);
  }, []);

  const handleCodeSubmit = useCallback(
    async (content) => {
      if (!lesson || isReviewMode) return;
      setIsSubmitting(true);

      if (content && content.completed && content.xpEarned !== undefined) {
        handleLessonCompletionUI(content);
        setIsSubmitting(false);
        return;
      }

      const payload =
        typeof content === "string" ? { code: content } : { answer: content };

      try {
        const result = await apiClient.post(
          `/content/lessons/${lessonId}/submit`,
          payload,
        );
        if (result.isCorrect) setExerciseCompleted(true);
        if (result.completed) handleLessonCompletionUI(result);
      } catch (err) {
        showToast(getErrorMessage(err, "Submission failed"), "error");
      } finally {
        setIsSubmitting(false);
      }
    },
    [lessonId, isReviewMode, lesson, handleLessonCompletionUI, showToast],
  );

  // --- Effects ---
  useEffect(() => {
    setIsReviewMode(false);
    setNextLesson(null);
    setQuizCompleted(false);
    setExerciseCompleted(false);
    fetchLesson();
  }, [lessonId, fetchLesson]);

  useEffect(() => {
    if (
      exerciseCompleted &&
      quizCompleted &&
      !lesson?.isCompleted &&
      !isReviewMode &&
      lesson?.contentType !== "THEORY"
    ) {
      markLessonComplete();
    }
  }, [
    exerciseCompleted,
    quizCompleted,
    lesson?.isCompleted,
    lesson?.contentType,
    isReviewMode,
    markLessonComplete,
  ]);

  // --- Helper Helpers ---
  const lessonFullyCompleted = lesson?.isCompleted || false;
  const isLastLesson = !nextLesson && lessonFullyCompleted;

  const toggleReviewMode = () => {
    setIsReviewMode(!isReviewMode);
    showToast(isReviewMode ? "📚 Learning mode" : "🔍 Review mode", "info");
  };

  if (loading) return <LoadingState />;
  if (error || !lesson)
    return (
      <ErrorState
        error={error || "Lesson not found"}
        onBack={() => navigate("/modules")}
      />
    );

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl ">
      <LessonHeader
        lesson={lesson}
        isReviewMode={isReviewMode}
        toggleReviewMode={toggleReviewMode}
        onReport={() => setShowReportModal(true)} // Pass report handler
      />

      <LessonContent
        key={lessonId}
        lesson={lesson}
        lessonId={lessonId}
        module={module}
        isReviewMode={isReviewMode}
        onAnswerSubmit={handleCodeSubmit}
        onCodeSubmit={handleCodeSubmit}
        markTheoryComplete={markLessonComplete}
        isSubmitting={isSubmitting}
        isLastLesson={isLastLesson}
        nextLessonId={nextLesson?._id}
        exerciseCompleted={exerciseCompleted}
        setExerciseCompleted={setExerciseCompleted}
        quizCompleted={quizCompleted}
        onQuizComplete={handleQuizComplete}
        setQuizCompleted={setQuizCompleted}
      />

      <LessonNavigation
        nextLesson={nextLesson}
        lesson={lesson}
        module={module}
        isReviewMode={isReviewMode}
        lessonFullyCompleted={lessonFullyCompleted}
      />
      <BackToTopButton />

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        lessonId={lessonId}
      />
    </div>
  );
};

export default LessonPage;
