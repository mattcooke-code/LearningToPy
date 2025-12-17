import { useState } from "react";
import { useNotification } from "../../context";
import BaseModal from "./BaseModal";
import { TrendingUp, TrendingDown, Info } from "lucide-react";

const XPAdjustmentModal = ({ user, onClose, onSave }) => {
  const [xpChange, setXpChange] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useNotification();

  const currentXP = user.xp || 0;
  const currentLevel = user.level || 1;

  // Calculate new XP/Level
  const newXP = xpChange ? currentXP + parseInt(xpChange) : currentXP;
  const newLevel = Math.floor(newXP / 100) + 1;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!xpChange || xpChange === "0") {
      showToast("Please enter a valid XP amount", "error");
      return;
    }

    if (!reason.trim()) {
      showToast("Please provide a reason for this adjustment", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(user._id, xpChange, reason);
    } catch (err) {
      // Error is handled in parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickAdjustments = [-1000, -100, -10, 10, 100, 1000];

  return (
    <BaseModal
      isOpen={true}
      onClose={onClose}
      title={`Adjust XP for ${user.username}`}
      size="xl" // Changed from "md" to "lg" for more width
      className="max-w-2xl" // Additional width control
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Current Stats */}
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Current XP
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {currentXP.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Current Level
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                Level {currentLevel}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Adjustments */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Quick Adjustments
          </label>
          <div className="grid grid-cols-6 gap-2">
            {" "}
            {/* Removed responsive classes, always 6 columns */}
            {quickAdjustments.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => {
                  const newValue = xpChange
                    ? parseInt(xpChange) + amount
                    : amount;
                  setXpChange(newValue.toString());
                }}
                className={`px-2 py-2.5 m-5 text-sm font-medium rounded-lg transition-colors flex items-center justify-center min-w-[60px] ${
                  amount < 0
                    ? "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800"
                    : "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800"
                }`}
              >
                {amount > 0 ? "+" : ""}
                {Math.abs(amount).toLocaleString()}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Click any button to apply that amount
          </p>
        </div>

        {/* Manual Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Custom Amount
          </label>
          <div className="relative">
            <input
              type="number"
              value={xpChange}
              onChange={(e) => setXpChange(e.target.value)}
              className="block w-full px-4 py-3 pl-11 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter XP amount (negative to deduct)"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {xpChange && parseInt(xpChange) < 0 ? (
                <TrendingDown className="h-5 w-5 text-red-500" />
              ) : (
                <TrendingUp className="h-5 w-5 text-green-500" />
              )}
            </div>
          </div>
        </div>

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Reason for Adjustment *
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows="3"
            className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Explain why you're adjusting this user's XP..."
            required
          />
        </div>

        {/* Preview */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-3 shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-3">
                Changes Preview
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Current XP:
                  </span>
                  <span className="font-medium">
                    {currentXP.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Adjustment:
                  </span>
                  <span
                    className={`font-medium ${
                      xpChange && parseInt(xpChange) < 0
                        ? "text-red-600 dark:text-red-400"
                        : "text-green-600 dark:text-green-400"
                    }`}
                  >
                    {xpChange
                      ? (parseInt(xpChange) > 0 ? "+" : "") +
                        parseInt(xpChange).toLocaleString()
                      : "0"}
                  </span>
                </div>
                <div className="flex justify-between border-t border-blue-200 dark:border-blue-800 pt-2">
                  <span className="text-gray-600 dark:text-gray-400">
                    New XP:
                  </span>
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    {newXP.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    New Level:
                  </span>
                  <span
                    className={`font-medium ${
                      newLevel > currentLevel
                        ? "text-green-600 dark:text-green-400"
                        : newLevel < currentLevel
                        ? "text-red-600 dark:text-red-400"
                        : "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    Level {newLevel}{" "}
                    {newLevel !== currentLevel &&
                      `(${newLevel > currentLevel ? "↑" : "↓"})`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !xpChange || !reason.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Processing...
              </span>
            ) : (
              "Apply Adjustment"
            )}
          </button>
        </div>
      </form>
    </BaseModal>
  );
};

export default XPAdjustmentModal;
