// ModuleLessonsPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiClient, useAuth, useTheme } from "../context";
import { BackToTopButton, LoadingState, ErrorState } from "../components/ui";
import {
  LessonItem,
  LessonsList,
  ModuleHeader,
  ProgressCircle,
  QuickActions,
} from "../components/module_lesson";
import { getErrorMessage, calculateModuleLessonProgress } from "../utils";

const ModuleLessonsPage = () => {
  // HOOKS & STATE
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { getModuleThemeColor } = useTheme();

  const [moduleData, setModuleData] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // DATA FETCHING
  useEffect(() => {
    if (authLoading || !isAuthenticated) {
      if (!authLoading && !isAuthenticated) {
        navigate("/login");
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
        setError(
          getErrorMessage(
            err,
            "Failed to load module content. Please try again."
          )
        );
      } finally {
        setLoading(false);
      }
    };
    if (moduleId) {
      fetchModuleLessons();
    }
  }, [moduleId, isAuthenticated, authLoading, navigate]);

  const { completedLessons, totalLessons, moduleLessonProgress } =
    calculateModuleLessonProgress(lessons);
  const moduleAccentColor = getModuleThemeColor(moduleLessonProgress);

  if (loading) return <LoadingState message="Loading module content..." />;
  if (error)
    return <ErrorState error={error} onBack={() => navigate("/modules")} />;
  if (!moduleData)
    return (
      <ErrorState
        error="Module not found"
        onBack={() => navigate("/modules")}
      />
    );

  const emptyStateButton = (
    <button
      onClick={() => navigate("/modules")}
      className="bg-python-blue text-white px-6 py-2 rounded-lg hover:bg-python-dark transition"
    >
      Back to Modules
    </button>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <ModuleHeader
        moduleData={moduleData}
        completedLessons={completedLessons}
        totalLessons={totalLessons}
        moduleLessonProgress={moduleLessonProgress}
        accentColor={moduleAccentColor}
        onBack={() => navigate("/modules")}
      />

      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Lessons in this Module
        </h2>

        <LessonsList
          lessons={lessons}
          moduleId={moduleId}
          accentColor={moduleAccentColor}
          emptyState={emptyStateButton}
        />

        {lessons.length > 0 && (
          <QuickActions
            lessons={lessons}
            moduleId={moduleId}
            accentColor={moduleAccentColor}
            onBackToModules={() => navigate("/modules")}
          />
        )}
      </div>

      <BackToTopButton />
    </div>
  );
};

export default ModuleLessonsPage;
