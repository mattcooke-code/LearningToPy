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
  PENDING: { color: "yellow", icon: Clock, label: "Pending" },
  IN_REVIEW: { color: "blue", icon: Eye, label: "In Review" },
  FIXED: { color: "green", icon: CheckCircle, label: "Fixed" },
  REJECTED: { color: "red", icon: XCircle, label: "Rejected" },
  XP_ADJUSTED: { color: "purple", icon: Star, label: "XP Adjusted" },
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
    }
  );
};

/**
 * Configuration for flagged content issue types with icons, colors, labels, and descriptions.
 * Used for categorizing and displaying different types of reported issues.
 */
export const ISSUE_TYPE_CONFIG = {
  CONTENT_ERROR: {
    icon: FileText,
    color: "blue",
    label: "Content Error",
    description: "Typo, incorrect information",
  },
  CODE_ERROR: {
    icon: Code,
    color: "purple",
    label: "Code Error",
    description: "Exercise code not working",
  },
  QUIZ_ERROR: {
    icon: HelpCircle,
    color: "orange",
    label: "Quiz Error",
    description: "Quiz marked incorrectly",
  },
  BROKEN_FUNCTIONALITY: {
    icon: Wrench,
    color: "red",
    label: "Broken Functionality",
    description: "Validation not working",
  },
  XP_ADJUSTMENT: {
    icon: Star,
    color: "yellow",
    label: "XP Adjustment",
    description: "XP not awarded correctly",
  },
  OTHER: {
    icon: AlertCircle,
    color: "gray",
    label: "Other",
    description: "Other issue",
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
  primary: ["#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444"],
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
