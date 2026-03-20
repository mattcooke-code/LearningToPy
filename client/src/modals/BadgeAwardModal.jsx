import { useState, useEffect } from "react";
import { adminApiClient, useNotification } from "../context";
import { BaseModal } from "../components/ui";
import { Search, Award, Loader2, Check, X } from "lucide-react";
import { BADGE_DEFINITIONS_CORE } from "../../../shared/constants/badgeDefinitions";

const BadgeAwardModal = ({ isOpen, user, onClose, onSave }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBadges, setSelectedBadges] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { showToast } = useNotification();

  // Fetch user's current badges
  useEffect(() => {
    if (isOpen && user?._id) {
      fetchUserBadges();
    }
  }, [isOpen, user]);

  const fetchUserBadges = async () => {
    setLoading(true);
    try {
      const response = await adminApiClient.get(`/users/${user._id}/badges`);
      setUserBadges(response?.badges || []);
    } catch (err) {
      showToast("Failed to load user badges", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredBadges = BADGE_DEFINITIONS_CORE.filter(
    (badge) =>
      badge.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      badge.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      badge.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const isBadgeEarned = (badgeId) => userBadges.includes(badgeId);
  const isSelected = (badgeId) => selectedBadges.includes(badgeId);

  const handleToggleBadge = (badgeId) => {
    setSelectedBadges((prev) =>
      prev.includes(badgeId)
        ? prev.filter((id) => id !== badgeId)
        : [...prev, badgeId],
    );
  };

  const handleAwardBadges = async () => {
    if (selectedBadges.length === 0) return;

    setSaving(true);
    try {
      await adminApiClient.post(`/users/${user._id}/badges/award`, {
        badgeIds: selectedBadges,
        reason: "Manually awarded by admin",
      });

      showToast(
        `Successfully awarded ${selectedBadges.length} badge(s)`,
        "success",
      );
      onSave?.();
      onClose();
    } catch (err) {
      showToast(err.response?.message || "Failed to award badges", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveBadges = async (badgeIds) => {
    setSaving(true);
    try {
      await adminApiClient.post(`/users/${user._id}/badges/remove`, {
        badgeIds,
        reason: "Manually removed by admin",
      });

      showToast(`Successfully removed ${badgeIds.length} badge(s)`, "success");
      await fetchUserBadges(); // Refresh the list
      setSelectedBadges([]); // Clear selection
    } catch (err) {
      showToast("Failed to remove badges", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-yellow-100 dark:bg-yellow-900/40 flex items-center justify-center">
            <Award className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Manage Badges: {user?.username}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Award or remove achievement badges
            </p>
          </div>
        </div>
      }
      size="4xl"
    >
      {user && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/40 flex items-center justify-center text-xl">
              {user.username?.charAt(0)?.toUpperCase() || "U"}
            </div>
          </div>
          <h4 className="font-semibold text-gray-900 dark:text-white">
            {user.username}
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {user.email} • Level {user.level} • {user.xp} XP
          </p>
        </div>
      )}

      {/* Search and Stats */}
      <div className="mb-6">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search badges by name, description, or category..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-yellow-500 outline-none"
          />
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Earned: {userBadges.length} / {BADGE_DEFINITIONS_CORE.length}
          </span>
          {selectedBadges.length > 0 && (
            <button
              onClick={() => handleAwardBadges()}
              disabled={saving}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-semibold hover:bg-yellow-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Award className="h-4 w-4" />
              )}
              <span>Award Selected ({selectedBadges.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Badges Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-96">
          <Loader2 className="h-8 w-8 text-yellow-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto p-1">
          {filteredBadges.map((badge) => {
            const earned = isBadgeEarned(badge.id);
            const selected = isSelected(badge.id);

            return (
              <div
                key={badge.id}
                className={`relative p-4 border rounded-xl transition-all ${
                  earned
                    ? "bg-green-50/30 border-green-200 dark:bg-green-900/10 dark:border-green-800"
                    : selected
                      ? "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/10 dark:border-yellow-800"
                      : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-yellow-300"
                }`}
              >
                <div className="flex items-start space-x-4">
                  {/* Badge Icon Placeholder */}
                  <div
                    className={`h-12 w-12 rounded-lg flex items-center justify-center text-2xl ${
                      earned
                        ? "bg-green-100 dark:bg-green-900/40"
                        : "bg-gray-100 dark:bg-gray-700"
                    }`}
                  >
                    {badge.icon || "🏆"}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 dark:text-white flex items-center">
                      {badge.name}
                      {earned && (
                        <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 text-xs rounded-full">
                          Earned
                        </span>
                      )}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {badge.description}
                    </p>
                    <div className="flex items-center mt-2 space-x-2">
                      <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-400">
                        {badge.category}
                      </span>
                      {badge.tier && (
                        <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400 rounded-full">
                          {badge.tier}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    {earned ? (
                      <button
                        onClick={() => handleRemoveBadges([badge.id])}
                        disabled={saving}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Remove Badge"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleToggleBadge(badge.id)}
                        disabled={saving}
                        className={`p-2 rounded-lg transition-colors ${
                          selected
                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400"
                            : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400"
                        }`}
                        title={selected ? "Deselect" : "Select to Award"}
                      >
                        {selected ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          <Award className="h-5 w-5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-8 flex justify-end">
        <button
          onClick={onClose}
          className="px-6 py-2.5 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
        >
          Close
        </button>
      </div>
    </BaseModal>
  );
};

export default BadgeAwardModal;
