// FlagResolutionModal.jsx
import { useState } from "react";
import BaseModal from "./BaseModal";
import {
  CheckCircle,
  AlertTriangle,
  Shield,
  X,
  MessageSquare,
  User,
  FileText,
} from "lucide-react";

const FlagResolutionModal = ({ flag, onClose, onResolve }) => {
  const [resolution, setResolution] = useState({
    status: "RESOLVED",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getTargetIcon = () => {
    const icons = {
      COMMENT: MessageSquare,
      EXERCISE_SUBMISSION: FileText,
      USER_PROFILE: User,
      LESSON_CONTENT: FileText,
    };
    return icons[flag.targetType] || AlertTriangle;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resolution.notes.trim()) return;

    setIsSubmitting(true);
    try {
      await onResolve(flag._id, resolution);
    } finally {
      setIsSubmitting(false);
    }
  };

  const TargetIcon = getTargetIcon();

  return (
    <BaseModal
      isOpen={true}
      onClose={onClose}
      title="Resolve Flag Report"
      size="2xl"
      showCloseButton={true}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header Summary (Sub-header) */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <TargetIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Reported by {flag.reporterId?.username || "System"} •{" "}
              {flag.targetType?.replace(/_/g, " ")}
            </p>
          </div>
        </div>

        {/* Flag Details Section */}
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Flagged Content
          </h4>
          <p className="font-medium text-gray-900 dark:text-white mb-1">
            Reason: {flag.reason}
          </p>
          {flag.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 italic">
              "{flag.description}"
            </p>
          )}
        </div>

        {/* Resolution Status Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Select Resolution
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              {
                value: "RESOLVED",
                label: "Resolve",
                icon: CheckCircle,
                color: "green",
              },
              {
                value: "WARNING_SENT",
                label: "Warn",
                icon: AlertTriangle,
                color: "yellow",
              },
              {
                value: "ESCALATED",
                label: "Escalate",
                icon: Shield,
                color: "red",
              },
              { value: "DISMISSED", label: "Dismiss", icon: X, color: "gray" },
            ].map((option) => {
              const Icon = option.icon;
              const isSelected = resolution.status === option.value;
              return (
                <label
                  key={option.value}
                  className={`flex flex-col items-center justify-center p-3 border rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? `bg-${option.color}-50 border-${option.color}-500 dark:bg-${option.color}-900/20`
                      : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value={option.value}
                    checked={isSelected}
                    onChange={(e) =>
                      setResolution({ ...resolution, status: e.target.value })
                    }
                    className="sr-only"
                  />
                  <Icon
                    className={`h-5 w-5 mb-1 ${
                      isSelected ? `text-${option.color}-600` : "text-gray-400"
                    }`}
                  />
                  <span
                    className={`text-xs font-semibold ${
                      isSelected ? `text-${option.color}-700` : "text-gray-500"
                    }`}
                  >
                    {option.label}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Notes Area */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Resolution Notes *
          </label>
          <textarea
            value={resolution.notes}
            onChange={(e) =>
              setResolution({ ...resolution, notes: e.target.value })
            }
            rows="3"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-sm"
            placeholder="Why are you taking this action?"
            required
          />
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !resolution.notes.trim()}
            className="px-6 py-2 text-sm font-bold text-white bg-python-blue rounded-lg hover:bg-python-dark disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? "Processing..." : "Confirm Resolution"}
          </button>
        </div>
      </form>
    </BaseModal>
  );
};

export default FlagResolutionModal;
