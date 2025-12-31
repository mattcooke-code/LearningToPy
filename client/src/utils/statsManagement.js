// statsManagement.js
import { Trophy, Target, Zap, Award, BookOpen, BarChart3 } from "lucide-react";

/**
 * Statistics for the high-level Content Management Table
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
 * Statistics for the Module Editor (XP and Time totals)
 */
export const calculateModuleEditorStats = (moduleLessons, formDataXpBonus) => {
  const lessonsXp = moduleLessons.reduce(
    (sum, l) => sum + (l.xpReward || 0),
    0
  );
  const lessonsTime = moduleLessons.reduce(
    (sum, l) => sum + (l.estimatedTime || 15),
    0
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
 * Statistics for the User Detail Profile
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
 * Statistics for the Main Admin Dashboard
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
