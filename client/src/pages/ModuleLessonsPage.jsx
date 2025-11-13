// client/src/pages/ModuleLessonsPage.jsx
import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { apiClient, useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  BookOpen,
  CheckCircle,
  PlayCircle,
  Clock,
  ArrowLeft,
  Lock,
  Star,
  ChevronRight,
} from "lucide-react";

const LessonItem = ({ lesson, moduleId, isLocked, accentColor }) => {
  const resolvedAccent = accentColor || "#3776AB";

  return (
    <div
      className={`
      bg-white rounded-lg shadow-md border-2 p-4 transition-all duration-300
      ${
        isLocked
          ? "border-gray-200 opacity-60"
          : "border-transparent hover:shadow-lg hover:scale-102"
      }
    `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          {/* Lesson Status Icon */}
          <div
            className={`p-2 rounded-full ${
              lesson.isCompleted
                ? "bg-green-100 text-green-600"
                : isLocked
                ? "bg-gray-100 text-gray-400"
                : "bg-blue-100"
            }`}
            style={
              !lesson.isCompleted && !isLocked
                ? { backgroundColor: `${resolvedAccent}20`, color: resolvedAccent }
                : {}
            }
          >
            {lesson.isCompleted ? (
              <CheckCircle size={20} />
            ) : isLocked ? (
              <Lock size={20} />
            ) : (
              <PlayCircle size={20} />
            )}
          </div>

          {/* Lesson Content */}
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800">
              {lesson.order}. {lesson.title}
            </h3>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {lesson.shortDescription}
            </p>

            {/* Lesson Metadata */}
            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <Clock size={12} />
                <span>{lesson.duration} min</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star size={12} />
                <span>{lesson.xpReward} XP</span>
              </div>
              <span className="capitalize px-2 py-1 bg-gray-100 rounded-full">
                {lesson.contentType}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="ml-4">
          {isLocked ? (
            <button disabled className="text-gray-400 p-2 cursor-not-allowed">
              <Lock size={20} />
            </button>
          ) : (
            <Link
              to={`/lessons/${lesson._id}`}
              className="flex items-center space-x-2 text-white py-2 px-4 rounded-lg font-semibold hover:opacity-90 transition"
              style={{ backgroundColor: resolvedAccent }}
            >
              <span>{lesson.isCompleted ? "Review" : "Start"}</span>
              <ChevronRight size={16} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

const ModuleLessonsPage = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { getModuleThemeColor } = useTheme();

  const [moduleData, setModuleData] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading || !isAuthenticated) {
      if (!authLoading && !isAuthenticated) {
      }
      return;
    }
    const fetchModuleLessons = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(
          `/content/modules/${moduleId}/lessons`
        );
        setModuleData(response.data.data.module);
        setLessons(response.data.data.lessons);
      } catch (err) {
        console.error("Failed to fetch module lessons:", err);
        if (err.response && err.response.status === 401) {
          setError(
            "Your session expired. Please refresh the page or log back in."
          );
        } else {
          setError("Failed to load module content. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (moduleId) {
      fetchModuleLessons();
    }
  }, [moduleId, isAuthenticated, authLoading]);

  // Calculate module progress
  const completedLessons = lessons.filter(
    (lesson) => lesson.isCompleted
  ).length;
  const totalLessons = lessons.length;
  const moduleProgress =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const moduleAccentColor = getModuleThemeColor(moduleProgress);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-python-blue mx-auto mb-4"></div>
            <p className="text-gray-600">Loading module content...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => navigate("/modules")}
            className="mt-4 bg-python-blue text-white px-4 py-2 rounded-lg hover:bg-python-dark transition"
          >
            Back to Modules
          </button>
        </div>
      </div>
    );
  }

  if (!moduleData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Module Not Found
          </h2>
          <button
            onClick={() => navigate("/modules")}
            className="bg-python-blue text-white px-4 py-2 rounded-lg hover:bg-python-dark transition"
          >
            Back to Modules
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with Back Button */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/modules")}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition mb-4"
        >
          <ArrowLeft size={20} />
          <span>Back to Modules</span>
        </button>

        {/* Module Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="text-4xl" style={{ color: moduleAccentColor }}>
                {moduleData.icon || "📚"}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  {moduleData.title}
                </h1>
                <p className="text-gray-600 text-lg">
                  {moduleData.description}
                </p>
              </div>
            </div>

            {/* Progress Circle */}
            <div className="text-center">
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                      stroke={moduleAccentColor}
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={226.2}
                    strokeDashoffset={226.2 - (moduleProgress / 100) * 226.2}
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className="text-lg font-bold"
                    style={{ color: moduleAccentColor }}
                  >
                    {moduleProgress}%
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {completedLessons}/{totalLessons} lessons
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Module Progress</span>
              <span>{moduleProgress}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="h-3 rounded-full transition-all duration-500"
                style={{
                  width: `${moduleProgress}%`,
                    backgroundColor: moduleAccentColor,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Lessons List */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Lessons in this Module
        </h2>

        <div className="space-y-4">
          {lessons.map((lesson) => (
            <LessonItem
              key={lesson._id}
              lesson={lesson}
              moduleId={moduleId}
              isLocked={false} // You can implement prerequisite logic here later
                accentColor={moduleAccentColor}
            />
          ))}
        </div>

        {/* Empty State */}
        {lessons.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <BookOpen size={64} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No lessons available yet
            </h3>
            <p className="text-gray-500 mb-6">
              Lessons for this module are being prepared.
            </p>
            <button
              onClick={() => navigate("/modules")}
              className="bg-python-blue text-white px-6 py-2 rounded-lg hover:bg-python-dark transition"
            >
              Back to Modules
            </button>
          </div>
        )}

        {/* Quick Actions */}
        {lessons.length > 0 && (
          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Ready to continue?
            </h3>
            <div className="flex flex-wrap gap-4">
              {lessons.find((lesson) => !lesson.isCompleted) ? (
                <Link
                  to={`/lessons/${
                    lessons.find((lesson) => !lesson.isCompleted)._id
                  }`}
                  className="flex items-center space-x-2 text-white py-3 px-6 rounded-lg font-semibold hover:opacity-90 transition"
                  style={{ backgroundColor: moduleAccentColor }}
                >
                  <PlayCircle size={20} />
                  <span>Continue with Next Lesson</span>
                </Link>
              ) : (
                <div className="text-green-600 font-semibold">
                  🎉 All lessons completed! Great job!
                </div>
              )}

              <Link
                to="/modules"
                className="flex items-center space-x-2 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                <span>Back to All Modules</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModuleLessonsPage;
