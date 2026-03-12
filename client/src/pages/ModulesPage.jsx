// client/src/pages/ModulesPage.jsx
import { useEffect, useState } from "react";
import { apiClient, useAuth } from "../context";
import { BackToTopButton, LoadingState, ErrorState } from "../components/ui";
import { ModulesHeader, ModulesGrid, ModulesStats } from "../components/module";
import { getErrorMessage } from "../utils";

const ModulesPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    fetchModules();
  }, [authLoading]);

  if (loading) return <LoadingState message="Loading your learning path..." />;
  if (error) return <ErrorState error={error} />;

  const safeModules = Array.isArray(modules) ? modules : [];

  const curriculumModules = safeModules.filter((module) => module.order > 0);
  const completedModules = curriculumModules.filter(
    (m) => m.isCompleted,
  ).length;
  const totalModules = curriculumModules.length;

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
        userXP={user?.xp}
      />

      <BackToTopButton />
    </div>
  );
};

export default ModulesPage;
