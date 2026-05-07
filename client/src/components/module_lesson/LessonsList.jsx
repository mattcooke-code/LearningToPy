import { BookOpen } from "lucide-react";
import LessonItem from "./LessonItem";

/**
 * Container component that renders either a list of lessons or an empty state.
 * @component
 * @param {Object} props
 * @param {Array} props.lessons - Array of lesson objects to display
 * @param {string} props.moduleId - Parent module identifier
 * @param {string} props.accentColor - Theme color for lesson items
 * @param {React.ReactNode} [props.emptyState] - Optional custom empty state component
 */

const LessonsList = ({ lessons, moduleId, accentColor, emptyState }) => {
  if (lessons.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-700 rounded-lg shadow-md">
        <BookOpen size={64} className="text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
          No lessons available yet
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Lessons for this module are being prepared.
        </p>
        {emptyState}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {lessons.map((lesson) => (
        <LessonItem
          key={lesson._id}
          lesson={lesson}
          moduleId={moduleId}
          isLocked={false}
          accentColor={accentColor}
        />
      ))}
    </div>
  );
};

export default LessonsList;