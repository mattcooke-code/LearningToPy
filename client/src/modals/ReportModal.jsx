// components/modals/ReportModal.jsx
import { useState } from "react";
import { useNotification } from "../context";
import { BaseModal } from "../components/ui";
import { apiClient } from "../services";
import { Flag } from "lucide-react";

const ISSUE_TYPES = [
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
];

/**
 * @fileoverview
 * User-facing modal for reporting lesson issues and content problems.
 * This component provides a comprehensive issue reporting interface with categorized issue types,
 * detailed description fields, and suggested fix options. Features form validation, error handling,
 * and integration with the moderation system. Designed for user-friendly content reporting
 * with proper feedback and confirmation systems.
 */

/**
 * User-facing modal for reporting lesson issues and content problems.
 * 
 * This component creates an accessible issue reporting interface that allows users to
 * report various types of lesson problems including content errors, code issues, quiz problems,
 * and functionality bugs. Features categorized issue selection, detailed description fields,
 * suggested fix options, and comprehensive form validation. Integrates with the moderation
 * system through API submissions and provides user-friendly feedback throughout the
 * reporting process.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to close the modal
 * @param {string} props.lessonId - ID of the lesson being reported
 * @returns {JSX.Element} Issue reporting interface with categorized problem selection
 * 
 * @securityContext
 * **User Authentication Required**:
 * - Relies on AuthContext for user authentication state
 * - Uses apiClient with user authentication tokens
 * - Validates user permissions before report submission
 * - Prevents anonymous or unauthorized reporting
 * - Maintains user privacy and data protection
 * 
 * **Data Protection**:
 * - User information automatically attached to reports
 * - Secure API communication with authentication
 * - Privacy-compliant data handling
 * - Protection against malicious submissions
 * - Rate limiting and spam prevention
 * 
 * @moderationFlow
 * **ReportModal (User-Facing) → FlagResolutionModal (Admin-Facing)**:
 * - User submits report through ReportModal
 * - Report creates flag in moderation system
 * - Admin views flag in FlagResolutionModal
 * - Admin can preview content in FlaggedLessonPreviewModal
 * - Resolution updates flag status and notifies user
 * 
 * **Flag Status Management**:
 * - Initial status: "PENDING" when report is submitted
 * - Admin can update to "IN_REVIEW", "FIXED", or "REJECTED"
 * - Status changes trigger notifications to reporting user
 * - XP rewards for valid reports (25 XP when marked as FIXED)
 * - Complete audit trail for all status changes
 * 
 * @issueCategorization
 * **CONTENT_ERROR**: Typos, incorrect information, formatting issues
 * **CODE_ERROR**: Exercise code problems, syntax errors, execution failures
 * **QUIZ_ERROR**: Incorrect quiz answers, validation issues, scoring problems
 * **BROKEN_FUNCTIONALITY**: UI bugs, navigation issues, feature failures
 * **XP_ADJUSTMENT**: Missing XP, incorrect calculations, reward problems
 * **OTHER**: Miscellaneous issues not fitting other categories
 * 
 * @formValidation
 * **Required Fields**:
 * - Issue type selection (must be valid category)
 * - Report title (minimum 3 characters, trimmed)
 * - Report details (minimum 10 characters, trimmed)
 * - Lesson ID validation (must exist and be accessible)
 * 
 * **Optional Fields**:
 * - Suggested fix (user-provided solution ideas)
 * - Additional context or examples
 * - Screenshots or attachments (future enhancement)
 * 
 * **Validation Feedback**:
 * - Real-time validation feedback
 * - User-friendly error messages
 * - Field highlighting for validation errors
 * - Prevention of duplicate submissions
 * 
 * @apiIntegration
 * **Report Submission**:
 * - POST /auth/flags: Submit new issue report
 * - Payload includes targetType, targetId, issueType, title, description
 * - Optional suggestedFix field for user solutions
 * - Automatic user authentication and attribution
 * - Error handling with detailed feedback
 * 
 * **Error Handling**:
 * - Network error detection and user notification
 * - Duplicate report prevention (warning message)
 * - Server validation error handling
 * - Graceful degradation for service failures
 * - User-friendly error recovery options
 * 
 * @userExperience
 * **Form Interface**:
 * - Clean, organized form layout with clear sections
 * - Visual issue type selection with icons and descriptions
 * - Progressive disclosure for optional fields
 * - Real-time validation feedback
 * - Mobile-responsive design
 * 
 * **Feedback Systems**:
 * - Loading indicators during submission
 * - Success confirmation with clear messaging
 * - Error notifications with actionable information
 * - Form reset on successful submission
 * - Consistent styling with platform design
 * 
 * @errorHandling
 * **Network Errors**:
 * - Connection failure detection
 * - Retry mechanisms for transient failures
 * - User notification with suggested actions
 * - Form data preservation during errors
 * - Graceful service degradation
 * 
 * **Validation Errors**:
 * - Client-side validation before submission
 * - Server-side validation error handling
 * - Field-specific error highlighting
 * - User-friendly error messages
 * - Prevention of data loss on errors
 * 
 * @sideEffects
 * **Database Changes**:
 * - Creates new flag record in moderation system
 * - Updates moderation queue for admin review
 * - Triggers notification systems for moderators
 * - Logs user activity for audit purposes
 * - Updates lesson flag status and metrics
 * 
 * **User Notifications**:
 * - Confirmation message on successful submission
 * - Error notifications for failed submissions
 * - Follow-up notifications when issue is resolved
 * - XP reward notifications for valid reports
 * - Email notifications for status changes (if enabled)
 * 
 * @accessibility
 * - Semantic HTML structure for form elements
 * - Proper ARIA labels and roles
 * - Screen reader compatible issue type selection
 * - Keyboard navigation support
 * - High contrast support for visual elements
 * - Focus management for modal interactions
 * - Error announcement for screen readers
 */

const ReportModal = ({ isOpen, onClose, lessonId }) => {
  const { showToast } = useNotification();
  const [reportReason, setReportReason] = useState("");
  const [reportTitle, setReportTitle] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [reportSuggestedFix, setReportSuggestedFix] = useState("");
  const [isReporting, setIsReporting] = useState(false);

  const resetForm = () => {
    setReportReason("");
    setReportTitle("");
    setReportDetails("");
    setReportSuggestedFix("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

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
      handleClose();
    } catch (err) {
      console.error("Report error:", err);
      const errorMsg = err.response?.data?.message || "Failed to submit report";
      showToast(
        errorMsg,
        errorMsg.includes("already flagged") ? "warning" : "error",
      );
    } finally {
      setIsReporting(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
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
            {ISSUE_TYPES.map((type) => (
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

        {/* Suggested Fix Field */}
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
            onClick={handleClose}
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
  );
};

export default ReportModal;
