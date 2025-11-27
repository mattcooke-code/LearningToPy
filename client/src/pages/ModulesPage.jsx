// client/src/pages/ModulesPage.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiClient, useAuth, useTheme } from "../context";
import { BackToTopButton } from "../components/ui";
import {
  BookOpen,
  Lock,
  CheckCircle,
  PlayCircle,
  Clock,
  Star,
} from "lucide-react";

const ModuleCard = ({ module, isLocked }) => {
  const { themeColor } = useTheme();

  return (
    <div
      className={`
      relative bg-white rounded-xl shadow-lg border-2 p-6 transition-all duration-300
      ${
        isLocked
          ? "border-gray-300 opacity-60"
          : "border-transparent hover:shadow-xl hover:scale-105"
      }
    `}
    >
      {/* Lock Icon for locked modules */}
      {isLocked && (
        <div className="absolute -top-3 -right-3 bg-gray-500 text-white p-2 rounded-full">
          <Lock size={20} />
        </div>
      )}

      {/* Completed Badge */}
      {module.isCompleted && (
        <div className="absolute -top-3 -right-3 bg-green-500 text-white p-2 rounded-full">
          <CheckCircle size={20} />
        </div>
      )}

      {/* Module Icon */}
      <div className="text-4xl mb-4 text-center" style={{ color: themeColor }}>
        {module.icon || "📚"}
      </div>

      {/* Module Title */}
      <h3 className="text-xl font-bold text-gray-800 text-center mb-2">
        {module.title}
      </h3>

      {/* Short Description */}
      <p className="text-gray-600 text-sm text-center mb-4 line-clamp-2">
        {module.shortDescription}
      </p>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Progress</span>
          <span>{module.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all duration-500"
            style={{
              width: `${module.progress}%`,
              backgroundColor: themeColor,
            }}
          ></div>
        </div>
      </div>

      {/* Module Stats */}
      <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
        <div className="flex items-center space-x-1">
          <Clock size={14} />
          <span>{module.estimatedHours}h</span>
        </div>
        <div className="flex items-center space-x-1">
          <BookOpen size={14} />
          <span>{module.lessonCount} lessons</span>
        </div>
        <div className="flex items-center space-x-1">
          <Star size={14} />
          <span>{module.xpReward} XP</span>
        </div>
      </div>

      {/* Action Button */}
      {isLocked ? (
        <button
          disabled
          className="w-full bg-gray-300 text-gray-500 py-2 px-4 rounded-lg font-semibold cursor-not-allowed"
        >
          Complete Prerequisites
        </button>
      ) : module.isCompleted ? (
        <Link
          to={`/modules/${module._id}/lessons`}
          className="w-full bg-green-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-600 transition flex items-center justify-center space-x-2"
        >
          <CheckCircle size={16} />
          <span>Review</span>
        </Link>
      ) : (
        <Link
          to={`/modules/${module._id}/lessons`}
          className="w-full text-white py-2 px-4 rounded-lg font-semibold hover:opacity-90 transition flex items-center justify-center space-x-2"
          style={{ backgroundColor: themeColor }}
        >
          <PlayCircle size={16} />
          <span>{module.progress > 0 ? "Continue" : "Start Learning"}</span>
        </Link>
      )}
    </div>
  );
};

const ModulesPage = () => {
  const { user } = useAuth();
  const { themeColor } = useTheme();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get("/content/modules");
        setModules(response.data.data);
      } catch (err) {
        console.error("Failed to fetch modules:", err);
        if (err.response?.status === 401) {
          setError("Your session has expired. Please log in again.");
        } else {
          setError("Failed to load modules. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-python-blue mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your learning path...</p>
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
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const completedModules = modules.filter(
    (module) => module.isCompleted
  ).length;
  const totalModules = modules.length;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Your Learning Path
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Master Python step by step. Complete modules in order to unlock
          advanced topics and earn XP along the way!
        </p>

        {/* Progress Overview */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Overall Progress
            </span>
            <span className="text-sm font-bold" style={{ color: themeColor }}>
              {totalModules > 0
                ? Math.round((completedModules / totalModules) * 100)
                : 0}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="h-3 rounded-full transition-all duration-500"
              style={{
                width: `${
                  totalModules > 0 ? (completedModules / totalModules) * 100 : 0
                }}%`,
                backgroundColor: themeColor,
              }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {completedModules} of {totalModules} modules completed
          </p>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {modules.map((module) => (
          <ModuleCard
            key={module._id}
            module={module}
            isLocked={module.isLocked}
          />
        ))}
      </div>

      {/* Empty State */}
      {modules.length === 0 && (
        <div className="text-center py-12">
          <BookOpen size={64} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No modules available yet
          </h3>
          <p className="text-gray-500">
            Learning content is being prepared. Check back soon!
          </p>
        </div>
      )}

      {/* Quick Stats */}
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-2xl font-bold" style={{ color: themeColor }}>
              {totalModules}
            </div>
            <div className="text-gray-600">Total Modules</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-500">
              {completedModules}
            </div>
            <div className="text-gray-600">Completed</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-python-yellow">
              {user?.xp || 0}
            </div>
            <div className="text-gray-600">Total XP</div>
          </div>
        </div>
        <BackToTopButton />
      </div>
    </div>
  );
};

export default ModulesPage;
