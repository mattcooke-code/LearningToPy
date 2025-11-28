//LessonPage.jsx
import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiClient, useAuth, useNotification, useTheme } from "../context";
// Import components
import { LoadingState, ErrorState, BackToTopButton } from "../components/ui";
import {
  LessonHeader,
  LessonContent,
  LessonNavigation,
} from "../components/lesson";
import { getErrorMessage } from "../utils/getErrorMessage";
import { calculateNextLessonManually } from "../utils/lessonCalculations";

const LessonPage = () => {
  const { id: lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { themeColor, updateThemeFromProgress } = useTheme();
  const { showToast } = useNotification();

  const [lesson, setLesson] = useState(null);
  const [nextLesson, setNextLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false);

  useEffect(() => {
    setIsReviewMode(false);
    setNextLesson(null);
  }, [lessonId]);

  // Data fetching logic
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
      } else {
        setIsReviewMode(false);
      }

      // Fetch next lesson if available
      if (lessonData.nextLessonId) {
        try {
          const nextResponse = await apiClient.get(
            `/content/lessons/${lessonData.nextLessonId}`
          );
          setNextLesson(nextResponse.data.data);
        } catch (err) {
          console.log("No next lesson available or failed to fetch");
        }
      }
    } catch (err) {
      console.error("Failed to fetch lesson:", err);
      setError(
        getErrorMessage(err, "Failed to load lesson content. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    fetchLesson();
  }, [fetchLesson]);

  // In LessonPage.jsx - Complete handleLessonCompletion
  const handleLessonCompletion = useCallback(
    async (responseData) => {
      const { xpEarned, moduleCompleted, progress, nextLessonId } =
        responseData;

      let message = `🎉 Lesson completed! +${xpEarned} XP earned!`;
      if (moduleCompleted) {
        message = `🎊 Module completed! Bonus XP earned! Total: +${xpEarned} XP`;
      }
      showToast(message, "success");

      setLesson((prev) => ({ ...prev, isCompleted: true }));

      if (progress && progress.progressPercentage !== undefined) {
        updateThemeFromProgress(progress.progressPercentage);
      }

      console.log("Updated progress:", progress);

      const handleNextLesson = async () => {
        // Try backend nextLessonId first
        if (nextLessonId) {
          console.log("✅ Using backend nextLessonId:", nextLessonId);
          try {
            const nextResponse = await apiClient.get(
              `/content/lessons/${nextLessonId}`
            );
            setNextLesson(nextResponse.data.data);
            console.log(
              "➡️ Next lesson set from backend:",
              nextResponse.data.data.title
            );
            return;
          } catch (err) {
            console.error(
              "❌ Failed to fetch next lesson from backend ID:",
              err
            );
            // Fall through to manual calculation
          }
        }

        // Fallback to manual calculation
        console.log("🔄 Calculating next lesson manually...");
        const manualNextLesson = await calculateNextLessonManually(
          lessonId,
          lesson?.moduleId
        );
        if (manualNextLesson) {
          setNextLesson(manualNextLesson);
        }
      };

      await handleNextLesson();
    },
    [showToast, updateThemeFromProgress, lessonId, lesson?.moduleId]
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
      showToast(
        getErrorMessage(err, "Failed to submit answer. Please try again."),
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCodeSubmit = async (code) => {
    if (!lesson || isReviewMode) return;

    let isEmptySubmission = false;

    if (!code || code.trim() === "") {
      isEmptySubmission = true;
    } else if (lesson.exercise && lesson.exercise.starterCode) {
      // Compare with starter code if it exists
      const userCodeClean = code.trim();
      const starterCodeClean = lesson.exercise.starterCode.trim();
      isEmptySubmission = userCodeClean === starterCodeClean;
    }

    if (isEmptySubmission) {
      showToast(
        getErrorMessage(err, "Please write some code before submitting!"),
        "error"
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiClient.post(
        `/content/lessons/${lessonId}/submit`,
        { code }
      );

      const { data } = response.data;

      console.log("📦 API Response:", data);

      if (data.completed) {
        handleLessonCompletion(data);
      } else {
        showToast(data.feedback, data.isCorrect ? "success" : "error");
      }
    } catch (err) {
      console.error("Failed to submit code:", err);
      showToast(
        getErrorMessage(err, "Failed to submit code. Please try again."),
        "error"
      );
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
      showToast(
        getErrorMessage(
          err,
          "Failed to mark lesson complete. Please try again."
        ),
        "error"
      );
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

  if (loading) return <LoadingState />;
  if (error)
    return <ErrorState error={error} onBack={() => navigate("/modules")} />;
  if (!lesson)
    return (
      <ErrorState
        error="Lesson not found"
        onBack={() => navigate("/modules")}
      />
    );

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <LessonHeader
        lesson={lesson}
        isReviewMode={isReviewMode}
        toggleReviewMode={toggleReviewMode}
        navigate={navigate}
      />

      <LessonContent
        lesson={lesson}
        isReviewMode={isReviewMode}
        onAnswerSubmit={handleAnswerSubmit}
        onCodeSubmit={handleCodeSubmit}
        markTheoryComplete={markTheoryComplete}
        isSubmitting={isSubmitting}
      />

      <LessonNavigation
        navigate={navigate}
        nextLesson={nextLesson}
        lesson={lesson}
        isReviewMode={isReviewMode}
        themeColor={themeColor}
      />

      <BackToTopButton />
    </div>
  );
};

export default LessonPage;
