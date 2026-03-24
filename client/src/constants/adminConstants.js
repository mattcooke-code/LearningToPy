// adminConstants.js
import {
  AlertCircle,
  BarChart3,
  BookOpen,
  CheckCircle,
  Clock,
  Code,
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

export const FLAG_STATUS_CONFIG = {
  PENDING: { color: "yellow", icon: Clock, label: "Pending" },
  IN_REVIEW: { color: "blue", icon: Eye, label: "In Review" },
  FIXED: { color: "green", icon: CheckCircle, label: "Fixed" },
  REJECTED: { color: "red", icon: XCircle, label: "Rejected" },
  XP_ADJUSTED: { color: "purple", icon: Star, label: "XP Adjusted" },
};

export const getStatusConfig = (status) => {
  return (
    FLAG_STATUS_CONFIG[status] || {
      color: "gray",
      icon: Flag,
      label: status || "Unknown",
    }
  );
};

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

export const getIssueTypeConfig = (issueType) => {
  return ISSUE_TYPE_CONFIG[issueType] || ISSUE_TYPE_CONFIG.OTHER;
};

// ==== ANALYTICS CONSTANTS ====
export const ANALYTICS_CHARTS = [
  { id: "activity", label: "Activity", icon: TrendingUp, color: "blue" },
  { id: "growth", label: "Growth", icon: Users, color: "green" },
  { id: "content", label: "Content", icon: BookOpen, color: "purple" },
  { id: "devices", label: "Devices", icon: Zap, color: "orange" },
  { id: "segments", label: "Segments", icon: Target, color: "pink" },
];

export const CHART_COLORS = {
  primary: ["#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444"],
  blue: "#3B82F6",
  green: "#10B981",
  purple: "#8B5CF6",
  orange: "#F59E0B",
  pink: "#EC4899",
};

export const ANALYTICS_TIME_RANGES = [
  { value: "24hr", label: "Last 24 Hours" },
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "90d", label: "Last 90 Days" },
  { value: "1y", label: "Last Year" },
  { value: "all", label: "All Time" },
];

export const ANALYTICS_GROUP_BY = [
  { value: "day", label: "Daily" },
  { value: "week", label: "Weekly" },
  { value: "month", label: "Monthly" },
];
