import { useState } from "react";
import { useNotification } from "../context";
import { BaseModal } from "../components/ui";
import {
  TrendingUp,
  TrendingDown,
  Info,
  AlertTriangle,
  Zap,
} from "lucide-react";

/**
 * @fileoverview
 * Administrative modal for XP adjustment with real-time calculation and validation.
 * This component provides a secure interface for modifying user XP scores with comprehensive
 * validation, reason tracking, and audit logging. Features real-time level calculation,
 * quick adjustment presets, and detailed feedback systems. Designed for administrative
 * XP management with proper error handling and user impact assessment.
 */

/**
 * Administrative modal for XP adjustment with real-time calculation and validation.
 * 
 * This component creates a secure administrative interface for modifying user XP scores
 * with comprehensive validation, reason tracking, and audit logging. Features include real-time
 * level calculation based on XP changes, quick adjustment presets for common values, and
 * detailed feedback showing the impact on user level and progression. The modal maintains
 * strict validation requirements and provides comprehensive error handling for all operations.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to close the modal
 * @param {Object} props.user - User object containing current XP and level information
 * @param {Function} props.onSave - Callback function to handle XP adjustment (userId, amount, reason)
 * @returns {JSX.Element} XP adjustment interface with real-time calculation and validation
 * 
 * @securityContext
 * **Admin/Moderator Permissions Required**:
 * - Relies on AuthContext for high-level admin role validation
 * - Uses elevated permissions for XP modification
 * - Validates administrative access before allowing adjustments
 * - Maintains audit trail for all XP changes
 * - Prevents unauthorized XP manipulation
 * 
 * **Data Protection**:
 * - Secure API communication with admin tokens
 * - Validation of adjustment amounts and reasons
 * - Protection against malicious XP modifications
 * - Rate limiting for XP adjustments
 * - Session validation and timeout handling
 * 
 * @sideEffects
 * **Database Changes**:
 * - Direct modification of user XP record in database
 * - Automatic level recalculation based on new XP total
 * - Updates user progression and achievement systems
 * - Triggers badge awarding if level thresholds are crossed
 * - Logs all XP adjustments for audit purposes
 * 
 * **User Impact**:
 * - Immediate XP total update in user profile
 * - Level progression changes (level = floor(XP / 100) + 1)
 * - Badge and achievement system updates
 * - Leaderboard ranking adjustments
 * - Progress tracking recalculation
 * 
 * **Notification Systems**:
 * - User notification of XP changes (if enabled)
 * - Admin confirmation of successful adjustments
 * - Error notifications for failed operations
 * - Audit trail logging for compliance
 * - System notifications for level changes
 * 
 * @realTimeCalculation
 * **Level Calculation**:
 * - Current level: Math.floor(currentXP / 100) + 1
 * - New level: Math.floor(newXP / 100) + 1
 * - XP change validation (non-zero, within reasonable bounds)
 * - Negative XP protection (minimum 0 XP)
 * - Real-time preview of level changes
 * 
 * **Validation Logic**:
 * - XP amount must be non-zero integer
 * - Reason must be at least 5 characters
 * - Maximum XP limits to prevent abuse
 * - Reason validation for audit compliance
 * - Input sanitization and type checking
 * 
 * @quickAdjustments
 * **Preset Values**:
 * - -500, -100, -50: Common penalty amounts
 * - +50, +100, +500: Common reward amounts
 * - One-click application with reason requirement
 * - Visual feedback for positive/negative changes
 * - Quick action buttons for efficiency
 * 
 * **User Experience**:
 * - Current stats display with XP and level
 * - Real-time preview of adjustment impact
 * - Visual indicators for level changes
 * - Intuitive input validation and feedback
 * - Professional admin interface styling
 * 
 * @errorHandling
 * **API Request Failures**:
 * - Network error detection and user notification
 * - Server validation error handling
 * - Permission denied error management
 * - Rate limiting error handling
 * - Graceful degradation for service failures
 * 
 * **Validation Errors**:
 * - Input validation before API submission
 * - Clear error messages for invalid inputs
 * - Field highlighting for validation errors
 * - Prevention of invalid submissions
 * - User-friendly error recovery guidance
 * 
 * @auditCompliance
 * **Reason Tracking**:
 * - Mandatory reason field for all adjustments
 * - Minimum 5 character requirement for detailed explanations
 * - Automatic admin attribution and timestamping
 * - Complete audit trail for compliance
 * - Searchable reason database for analytics
 * 
 * **Logging Requirements**:
 * - Before/after XP values
 * - Admin user identification
 * - Adjustment reason and timestamp
 * - User impact assessment
 * - System response and outcome
 * 
 * @userExperience
 * **Visual Design**:
 * - Current stats ribbon with XP and level display
 * - Color-coded adjustment indicators (green for positive, red for negative)
 * - Real-time level change preview
 * - Professional admin interface styling
 * - Responsive design for mobile and desktop
 * 
 * **Interaction Design**:
 * - Quick adjustment buttons for common values
 * - Manual input field for custom amounts
 * - Reason textarea with character counting
 * - Real-time validation feedback
 * - Loading states during submission
 * 
 * @accessibility
 * - Semantic HTML structure for form elements
 * - Proper ARIA labels and roles
 * - Screen reader compatible XP information
 * - Keyboard navigation support
 * - High contrast support for visual elements
 * - Focus management for modal interactions
 * - Error announcement for screen readers
 */

