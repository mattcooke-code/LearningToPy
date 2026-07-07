// /src/modals/BadgeAwardModal.jsx
import { useState, useEffect, useCallback } from "react";
import { useNotification } from "../context";
import { adminApiClient } from "../services";
import { BaseModal } from "../components/ui";
import { Search, Award, Loader2, Check, X, Trophy } from "lucide-react";
import { BADGE_DEFINITIONS_CORE } from "@shared/constants/badgeDefinitions.cjs";

/**
 * @fileoverview
 * Admin modal for managing user badges with award and revoke functionality.
 * This component provides a comprehensive badge management interface for administrators,
 * featuring search functionality, batch operations, and real-time synchronization with
 * the user's badge collection. Integrates with the achievement system and provides
 * detailed badge information with visual feedback for earned status.
 */

/**
 * Admin modal for managing user badges with award and revoke functionality.
 *
 * This component creates a powerful badge management interface for administrators to
 * award or revoke badges from specific users. Features include comprehensive search
 * across badge names, descriptions, and categories, batch selection for multiple badge
 * operations, and real-time synchronization with the user's current badge collection.
 * The modal provides visual feedback for earned badges, XP values, and administrative
 * actions with proper error handling and user notifications.
 *
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Object} props.user - User object containing user information
 * @param {Function} props.onClose - Function to close the modal
 * @param {Function} [props.onSave] - Callback function to refresh parent components after changes
 * @returns {JSX.Element} Badge management interface with search and batch operations
 */
const BadgeAwardModal = ({ isOpen, user, onClose, onSave }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBadges, setSelectedBadges] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { showToast } = useNotification();

  const fetchUserBadges = useCallback(async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const response = await adminApiClient.get(`/users/${user._id}/badges`);
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
      setSearchQuery("");
    }
  }, [isOpen, user?._id, fetchUserBadges]);

  const filteredBadges = BADGE_DEFINITIONS_CORE.filter(
    (badge) =>
      badge.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      badge.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      badge.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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
      await adminApiClient.post(`/users/${user._id}/badges/award`, {
        badgeIds: selectedBadges,
        reason: "Manually awarded by admin",
      });

      showToast(
        `Successfully awarded ${selectedBadges.length} badge(s)`,
        "success",
      );
      setSelectedBadges([]);
      await fetchUserBadges();
      onSave?.();
    } catch (err) {
      showToast("Failed to award badges", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveBadge = async (badgeId) => {
    setSaving(true);
    try {
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

  // Title component for the modal header
  const modalTitle = (
    <div className="flex items-center space-x-3">
      <div
        className="h-10 w-10 rounded-full bg-yellow-100 dark:bg-yellow-900/40 flex items-center justify-center"
        aria-hidden="true"
      >
        <Award className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
      </div>
      <div>
        <span className="text-lg font-bold text-gray-900 dark:text-white leading-tight block">
          Badge Management: {user?.username}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">
          Grant or Revoke Achievements
        </span>
      </div>
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      className="max-h-[90vh] w-[92vw] md:w-[85vw] lg:w-[80vw] xl:max-w-5xl"
      size="4xl"
      description={`Manage badges for ${user?.username}. Search, award, or revoke achievement badges.`}
    >
      {/* Search */}
      <div className="relative mb-6">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
          aria-hidden="true"
        />
        <label htmlFor="badge-search" className="sr-only">
          Search badges by name, description, or category
        </label>
        <input
          id="badge-search"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search badges..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
        />
      </div>

      {/* Loading State */}
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
            Synchronizing badges...
          </p>
        </div>
      ) : (
        /* Badge Grid */
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar"
          tabIndex={0}
          role="region"
          aria-label={`Badge catalog for ${user?.username}`}
        >
          {filteredBadges.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
              <Award
                className="h-12 w-12 mx-auto mb-3 opacity-30"
                aria-hidden="true"
              />
              <p className="text-sm font-medium">No badges found</p>
              <p className="text-xs mt-1">Try adjusting your search terms</p>
            </div>
          ) : (
            filteredBadges.map((badge) => {
              const earned = isBadgeEarned(badge.id);
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
                    {/* Badge Icon & XP */}
                    <div className="flex flex-col items-center space-y-2 shrink-0">
                      <div
                        className="text-4xl filter drop-shadow-sm group-hover:scale-110 transition-transform"
                        aria-hidden="true"
                      >
                        {badge.icon || "🏆"}
                      </div>
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                        <Trophy
                          className={`h-3 w-3 ${earned ? "text-yellow-500" : "text-gray-400 grayscale opacity-50"}`}
                          aria-hidden="true"
                        />
                        <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400">
                          {badge.xpReward || 0}
                        </span>
                      </div>
                    </div>

                    {/* Badge Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-gray-900 dark:text-white truncate text-sm">
                          {badge.name}
                        </h3>
                        {earned && (
                          <span className="text-[9px] font-black uppercase tracking-widest text-green-800 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded">
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

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                      {earned ? (
                        <button
                          onClick={() => handleRemoveBadge(badge.id)}
                          disabled={saving}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                          aria-label={`Revoke ${badge.name} badge from ${user?.username}`}
                          title={`Revoke ${badge.name}`}
                        >
                          <X className="h-5 w-5" aria-hidden="true" />
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
                          aria-label={
                            selected
                              ? `Deselect ${badge.name} badge`
                              : `Select ${badge.name} badge for awarding`
                          }
                          aria-pressed={selected}
                          title={selected ? "Deselect" : "Select to Award"}
                        >
                          {selected ? (
                            <Check className="h-5 w-5" aria-hidden="true" />
                          ) : (
                            <Award className="h-5 w-5" aria-hidden="true" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-gray-100 dark:border-gray-800 pt-6">
        <p
          className="text-xs text-gray-500 dark:text-gray-400 italic"
          aria-live="polite"
        >
          {selectedBadges.length} badge(s) selected for award
        </p>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onClose}
            className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
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
                <>
                  <Loader2
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                  Awarding...
                </>
              ) : (
                <>
                  <Award className="h-4 w-4" aria-hidden="true" />
                  Confirm Award
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </BaseModal>
  );
};

export default BadgeAwardModal;
