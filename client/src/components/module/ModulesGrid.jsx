// components/ModulesGrid.jsx
import ModuleCard from "./ModuleCard";

const ModulesGrid = ({ modules }) => {
  if (modules.length === 0) {
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
      {modules.map((module) => (
        <ModuleCard
          key={module._id}
          module={module}
          isLocked={module.isLocked}
        />
      ))}
    </div>
  );
};

export default ModulesGrid;
