// /src/modals/XPAdjustmentModal.jsx
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
 * quick adjustment presets, and detailed feedback systems.
 */

/**
 * Administrative modal for XP adjustment with real-time calculation and validation.
 *
 * This component creates a secure administrative interface for modifying user XP scores
 * with comprehensive validation, reason tracking, and audit logging.
 *
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to close the modal
 * @param {Object} props.user - User object containing current XP and level information
 * @param {Function} props.onSave - Callback function to handle XP adjustment (userId, amount, reason)
 * @returns {JSX.Element} XP adjustment interface with real-time calculation and validation
 */
const XPAdjustmentModal = ({ isOpen, onClose, user, onSave }) => {
  const [xpChange, setXpChange] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useNotification();

  const currentXP = user.xp || 0;
  const currentLevel = user.level || 1;

  const changeAmount =
    xpChange === "" || xpChange === null ? 0 : parseInt(xpChange, 10);
  const safeChangeAmount = isNaN(changeAmount) ? 0 : changeAmount;

  const newXP = Math.max(0, currentXP + safeChangeAmount);
  const newLevel = Math.floor(newXP / 100) + 1;

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      title={`XP Adjustment: ${user.username}`}
      description={`Adjust XP for ${user.username}. Current XP: ${currentXP.toLocaleString()}, Level: ${currentLevel}. Changes take effect immediately.`}
      size="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <p
            className="text-[10px] text-gray-400 max-w-[200px] leading-tight font-medium"
            role="note"
          >
            Note: XP adjustments are logged and visible in user activity
            history.
          </p>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="xp-adjustment-form"
              disabled={
                isSubmitting || safeChangeAmount === 0 || reason.length < 5
              }
              className="px-6 py-2.5 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95 flex items-center focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label={
                isSubmitting
                  ? "Submitting XP adjustment"
                  : `Confirm ${safeChangeAmount > 0 ? "+" : ""}${safeChangeAmount} XP adjustment`
              }
            >
              {isSubmitting ? (
                <>
                  <div
                    className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"
                    aria-hidden="true"
                  />
                  Syncing...
                </>
              ) : (
                "Confirm & Apply"
              )}
            </button>
          </div>
        </div>
      }
    >
      <form
        id="xp-adjustment-form"
        onSubmit={handleSubmit}
        className="space-y-6"
      >
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
          <div className="h-10 w-[1px] bg-white/10" aria-hidden="true" />
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">
              Current Rank
            </p>
            <p className="text-xl font-black">Level {currentLevel}</p>
          </div>
        </div>

        {/* Quick Adjustments */}
        <fieldset>
          <legend className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
            Quick Presets
          </legend>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {quickAdjustments.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => setXpChange(amount.toString())}
                aria-label={`Set XP adjustment to ${amount > 0 ? "+" : ""}${amount}`}
                aria-pressed={xpChange === amount.toString()}
                className={`py-2 text-xs font-black rounded-lg transition-all border-b-4 active:border-b-0 active:translate-y-1 ${
                  amount < 0
                    ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400"
                    : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400"
                }`}
              >
                {amount > 0 ? `+${amount}` : amount}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Manual Input & Reason */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <label
              htmlFor="xp-amount"
              className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2"
            >
              XP Amount
            </label>
            <div className="relative">
              <input
                id="xp-amount"
                type="number"
                value={xpChange}
                onChange={(e) => setXpChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-xl font-black text-gray-900 dark:text-yellow-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                placeholder="0"
                aria-describedby="xp-preview"
              />
              <div
                className="absolute inset-y-0 left-3 flex items-center pointer-events-none"
                aria-hidden="true"
              >
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
            <label
              htmlFor="xp-reason"
              className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2"
            >
              Reasoning{" "}
              <span className="text-red-500" aria-label="required">
                *
              </span>
            </label>
            <input
              id="xp-reason"
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-xl font-medium text-gray-900 dark:text-yellow-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              placeholder="e.g., Bug bounty reward, manual correction..."
              minLength={5}
              aria-describedby="reason-hint"
            />
            <p id="reason-hint" className="text-[10px] text-gray-400 mt-1">
              Minimum 5 characters required
            </p>
          </div>
        </div>

        {/* Changes Preview Card */}
        <div
          id="xp-preview"
          className={`p-4 rounded-xl border-2 border-dashed transition-colors ${
            safeChangeAmount === 0
              ? "bg-gray-50 border-gray-200 dark:bg-gray-900/40 dark:border-gray-800"
              : safeChangeAmount < 0
                ? "bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-900/30"
                : "bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-900/30"
          }`}
          aria-live="polite"
          aria-atomic="true"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black text-gray-500 uppercase flex items-center">
              <Info className="h-3 w-3 mr-1" aria-hidden="true" /> Adjustment
              Preview
            </h3>
            {newXP === 0 && safeChangeAmount < 0 && (
              <span
                className="flex items-center text-[10px] font-bold text-red-600 dark:text-red-400 animate-pulse"
                role="alert"
              >
                <AlertTriangle className="h-3 w-3 mr-1" aria-hidden="true" />{" "}
                Floored at 0 XP
              </span>
            )}
          </div>

          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase">
                Projected XP
              </p>
              <div className="flex items-center space-x-2">
                <span
                  className="text-lg font-black text-gray-400 line-through decoration-2"
                  aria-label={`Current XP: ${currentXP}`}
                >
                  {currentXP}
                </span>
                <span
                  className="text-2xl font-black text-blue-700 dark:text-blue-400"
                  aria-label={`New XP: ${newXP.toLocaleString()}`}
                >
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
                      ? "text-green-600 dark:text-green-400"
                      : newLevel < currentLevel
                        ? "text-red-600 dark:text-red-400"
                        : "text-gray-900 dark:text-white"
                  }`}
                  aria-label={`Level ${newLevel}`}
                >
                  Lvl {newLevel}
                </span>
                {newLevel !== currentLevel && (
                  <span
                    className={`text-sm font-bold ${
                      newLevel > currentLevel
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                    aria-label={
                      newLevel > currentLevel
                        ? "Level increased"
                        : "Level decreased"
                    }
                  >
                    {newLevel > currentLevel ? "↑" : "↓"}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </BaseModal>
  );
};

export default XPAdjustmentModal;
