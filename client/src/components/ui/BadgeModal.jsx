import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { BADGE_LIBRARY } from "../../data/badges";

const BadgeModal = ({
  isOpen,
  onClose,
  earnedBadgeIds = [],
  progressMap = {},
}) => {
  if (!isOpen) return null;

  const earnedSet = new Set(earnedBadgeIds);

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      onClick={handleBackdropClick}
    >
      <div className="relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">All Badges</h2>
            <p className="text-sm text-gray-500">
              Discover every badge you can earn and track your progress.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
            aria-label="Close badge modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 md:pr-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {BADGE_LIBRARY.map((badge) => {
              const isEarned = earnedSet.has(badge.id);
              const progress = isEarned
                ? 100
                : Math.min(progressMap[badge.id] || 0, 100);
              const hasProgress = !isEarned && progress > 0;

              return (
                <div
                  key={badge.id}
                  className={`group flex h-full flex-col rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md ${
                    isEarned ? "border-green-200" : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`relative h-16 w-16 overflow-hidden rounded-xl border ${
                        isEarned ? "border-green-300" : "border-gray-200"
                      }`}
                    >
                      {badge.image ? (
                        <img
                          src={badge.image}
                          alt={badge.name}
                          className={`h-full w-full object-cover transition ${
                            isEarned ? "" : "grayscale opacity-60"
                          }`}
                        />
                      ) : (
                        <div
                          className={`flex h-full w-full items-center justify-center text-2xl font-semibold ${
                            isEarned
                              ? "bg-green-100 text-green-600"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {badge.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {badge.name}
                        </h3>
                        {isEarned && (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                            Earned
                          </span>
                        )}
                        {!isEarned && hasProgress && (
                          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                            In progress
                          </span>
                        )}
                      </div>
                      <p className="text-xs uppercase tracking-wide text-gray-400">
                        {badge.category}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-sm text-gray-600">
                    {badge.description}
                  </p>
                  <p className="mt-3 text-sm font-medium text-gray-800">
                    How to earn:
                  </p>
                  <p className="text-sm text-gray-600">{badge.requirement}</p>

                  {!isEarned && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs font-medium text-gray-500">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                        <div
                          className={`h-2 rounded-full ${
                            hasProgress ? "bg-blue-500" : "bg-gray-300"
                          }`}
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default BadgeModal;
