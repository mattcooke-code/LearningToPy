import { useState, useEffect, useRef } from "react";
import { adminApiClient, useNotification } from "../../context";
import {
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  Users,
  Clock,
  Trophy,
  Download,
  Calendar,
  Filter,
  RefreshCw,
  Eye,
  EyeOff,
  ChevronDown,
  Zap,
  BookOpen,
  Award,
  Target,
} from "lucide-react";

// Mock data for development - remove when backend is ready
const MOCK_DATA = {
  dailyActivity: [
    {
      date: "2024-01-01",
      activeUsers: 145,
      lessonsCompleted: 89,
      xpEarned: 12500,
    },
    {
      date: "2024-01-02",
      activeUsers: 167,
      lessonsCompleted: 102,
      xpEarned: 15600,
    },
    {
      date: "2024-01-03",
      activeUsers: 189,
      lessonsCompleted: 134,
      xpEarned: 18900,
    },
    {
      date: "2024-01-04",
      activeUsers: 156,
      lessonsCompleted: 98,
      xpEarned: 14200,
    },
    {
      date: "2024-01-05",
      activeUsers: 201,
      lessonsCompleted: 156,
      xpEarned: 21500,
    },
    {
      date: "2024-01-06",
      activeUsers: 234,
      lessonsCompleted: 187,
      xpEarned: 25600,
    },
    {
      date: "2024-01-07",
      activeUsers: 278,
      lessonsCompleted: 221,
      xpEarned: 29800,
    },
  ],
  userGrowth: [
    { month: "Sep", newUsers: 450, activeUsers: 1200 },
    { month: "Oct", newUsers: 520, activeUsers: 1450 },
    { month: "Nov", newUsers: 610, activeUsers: 1780 },
    { month: "Dec", newUsers: 720, activeUsers: 2100 },
    { month: "Jan", newUsers: 850, activeUsers: 2450 },
  ],
  contentPerformance: [
    { name: "Python Basics", views: 12500, completions: 890, rating: 4.8 },
    { name: "Functions", views: 9800, completions: 720, rating: 4.6 },
    { name: "Data Structures", views: 8200, completions: 610, rating: 4.4 },
    { name: "OOP", views: 6700, completions: 520, rating: 4.7 },
    { name: "APIs", views: 5400, completions: 430, rating: 4.5 },
  ],
  platformMetrics: {
    avgSessionDuration: 24, // minutes
    completionRate: 68, // percentage
    retentionRate: 42, // percentage
    dailyActiveUsers: 278,
    weeklyActiveUsers: 1450,
    monthlyActiveUsers: 2450,
    totalLessonsCompleted: 15600,
    totalXP: 2450000,
    avgLevel: 4.2,
  },
  deviceBreakdown: [
    { device: "Desktop", percentage: 65 },
    { device: "Mobile", percentage: 30 },
    { device: "Tablet", percentage: 5 },
  ],
  userSegments: [
    { segment: "Beginners", count: 1200, avgLevel: 1.8 },
    { segment: "Intermediate", count: 850, avgLevel: 4.5 },
    { segment: "Advanced", count: 400, avgLevel: 8.2 },
  ],
};

