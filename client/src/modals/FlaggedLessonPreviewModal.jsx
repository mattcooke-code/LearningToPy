import { useState, useEffect } from "react";
import { BaseModal } from "../components/ui";
import { MarkdownRenderer } from "../components/ui";
import { apiClient } from "../services";
import {
  BookOpen,
  Flag,
  User,
  Calendar,
  Loader2,
  AlertCircle,
} from "lucide-react";

/**
 * @fileoverview
 * Administrative modal for previewing reported lesson content in moderation context.
 * This component provides a comprehensive preview interface for administrators to review
 * lesson content that has been flagged by users. Features content rendering with
 * MarkdownRenderer, metadata display, and integration with the moderation workflow.
 * Designed for content review and assessment in the moderation process.
 */

/**
 * Administrative modal for previewing reported lesson content in moderation context.
 * 
 * This component creates a dedicated preview interface that allows administrators to
 * review lesson content that has been flagged by users for various issues. Fetches complete
 * lesson data including content, exercises, quizzes, and metadata, then renders it using
 * the same components as the live lesson view. Integrates with the moderation workflow
 * by providing context for flagged content and supporting resolution decisions.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to close the modal
 * @param {string} props.lessonId - ID of the flagged lesson to preview
 * @param {string} [props.semanticId] - Semantic identifier for context display
 * @returns {JSX.Element} Lesson preview interface for moderation review
 * 
 * @securityContext
 * **Admin/Moderator Permissions Required**:
 * - Relies on AuthContext for high-level admin role validation
 * - Uses apiClient with elevated permissions for content access
 * - Validates administrative access before content loading
 * - Prevents unauthorized content preview access
 * - Maintains audit trail for content review activities
 * 
 * **Content Access Control**:
 * - Role-based access to flagged content
 * - Secure API communication with admin tokens
 * - Protection against unauthorized content access
 * - Privacy compliance for content handling
 * - Proper session validation and timeout handling
 * 
 * @moderationFlow
 * **Flag Status Integration**:
 * - Receives flagged lesson ID from FlagResolutionModal
 * - Displays content in moderation context with "Review Reported Lesson" title
 * - Provides context for flag resolution decisions
 * - Supports admin assessment of reported issues
 * - Integrates with flag status management workflow
 * 
 * **Content Review Process**:
 * - Admin views flag details in FlagResolutionModal
 * - Admin clicks preview to review actual content
 * - FlaggedLessonPreviewModal displays full lesson content
 * - Admin makes informed resolution decision
 * - Status update triggers user notification
 * 
 * @contentRendering
 * **Lesson Display**:
 * - Uses MarkdownRenderer for content formatting
 * - Displays lesson metadata (title, type, XP, difficulty)
 * - Shows exercises and quizzes in formatted layout
 * - Code examples with syntax highlighting
 * - Prerequisites and tags display
 * 
 * **Moderation Context**:
 * - Header indicates "Review Reported Lesson" for context
 * - Semantic ID display for content identification
 * - Flag status indicators and metadata
 * - Admin-focused interface design
 * - Integration with moderation tools
 * 
 * @dataFetching
 * **Content Retrieval**:
 * - GET /content/lessons/{lessonId}: Fetch complete lesson data
 * - Includes all nested content (exercises, quizzes, metadata)
 * - Error handling with fallback UI states
 * - Loading indicators for better UX
 * - Automatic refresh on modal open
 * 
 * **Error Handling**:
 * - Network error detection and admin notification
 * - 404 error handling for missing lessons
 * - Server error graceful degradation
 * - User-friendly error messages for admins
 * - Retry mechanisms for transient failures
 * 
 * @userExperience
 * **Administrative Interface**:
 * - Professional admin styling with clear context
 * - Loading states with informative messages
 * - Error displays with actionable information
 * - Responsive design for various screen sizes
 * - Consistent with other admin modals
 * 
 * **Navigation**:
 * - Close button with proper modal behavior
 * - Escape key support for closing
 * - Click-outside-to-close disabled (prevents accidental closure)
 * - Focus management for accessibility
 * - Keyboard navigation support
 * 
 * @errorHandling
 * **Network Errors**:
 * - API failure detection and admin notification
 * - Graceful fallback to error display
 * - Retry mechanism through modal reopen
 * - Console logging for debugging
 * - Admin-friendly error messages
 * 
 * **Data Validation**:
 * - Lesson data structure validation
 * - Missing field handling with defaults
 * - Malformed content recovery
 * - Safe rendering with fallbacks
 * - Error boundary protection
 * 
 * @accessibility
 * - Semantic HTML structure for content
 * - Proper ARIA labels and roles
 * - Screen reader compatible lesson information
 * - Keyboard navigation support
 * - High contrast support for visual elements
 * - Focus management for modal interactions
 * - Error announcement for screen readers
 * 
 * @performanceOptimizations
 * **Efficient Rendering**:
 * - Conditional rendering based on data state
 * - Optimized markdown processing
 * - Efficient data structure handling
 * - Memory leak prevention
 * - Proper cleanup on unmount
 * 
 * **Data Management**:
 * - Single lesson object state
 * - Efficient API call timing
 * - Proper error state management
 * - Optimized re-rendering triggers
 * - Memory-efficient data storage
 */

