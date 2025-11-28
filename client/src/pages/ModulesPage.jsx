// client/src/pages/ModulesPage.jsx
import { useEffect, useState } from "react";
import { apiClient, useAuth } from "../context";
import { BackToTopButton, LoadingState, ErrorState } from "../components/ui";
import { ModulesHeader, ModulesGrid, ModulesStats } from "../components/module";
import { getErrorMessage } from "../utils/getErrorMessage";

const ModulesPage = () => {
  const { user } = useAuth();
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
        setError(
          getErrorMessage(err, "Failed to load modules. Please try again.")
        );
      } finally {
        setLoading(false);
      }
    };
    fetchModules();
  }, []);

  if (loading) return <LoadingState message="Loading your learning path..." />;
  if (error) return <ErrorState error={error} />;

  const completedModules = modules.filter(
    (module) => module.isCompleted
  ).length;
  const totalModules = modules.length;

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
