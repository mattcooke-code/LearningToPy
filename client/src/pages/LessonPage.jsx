import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiClient, useAuth, useNotification, useTheme } from "../context";
import {
  LoadingState,
  ErrorState,
  BackToTopButton,
  BaseModal,
} from "../components/ui";
import {
  LessonHeader,
  LessonContent,
  LessonNavigation,
} from "../components/lesson";
import { getErrorMessage, calculateNextLessonManually } from "../utils";
import { Flag, AlertTriangle, Send, X } from "lucide-react";

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
  const [reportReason, setReportReason] = useState("");
  const [reportTitle, setReportTitle] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [reportSuggestedFix, setReportSuggestedFix] = useState("");
  const [isReporting, setIsReporting] = useState(false);

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

  // --- 5. Report Handler ---
  const handleReport = async () => {
    if (!reportReason || !reportTitle.trim() || !reportDetails.trim()) {
      showToast("Please fill in all required fields", "warning");
      return;
    }
    setIsReporting(true);
    try {
      await apiClient.post("/auth/flags", {
        targetType: "LESSON",
        targetId: lessonId,
        issueType: reportReason,
        title: reportTitle,
        description: reportDetails,
        suggestedFix: reportSuggestedFix || undefined,
      });

      showToast(
        "Thank you for reporting. Our team will review it shortly.",
        "success",
      );
      setShowReportModal(false);
      setReportReason("");
      setReportTitle("");
      setReportDetails("");
      setReportSuggestedFix("");
    } catch (err) {
      console.error("Report error:", err);
      const errorMsg = err.response?.data?.message || "Failed to submit report";
      if (errorMsg.includes("already flagged")) {
        showToast(errorMsg, "warning");
      } else {
        showToast(errorMsg, "error");
      }
    } finally {
      setIsReporting(false);
    }
  };

  // --- 6. Interaction Handlers ---
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
    <div className="container mx-auto px-4 py-8 max-w-4xl bg-gray-200 dark:bg-gray-700">
      <LessonHeader
        lesson={lesson}
        isReviewMode={isReviewMode}
        toggleReviewMode={toggleReviewMode}
        navigate={navigate}
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
        navigate={navigate}
        nextLesson={nextLesson}
        lesson={lesson}
        module={module}
        isReviewMode={isReviewMode}
        themeColor={themeColor}
        lessonFullyCompleted={lessonFullyCompleted}
      />
      <BackToTopButton />

      {/* Report Modal - Updated with new issue types */}
      {showReportModal && (
        <BaseModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          title="Report an Issue"
          size="md"
        >
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <Flag className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                    Help us improve this lesson!
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Found an error? Let us know and we'll fix it. You might even
                    earn XP for helping!
                  </p>
                </div>
              </div>
            </div>

            {/* Issue Type Selection */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                What type of issue did you find? *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  {
                    value: "CONTENT_ERROR",
                    label: "📝 Content Error",
                    desc: "Typo, incorrect information",
                  },
                  {
                    value: "CODE_ERROR",
                    label: "💻 Code Error",
                    desc: "Exercise code not working",
                  },
                  {
                    value: "QUIZ_ERROR",
                    label: "❓ Quiz Error",
                    desc: "Quiz marked incorrectly",
                  },
                  {
                    value: "BROKEN_FUNCTIONALITY",
                    label: "🔧 Broken Functionality",
                    desc: "Validation not working",
                  },
                  {
                    value: "XP_ADJUSTMENT",
                    label: "⭐ XP Adjustment",
                    desc: "XP not awarded correctly",
                  },
                  { value: "OTHER", label: "📌 Other", desc: "Something else" },
                ].map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setReportReason(type.value)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      reportReason === type.value
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500"
                        : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
                    }`}
                  >
                    <div className="font-medium text-gray-900 dark:text-white text-sm">
                      {type.label}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {type.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Title Field */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Issue Title *
              </label>
              <input
                type="text"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                placeholder="Brief summary of the issue..."
                maxLength={200}
              />
            </div>

            {/* Description Field */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Detailed Description *
              </label>
              <textarea
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                placeholder="Please describe the issue in detail. What did you expect to happen? What actually happened?"
                maxLength={2000}
              />
            </div>

            {/* Suggested Fix Field (Optional) */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Suggested Fix (Optional)
              </label>
              <textarea
                value={reportSuggestedFix}
                onChange={(e) => setReportSuggestedFix(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                placeholder="If you know what the correct content should be, please share it here..."
                maxLength={1000}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setReportReason("");
                  setReportTitle("");
                  setReportDetails("");
                  setReportSuggestedFix("");
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                disabled={
                  isReporting || !reportReason || !reportTitle || !reportDetails
                }
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                {isReporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Flag className="h-4 w-4 mr-2" />
                    Submit Report
                  </>
                )}
              </button>
            </div>
          </div>
        </BaseModal>
      )}
    </div>
  );
};

export default LessonPage;
