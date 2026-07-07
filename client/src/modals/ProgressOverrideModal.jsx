// /src/modals/ProgressOverrideModal.jsx
import { useState, useEffect, useMemo, useCallback } from "react";
import { useNotification } from "../context";
import { BaseModal } from "../components/ui";
import { adminApiClient } from "../services";
import {
  BookOpen,
  FileText,
  Check,
  X as XIcon,
  Search,
  Loader2,
  Trophy,
} from "lucide-react";

/**
 * @fileoverview
 * Privileged administrative modal for direct user progress modification and database overrides.
 * This component provides powerful administrative tools to directly modify user progress records,
 * including lesson completion status, module completion, and XP adjustments. Features comprehensive
 * search functionality, bulk operations, and audit trail logging for accountability.
 */

/**
 * Privileged administrative modal for direct user progress modification and database overrides.
 *
 * This component creates a powerful administrative interface for directly modifying user progress
 * records in the database. Features include lesson and module completion toggling, progress
 * search and filtering, bulk operations, and comprehensive audit logging.
 *
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Object} props.user - User object containing user information and progress data
 * @param {Function} props.onClose - Function to close the modal
 * @param {Function} props.onSave - Callback function to refresh parent components after changes
 * @returns {JSX.Element} Administrative progress override interface with direct database modification
 */
