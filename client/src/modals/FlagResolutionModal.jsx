// /src/modals/FlagResolutionModal.jsx
import { useState } from "react";
import { BaseModal } from "../components/ui";
import {
  Flag,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Send,
  User,
  BookOpen,
} from "lucide-react";

/**
 * @fileoverview
 * Administrative modal for resolving user-submitted content flags and managing moderation workflow.
 * This component provides a comprehensive interface for reviewing and resolving flagged content
 * with status management, admin responses, and user notification systems. Features integration
 * with user and lesson preview modals, XP reward systems, and audit trail logging for compliance.
 */

/**
 * Administrative modal for resolving user-submitted content flags and managing moderation workflow.
 *
 * This component creates a powerful moderation interface that allows administrators to review
 * and resolve user-submitted content flags. Features include status management (IN_REVIEW,
 * FIXED, REJECTED), admin response composition, user notification systems, and XP reward
 * integration for valid reports.
 *
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.flag - Flag object containing report details and current status
 * @param {Function} props.onClose - Function to close the modal
 * @param {Function} props.onResolve - Callback function to handle flag resolution (flagId, resolutionData)
 * @param {Function} props.onViewUser - Callback to view reporting user details
 * @param {Function} props.onViewLesson - Callback to preview flagged lesson content
 * @returns {JSX.Element} Flag resolution interface with status management and user communication
 */
