// /client/src/utils/statsManagement.js
/**
 * @fileoverview Dashboard and admin statistics calculation utilities.
 *
 * Pure functions for aggregating content statistics (lessons/modules
 * published vs draft), module editor XP/time totals, user profile stat
 * cards, and the main admin dashboard overview. Used by admin pages and
 * the user dashboard.
 *
 * @module utils/statsManagement
 */

import { Trophy, Target, Zap, Award, BookOpen, BarChart3 } from "lucide-react";

/**
 * Calculate content breakdown statistics for the Content Management Table.
 *
 * Separates a mixed content array into lessons and modules, then counts
 * published vs draft for each type.
 *
 * @param {object[]} content - Array of content items, each with `type`
 *   (`"lesson"` or `"module"`) and `isPublished`.
 * @returns {{
 *   totalLessons: number,
 *   totalModules: number,
 *   publishedLessons: number,
 *   publishedModules: number,
 *   draftLessons: number,
 *   draftModules: number
 * }}
 */
export const calculateContentStats = (content) => {
  const lessons = content.filter((item) => item.type === "lesson");
  const modules = content.filter((item) => item.type === "module");

  return {
    totalLessons: lessons.length,
    totalModules: modules.length,
    publishedLessons: lessons.filter((l) => l.isPublished).length,
    publishedModules: modules.filter((m) => m.isPublished).length,
    draftLessons: lessons.filter((l) => !l.isPublished).length,
    draftModules: modules.filter((m) => !m.isPublished).length,
  };
};

/**
 * Calculate XP and time totals for the Module Editor summary panel.
 *
 * Sums `xpReward` and `estimatedTime` across all lessons in the module,
 * then adds the module-level XP bonus.
 *
 * @param {object[]} moduleLessons - Array of lesson objects with `xpReward`
 *   and `estimatedTime` properties.
 * @param {number|string} formDataXpBonus - The module-level XP bonus from the
 *   form (coerced to number).
 * @returns {{ totalXp: number, totalTime: number, count: number, bonusXp: number }}
 */
export const calculateModuleEditorStats = (moduleLessons, formDataXpBonus) => {
  const lessonsXp = moduleLessons.reduce(
    (sum, l) => sum + (l.xpReward || 0),
    0,
  );
  const lessonsTime = moduleLessons.reduce(
    (sum, l) => sum + (l.estimatedTime || 15),
    0,
  );
  const bonus = Number(formDataXpBonus) || 0;

  return {
    totalXp: lessonsXp + bonus,
    totalTime: lessonsTime,
    count: moduleLessons.length,
    bonusXp: bonus,
  };
};

/**
 * Build the array of stat card definitions for the User Detail Profile page.
 *
 * Each card includes a Lucide icon component, label, formatted value, and
 * a colour key for theming. Returns an array suitable for mapping to a
 * dashboard card grid.
 *
 * @param {object} userDetails - The normalised user object (from
 *   `normalizeUserData`).
 * @returns {{ icon: React.Component, label: string, value: string|number, color: string }[]}
 */
export const calculateUserDashboardStats = (userDetails) => {
  return [
    {
      icon: Trophy,
      label: "Total XP",
      value: userDetails?.xp?.toLocaleString() || "0",
      color: "yellow",
    },
    {
      icon: Target,
      label: "Level",
      value: userDetails?.level || 1,
      color: "green",
    },
    {
      icon: Zap,
      label: "Streak",
      value: userDetails?.streak || 0,
      color: "orange",
    },
    {
      icon: Award,
      label: "Badges",
      value: userDetails?.badges?.length || 0,
      color: "purple",
    },
    {
      icon: BookOpen,
      label: "Lessons",
      value: userDetails?.completedLessons?.length || 0,
      color: "blue",
    },
    {
      icon: BarChart3,
      label: "Modules",
      value: userDetails?.completedModules?.length || 0,
      color: "indigo",
    },
  ];
};

/**
 * Calculate overview statistics for the main Admin Dashboard.
 *
 * Computes published percentage (0 when no lessons exist) and provides
 * safe defaults for all fields when `statsData` is sparse or undefined.
 *
 * @param {object} [statsData={}] - Raw stats object from the admin API.
 * @returns {{
 *   totalUsers: number,
 *   activeUsers: number,
 *   totalLessons: number,
 *   publishedLessons: number,
 *   flaggedCount: number,
 *   publishedPercentage: number
 * }}
 */
export const calculateAdminDashboardStats = (statsData) => {
  const total = statsData?.totalLessons || 0;
  const published = statsData?.publishedLessons || 0;

  return {
    totalUsers: statsData?.totalUsers || 0,
    activeUsers: statsData?.activeUsers || 0,
    totalLessons: total,
    publishedLessons: published,
    flaggedCount: statsData?.flaggedCount || statsData?.pendingFlags || 0,
    publishedPercentage: total > 0 ? Math.round((published / total) * 100) : 0,
  };
};
