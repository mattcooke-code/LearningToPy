import { useState, useEffect, useCallback } from "react";
import { useNotification } from "../context";
import { adminApiClient } from "../services";
import { BaseModal } from "../components/ui";
import { Search, Award, Loader2, Check, X, Trophy } from "lucide-react";
import { BADGE_DEFINITIONS_CORE } from "@shared/constants/badgeDefinitions.cjs";

const BadgeAwardModal = ({ isOpen, user, onClose, onSave }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBadges, setSelectedBadges] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { showToast } = useNotification();

  // Reverted to your original data path: response.badges
  const fetchUserBadges = useCallback(async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const response = await adminApiClient.get(`/users/${user._id}/badges`);
      // Restored original logic: response?.badges
      setUserBadges(response?.badges || []);
    } catch (err) {
      showToast("Failed to load user badges", "error");
    } finally {
      setLoading(false);
    }
  }, [user?._id, showToast]);

  useEffect(() => {
    if (isOpen && user?._id) {
      fetchUserBadges();
      setSelectedBadges([]);
    }
  }, [isOpen, user?._id, fetchUserBadges]);

  const filteredBadges = BADGE_DEFINITIONS_CORE.filter(
    (badge) =>
      badge.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      badge.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      badge.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Restored original simple inclusion check
  const isBadgeEarned = (badgeId) => userBadges.includes(badgeId);

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
      // Restored original Award payload and path
      await adminApiClient.post(`/users/${user._id}/badges/award`, {
        badgeIds: selectedBadges,
        reason: "Manually awarded by admin",
      });

      showToast(
        `Successfully awarded ${selectedBadges.length} badge(s)`,
        "success",
      );
      setSelectedBadges([]);
      await fetchUserBadges(); // Refresh local list
      onSave?.(); // Refresh parent table
    } catch (err) {
      showToast("Failed to award badges", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveBadge = async (badgeId) => {
    setSaving(true);
    try {
      // Restored original Remove path and payload
      await adminApiClient.post(`/users/${user._id}/badges/remove`, {
        badgeIds: [badgeId],
        reason: "Manually removed by admin",
      });

      showToast("Badge revoked", "success");
      await fetchUserBadges();
      onSave?.();
    } catch (err) {
      showToast("Failed to revoke badge", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      className="max-h-[90vh] w-[92vw] md:w-[85vw] lg:w-[80vw] xl:max-w-5xl"
      title={
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-yellow-100 dark:bg-yellow-900/40 flex items-center justify-center">
            <Award className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
              Badge Management: {user?.username}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">
              Grant or Revoke Achievements
            </p>
          </div>
        </div>
      }
      size="4xl"
    >
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={
            window.innerWidth < 640
              ? "Search badges..."
              : "Search by badge name or category..."
          }
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
          <p className="text-sm text-gray-500 animate-pulse font-medium">
            Synchronizing badges...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
          {filteredBadges.map((badge) => {
            const earned = isBadgeEarned(badge.id); // Re-connected
            const selected = selectedBadges.includes(badge.id);

            return (
              <div
                key={badge.id}
                className={`group p-4 border rounded-2xl transition-all relative ${
                  earned
                    ? "bg-green-50/30 border-green-100 dark:bg-green-900/5 dark:border-green-900/30"
                    : selected
                      ? "bg-blue-50/50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
                      : "bg-white dark:bg-gray-800/50 border-gray-100 dark:border-gray-700"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center space-y-2 shrink-0">
                    <div className="text-4xl filter drop-shadow-sm group-hover:scale-110 transition-transform">
                      {badge.icon || "🏆"}
                    </div>
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                      <Trophy
                        className={`h-3 w-3 ${earned ? "text-yellow-500" : "text-gray-400 grayscale opacity-50"}`}
                      />
                      <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400">
                        {badge.xpReward || 0}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-gray-900 dark:text-white truncate text-sm">
                        {badge.name}
                      </h4>
                      {earned && (
                        <span className="text-[9px] font-black uppercase tracking-widest text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded">
                          Earned
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-black uppercase tracking-tighter mb-1.5">
                      {badge.category}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                      {badge.description}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    {earned ? (
                      <button
                        onClick={() => handleRemoveBadge(badge.id)}
                        disabled={saving}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                        title="Revoke Badge"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleToggleBadge(badge.id)}
                        disabled={saving}
                        className={`p-2 rounded-lg transition-all ${
                          selected
                            ? "bg-blue-600 text-white shadow-md scale-105"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-blue-500"
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

      <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-gray-100 dark:border-gray-800 pt-6">
        <p className="text-xs text-gray-500 dark:text-gray-400 italic">
          {selectedBadges.length} badge(s) selected for award
        </p>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onClose}
            className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
          >
            Cancel
          </button>
          {selectedBadges.length > 0 && (
            <button
              onClick={handleAwardBadges}
              disabled={saving}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg active:scale-95 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Award className="h-4 w-4" />
              )}
              Confirm Award
            </button>
          )}
        </div>
      </div>
    </BaseModal>
  );
};

export default BadgeAwardModal;