const FlagResolutionModal = ({
  flag,
  onClose,
  onResolve,
  onViewUser,
  onViewLesson,
}) => {
  const [status, setStatus] = useState(flag.status);
  const [adminResponse, setAdminResponse] = useState(flag.adminResponse || "");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!status) return;

    setSubmitting(true);
    try {
      await onResolve(flag._id, {
        status,
        adminResponse,
      });
      onClose();
    } catch (error) {
      console.error("Failed to resolve flag:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Pre-computed color classes to work with Tailwind JIT
  const statusOptions = [
    {
      value: "IN_REVIEW",
      label: "Mark as In Review",
      icon: Eye,
      selectedClasses: "border-blue-500 bg-blue-50 dark:bg-blue-900/20",
      iconBgClasses: "bg-blue-100 dark:bg-blue-900/30",
      iconClasses: "text-blue-600 dark:text-blue-400",
      actionClasses: "text-blue-600 dark:text-blue-400",
      description: "You're currently reviewing this issue.",
      action: "Student will be notified that you're looking into it.",
    },
    {
      value: "FIXED",
      label: "Mark as Fixed",
      icon: CheckCircle,
      selectedClasses: "border-green-500 bg-green-50 dark:bg-green-900/20",
      iconBgClasses: "bg-green-100 dark:bg-green-900/30",
      iconClasses: "text-green-600 dark:text-green-400",
      actionClasses: "text-green-600 dark:text-green-400",
      description: "The issue has been resolved.",
      action: "Student will be notified and will receive 25 XP as a thank you!",
    },
    {
      value: "REJECTED",
      label: "Reject",
      icon: XCircle,
      selectedClasses: "border-red-500 bg-red-50 dark:bg-red-900/20",
      iconBgClasses: "bg-red-100 dark:bg-red-900/30",
      iconClasses: "text-red-600 dark:text-red-400",
      actionClasses: "text-red-600 dark:text-red-400",
      description: "No issue found or not applicable.",
      action: "Student will be notified with an explanation.",
    },
  ];

  const getIssueTypeIcon = (type) => {
    const icons = {
      CONTENT_ERROR: "📝",
      CODE_ERROR: "💻",
      QUIZ_ERROR: "❓",
      BROKEN_FUNCTIONALITY: "🔧",
      XP_ADJUSTMENT: "⭐",
      OTHER: "📌",
    };
    return icons[type] || "📋";
  };

  const getIssueTypeLabel = (type) => {
    return type?.replace(/_/g, " ") || "Unknown";
  };

  return (
    <BaseModal
      isOpen={true}
      onClose={onClose}
      title="Review Issue Report"
      size="lg"
      description="Review the reported issue details and choose a resolution status. Your response will be shared with the student."
    >
      <div className="space-y-6">
        {/* Flag Details */}
        <div
          className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
          role="region"
          aria-label="Flag details"
        >
          <div className="flex items-start space-x-3">
            <div
              className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-xl shrink-0"
              aria-hidden="true"
            >
              {getIssueTypeIcon(flag.issueType)}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {flag.title}
                </h3>
                <span className="text-xs font-mono bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-700 dark:text-gray-300">
                  {getIssueTypeLabel(flag.issueType)}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {flag.description}
              </p>
              {flag.suggestedFix && (
                <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                  <p className="text-xs font-semibold text-green-800 dark:text-green-400 mb-1">
                    Suggested Fix:
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    {flag.suggestedFix}
                  </p>
                </div>
              )}
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                <span>
                  Reported by: {flag.reporterId?.username || "Student"}
                </span>
                <span>
                  Date: {new Date(flag.createdAt).toLocaleDateString()}
                </span>
                <span>Type: {flag.targetType}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Resolution Options */}
        <fieldset>
          <legend className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
            Resolution Status
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {statusOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = status === option.value;

              return (
                <button
                  key={option.value}
                  onClick={() => setStatus(option.value)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    isSelected
                      ? option.selectedClasses
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                  aria-pressed={isSelected}
                  aria-label={`${option.label}: ${option.description}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${option.iconBgClasses}`}>
                      <Icon
                        className={`h-5 w-5 ${option.iconClasses}`}
                        aria-hidden="true"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {option.label}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {option.description}
                      </p>
                      {isSelected && (
                        <p className={`text-xs mt-2 ${option.actionClasses}`}>
                          {option.action}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Admin Response */}
        <div>
          <label
            htmlFor="admin-response"
            className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
          >
            Admin Response (will be shared with student)
          </label>
          <textarea
            id="admin-response"
            value={adminResponse}
            onChange={(e) => setAdminResponse(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="Explain what action was taken, or provide additional information to the student..."
          />
        </div>

        {/* Footer with Action Buttons */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-3">
            {/* View User Profile Button */}
            {flag.reporterId?._id && (
              <button
                onClick={() => onViewUser(flag.reporterId)}
                className="px-4 py-2 text-sm font-medium text-amber-900 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/40 transition-colors inline-flex items-center justify-center"
                aria-label={`View profile of ${flag.reporterId?.username || "reporting user"}`}
              >
                <User className="h-4 w-4 mr-2" aria-hidden="true" />
                View User Profile
              </button>
            )}

            {/* View Lesson Button */}
            {flag.targetType === "LESSON" && flag.targetId && (
              <button
                onClick={() => onViewLesson(flag.targetId, flag.semanticId)}
                className="px-4 py-2 text-sm font-medium text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/40 transition-colors inline-flex items-center justify-center"
                aria-label="View flagged lesson content"
              >
                <BookOpen className="h-4 w-4 mr-2" aria-hidden="true" />
                View Lesson
              </button>
            )}

            {/* Cancel Button */}
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={submitting || !status}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center"
              aria-label={
                submitting ? "Submitting resolution" : "Submit resolution"
              }
            >
              {submitting ? (
                <>
                  <div
                    className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"
                    aria-hidden="true"
                  />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" aria-hidden="true" />
                  Submit Resolution
                </>
              )}
            </button>
          </div>

          {/* Note for when buttons are missing */}
          {(!flag.reporterId?._id || flag.targetType !== "LESSON") && (
            <div
              className="mt-2 text-xs text-center text-gray-400 dark:text-gray-500"
              role="note"
            >
              {!flag.reporterId?._id && "User profile not available • "}
              {flag.targetType !== "LESSON" &&
                "Lesson view not available for this content type"}
            </div>
          )}
        </div>
      </div>
    </BaseModal>
  );
};

export default FlagResolutionModal;
