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

  const statusOptions = [
    {
      value: "IN_REVIEW",
      label: "Mark as In Review",
      icon: Eye,
      color: "blue",
      description: "You're currently reviewing this issue.",
      action: "Student will be notified that you're looking into it.",
    },
    {
      value: "FIXED",
      label: "Mark as Fixed",
      icon: CheckCircle,
      color: "green",
      description: "The issue has been resolved.",
      action: "Student will be notified and will receive 25 XP as a thank you!",
    },
    {
      value: "REJECTED",
      label: "Reject",
      icon: XCircle,
      color: "gray",
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

  return (
    <BaseModal
      isOpen={true}
      onClose={onClose}
      title="Review Issue Report"
      size="lg"
    >
      <div className="space-y-6">
        {/* Flag Details */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-xl">
              {getIssueTypeIcon(flag.issueType)}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {flag.title}
                </h4>
                <span className="text-xs font-mono bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">
                  {flag.issueType?.replace(/_/g, " ")}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {flag.description}
              </p>
              {flag.suggestedFix && (
                <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                  <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">
                    Suggested Fix:
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-300">
                    {flag.suggestedFix}
                  </p>
                </div>
              )}
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
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
        <div>
          <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
            Resolution Status
          </label>
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
                      ? `border-${option.color}-500 bg-${option.color}-50 dark:bg-${option.color}-900/20`
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-2 rounded-lg bg-${option.color}-100 dark:bg-${option.color}-900/30`}
                    >
                      <Icon className={`h-5 w-5 text-${option.color}-600`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {option.label}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {option.description}
                      </p>
                      {isSelected && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                          {option.action}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Admin Response */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Admin Response (will be shared with student)
          </label>
          <textarea
            value={adminResponse}
            onChange={(e) => setAdminResponse(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            placeholder="Explain what action was taken, or provide additional information to the student..."
          />
        </div>

        {/* Footer with Action Buttons */}
        <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          {/* View User Profile Button */}
          {flag.reporterId?._id && (
            <button
              onClick={() => onViewUser(flag.reporterId)}
              className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 flex items-center"
            >
              <User className="h-4 w-4 mr-2" />
              View User Profile
            </button>
          )}

          {/* View Lesson Button */}
          {flag.targetType === "LESSON" && flag.targetId && (
            <button
              onClick={() => onViewLesson(flag.targetId, flag.semanticId)}
              className="px-4 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/40 flex items-center"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              View Lesson
            </button>
          )}

          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !status}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Processing...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Resolution
              </>
            )}
          </button>
        </div>
      </div>
    </BaseModal>
  );
};

export default FlagResolutionModal;
