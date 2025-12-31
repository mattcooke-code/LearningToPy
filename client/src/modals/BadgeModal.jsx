// /src/modals/BadgeModal.jsx
import { BaseModal } from "../components/ui";
import { BADGE_LIBRARY } from "../data/badges";

const BadgeModal = ({
  isOpen,
  onClose,
  earnedBadgeIds = [],
  progressMap = {},
}) => {
  const earnedSet = new Set(earnedBadgeIds);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="All Badges"
      size="5xl"
      className="max-h-[90vh]"
      backdropBlur
      closeOnOverlayClick
      closeOnEscape
    >
      <p className="text-sm text-gray-500 mb-6">
        Discover every badge you can earn and track your progress.
      </p>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 max-h-[60vh] overflow-y-auto pr-2">
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

              <p className="mt-4 text-sm text-gray-600">{badge.description}</p>
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
    </BaseModal>
  );
};

export default BadgeModal;