const AnalyticsChart = () => {
  const [activeChart, setActiveChart] = useState("activity");
  const [dateRange, setDateRange] = useState("7d"); // 7d, 30d, 90d, 1y, all
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(MOCK_DATA);
  const [showDetails, setShowDetails] = useState(false);
  const [exporting, setExporting] = useState(false);
  const { showToast } = useNotification();

  const chartRef = useRef(null);
  const canvasRef = useRef(null);

  const charts = [
    { id: "activity", label: "Activity", icon: TrendingUp, color: "blue" },
    { id: "growth", label: "Growth", icon: Users, color: "green" },
    { id: "content", label: "Content", icon: BookOpen, color: "purple" },
    { id: "devices", label: "Devices", icon: Zap, color: "orange" },
    { id: "segments", label: "Segments", icon: Target, color: "pink" },
  ];

  const dateRanges = [
    { value: "7d", label: "Last 7 days" },
    { value: "30d", label: "Last 30 days" },
    { value: "90d", label: "Last 90 days" },
    { value: "1y", label: "Last year" },
    { value: "all", label: "All time" },
  ];

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      // Replace with actual API call when backend is ready
      // const response = await adminApiClient.get(`/analytics?range=${dateRange}`);
      // setData(response.data.data);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // For now, use mock data
      setData(MOCK_DATA);
    } catch (error) {
      showToast("Failed to load analytics data", "error");
      console.error("Analytics fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportChart = async (format = "png") => {
    try {
      setExporting(true);
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const link = document.createElement("a");
        link.download = `analytics-${activeChart}-${
          new Date().toISOString().split("T")[0]
        }.${format}`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      }
      showToast(`Chart exported as ${format.toUpperCase()}`, "success");
    } catch (error) {
      showToast("Failed to export chart", "error");
    } finally {
      setExporting(false);
    }
  };

  const renderActivityChart = () => {
    const dates = data.dailyActivity.map((d) => {
      const date = new Date(d.date);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    });

    return (
      <div className="h-64 mt-4 relative">
        <canvas ref={canvasRef} className="w-full h-full" />
        <div className="absolute top-4 left-4 text-sm text-gray-500 dark:text-gray-400">
          {dateRanges.find((r) => r.value === dateRange)?.label}
        </div>

        {/* Chart Legend */}
        <div className="absolute bottom-4 right-4 flex space-x-4 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span>Active Users</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span>Lessons Completed</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
            <span>XP Earned (k)</span>
          </div>
        </div>
      </div>
    );
  };

  const renderGrowthChart = () => {
    return (
      <div className="h-64 mt-4 relative">
        <div className="flex items-end h-48 space-x-4 px-4">
          {data.userGrowth.map((month, index) => (
            <div
              key={month.month}
              className="flex-1 flex flex-col items-center"
            >
              <div className="w-full flex justify-center space-x-1 mb-2">
                <div
                  className="w-1/2 bg-blue-500 rounded-t"
                  style={{ height: `${(month.newUsers / 1000) * 100}%` }}
                  title={`New Users: ${month.newUsers}`}
                ></div>
                <div
                  className="w-1/2 bg-green-500 rounded-t"
                  style={{ height: `${(month.activeUsers / 3000) * 100}%` }}
                  title={`Active Users: ${month.activeUsers}`}
                ></div>
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {month.month}
              </span>
            </div>
          ))}
        </div>

        <div className="absolute bottom-4 right-4 flex space-x-4 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
            <span>New Users</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
            <span>Active Users</span>
          </div>
        </div>
      </div>
    );
  };

  const renderContentChart = () => {
    return (
      <div className="h-64 mt-4">
        <div className="space-y-3">
          {data.contentPerformance.map((item, index) => (
            <div key={item.name} className="flex items-center">
              <div className="w-32 text-sm truncate text-gray-700 dark:text-gray-300">
                {item.name}
              </div>
              <div className="flex-1 ml-4">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-purple-500 to-pink-500 rounded-full"
                    style={{ width: `${(item.views / 15000) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="w-24 text-right text-sm">
                <div className="font-medium">
                  {item.views.toLocaleString()} views
                </div>
                <div className="text-xs text-gray-500">
                  {item.completions} completions
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDevicesChart = () => {
    return (
      <div className="h-64 mt-4 relative">
        <div className="flex justify-center items-center h-48">
          <div className="relative w-48 h-48">
            {/* Pie Chart Slices */}
            {(() => {
              let cumulative = 0;
              return data.deviceBreakdown.map((segment, index) => {
                const percentage = segment.percentage;
                const offset = cumulative;
                cumulative += percentage;

                return (
                  <div
                    key={segment.device}
                    className="absolute inset-0 rounded-full border-8"
                    style={{
                      clipPath: `conic-gradient(
                      from ${offset * 3.6}deg,
                      ${
                        index === 0
                          ? "#3b82f6"
                          : index === 1
                          ? "#10b981"
                          : "#f59e0b"
                      }
                      ${percentage * 3.6}deg,
                      transparent ${percentage * 3.6}deg
                    )`,
                      transform: "rotate(0deg)",
                    }}
                  />
                );
              });
            })()}

            {/* Center */}
            <div className="absolute inset-0 m-auto w-24 h-24 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
              <div className="text-center">
                <div className="text-xl font-bold">Devices</div>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-center space-x-6 mt-6">
          {data.deviceBreakdown.map((segment, index) => (
            <div key={segment.device} className="flex items-center">
              <div
                className="w-4 h-4 rounded mr-2"
                style={{
                  backgroundColor:
                    index === 0
                      ? "#3b82f6"
                      : index === 1
                      ? "#10b981"
                      : "#f59e0b",
                }}
              ></div>
              <div>
                <div className="font-medium">{segment.device}</div>
                <div className="text-sm text-gray-500">
                  {segment.percentage}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSegmentsChart = () => {
    return (
      <div className="h-64 mt-4">
        <div className="grid grid-cols-3 gap-4 h-full">
          {data.userSegments.map((segment, index) => {
            const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500"];
            const textColors = [
              "text-blue-600",
              "text-green-600",
              "text-purple-600",
            ];

            return (
              <div
                key={segment.segment}
                className={`${colors[index]} rounded-xl p-6 flex flex-col justify-between`}
              >
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">
                    {segment.segment}
                  </h4>
                  <div className="text-3xl font-bold text-white mb-1">
                    {segment.count.toLocaleString()}
                  </div>
                  <div className="text-white/80">Users</div>
                </div>
                <div className="mt-4">
                  <div className="text-white/90">Avg Level</div>
                  <div className="text-2xl font-bold text-white">
                    {segment.avgLevel}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderChart = () => {
    switch (activeChart) {
      case "activity":
        return renderActivityChart();
      case "growth":
        return renderGrowthChart();
      case "content":
        return renderContentChart();
      case "devices":
        return renderDevicesChart();
      case "segments":
        return renderSegmentsChart();
      default:
        return renderActivityChart();
    }
  };

  const renderMetrics = () => {
    const metrics = [
      {
        icon: Users,
        label: "Daily Active",
        value: data.platformMetrics.dailyActiveUsers,
        change: "+12%",
        color: "blue",
      },
      {
        icon: Clock,
        label: "Avg Session",
        value: `${data.platformMetrics.avgSessionDuration}m`,
        change: "+2m",
        color: "green",
      },
      {
        icon: Trophy,
        label: "Total XP",
        value: `${(data.platformMetrics.totalXP / 1000000).toFixed(1)}M`,
        change: "+5%",
        color: "yellow",
      },
      {
        icon: BookOpen,
        label: "Lessons Completed",
        value: data.platformMetrics.totalLessonsCompleted.toLocaleString(),
        change: "+8%",
        color: "purple",
      },
      {
        icon: Award,
        label: "Completion Rate",
        value: `${data.platformMetrics.completionRate}%`,
        change: "+3%",
        color: "pink",
      },
      {
        icon: Target,
        label: "Retention Rate",
        value: `${data.platformMetrics.retentionRate}%`,
        change: "+1%",
        color: "orange",
      },
    ];

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`p-2 rounded-lg bg-${metric.color}-100 dark:bg-${metric.color}-900`}
                >
                  <Icon
                    className={`h-5 w-5 text-${metric.color}-600 dark:text-${metric.color}-400`}
                  />
                </div>
                <span className="text-xs font-medium text-green-600 dark:text-green-400">
                  {metric.change}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {metric.value}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {metric.label}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Platform Analytics
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Monitor user engagement and platform performance
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center"
          >
            {showDetails ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Hide Details
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Show Details
              </>
            )}
          </button>

          <button
            onClick={fetchAnalyticsData}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>

          <div className="relative">
            <button
              onClick={() => exportChart("png")}
              disabled={exporting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center"
            >
              {exporting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </>
              )}
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10 hidden group-hover:block">
              <button
                onClick={() => exportChart("png")}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Download as PNG
              </button>
              <button
                onClick={() => exportChart("csv")}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Download as CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Date Range:
          </span>
        </div>
        <div className="flex space-x-2">
          {dateRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => setDateRange(range.value)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                dateRange === range.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {range.value}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Overview */}
      {showDetails && (
        <div>
          <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">
            Key Metrics
          </h4>
          {renderMetrics()}
        </div>
      )}

      {/* Chart Selector */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 overflow-x-auto">
          {charts.map((chart) => {
            const Icon = chart.icon;
            return (
              <button
                key={chart.id}
                onClick={() => setActiveChart(chart.id)}
                className={`py-4 px-1 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  activeChart === chart.id
                    ? `border-${chart.color}-500 text-${chart.color}-600 dark:text-${chart.color}-400`
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                <Icon className="h-4 w-4 inline mr-2" />
                {chart.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <div ref={chartRef}>{renderChart()}</div>
      </div>

      {/* Additional Insights */}
      {showDetails && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performing Content */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Top Performing Content
            </h4>
            <div className="space-y-4">
              {data.contentPerformance.slice(0, 5).map((item, index) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-lg font-bold text-gray-400">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Rating: {item.rating}/5
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {item.completions.toLocaleString()} completions
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-400">
                      {((item.completions / item.views) * 100).toFixed(1)}%
                      completion rate
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User Segmentation */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              User Segmentation
            </h4>
            <div className="space-y-4">
              {data.userSegments.map((segment, index) => {
                const percentage =
                  (segment.count / data.platformMetrics.monthlyActiveUsers) *
                  100;
                const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500"];

                return (
                  <div key={segment.segment} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {segment.segment}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {segment.count.toLocaleString()} users (
                        {percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${colors[index]} rounded-full`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Average Level: {segment.avgLevel} • Average XP:{" "}
                      {(segment.avgLevel * 1000).toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="text-2xl font-bold">
            {data.platformMetrics.monthlyActiveUsers.toLocaleString()}
          </div>
          <div className="text-sm opacity-90">Monthly Active Users</div>
          <div className="text-xs mt-2 opacity-75">↑ 15% from last month</div>
        </div>

        <div className="bg-linear-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="text-2xl font-bold">
            {data.platformMetrics.totalLessonsCompleted.toLocaleString()}
          </div>
          <div className="text-sm opacity-90">Total Lessons Completed</div>
          <div className="text-xs mt-2 opacity-75">↑ 8% from last month</div>
        </div>

        <div className="bg-linear-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="text-2xl font-bold">
            {(data.platformMetrics.totalXP / 1000000).toFixed(1)}M
          </div>
          <div className="text-sm opacity-90">Total XP Earned</div>
          <div className="text-xs mt-2 opacity-75">↑ 12% from last month</div>
        </div>

        <div className="bg-linear-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="text-2xl font-bold">
            {data.platformMetrics.avgSessionDuration}m
          </div>
          <div className="text-sm opacity-90">Average Session Duration</div>
          <div className="text-xs mt-2 opacity-75">↑ 2m from last month</div>
        </div>
      </div>

      {/* Time-based Trends */}
      {showDetails && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Time-based Trends
          </h4>
          <div className="space-y-6">
            {data.dailyActivity.map((day, index) => (
              <div key={day.date} className="flex items-center justify-between">
                <div className="w-24 text-sm text-gray-600 dark:text-gray-400">
                  {new Date(day.date).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </div>
                <div className="flex-1 mx-4">
                  <div className="flex space-x-1">
                    <div
                      className="h-6 bg-blue-500 rounded"
                      style={{ width: `${(day.activeUsers / 300) * 100}%` }}
                      title={`Active Users: ${day.activeUsers}`}
                    ></div>
                    <div
                      className="h-6 bg-green-500 rounded"
                      style={{
                        width: `${(day.lessonsCompleted / 250) * 100}%`,
                      }}
                      title={`Lessons Completed: ${day.lessonsCompleted}`}
                    ></div>
                    <div
                      className="h-6 bg-purple-500 rounded"
                      style={{ width: `${(day.xpEarned / 30000) * 100}%` }}
                      title={`XP Earned: ${day.xpEarned.toLocaleString()}`}
                    ></div>
                  </div>
                </div>
                <div className="w-24 text-right text-sm">
                  <div className="font-medium">{day.activeUsers} users</div>
                  <div className="text-gray-500 dark:text-gray-400">
                    {day.lessonsCompleted} lessons
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsChart;
