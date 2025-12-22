// UserTableFilters.jsx
import { Filter, RotateCcw } from "lucide-react";

const UserTableFilters = ({ filters, setFilters, onReset }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const hasActiveFilters = Object.values(filters).some((val) => val !== "");

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <Filter className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-tight">
            Filter Directory
          </h3>
        </div>

        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="group flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-orange-600 transition-colors"
          >
            <RotateCcw className="h-3 w-3 group-hover:rotate-[-45deg] transition-transform" />
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Status Filter */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold text-gray-400 uppercase">
            Account Status
          </label>
          <select
            name="isBlocked"
            value={filters.isBlocked}
            onChange={handleChange}
            className="w-full h-10 px-3 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
          >
            <option value="">All Statuses</option>
            <option value="true">Blocked</option>
            <option value="false">Active</option>
          </select>
        </div>

        {/* Role Filter */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold text-gray-400 uppercase">
            Privileges
          </label>
          <select
            name="isAdmin"
            value={filters.isAdmin}
            onChange={handleChange}
            className="w-full h-10 px-3 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
          >
            <option value="">All Roles</option>
            <option value="true">Admins Only</option>
            <option value="false">Users Only</option>
          </select>
        </div>

        {/* Level Filters */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold text-gray-400 uppercase">
            Min Level
          </label>
          <input
            type="number"
            name="levelMin"
            min="0"
            value={filters.levelMin}
            onChange={handleChange}
            placeholder="0"
            className="w-full h-10 px-3 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold text-gray-400 uppercase">
            Max Level
          </label>
          <input
            type="number"
            name="levelMax"
            min="0"
            value={filters.levelMax}
            onChange={handleChange}
            placeholder="99"
            className="w-full h-10 px-3 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
          />
        </div>
      </div>
    </div>
  );
};

export default UserTableFilters;
