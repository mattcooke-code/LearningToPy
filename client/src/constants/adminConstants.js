// adminMenuItems.js
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  CheckCircle,
  Clock,
  Flag,
  PieChart,
  Settings,
  Shield,
  Target,
  TrendingUp,
  Users,
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
  RESOLVED: { color: "green", icon: CheckCircle, label: "Resolved" },
  WARNING_SENT: { color: "blue", icon: AlertTriangle, label: "Warning Sent" },
  ESCALATED: { color: "red", icon: Shield, label: "Escalated" },
  DISMISSED: { color: "gray", icon: XCircle, label: "Dismissed" },
};

export const getStatusConfig = (status) =>
  FLAG_STATUS_CONFIG[status] || FLAG_STATUS_CONFIG.PENDING;

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
