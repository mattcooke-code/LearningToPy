// hooks/useStreakNotifications.js
import { useEffect, useRef } from "react";
import { useNotification } from "../context/NotificationContext";

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
