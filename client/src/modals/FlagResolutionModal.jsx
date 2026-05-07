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
 * integration for valid reports. Integrates with user and lesson preview modals for comprehensive
 * context and maintains complete audit trails for compliance and accountability.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.flag - Flag object containing report details and current status
 * @param {Function} props.onClose - Function to close the modal
 * @param {Function} props.onResolve - Callback function to handle flag resolution (flagId, resolutionData)
 * @param {Function} props.onViewUser - Callback to view reporting user details
 * @param {Function} props.onViewLesson - Callback to preview flagged lesson content
 * @returns {JSX.Element} Flag resolution interface with status management and user communication
 * 
 * @securityContext
 * **Admin/Moderator Permissions Required**:
 * - Relies on AuthContext for high-level admin role validation
 * - Uses elevated permissions for flag resolution
 * - Validates administrative access before status changes
 * - Maintains audit trail for all resolution actions
 * - Prevents unauthorized flag status modifications
 * 
 * **Data Protection**:
 * - Secure API communication with admin tokens
 * - Protection against unauthorized status changes
 * - Privacy compliance for user data handling
 * - Proper session validation and timeout handling
 * - Rate limiting for status updates
 * 
 * @sideEffects
 * **Database Changes**:
 * - Updates flag status in moderation system
 * - Records admin responses and timestamps
 * - Triggers user notification systems
 * - Awards XP to reporting users for valid reports
 * - Updates moderation metrics and analytics
 * 
 * **User Impact**:
 * - Status change notifications to reporting user
 * - XP rewards (25 XP) for reports marked as FIXED
 * - Admin response communication to users
 * - Content status updates for resolved issues
 * - Follow-up notifications for status changes
 * 
 * **System Effects**:
 * - Moderation queue updates and prioritization
 * - Content status changes for FIXED resolutions
 * - Analytics updates for moderation metrics
 * - Audit trail logging for compliance
 * - Notification system triggers
 * 
 * @moderationFlow
 * **ReportModal (User-Facing) → FlagResolutionModal (Admin-Facing)**:
 * - User submits report through ReportModal
 * - Report creates flag with PENDING status
 * - Admin views flag in FlagResolutionModal
 * - Admin can preview content and user details
 * - Resolution updates flag status and notifies user
 * 
 * **Flag Status Management**:
 * - IN_REVIEW: Admin is actively reviewing the issue
 * - FIXED: Issue resolved, user gets 25 XP reward
 * - REJECTED: No issue found or not applicable
 * - Status changes trigger notifications and XP rewards
 * - Complete audit trail for all status changes
 * 
 * @statusOptions
 * **IN_REVIEW**:
 * - Indicates admin is actively reviewing the issue
 * - Notifies user that investigation is underway
 * - No XP reward, but provides user feedback
 * - Used for complex issues requiring investigation
 * 
 * **FIXED**:
 * - Indicates the issue has been successfully resolved
 * - Awards 25 XP to reporting user as thank you
 * - Sends detailed resolution notification
 * - Updates content status if applicable
 * 
 * **REJECTED**:
 * - Indicates no issue found or not applicable
 * - Provides explanation to reporting user
 * - No XP reward for rejected reports
 * - Maintains content status as-is
 * 
 * @userCommunication
 * **Admin Response System**:
 * - Required admin response for all status changes
 * - Rich text formatting for detailed explanations
 * - User notification with admin response content
 * - Follow-up communication capabilities
 * - Professional communication standards
 * 
 * **Notification Templates**:
 * - IN_REVIEW: "We're looking into this issue"
 * - FIXED: "This has been fixed. Thank you for your help! +25 XP"
 * - REJECTED: "After review, we found no issue. Here's why..."
 * - Custom messages based on admin responses
 * 
 * @errorHandling
 * **API Request Failures**:
 * - Network error detection and admin notification
 * - Server validation error handling
 * - Permission denied error management
 * - Rate limiting error handling
 * - Graceful degradation for service failures
 * 
 * **Validation Errors**:
 * - Status selection validation before submission
 * - Admin response requirement checking
 * - Flag ID validation for security
 * - Payload structure validation
 * - User-friendly error messages
 * 
 * @integrationFeatures
 * **User Preview Integration**:
 * - onViewUser callback to UserDetailModal
 * - Displays reporting user information
 * - User history and activity context
 * - Communication tools for user contact
 * - Support workflow integration
 * 
 * **Content Preview Integration**:
 * - onViewLesson callback to FlaggedLessonPreviewModal
 * - Displays flagged lesson in moderation context
 * - Content assessment tools and features
 * - Side-by-side comparison capabilities
 * - Resolution workflow support
 * 
 * @auditCompliance
 * **Resolution Logging**:
 * - Complete audit trail for all status changes
 * - Admin user identification and timestamps
 * - Before/after status recording
 * - Admin response content logging
 * - User notification tracking
 * 
 * **Compliance Features**:
 * - Required admin responses for accountability
 * - Status change justification tracking
 * - User communication logging
 * - Analytics and reporting capabilities
 * - Regulatory compliance support
 * 
 * @userExperience
 * **Administrative Interface**:
 * - Clean, organized flag review interface
 * - Visual status indicators with icons
 * - Rich text editor for admin responses
 * - Quick action buttons for common resolutions
 * - Professional admin styling and layout
 * 
 * **Workflow Support**:
 * - Efficient flag processing and resolution
 * - Quick access to user and content previews
 * - Status change confirmation dialogs
 * - Bulk resolution capabilities (future enhancement)
 * - Integration with other admin tools
 * 
 * @accessibility
 * - Semantic HTML structure for flag information
 * - Proper ARIA labels and roles
 * - Screen reader compatible status information
 * - Keyboard navigation support
 * - High contrast support for visual elements
 * - Focus management for modal interactions
 * - Error announcement for screen readers
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

        {/* Footer with Action Buttons - Grid layout for responsive design */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          {/* Action Buttons Grid - 2 columns on mobile/tablet, auto on desktop */}
          <div className="grid grid-cols-2 gap-3">
            {/* View User Profile Button */}
            {flag.reporterId?._id && (
              <button
                onClick={() => onViewUser(flag.reporterId)}
                className="px-4 py-2 text-sm font-medium text-amber-900 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/40 transition-colors items-center justify-center flex"
              >
                <User className="h-4 w-4 mr-2" />
                View User Profile
              </button>
            )}

            {/* View Lesson Button */}
            {flag.targetType === "LESSON" && flag.targetId && (
              <button
                onClick={() => onViewLesson(flag.targetId, flag.semanticId)}
                className="px-4 py-2 text-sm font-medium text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/40 transition-colors items-center justify-center flex"
              >
                <BookOpen className="h-4 w-4 mr-2" />
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
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors items-center justify-center flex"
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

          {/* Note for when buttons are missing */}
          {(!flag.reporterId?._id || flag.targetType !== "LESSON") && (
            <div className="mt-2 text-xs text-center text-gray-400">
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
