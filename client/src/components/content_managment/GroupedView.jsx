// GroupedView.jsx
import { PublishToggleButton, ContentActionBar } from "./ActionButtons";
import { DifficultyBadge } from "./ContentBadges";

/**
 * Module-grouped view showing lessons organized under their parent modules.
 *
 * @component
 * @param {Object} props
 * @param {Array} props.groupedContent - Array of [moduleId, {module, lessons}] entries
 * @param {Function} props.onEdit - Edit action handler
 * @param {Function} props.onTogglePublish - Publish toggle handler
 * @param {Function} props.onDuplicate - Duplicate action handler
 * @param {Function} props.onDelete - Delete action handler
 */
const GroupedView = ({
  groupedContent,
  onEdit,
  onTogglePublish,
  onDuplicate,
  onDelete,
}) => {
  if (!groupedContent || groupedContent.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No lessons to display by module
      </div>
    );
  }

  return (
    <div
      className="space-y-6"
      role="list"
      aria-label="Lessons grouped by module"
    >
      {groupedContent.map(([moduleId, { module, lessons }]) => (
        <div
          key={moduleId}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
          role="listitem"
          aria-label={module ? `Module: ${module.title}` : "Unknown Module"}
        >
          {/* Module Header */}
          <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                  {module ? (
                    <>
                      <span className="text-sm font-mono text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded mr-2">
                        M{module.order || "—"}
                      </span>
                      {module.title}
                    </>
                  ) : (
                    "Unknown Module"
                  )}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {lessons.length} {lessons.length === 1 ? "lesson" : "lessons"}
                </p>
              </div>
              {module && (
                <button
                  onClick={() => onEdit(module)}
                  className="px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  aria-label={`Edit module: ${module.title}`}
                >
                  Edit Module
                </button>
              )}
            </div>
          </div>

          {/* Lessons List */}
          <div
            className="divide-y divide-gray-100 dark:divide-gray-800"
            role="list"
            aria-label={`Lessons in ${module?.title || "Unknown Module"}`}
          >
            {lessons
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map((lesson) => (
                <div
                  key={lesson._id}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  role="listitem"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <span
                        className="text-sm font-mono text-gray-400 w-12"
                        aria-label={`Lesson order: ${lesson.order || "—"}`}
                      >
                        #{lesson.order || "—"}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {lesson.title}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs ${
                              lesson.isPublished
                                ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200"
                                : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400"
                            }`}
                            role="status"
                          >
                            {lesson.isPublished ? "Published" : "Draft"}
                          </span>
                          {lesson.difficulty && (
                            <span className="text-xs">
                              <DifficultyBadge difficulty={lesson.difficulty} />
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          ID: {lesson._id?.slice(-8)} • XP:{" "}
                          {lesson.xpReward || 0}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 ml-4">
                      <PublishToggleButton
                        isPublished={lesson.isPublished}
                        onClick={() =>
                          onTogglePublish(
                            lesson._id,
                            "lesson",
                            lesson.isPublished,
                          )
                        }
                        label={`${lesson.isPublished ? "Unpublish" : "Publish"} ${lesson.title}`}
                      />
                      <ContentActionBar
                        item={lesson}
                        onEdit={onEdit}
                        onDuplicate={onDuplicate}
                        onDelete={onDelete}
                        size="sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default GroupedView;