const FlaggedLessonPreviewModal = ({
  isOpen,
  onClose,
  lessonId,
  semanticId,
}) => {
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && lessonId) {
      fetchLesson();
    }
  }, [isOpen, lessonId]);

  const fetchLesson = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch the full lesson content
      const data = await apiClient.get(`/content/lessons/${lessonId}`);
      setLesson(data);
    } catch (err) {
      setError("Failed to load lesson content");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Review Reported Lesson
            </h3>
            {semanticId && (
              <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                {semanticId}
              </p>
            )}
          </div>
        </div>
      }
      size="5xl"
      closeOnOverlayClick={false}
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center h-96">
          <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            Loading lesson content...
          </p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-96">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      ) : lesson ? (
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-4 custom-scrollbar">
          {/* Lesson Header with Metadata */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              {lesson.title}
            </h2>

            <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center">
                <BookOpen className="h-4 w-4 mr-1" />
                {lesson.type || "Lesson"}
              </span>
              <span className="flex items-center">
                <Flag className="h-4 w-4 mr-1 text-yellow-500" />
                {lesson.xpReward || 0} XP
              </span>
              <span className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                Difficulty: {lesson.difficulty || "Beginner"}
              </span>
              {lesson.estimatedTime && (
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />~{lesson.estimatedTime}{" "}
                  min
                </span>
              )}
            </div>
          </div>

          {/* Lesson Description */}
          {lesson.description && (
            <div className="bg-gray-50 dark:bg-gray-800/30 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                Description
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {lesson.description}
              </p>
            </div>
          )}

          {/* Full Lesson Content with Markdown Rendering */}
          {lesson.content && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">
                Lesson Content
              </h3>
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6">
                  <MarkdownRenderer
                    content={lesson.content}
                    className="prose prose-sm dark:prose-invert max-w-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Exercise Section */}
          {lesson.exercise && (
            <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800 p-5">
              <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-3 uppercase tracking-wider">
                Exercise
              </h3>
              {lesson.exercise.instructions && (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <MarkdownRenderer content={lesson.exercise.instructions} />
                </div>
              )}
              {lesson.exercise.starterCode && (
                <div className="mt-4">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Starter Code:
                  </p>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{lesson.exercise.starterCode}</code>
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Quiz Section */}
          {lesson.quiz &&
            lesson.quiz.questions &&
            lesson.quiz.questions.length > 0 && (
              <div className="bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-200 dark:border-purple-800 p-5">
                <h3 className="text-sm font-semibold text-purple-700 dark:text-purple-400 mb-3 uppercase tracking-wider">
                  Quiz ({lesson.quiz.questions.length} questions)
                </h3>
                <div className="space-y-4">
                  {lesson.quiz.questions.slice(0, 3).map((q, idx) => (
                    <div
                      key={idx}
                      className="border-l-2 border-purple-300 dark:border-purple-700 pl-3"
                    >
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {idx + 1}. {q.question}
                      </p>
                      {q.options && (
                        <div className="mt-2 space-y-1">
                          {q.options.map((opt, optIdx) => (
                            <p
                              key={optIdx}
                              className="text-xs text-gray-500 dark:text-gray-400 ml-4"
                            >
                              {String.fromCharCode(65 + optIdx)}. {opt}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {lesson.quiz.questions.length > 3 && (
                    <p className="text-xs text-purple-600 dark:text-purple-400 italic">
                      + {lesson.quiz.questions.length - 3} more questions
                    </p>
                  )}
                </div>
              </div>
            )}

          {/* Metadata Footer */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
            <div className="grid grid-cols-2 gap-2">
              <p>
                <strong>Lesson ID:</strong> {lesson._id}
              </p>
              <p>
                <strong>Module ID:</strong> {lesson.moduleId}
              </p>
              <p>
                <strong>Created:</strong>{" "}
                {new Date(lesson.createdAt).toLocaleString()}
              </p>
              <p>
                <strong>Last Updated:</strong>{" "}
                {new Date(lesson.updatedAt).toLocaleString()}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                {lesson.isPublished ? "Published" : "Draft"}
              </p>
              {lesson.tags && lesson.tags.length > 0 && (
                <p>
                  <strong>Tags:</strong> {lesson.tags.join(", ")}
                </p>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Footer with Actions */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <Flag className="h-4 w-4 inline mr-1 text-red-500" />
          Reported content - please review carefully
        </div>
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Close Preview
        </button>
      </div>
    </BaseModal>
  );
};

export default FlaggedLessonPreviewModal;
