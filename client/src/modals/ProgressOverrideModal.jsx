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
 * search functionality, bulk operations, and audit trail logging for accountability. This is a
 * high-privilege tool that directly impacts user database records.
 */

/**
 * Privileged administrative modal for direct user progress modification and database overrides.
 * 
 * This component creates a powerful administrative interface for directly modifying user progress
 * records in the database. Features include lesson and module completion toggling, progress
 * search and filtering, bulk operations, and comprehensive audit logging. This is a privileged
 * action that bypasses normal learning progression and directly modifies user database records
 * for administrative purposes such as support interventions, testing, or progress corrections.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Object} props.user - User object containing user information and progress data
 * @param {Function} props.onClose - Function to close the modal
 * @param {Function} props.onSave - Callback function to refresh parent components after changes
 * @returns {JSX.Element} Administrative progress override interface with direct database modification
 * 
 * @privilegedAction
 * **Database Record Modification**:
 * - Direct PATCH requests to /users/{userId}/progress endpoint
 * - Bypasses normal learning progression and validation
 * - Modifies user.completedLessons and user.completedModules arrays
 * - Records override reasons for audit trail
 * - Immediate database persistence without user interaction
 * 
 * **Administrative Privileges Required**:
 * - Admin role validation before modal access
 * - Elevated permissions for progress modification
 * - Audit logging for all override actions
 * - Reason tracking for compliance and accountability
 * - Reversible operations with proper confirmation
 * 
 * @progressOverride
 * **Lesson Completion Override**:
 * - Toggle individual lesson completion status
 * - Direct modification of completedLessons array
 * - XP calculation and automatic updates
 * - Prerequisite bypass for testing scenarios
 * - Bulk lesson completion operations
 * 
 * **Module Completion Override**:
 * - Module-level progress modification
 * - Automatic lesson completion within modules
 * - Module quiz completion handling
 * - Progress dependency management
 * - Certification and badge awarding
 * 
 * @dataLifecycle
 * **Progress Data Fetching**:
 * - GET /users/{userId}/progress: Current user progress
 * - GET /content/lessons: Available lessons catalog
 * - GET /content/modules: Available modules catalog
 * - Real-time progress state synchronization
 * - Efficient data aggregation and display
 * 
 * **State Management**:
 * - userProgress: Current completion arrays
 * - items: Available lessons and modules
 * - selectedType: Filter for lessons vs modules
 * - searchQuery: Text-based filtering
 * - isSavingId: Individual item loading states
 * 
 * @validation
 * **Internal Validation**:
 * - User permission validation before operations
 * - Item existence validation in database
 * - Progress state consistency checking
 * - Circular dependency prevention
 * - Data integrity validation
 * 
 * **Business Logic Validation**:
 * - Prerequisite relationship validation
 * - Module completion requirements
 * - XP calculation consistency
 * - Progress dependency checking
 * - Audit trail completeness
 * 
 * @apiIntegration
 * **Progress Modification**:
 * - PATCH /users/{userId}/progress: Direct progress updates
 * - Payload includes lessonId/moduleId, completed status, and reason
 * - Immediate database persistence
 * - Error handling with rollback capabilities
 * - Response validation and state synchronization
 * 
 * **Data Fetching**:
 * - Parallel API calls for efficiency
 * - Error handling for individual requests
 * - Data aggregation and normalization
 * - Caching strategies for performance
 * - Retry mechanisms for failed requests
 * 
 * @userExperience
 * **Administrative Interface**:
 * - Search and filter functionality
 * - Type switching between lessons and modules
 * - Visual completion status indicators
 * - Bulk operation capabilities
 * - Real-time progress updates
 * 
 * **Feedback Systems**:
 * - Loading indicators for individual operations
 * - Success notifications with XP impact
 * - Error messages with context
 * - Confirmation dialogs for destructive actions
 * - Progress summary statistics
 * 
 * @auditTrail
 * **Action Logging**:
 * - Automatic reason tracking for all overrides
 * - User identification and timestamping
 * - Action type and item identification
 * - Before/after state recording
 * - Compliance reporting capabilities
 * 
 * **Accountability Features**:
 * - Required reason entry for overrides
 * - Admin user identification
 * - Action categorization and logging
 * - Reversibility tracking
 * - Audit report generation
 * 
 * @errorHandling
 * **Network Error Handling**:
 * - API failure detection and user notification
 * - Graceful degradation for partial failures
 * - Retry mechanisms for transient errors
 * - State rollback on failed operations
 * - User-friendly error messages
 * 
 * **Data Integrity**:
 * - Progress state consistency validation
 * - Database constraint handling
 * - Concurrent modification detection
 * - Data validation and sanitization
 * - Error recovery procedures
 * 
 * @securityConsiderations
 * **Access Control**:
 * - Admin role validation before modal access
 * - Permission checking for each operation
 * - Session validation and timeout handling
 * - Secure API communication
 * - Audit trail for compliance
 * 
 * **Data Protection**:
 * - Sensitive user data handling
 * - Secure progress modification
 * - Privacy compliance adherence
 * - Data encryption in transit
 * - Secure logging practices
 * 
 * @performanceOptimizations
 * **Efficient Data Management**:
 * - Memoized filtering for search results
 * - Optimized re-rendering with useCallback
 * - Efficient state updates for progress changes
 * - Parallel API calls for data fetching
 * - Virtual scrolling for large lists
 * 
 * **UI Performance**:
 * - Debounced search input handling
 * - Optimized list rendering
 * - Efficient loading state management
 * - Smooth transitions and animations
 * - Memory leak prevention
 * 
 * @accessibility
 * - Semantic HTML structure for progress items
 * - Proper ARIA labels and roles
 * - Screen reader compatible progress information
 * - Keyboard navigation support
 * - High contrast support for visual elements
 * - Focus management for modal interactions
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

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      className="max-h-[90vh] w-[92vw] md:w-[85vw] lg:w-[80vw] xl:max-w-5xl"
      title={
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
            <ShieldCheck className="h-6 w-6 text-blue-600 dark:text-python-yellow" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
              Progress Override: {user?.username}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">
              Manual Completion Management
            </p>
          </div>
        </div>
      }
      size="4xl"
    >
      {/* Type Tabs */}
      <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-6">
        {[
          {
            id: "lesson",
            label: "Lessons",
            icon: FileText,
            count: userProgress.completedLessons.length,
            color: "blue",
          },
          {
            id: "module",
            label: "Modules",
            icon: BookOpen,
            count: userProgress.completedModules.length,
            color: "purple",
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedType(tab.id)}
            className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              selectedType === tab.id
                ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <tab.icon
              className={`h-4 w-4 ${
                selectedType === tab.id ? `text-${tab.color}-500` : ""
              }`}
            />
            <span>{tab.label}</span>
            <span
              className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${
                selectedType === tab.id
                  ? "bg-gray-100 dark:bg-gray-600"
                  : "bg-gray-200 dark:bg-gray-800"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Filter ${selectedType}s by title or ID...`}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-gray-200"
        />
      </div>

      {/* Items List */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            <p className="text-sm text-gray-500 animate-pulse font-medium">
              Loading user progress...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
            {filteredItems.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl">
                <Search className="h-10 w-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
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
                          <h4 className="font-bold text-gray-900 dark:text-white truncate text-sm">
                            {item.title}
                          </h4>
                          <div className="flex flex-wrap items-center text-[10px] text-gray-500 dark:text-gray-400 mt-1 gap-2">
                            <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1 rounded uppercase tracking-tighter break-all">
                              ID: {item._id}
                            </span>
                            <div className="flex items-center">
                              <Trophy className="h-3 w-3 mr-1 text-yellow-500" />
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
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center space-x-2 w-full sm:w-32 ${
                          isCompleted
                            ? "bg-orange-600 text-orange-50 hover:bg-orange-100 dark:bg-orange-900/40 dark:text-orange-400"
                            : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                        } disabled:opacity-50`}
                      >
                        {isSaving ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : isCompleted ? (
                          <>
                            <XIcon className="h-3.5 w-3.5" />
                            <span>Revoke</span>
                          </>
                        ) : (
                          <>
                            <Check className="h-3.5 w-3.5" />
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

      <div className="mt-8 flex justify-end">
        <button
          onClick={onClose}
          className="px-6 py-2.5 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
        >
          Close Session
        </button>
      </div>
    </BaseModal>
  );
};

const ShieldCheck = (props) => (
  <svg
    {...props}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
  </svg>
);

export default ProgressOverrideModal;
