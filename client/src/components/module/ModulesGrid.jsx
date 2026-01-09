// components/module/ModulesGrid.jsx
import ModuleCard from "./ModuleCard";
import { BookOpen, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useTutorial } from "../../hooks";

const ModulesGrid = ({ modules = [] }) => {
  const { hasCompletedTutorial } = useTutorial();
  const safeModules = Array.isArray(modules) ? modules : [];

  if (safeModules.length === 0 && hasCompletedTutorial) {
    return (
      <div className="text-center py-12">
        <BookOpen size={64} className="text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">
          No modules available yet
        </h3>
        <p className="text-gray-500">
          Learning content is being prepared. Check back soon!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {/* Getting Started Card - Show only if tutorial not completed */}
      {!hasCompletedTutorial && (
        <div className="border-2 border-dashed border-yellow-400 rounded-xl p-6 bg-yellow-50 dark:bg-yellow-900/20 hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center text-2xl">
              <Sparkles className="text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Getting Started</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Platform tutorial
              </p>
            </div>
          </div>

          <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm">
            Learn how to use the code editor, terminal, and platform features
            before diving into lessons.
          </p>

          <div className="space-y-2 mb-6">
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
              Code editor walkthrough
            </div>
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
              Python terminal basics
            </div>
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
              Platform navigation guide
            </div>
          </div>

          <Link
            to="/getting-started"
            className="block w-full text-center py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors"
          >
            Start Tutorial →
          </Link>
        </div>
      )}

      {/* Regular modules */}
      {safeModules.map((module) => (
        <ModuleCard
          key={module._id || module.id}
          module={module}
          isLocked={module.isLocked}
        />
      ))}
    </div>
  );
};

export default ModulesGrid;
