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

  // Data fetching logic
  const fetchLesson = useCallback(async () => {
    if (!lessonId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(`/content/lessons/${lessonId}`);
      const lessonData = response.data.data;

      console.log("📚 Initial lesson data:", lessonData);
      console.log("➡️ nextLessonId:", lessonData.nextLessonId);

      setLesson(lessonData);

      // Auto-enable review mode for completed lessons
      if (lessonData.isCompleted) {
        setIsReviewMode(true);
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
      setError("Failed to load lesson content. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    fetchLesson();
  }, [fetchLesson]);

  const handleLessonCompletion = useCallback(
    async (responseData) => {
      const { xpEarned, moduleCompleted, progress } = responseData;

      let message = `🎉 Lesson completed! +${xpEarned} XP earned!`;
      if (moduleCompleted) {
        message = `🎊 Module completed! Bonus XP earned! Total: +${xpEarned} XP`;
      }
      showToast(message, "success");

      // Update local state immediately for UI feedback
      setLesson((prev) => ({
        ...prev,
        isCompleted: true,
      }));

      setIsReviewMode(true);

      if (progress && progress.progressPercentage !== undefined) {
        updateThemeFromProgress(progress.progressPercentage);
      }

      console.log("Updated progress:", progress);

      // ✅ FIXED: Calculate next lesson manually
      try {
        console.log("🔄 Fetching module lessons to calculate next lesson...");

        if (!lesson || !lesson.moduleId) {
          console.log("❌ Cannot calculate next lesson - missing moduleId");
          return;
        }

        // Get all lessons in the current module to find the next one
        const moduleResponse = await apiClient.get(
          `/content/modules/${lesson.moduleId}/lessons`
        );
        const responseData = moduleResponse.data.data;

        console.log("📋 Full module response:", responseData);
        console.log("🔍 Response keys:", Object.keys(responseData));

        // ✅ FIX: Extract lessons array from the response
        const moduleLessons = responseData.lessons || responseData.data || [];
        console.log("📖 Lessons array:", moduleLessons);

        if (!Array.isArray(moduleLessons) || moduleLessons.length === 0) {
          console.log("❌ No lessons array found in response");
          return;
        }

        // Find current lesson index
        const currentIndex = moduleLessons.findIndex((l) => l._id === lessonId);
        console.log("📍 Current lesson index:", currentIndex);

        // Get next lesson if exists
        if (currentIndex !== -1 && currentIndex < moduleLessons.length - 1) {
          const nextLessonData = moduleLessons[currentIndex + 1];
          console.log("➡️ Next lesson found:", nextLessonData);
          setNextLesson(nextLessonData);
        } else {
          console.log("🏁 No next lesson - this is the last lesson in module");
        }
      } catch (err) {
        console.error("❌ Failed to calculate next lesson:", err);
      }
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
      showToast("Failed to submit answer. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCodeSubmit = async (code) => {
    if (!lesson || isReviewMode) return;

    // ✅ ROBUST VALIDATION: Handle all edge cases
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
      showToast("Please write some code before submitting!", "error");
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
