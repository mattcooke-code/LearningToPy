// adminConstants.js
import {
  AlertCircle,
  BarChart3,
  BookOpen,
  CheckCircle,
  Clock,
  Code,
  Eye,
  FileText,
  Flag,
  HelpCircle,
  PieChart,
  Settings,
  Star,
  Target,
  TrendingUp,
  Users,
  Wrench,
  XCircle,
  Zap,
} from "lucide-react";

/**
 * Configuration constants for admin interface including menu items, status configurations,
 * and analytics chart settings. Provides centralized management of admin UI elements.
 */

/**
 * Admin navigation menu items with paths, labels, icons, and badge configurations.
 * Used for rendering the admin sidebar navigation with dynamic badge counts.
 */
export const ADMIN_MENU_ITEMS = [
  { path: "/admin", label: "Dashboard", icon: BarChart3, exact: true },
  { path: "/admin/users", label: "User Management", icon: Users },
  { path: "/admin/content", label: "Content Management", icon: BookOpen },
  {
    path: "/admin/flagged",
    label: "Flagged Content",
    icon: Flag,
    badge: true,
    badgeCount: 3, // Dynamic value
  },
  { path: "/admin/analytics", label: "Analytics", icon: PieChart },
  { path: "/admin/settings", label: "Settings", icon: Settings },
];

/**
 * Configuration for flagged content status with associated colors, icons, and labels.
 * Used for rendering status badges and determining visual styling of flagged items.
 */
export const FLAG_STATUS_CONFIG = {
  PENDING: {
    color: "yellow",
    icon: Clock,
    label: "Pending",
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    text: "text-yellow-700 dark:text-yellow-300",
    iconBg: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600",
    badge:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  },
  IN_REVIEW: {
    color: "blue",
    icon: Eye,
    label: "In Review",
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-300",
    iconBg: "bg-blue-100 dark:bg-blue-900/30 text-blue-600",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  },
  FIXED: {
    color: "green",
    icon: CheckCircle,
    label: "Fixed",
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-700 dark:text-green-300",
    iconBg: "bg-green-100 dark:bg-green-900/30 text-green-600",
    badge:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  },
  REJECTED: {
    color: "red",
    icon: XCircle,
    label: "Rejected",
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-700 dark:text-red-300",
    iconBg: "bg-red-100 dark:bg-red-900/30 text-red-600",
    badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  },
  XP_ADJUSTED: {
    color: "purple",
    icon: Star,
    label: "XP Adjusted",
    bg: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-700 dark:text-purple-300",
    iconBg: "bg-purple-100 dark:bg-purple-900/30 text-purple-600",
    badge:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  },
};

/**
 * Retrieves status configuration for a given flag status.
 * Provides fallback configuration for unknown statuses.
 *
 * @param {string} status - The flag status to get configuration for
 * @returns {Object} Status configuration object with color, icon, and label
 */
export const getStatusConfig = (status) => {
  return (
    FLAG_STATUS_CONFIG[status] || {
      color: "gray",
      icon: Flag,
      label: status || "Unknown",
      bg: "bg-gray-100 dark:bg-gray-900/30",
      text: "text-gray-700 dark:text-gray-300",
      iconBg: "bg-gray-100 dark:bg-gray-900/30 text-gray-600",
      badge: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300",
    }
  );
};

/**
 * Retrieves issue type configuration for a given issue type.
 * Provides fallback to OTHER configuration for unknown issue types.
 *
 * @param {string} issueType - The issue type to get configuration for
 * @returns {Object} Issue type configuration object with icon, color, label, and description
 */
export const ISSUE_TYPE_CONFIG = {
  CONTENT_ERROR: {
    icon: FileText,
    color: "blue",
    label: "Content Error",
    description: "Typo, incorrect information",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  },
  CODE_ERROR: {
    icon: Code,
    color: "purple",
    label: "Code Error",
    description: "Exercise code not working",
    badge:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  },
  QUIZ_ERROR: {
    icon: HelpCircle,
    color: "orange",
    label: "Quiz Error",
    description: "Quiz marked incorrectly",
    badge:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  },
  BROKEN_FUNCTIONALITY: {
    icon: Wrench,
    color: "red",
    label: "Broken Functionality",
    description: "Validation not working",
    badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  },
  XP_ADJUSTMENT: {
    icon: Star,
    color: "yellow",
    label: "XP Adjustment",
    description: "XP not awarded correctly",
    badge:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  },
  OTHER: {
    icon: AlertCircle,
    color: "gray",
    label: "Other",
    description: "Other issue",
    badge: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300",
  },
};

/**
 * Retrieves issue type configuration for a given issue type.
 * Provides fallback to OTHER configuration for unknown issue types.
 *
 * @param {string} issueType - The issue type to get configuration for
 * @returns {Object} Issue type configuration object with icon, color, label, and description
 */
export const getIssueTypeConfig = (issueType) => {
  return ISSUE_TYPE_CONFIG[issueType] || ISSUE_TYPE_CONFIG.OTHER;
};

// ==== ANALYTICS CONSTANTS ====

/**
 * Analytics chart types with identifiers, labels, icons, and colors.
 * Used for rendering analytics dashboard chart selection and configuration.
 */
export const ANALYTICS_CHARTS = [
  { id: "activity", label: "Activity", icon: TrendingUp, color: "blue" },
  { id: "growth", label: "Growth", icon: Users, color: "green" },
  { id: "content", label: "Content", icon: BookOpen, color: "purple" },
  { id: "devices", label: "Devices", icon: Zap, color: "orange" },
  { id: "segments", label: "Segments", icon: Target, color: "pink" },
];

/**
 * Color palette for analytics charts with primary array and individual color values.
 * Used for consistent chart styling across the analytics dashboard.
 */
export const CHART_COLORS = {
  primary: ["#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EC4899"],
  blue: "#3B82F6",
  green: "#10B981",
  purple: "#8B5CF6",
  orange: "#F59E0B",
  pink: "#EC4899",
};

/**
 * Time range options for analytics data filtering.
 * Used for date range selection in analytics charts and reports.
 */
export const ANALYTICS_TIME_RANGES = [
  { value: "24hr", label: "Last 24 Hours" },
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "90d", label: "Last 90 Days" },
  { value: "1y", label: "Last Year" },
  { value: "all", label: "All Time" },
];

/**
 * Grouping options for analytics data aggregation.
 * Used for selecting time-based grouping in analytics charts.
 */
export const ANALYTICS_GROUP_BY = [
  { value: "day", label: "Daily" },
  { value: "week", label: "Weekly" },
  { value: "month", label: "Monthly" },
];
