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

const ModulesPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userProgress, setUserProgress] = useState(null);

  useEffect(() => {
    if (authLoading) return;

    const fetchData = async () => {
      setError(null);

      const [modulesResult, progressResult] = await Promise.allSettled([
        apiClient.get("/content/modules"),
        apiClient.get("/progress/current"),
      ]);

      if (modulesResult.status === "fulfilled") {
        setModules(modulesResult.value || []);
      } else {
        setError(
          getErrorMessage(modulesResult.reason, "Failed to load modules."),
        );
      }

      if (progressResult.status === "fulfilled") {
        setUserProgress(progressResult.value);
      }

      setLoading(false);
    };

    fetchData();
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
    <div className="container mx-auto px-4 py-8">
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
