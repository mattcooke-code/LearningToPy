// /src/modals/BadgeModal.jsx
import { useMemo } from "react";
import { BaseModal } from "../components/ui";
import { BADGE_LIBRARY } from "../data/badges";

/**
 * @fileoverview
 * User-facing modal for displaying all available badges with progress tracking.
 * This component provides a comprehensive badge gallery interface showing earned badges,
 * in-progress badges, and locked badges with detailed information and visual progress
 * indicators. Features responsive grid layout, badge categorization, and achievement
 * requirement descriptions for user motivation and progress visualization.
 */

/**
 * User-facing modal for displaying all available badges with progress tracking.
 *
 * This component creates an engaging badge gallery interface that displays the complete
 * badge collection with visual distinction between earned, in-progress, and locked badges.
 * Features include detailed badge information, progress tracking with percentage indicators,
 * requirement descriptions, and category organization. The modal provides users with
 * a comprehensive view of their achievement progress and motivates continued engagement
 * through visual goal setting and progress visualization.
 *
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to close the modal
 * @param {Array} [props.earnedBadgeIds=[]] - Array of earned badge IDs
 * @param {Object} [props.progressMap={}] - Object mapping badge IDs to progress percentages
 * @returns {JSX.Element} Badge gallery with progress tracking and visual feedback
 */

const BadgeModal = ({
  isOpen,
  onClose,
  earnedBadgeIds = [],
  progressMap = {},
}) => {
  const earnedSet = useMemo(() => new Set(earnedBadgeIds), [earnedBadgeIds]);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="All Badges"
      size="5xl"
      className="max-h-[90vh] w-[92vw] md:w-[85vw] lg:w-[80vw] xl:max-w-5xl"
      backdropBlur
      closeOnOverlayClick
      closeOnEscape
    >
      <p className="text-sm text-gray-500 dark:text-gray-200 mb-6">
        Discover every badge you can earn and track your progress.
      </p>

      <div className="grid grid-cols-1 gap-4 overflow-y-auto pr-2 sm:grid-cols-2 lg:grid-cols-3 max-h-[60vh]">
        {BADGE_LIBRARY.map((badge) => {
          const isEarned = earnedSet.has(badge.id);
          const progress = isEarned
            ? 100
            : Math.min(progressMap[badge.id] || 0, 100);
          const hasProgress = !isEarned && progress > 0;

          return (
            <div
              key={badge.id}
              className={`group flex h-full flex-col rounded-2xl border bg-white dark:bg-gray-600 p-5 shadow-sm transition hover:shadow-md ${
                isEarned ? "border-green-200" : "border-gray-200"
              }`}
            >
              <div className="flex items-center space-x-4">
                <div
                  className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border ${
                    isEarned ? "border-green-300" : "border-gray-200"
                  }`}
                >
                  {badge.image ? (
                    <img
                      src={badge.image}
                      alt={badge.name}
                      /* - aspect-square: Forces the 1:1 shape
           - object-cover: Crops the image to fill the square without stretching
           - w-full h-full: Ensures it fills the 16x16 container
        */
                      className={`aspect-square h-full w-full object-cover transition ${
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
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {badge.name}
                    </h3>
                    {isEarned && (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-700 dark:text-green-100">
                        Earned
                      </span>
                    )}
                    {!isEarned && hasProgress && (
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-700 dark:text-blue-100">
                        In progress
                      </span>
                    )}
                  </div>
                  <p className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-300">
                    {badge.category}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-sm text-gray-600 dark:text-python-light">
                {badge.description}
              </p>
              <p className="mt-3 text-sm font-medium text-gray-800 dark:text-gray-200">
                How to earn:
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-200">
                {badge.requirement}
              </p>

              {!isEarned && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs font-medium text-gray-500 dark:text-gray-300 ">
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
