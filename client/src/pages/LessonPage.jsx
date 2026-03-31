import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiClient, useAuth, useNotification, useTheme } from "../context";
import { LoadingState, ErrorState, BackToTopButton } from "../components/ui";
import {
  LessonHeader,
  LessonContent,
  LessonNavigation,
} from "../components/lesson";
import { ReportModal } from "../modals";
import { getErrorMessage, calculateNextLessonManually } from "../utils";

const LessonPage = () => {
  const { id: lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { themeColor, updateThemeFromCourseProgress } = useTheme();
  const { showToast } = useNotification();

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
    (responseData) => {
      const { xpEarned, moduleCompleted, progress, nextLessonId } =
        responseData;

      const message = moduleCompleted
        ? `🎊 Module completed! +${xpEarned} XP`
        : `🎉 Lesson completed! +${xpEarned} XP`;

      showToast(message, "success");
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
    if (!lesson || isReviewMode || lesson.isCompleted) return;

    setIsSubmitting(true);
    try {
      const result = await apiClient.post(
        `/content/lessons/${lessonId}/submit`,
        { manualCompletion: true },
      );
      console.log("Server Response:", result);

      if (result.completed) {
        handleLessonCompletionUI(result);
      } else {
        showToast("Lesson not fully finished yet.", "warning");
      }
    } catch (err) {
      console.error("Completion call failed:", err);
    } finally {
      setIsSubmitting(false);
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
        console.log("Module data:", moduleData);
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
  const handleQuizComplete = useCallback(
    (isCompleted) => {
      setQuizCompleted(isCompleted);
      if (isCompleted && lesson?.contentType === "theory") {
        markLessonComplete();
      }
    },
    [lesson?.contentType, markLessonComplete],
  );

  const handleCodeSubmit = useCallback(
    async (content) => {
      if (!lesson || isReviewMode) return;
      setIsSubmitting(true);

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
      !isReviewMode
    ) {
      markLessonComplete();
    }
  }, [
    exerciseCompleted,
    quizCompleted,
    lesson?.isCompleted,
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
        themeColor={themeColor}
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
