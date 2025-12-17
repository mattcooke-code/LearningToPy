// FlagResolutionModal.jsx
import { useState } from "react";
import {
  X,
  AlertTriangle,
  CheckCircle,
  Shield,
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
    if (!resolution.notes.trim()) {
      alert("Please provide resolution notes");
      return;
    }

    setIsSubmitting(true);

    try {
      await onResolve(flag._id, resolution);
    } finally {
      setIsSubmitting(false);
    }
  };

  const TargetIcon = getTargetIcon();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block w-full max-w-2xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-2xl">
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-900 flex items-center justify-center">
                  <TargetIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-white">
                    Resolve Flag Report
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Reported by {flag.reporterId?.username || "Unknown"} •{" "}
                    {flag.targetType?.replace(/_/g, " ")}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-4">
              {/* Flag Details */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Flag Details
                </h4>
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                  <p className="font-medium text-gray-900 dark:text-white mb-2">
                    Reason: {flag.reason}
                  </p>
                  {flag.description && (
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {flag.description}
                    </p>
                  )}
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Reported {new Date(flag.createdAt).toLocaleDateString()} •
                    ID: {flag._id}
                  </div>
                </div>
              </div>

              {/* Resolution Status */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Resolution Status
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    {
                      value: "RESOLVED",
                      label: "Resolved",
                      icon: CheckCircle,
                      color: "green",
                    },
                    {
                      value: "WARNING_SENT",
                      label: "Warning Sent",
                      icon: AlertTriangle,
                      color: "yellow",
                    },
                    {
                      value: "ESCALATED",
                      label: "Escalated",
                      icon: Shield,
                      color: "red",
                    },
                    {
                      value: "DISMISSED",
                      label: "Dismissed",
                      icon: X,
                      color: "gray",
                    },
                  ].map((option) => {
                    const Icon = option.icon;
                    return (
                      <label
                        key={option.value}
                        className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors ${
                          resolution.status === option.value
                            ? `bg-${option.color}-50 border-${option.color}-200 dark:bg-${option.color}-900/20 dark:border-${option.color}-800`
                            : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                      >
                        <input
                          type="radio"
                          name="status"
                          value={option.value}
                          checked={resolution.status === option.value}
                          onChange={(e) =>
                            setResolution({
                              ...resolution,
                              status: e.target.value,
                            })
                          }
                          className="sr-only"
                        />
                        <div className="flex items-center space-x-2">
                          <Icon
                            className={`h-5 w-5 ${
                              resolution.status === option.value
                                ? `text-${option.color}-600 dark:text-${option.color}-400`
                                : "text-gray-400"
                            }`}
                          />
                          <span
                            className={`text-sm font-medium ${
                              resolution.status === option.value
                                ? `text-${option.color}-700 dark:text-${option.color}-300`
                                : "text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {option.label}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Resolution Notes *
                </label>
                <textarea
                  value={resolution.notes}
                  onChange={(e) =>
                    setResolution({ ...resolution, notes: e.target.value })
                  }
                  rows="4"
                  className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe the actions taken and reasoning..."
                  required
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  This will be saved in the audit log and may be visible to
                  other admins.
                </p>
              </div>

              {/* Action Preview */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                  Action Preview
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  This flag will be marked as{" "}
                  <span className="font-semibold">
                    {resolution.status.toLowerCase().replace("_", " ")}
                  </span>
                  .
                  {resolution.notes && (
                    <>
                      <br />
                      <span className="font-medium">Notes:</span>{" "}
                      {resolution.notes}
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <div className="flex justify-end space-x-3">
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
                  disabled={isSubmitting || !resolution.notes.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
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
                    "Apply Resolution"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FlagResolutionModal;