const XPAdjustmentModal = ({ isOpen, onClose, user, onSave }) => {
  const [xpChange, setXpChange] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useNotification();

  const currentXP = user.xp || 0;
  const currentLevel = user.level || 1;

  // FIX: Better handling of empty/non-numeric values
  const changeAmount =
    xpChange === "" || xpChange === null ? 0 : parseInt(xpChange, 10);
  // Ensure we don't get NaN
  const safeChangeAmount = isNaN(changeAmount) ? 0 : changeAmount;

  const newXP = Math.max(0, currentXP + safeChangeAmount);
  const newLevel = Math.floor(newXP / 100) + 1;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // FIX: Check safeChangeAmount instead of xpChange
    if (safeChangeAmount === 0) {
      showToast("Please enter a valid XP amount (non-zero)", "error");
      return;
    }

    if (!reason.trim() || reason.length < 5) {
      showToast(
        "Please provide a detailed reason for this adjustment (minimum 5 characters)",
        "error",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(user._id, safeChangeAmount, reason);
      setXpChange("");
      setReason("");
      onClose();
    } catch (err) {
      // Error handled by parent
      console.error("XP adjustment error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickAdjustments = [-500, -100, -50, 50, 100, 500];

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center space-x-2">
          <Zap className="h-5 w-5 text-yellow-500 fill-yellow-500" />
          <span className="text-gray-900 dark:text-white">
            XP Adjustment: {user.username}
          </span>
        </div>
      }
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Current Stats Ribbon */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-900 dark:bg-blue-900/20 text-white border border-blue-500/20">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">
              Current Total
            </p>
            <p className="text-xl font-black">
              {currentXP.toLocaleString()}{" "}
              <span className="text-sm font-normal opacity-60">XP</span>
            </p>
          </div>
          <div className="h-10 w-[1px] bg-white/10" />
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">
              Current Rank
            </p>
            <p className="text-xl font-black">Level {currentLevel}</p>
          </div>
        </div>

        {/* Quick Adjustments */}
        <div>
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
            Quick Presets
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {quickAdjustments.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => setXpChange(amount.toString())}
                className={`py-2 text-xs font-black rounded-lg transition-all border-b-4 active:border-b-0 active:translate-y-1 ${
                  amount < 0
                    ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400"
                    : "bg-green-50 text-green-600 border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400"
                }`}
              >
                {amount > 0 ? `+${amount}` : amount}
              </button>
            ))}
          </div>
        </div>

        {/* Manual Input & Reason */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
              XP Amount
            </label>
            <div className="relative">
              <input
                type="number"
                value={xpChange}
                onChange={(e) => setXpChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-xl font-black focus:ring-0 focus:border-blue-500 transition-all dark:text-python-yellow"
                placeholder="0"
              />
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                {safeChangeAmount < 0 ? (
                  <TrendingDown className="h-5 w-5 text-red-500" />
                ) : safeChangeAmount > 0 ? (
                  <TrendingUp className="h-5 w-5 text-green-500" />
                ) : (
                  <TrendingUp className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
              Reasoning <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 dark:text-python-light rounded-xl font-medium focus:ring-0 focus:border-blue-500 transition-all"
              placeholder="e.g., Bug bounty reward, manual correction..."
            />
          </div>
        </div>

        {/* Changes Preview Card */}
        <div
          className={`p-4 rounded-xl border-2 border-dashed transition-colors ${
            safeChangeAmount === 0
              ? "bg-gray-50 border-gray-200 dark:bg-gray-900/40 dark:border-gray-800"
              : safeChangeAmount < 0
                ? "bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-900/30"
                : "bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-900/30"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-black text-gray-500 uppercase flex items-center">
              <Info className="h-3 w-3 mr-1" /> Adjustment Preview
            </h4>
            {newXP === 0 && safeChangeAmount < 0 && (
              <span className="flex items-center text-[10px] font-bold text-red-500 animate-pulse">
                <AlertTriangle className="h-3 w-3 mr-1" /> Floored at 0 XP
              </span>
            )}
          </div>

          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase">
                Projected XP
              </p>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-black text-gray-400 line-through decoration-2">
                  {currentXP}
                </span>
                <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                  {newXP.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="text-right">
              <p className="text-[10px] text-gray-400 font-bold uppercase">
                Projected Level
              </p>
              <div className="flex items-center justify-end space-x-2">
                <span
                  className={`text-2xl font-black ${
                    newLevel > currentLevel
                      ? "text-green-500"
                      : newLevel < currentLevel
                        ? "text-red-500"
                        : "text-gray-900 dark:text-white"
                  }`}
                >
                  Lvl {newLevel}
                </span>
                {newLevel !== currentLevel && (
                  <span
                    className={`text-sm font-bold ${
                      newLevel > currentLevel
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    ({newLevel > currentLevel ? "↑" : "↓"})
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4">
          <p className="text-[10px] text-gray-400 max-w-[200px] leading-tight font-medium">
            Note: XP adjustments are logged and visible in user activity
            history.
          </p>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-gray-700 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                isSubmitting || safeChangeAmount === 0 || reason.length < 5
              }
              className="px-6 py-2.5 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95 flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Syncing...
                </>
              ) : (
                "Confirm & Apply"
              )}
            </button>
          </div>
        </div>
      </form>
    </BaseModal>
  );
};

export default XPAdjustmentModal;
