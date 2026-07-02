// ContentStats.jsx
import { FileText, BookOpen, Eye, Clock } from "lucide-react";

const StatCard = ({ icon: Icon, value, label, sublabel, color, subColor }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6 text-center">
    <div className="flex flex-col items-center">
      <div
        className={`h-10 w-10 md:h-12 md:w-12 rounded-full bg-${color}-100 dark:bg-${color}-900 flex items-center justify-center mb-2 md:mb-3`}
      >
        <Icon
          className={`h-5 w-5 md:h-6 md:w-6 text-${color}-600 dark:text-${color}-400`}
          aria-hidden="true"
        />
      </div>
      <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
        {value}
      </h3>
      <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
        {label}
      </p>
      {sublabel && (
        <p
          className={`text-xs text-${subColor}-700 dark:text-${subColor}-400 mt-1 font-medium`}
        >
          {sublabel}
        </p>
      )}
    </div>
  </div>
);

export const ContentStats = ({ stats, moduleRange }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
    <h2 className="sr-only">Content Statistics</h2>

    <StatCard
      icon={FileText}
      value={stats.totalLessons}
      label="Total Lessons"
      color="blue"
    />

    <StatCard
      icon={BookOpen}
      value={stats.totalModules}
      label="Total Modules"
      color="purple"
      sublabel={stats.totalModules > 0 ? moduleRange : undefined}
      subColor="gray"
    />

    <StatCard
      icon={Eye}
      value={stats.publishedLessons + stats.publishedModules}
      label="Published Total"
      color="green"
      sublabel={`${stats.publishedLessons}/${stats.publishedModules} (L/M)`}
      subColor="green"
    />

    <StatCard
      icon={Clock}
      value={stats.draftLessons + stats.draftModules}
      label="Drafts"
      color="yellow"
      sublabel="Ready for review"
      subColor="yellow"
    />
  </div>
);
