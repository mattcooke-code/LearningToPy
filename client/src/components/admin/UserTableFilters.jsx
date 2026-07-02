import { useState, useEffect, useCallback } from "react";
import { Filter, RotateCcw } from "lucide-react";

/**
 * Filter component for user management table with debounced level inputs.
 * Provides account status filtering, role-based filtering, and level range selection.
 *
 * @component
 * @param {Object} props
 * @param {Object} props.filters - Current filter values object
 * @param {string} props.filters.isBlocked - Account status filter ("", "true", "false")
 * @param {string} props.filters.isAdmin - Role filter ("", "true", "false")
 * @param {string} props.filters.levelMin - Minimum level filter
 * @param {string} props.filters.levelMax - Maximum level filter
 * @param {Function} props.setFilters - Function to update filter values: (filters) => void
 * @param {Function} props.onReset - Function to reset all filters to defaults
 * @returns {JSX.Element} User table filters with debounced inputs
 */

const UserTableFilters = ({ filters, setFilters, onReset }) => {
  // Local state to handle the input text smoothly before triggering the API
  const [localLevels, setLocalLevels] = useState({
    levelMin: filters.levelMin || "",
    levelMax: filters.levelMax || "",
  });

  // Sync local state if filters are cleared/reset by the parent component
  useEffect(() => {
    setLocalLevels({
      levelMin: filters.levelMin || "",
      levelMax: filters.levelMax || "",
    });
  }, [filters.levelMin, filters.levelMax]);

  // Debounce logic: Only update the parent state (and trigger API)
  // after the user stops typing for 500ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => {
        if (
          prev.levelMin === localLevels.levelMin &&
          prev.levelMax === localLevels.levelMax
        ) {
          return prev; // No change — skip update
        }
        return {
          ...prev,
          levelMin: localLevels.levelMin,
          levelMax: localLevels.levelMax,
        };
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [localLevels, setFilters]);

  // Instant update for dropdowns
  const handleSelectChange = useCallback((e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleNumericChange = useCallback((e) => {
    const { name, value } = e.target;
    setLocalLevels((prev) => ({ ...prev, [name]: value }));
  }, []);

  const hasActiveFilters = Object.values(filters).some((val) => val !== "");

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <Filter className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>

          <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-tight">
            Filter Directory
          </h2>
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
          <label
            htmlFor="filter-status"
            className="text-[11px] font-bold text-gray-600 dark:text-gray-200 uppercase"
          >
            Account Status
          </label>
          <select
            id="filter-status"
            name="isBlocked"
            value={filters.isBlocked}
            onChange={handleSelectChange}
            className="w-full h-10 px-3 text-sm bg-gray-50 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
          >
            <option value="">All Statuses</option>
            <option value="true">Blocked</option>
            <option value="false">Active</option>
          </select>
        </div>

        {/* Role Filter */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="filter-role"
            className="text-[11px] font-bold text-gray-400 dark:text-gray-200 uppercase"
          >
            Privileges
          </label>
          <select
            id="filter-role"
            name="isAdmin"
            value={filters.isAdmin}
            onChange={handleSelectChange}
            className="w-full h-10 px-3 text-sm bg-gray-50 dark:bg-gray-800 border dark:text-gray-300 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
          >
            <option value="">All Roles</option>
            <option value="true">Admins Only</option>
            <option value="false">Users Only</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="filter-min-level"
            className="text-[11px] font-bold text-gray-600 dark:text-gray-200 uppercase"
          >
            Min Level
          </label>
          <input
            id="filter-min-level"
            type="number"
            name="levelMin"
            min="0"
            value={localLevels.levelMin}
            onChange={handleNumericChange}
            placeholder="0"
            className="w-full h-10 px-3 text-sm bg-gray-50 dark:bg-gray-800 border dark:text-gray-300 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="filter-max-level"
            className="text-[11px] font-bold text-gray-600 dark:text-gray-200 uppercase"
          >
            Max Level
          </label>
          <input
            id="filter-max-level"
            type="number"
            name="levelMax"
            min="0"
            value={localLevels.levelMax}
            onChange={handleNumericChange}
            placeholder="99"
            className="w-full h-10 px-3 text-sm bg-gray-50 dark:bg-gray-800 border dark:text-gray-300 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
          />
        </div>
      </div>
    </div>
  );
};

export default UserTableFilters;
