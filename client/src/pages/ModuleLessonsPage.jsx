// ModuleLessonsPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth, useTheme } from "../context";
import { BackToTopButton, LoadingState, ErrorState } from "../components/ui";
import {
  LessonsList,
  ModuleHeader,
  QuickActions,
} from "../components/module_lesson";
import { apiClient } from "../services";
import { getErrorMessage, calculateModuleLessonProgress } from "../utils";

/**
 * Module lessons listing page that displays all lessons within a specific module.
 * This page provides lesson navigation, progress tracking, and module-specific theming.
 * Requires authentication and includes comprehensive error handling with navigation fallbacks.
 */

/**
 * Module lessons page component displaying individual lesson listings within a module context.
 *
 * This component fetches module and lesson data, calculates progress metrics, applies
 * theme-based styling, and provides navigation between lessons. Includes authentication
 * checks, error handling with navigation fallbacks, and progress-based theming.
 *
 * @component
 * @returns {JSX.Element} Module lessons page with header, lesson list, and quick actions
 *
 * @stateManagement
 * - moduleData: Module information including title and completion status
 * - lessons: Array of lessons within the module
 * - loading: Loading state during data fetch
 * - error: Error state for failed API calls
 *
 * @authenticationFlow
 * - Checks authentication status before data fetching
 * - Redirects to login page if not authenticated
 * - Prevents data fetches during auth loading state
 *
 * @dataProcessing
 * - Calculates lesson completion metrics using calculateModuleLessonProgress
 * - Determines module accent color based on progress using getModuleThemeColor
 * - Processes module quiz completion status for quick actions
 *
 * @errorHandling
 * - Redirects to login if not authenticated
 * - Shows error state with back navigation to modules page
 * - Handles module not found scenario gracefully
 * - Provides empty state button for navigation fallback
 *
 * @theming
 * - Applies dynamic module accent colors based on progress
 * - Uses theme context for consistent styling
 * - Progress-based color calculations for visual feedback
 */
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
        const data = await apiClient.get(
          `/content/modules/${moduleId}/lessons`,
        );
        setModuleData(data.module);
        setLessons(data.lessons);
      } catch (err) {
        setError(
          getErrorMessage(
            err,
            "Failed to load module content. Please try again.",
          ),
        );
      } finally {
        setLoading(false);
      }
    };
    if (moduleId) {
      fetchModuleLessons();
    }
  }, [moduleId]);

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
    <div className="container mx-auto px-4 py-8  ">
      <ModuleHeader
        moduleData={moduleData}
        completedLessons={completedLessons}
        totalLessons={totalLessons}
        moduleLessonProgress={moduleLessonProgress}
        accentColor={moduleAccentColor}
        onBack={() => navigate("/modules")}
      />

      <div className="max-w-4xl mx-auto rounded-lg">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6 px-3 py-3 ">
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
            quizCompleted={moduleData?.quizCompleted}
          />
        )}
      </div>

      <BackToTopButton />
    </div>
  );
};

export default ModuleLessonsPage;
