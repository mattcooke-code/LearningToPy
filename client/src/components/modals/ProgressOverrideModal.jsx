// ProgressOverrideModal.jsx
import { useState, useEffect } from "react";
import { adminApiClient, useNotification } from "../../context";
import BaseModal from "./BaseModal";
import { BookOpen, FileText, Check, X as XIcon, Search } from "lucide-react";

const ProgressOverrideModal = ({ user, onClose, onSave }) => {
  const [selectedType, setSelectedType] = useState("lesson");
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [userProgress, setUserProgress] = useState({
    completedLessons: [],
    completedModules: [],
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useNotification();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = items.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item._id.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems(items);
    }
  }, [searchQuery, items]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch User's Progress
      const userRes = await adminApiClient.get(`/users/${user._id}/progress`);
      setUserProgress(
        userRes.data.data || { completedLessons: [], completedModules: [] }
      );

      // Fetch all lessons and modules
      const [lessonsRes, modulesRes] = await Promise.all([
        adminApiClient.get("/content/lessons"),
        adminApiClient.get("/content/modules"),
      ]);

      const allItems = [
        ...(lessonsRes.data.data?.lessons || []).map((lesson) => ({
          ...lesson,
          type: "lesson",
        })),
        ...(modulesRes.data.data?.modules || []).map((module) => ({
          ...module,
          type: "module",
        })),
      ];

      setItems(allItems);
      setFilteredItems(allItems);
    } catch (err) {
      showToast("Failed to load content", "error");
    } finally {
      setLoading(false);
    }
  };

  const toggleItemCompletion = async (itemId, itemType, currentlyCompleted) => {
    try {
      setIsSaving(true);

      await adminApiClient.patch(`/users/${user._id}/progress`, {
        [itemType === "lesson" ? "lessonId" : "moduleId"]: itemId,
        completed: !currentlyCompleted,
        reason: "Manual override by admin",
      });

      // Update local state
      if (itemType === "lesson") {
        setUserProgress((prev) => ({
          ...prev,
          completedLessons: currentlyCompleted
            ? prev.completedLessons.filter((id) => id !== itemId)
            : [...prev.completedLessons, itemId],
        }));
      } else {
        setUserProgress((prev) => ({
          ...prev,
          completedModules: currentlyCompleted
            ? prev.completedModules.filter((id) => id !== itemId)
            : [...prev.completedModules, itemId],
        }));
      }

      showToast("Progress updated", "success");
    } catch (err) {
      showToast("Failed to update progress", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const currentItems = filteredItems.filter(
    (item) => item.type === selectedType
  );
  const completedItems =
    selectedType === "lesson"
      ? userProgress.completedLessons
      : userProgress.completedModules;

  return (
    <BaseModal
      isOpen={true}
      onClose={onClose}
      title={
        <div>
          <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-white">
            Edit Progress for {user.username}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Override lesson and module completion status
          </p>
        </div>
      }
      size="4xl"
    >
      {/* Type selector */}
      <div className="mb-6">
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedType("lesson")}
            className={`flex-1 px-4 py-3 rounded-lg border transition-colors ${
              selectedType === "lesson"
                ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                : "bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <FileText className="h-5 w-5" />
              <span className="font-medium">Lessons</span>
              <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full">
                {userProgress.completedLessons.length} completed
              </span>
            </div>
          </button>
          <button
            onClick={() => setSelectedType("module")}
            className={`flex-1 px-4 py-3 rounded-lg border transition-colors ${
              selectedType === "module"
                ? "bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800 text-purple-700 dark:text-purple-300"
                : "bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span className="font-medium">Modules</span>
              <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200 rounded-full">
                {userProgress.completedModules.length} completed
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder={`Search ${selectedType}s...`}
          />
        </div>
      </div>

      {/* Items list */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {currentItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                No {selectedType}s found
                {searchQuery && ` matching "${searchQuery}"`}
              </p>
            </div>
          ) : (
            currentItems.map((item) => {
              const isCompleted = completedItems.includes(item._id);
              return (
                <div
                  key={item._id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        isCompleted
                          ? "bg-green-100 dark:bg-green-900"
                          : "bg-gray-100 dark:bg-gray-700"
                      }`}
                    >
                      {selectedType === "lesson" ? (
                        <FileText
                          className={`h-5 w-5 ${
                            isCompleted
                              ? "text-green-600 dark:text-green-400"
                              : "text-gray-500 dark:text-gray-400"
                          }`}
                        />
                      ) : (
                        <BookOpen
                          className={`h-5 w-5 ${
                            isCompleted
                              ? "text-purple-600 dark:text-purple-400"
                              : "text-gray-500 dark:text-gray-400"
                          }`}
                        />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {item.title}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        ID: {item._id} • {item.xpReward || 0} XP
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        isCompleted
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {isCompleted ? "Completed" : "Not Completed"}
                    </span>
                    <button
                      onClick={() =>
                        toggleItemCompletion(item._id, item.type, isCompleted)
                      }
                      disabled={isSaving}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isCompleted
                          ? "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
                          : "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800"
                      } disabled:opacity-50`}
                    >
                      {isSaving ? (
                        "Updating..."
                      ) : isCompleted ? (
                        <span className="flex items-center">
                          <XIcon className="h-4 w-4 mr-1" />
                          Mark Incomplete
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <Check className="h-4 w-4 mr-1" />
                          Mark Complete
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 -mx-6 -mb-4 px-6 py-4 rounded-b-2xl">
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </BaseModal>
  );
};

export default ProgressOverrideModal;
