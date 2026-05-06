// /client/src/hooks/useStreakNotifications.js
/**
 * @fileoverview Streak notification hook.
 *
 * Watches the user's streak status and fires toast notifications or
 * confirmation dialogs when the streak enters WARNING, AT_RISK, or
 * RESETTING states. Each status fires only once per session (tracked via
 * a ref).
 *
 * @module hooks/useStreakNotifications
 * @requires react
 * @requires ../context/NotificationContext
 */

import { useEffect, useRef } from "react";
import { useNotification } from "../context/NotificationContext";

/**
 * Show streak-related notifications based on status changes.
 *
 * @param {number} streak - The current streak count (used in messages).
 * @param {'WARNING'|'AT_RISK'|'RESETTING'|null} streakStatus - Current
 *   streak status from the backend.
 * @param {object} [weeklyProgress] - Weekly progress data.
 * @param {number} [weeklyProgress.daysRemaining=2] - Days left to save streak.
 */
export const useStreakNotifications = (
  streak,
  streakStatus,
  weeklyProgress,
) => {
  const { showToast, showConfirm } = useNotification();
  const notifiedStatus = useRef(null);

  useEffect(() => {
    // Don't fire notification twice in same session
    if (!streakStatus || notifiedStatus.current === streakStatus) return;

    const daysRemaining = weeklyProgress?.daysRemaining ?? 2;

    if (streakStatus === "WARNING") {
      showToast(
        `⚠️ Complete 1 lesson or module quiz in the next ${daysRemaining} days to save your ${streak}-day streak!`,
        "warning",
        8000,
      );
    }

    if (streakStatus === "AT_RISK") {
      showToast(
        `⚡ Complete 1 lesson or module quiz today to maintain your ${streak}-day streak!`,
        "warning",
        8000,
      );
    }

    if (streakStatus === "RESETTING") {
      showConfirm({
        title: "Streak Lost",
        message: `Your ${streak}-day streak has reset. Complete a lesson today to start a new one!`,
        type: "warning",
        confirmText: "Let's go",
        cancelText: "Dismiss",
        onConfirm: () => {},
      });
    }

    notifiedStatus.current = streakStatus;
  }, [streakStatus]);
};