const ProgressOverrideModal = ({ isOpen, user, onClose, onSave }) => {
  // State
  const [selectedType, setSelectedType] = useState("lesson");
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState([]);
  const [userProgress, setUserProgress] = useState({
    completedLessons: [],
    completedModules: [],
  });

  const [loading, setLoading] = useState(true);
  const [isSavingId, setIsSavingId] = useState(null);
  const { showToast } = useNotification();

  const fetchData = useCallback(async () => {
    if (!user?._id) return;

    try {
      setLoading(true);
      const [userProgressPayload, lessonsPayload, modulesPayload] =
        await Promise.all([
          adminApiClient.get(`/users/${user._id}/progress`),
          adminApiClient.get("/content/lessons"),
          adminApiClient.get("/content/modules"),
        ]);

      setUserProgress(
        userProgressPayload || { completedLessons: [], completedModules: [] },
      );

      const allItems = [
        ...(lessonsPayload.lessons || []).map((l) => ({
          ...l,
          type: "lesson",
        })),
        ...(modulesPayload.modules || []).map((m) => ({
          ...m,
          type: "module",
        })),
      ];

      setItems(allItems);
    } catch (err) {
      showToast("Failed to load user progress data", "error");
    } finally {
      setLoading(false);
    }
  }, [user?._id, showToast]);

  useEffect(() => {
    if (isOpen) fetchData();
  }, [isOpen, fetchData]);

  const filteredItems = useMemo(() => {
    const lowerQuery = searchQuery.toLowerCase();
    return items.filter((item) => {
      const matchesType = item.type === selectedType;
      const matchesSearch =
        !searchQuery ||
        item.title.toLowerCase().includes(lowerQuery) ||
        item._id.toLowerCase().includes(lowerQuery);
      return matchesType && matchesSearch;
    });
  }, [items, selectedType, searchQuery]);

  const toggleItemCompletion = async (itemId, itemType, currentlyCompleted) => {
    try {
      setIsSavingId(itemId);

      await adminApiClient.patch(`/users/${user._id}/progress`, {
        [itemType === "lesson" ? "lessonId" : "moduleId"]: itemId,
        completed: !currentlyCompleted,
        reason: "Manual override by admin",
      });

      setUserProgress((prev) => {
        const key =
          itemType === "lesson" ? "completedLessons" : "completedModules";
        return {
          ...prev,
          [key]: currentlyCompleted
            ? prev[key].filter((id) => id !== itemId)
            : [...prev[key], itemId],
        };
      });

      showToast(`${itemType} status updated`, "success");
      onSave?.();
    } catch (err) {
      showToast("Failed to override progress", "error");
    } finally {
      setIsSavingId(null);
    }
  };

  // Pre-computed tab classes to work with Tailwind JIT
  const tabs = [
    {
      id: "lesson",
      label: "Lessons",
      icon: FileText,
      count: userProgress.completedLessons?.length || 0,
      activeIconClass: "text-blue-500",
    },
    {
      id: "module",
      label: "Modules",
      icon: BookOpen,
      count: userProgress.completedModules?.length || 0,
      activeIconClass: "text-purple-500",
    },
  ];

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Progress Override: ${user?.username}`}
      description={`Manage lesson and module completion status for ${user?.username}. Changes are immediate and bypass normal progression.`}
      className="max-h-[90vh] w-[92vw] md:w-[85vw] lg:w-[80vw] xl:max-w-5xl"
      size="4xl"
      footer={
        <div className="flex justify-end w-full">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-xl text-sm font-bold hover:opacity-90 transition-opacity focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Close Session
          </button>
        </div>
      }
    >
      {/* Type Tabs */}
      <div
        className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-6"
        role="tablist"
        aria-label="Content type selection"
      >
        {tabs.map((tab) => {
          const TabIcon = tab.icon;
          const isActive = selectedType === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setSelectedType(tab.id)}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                isActive
                  ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <TabIcon
                className={`h-4 w-4 ${isActive ? tab.activeIconClass : ""}`}
                aria-hidden="true"
              />
              <span>{tab.label}</span>
              <span
                className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${
                  isActive
                    ? "bg-gray-100 dark:bg-gray-600"
                    : "bg-gray-200 dark:bg-gray-800"
                }`}
                aria-label={`${tab.count} ${tab.label.toLowerCase()}`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="relative mb-6">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
          aria-hidden="true"
        />
        <label htmlFor="progress-search" className="sr-only">
          Filter {selectedType}s by title or ID
        </label>
        <input
          id="progress-search"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Filter ${selectedType}s by title or ID...`}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
        />
      </div>

      {/* Items List */}
      <div className="min-h-[400px]">
        {loading ? (
          <div
            className="flex flex-col items-center justify-center h-64 space-y-4"
            role="status"
          >
            <Loader2
              className="h-8 w-8 text-blue-500 animate-spin"
              aria-hidden="true"
            />
            <p className="text-sm text-gray-500 animate-pulse font-medium">
              Loading user progress...
            </p>
          </div>
        ) : (
          <div
            id={`panel-${selectedType}`}
            className="grid grid-cols-1 gap-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar"
            tabIndex={0}
            role="region"
            aria-label={`${selectedType} progress list`}
          >
            {filteredItems.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl">
                <Search
                  className="h-10 w-10 text-gray-200 dark:text-gray-700 mx-auto mb-3"
                  aria-hidden="true"
                />
                <p className="text-gray-500 dark:text-gray-400">
                  No results found matching your search
                </p>
              </div>
            ) : (
              filteredItems.map((item) => {
                const isCompleted = (
                  selectedType === "lesson"
                    ? userProgress.completedLessons
                    : userProgress.completedModules
                ).includes(item._id);
                const isSaving = isSavingId === item._id;

                return (
                  <div
                    key={item._id}
                    className={`p-4 border rounded-xl transition-all ${
                      isCompleted
                        ? "bg-green-50/30 border-green-100 dark:bg-green-900/5 dark:border-green-900/30"
                        : "bg-white dark:bg-gray-800/50 border-gray-100 dark:border-gray-700"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center space-x-4 min-w-0">
                        <div
                          className={`h-10 w-10 shrink-0 rounded-lg flex items-center justify-center ${
                            isCompleted
                              ? "bg-green-100 dark:bg-green-900/40"
                              : "bg-gray-100 dark:bg-gray-700"
                          }`}
                          aria-hidden="true"
                        >
                          {selectedType === "lesson" ? (
                            <FileText
                              className={`h-5 w-5 ${
                                isCompleted ? "text-green-600" : "text-gray-400"
                              }`}
                            />
                          ) : (
                            <BookOpen
                              className={`h-5 w-5 ${
                                isCompleted
                                  ? "text-purple-600"
                                  : "text-gray-400"
                              }`}
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-gray-900 dark:text-white truncate text-sm">
                            {item.title}
                          </h3>
                          <div className="flex flex-wrap items-center text-[10px] text-gray-500 dark:text-gray-400 mt-1 gap-2">
                            <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1 rounded uppercase tracking-tighter break-all">
                              ID: {item._id}
                            </span>
                            <div className="flex items-center">
                              <Trophy
                                className="h-3 w-3 mr-1 text-yellow-500"
                                aria-hidden="true"
                              />
                              <span>{item.xpReward || 0} XP</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          toggleItemCompletion(item._id, item.type, isCompleted)
                        }
                        disabled={isSavingId !== null}
                        aria-label={
                          isSaving
                            ? `Saving...`
                            : isCompleted
                              ? `Revoke completion of ${item.title}`
                              : `Mark ${item.title} as completed`
                        }
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center space-x-2 w-full sm:w-32 ${
                          isCompleted
                            ? "bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/40 dark:text-orange-400"
                            : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                        } disabled:opacity-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                      >
                        {isSaving ? (
                          <Loader2
                            className="h-3.5 w-3.5 animate-spin"
                            aria-hidden="true"
                          />
                        ) : isCompleted ? (
                          <>
                            <XIcon className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Revoke</span>
                          </>
                        ) : (
                          <>
                            <Check className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Award</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </BaseModal>
  );
};

/**
 * Shield check icon component for security-related UI elements.
 * Implements a heroicon-style shield with check mark for admin interfaces.
 *
 * @component
 * @param {Object} props - SVG props to pass through
 * @returns {JSX.Element} Shield check SVG icon
 */
const ShieldCheck = (props) => (
  <svg
    {...props}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
  </svg>
);

export default ProgressOverrideModal;
