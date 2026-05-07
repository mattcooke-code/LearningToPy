// client/src/pages/ModulesPage.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../context";
import { BackToTopButton, LoadingState, ErrorState } from "../components/ui";
import { ModulesHeader, ModulesGrid, ModulesStats } from "../components/module";
import { apiClient } from "../services";
import { getErrorMessage } from "../utils";

/**
 * @fileoverview
 * Main modules listing page that displays all available course modules with user progress tracking.
 * This page serves as the primary navigation hub for the learning curriculum, showing module completion
 * status, user XP, and progress statistics. Implements parallel data fetching for modules and user progress
 * with comprehensive error handling and loading states.
 */

/**
 * Modules listing page component displaying the complete course curriculum with progress tracking.
 * 
 * This component fetches and displays all available modules, filters curriculum modules from
 * administrative ones, calculates completion statistics, and shows user progress. Provides
 * the main entry point for users to navigate through their learning journey.
 * 
 * @component
 * @returns {JSX.Element} Modules listing page with header, grid, and statistics
 * 
 * @stateManagement
 * - modules: Array of all modules fetched from API
 * - loading: Loading state during data fetch
 * - error: Error state for failed API calls
 * - userProgress: User's current progress data including XP
 * 
 * @dataFlow
 * 1. Waits for authentication to complete before fetching
 * 2. Parallel fetch of modules data and user progress
 * 3. Filters curriculum modules (order > 0) from admin modules
 * 4. Calculates completion statistics and XP display
 * 5. Passes processed data to child components
 * 
 * @errorHandling
 * - Shows LoadingState during data fetching
 * - Displays ErrorState with retry functionality on API failures
 * - Graceful fallback for missing module data
 * - Safe array handling with Array.isArray checks
 * 
 * @dataProcessing
 * - Filters curriculum modules using order > 0 criteria
 * - Calculates completed modules count
 * - Determines XP display priority (progress.xp > user.xp > 0)
 * - Safe array operations to prevent runtime errors
 */
const ModulesPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userProgress, setUserProgress] = useState(null);

  useEffect(() => {
    if (authLoading) return;

    const fetchModules = async () => {
      try {
        setLoading(true);
        const moduleData = await apiClient.get("/content/modules");
        setModules(moduleData || []);
      } catch (err) {
        setError(
          getErrorMessage(err, "Failed to load modules. Please try again."),
        );
      } finally {
        setLoading(false);
      }
    };

    const fetchProgress = async () => {
      try {
        const progressData = await apiClient.get("/progress/current");
        setUserProgress(progressData);
      } catch (err) {
        console.error("Failed to fetch progress:", err);
      }
    };

    fetchModules();
    fetchProgress();
  }, [authLoading]);

  if (loading) return <LoadingState message="Loading your learning path..." />;
  if (error) return <ErrorState error={error} />;

  const safeModules = Array.isArray(modules) ? modules : [];

  const curriculumModules = safeModules.filter((module) => module.order > 0);
  const completedModules = curriculumModules.filter(
    (m) => m.isCompleted,
  ).length;
  const totalModules = curriculumModules.length;

  const displayXP = userProgress?.xp ?? user?.xp ?? 0;

  return (
    <div className="container mx-auto px-4 py-8 ">
      <ModulesHeader
        completedModules={completedModules}
        totalModules={totalModules}
      />

      <ModulesGrid modules={modules} />

      <ModulesStats
        totalModules={totalModules}
        completedModules={completedModules}
        userXP={displayXP}
      />

      <BackToTopButton />
    </div>
  );
};

export default ModulesPage;
