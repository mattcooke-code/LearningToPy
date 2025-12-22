// components/admin/AnalyticsChart.jsx
import { useState } from "react";
import { adminApiClient } from "../../context";
import { useAdminData } from "../../hooks";
import { LoadingState, RefreshButton } from "../ui";
import { exportToCSV } from "../../utils/analyticsUtils";
import { ANALYTICS_CHARTS, DATE_RANGES } from "../../constants/adminConstants";
import {
  MetricsGrid,
  TopContent,
  UserSegmentation,
  QuickStats,
} from "../analytics";
import {
  ActivityChart,
  GrowthChart,
  ContentChart,
  DevicesChart,
  SegmentsChart,
} from "../charts";
import { Download, Eye, EyeOff, Calendar } from "lucide-react";

// Chart component lookup
const CHART_COMPONENTS = {
  activity: ActivityChart,
  growth: GrowthChart,
  content: ContentChart,
  devices: DevicesChart,
  segments: SegmentsChart,
};

const AnalyticsChart = () => {
  const [activeChart, setActiveChart] = useState(ANALYTICS_CHARTS[0].id);
  const [dateRange, setDateRange] = useState(DATE_RANGES[0].value);
  const [showDetails, setShowDetails] = useState(false);

  const { data, loading, error, refetch } = useAdminData(
    () => adminApiClient.get(`/analytics?range=${dateRange}`),
    [dateRange],
    {
      defaultErrorMessage: "Failed to load analytics data",
      showToastOnError: true,
    }
  );

  const handleExport = () => {
    if (!data) return;

    try {
      const activeChartConfig = ANALYTICS_CHARTS.find(
        (c) => c.id === activeChart
      );
      const chartData = data[activeChartConfig.dataKey];

      if (chartData) {
        exportToCSV(chartData, `analytics-${activeChart}-${dateRange}`);
      }
    } catch (error) {
      console.error("Export error:", error);
    }
  };

  if (loading) {
    return <LoadingState message="Loading analytics data..." height="h-96" />;
  }

  if (!data) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 text-center">
        <div className="text-gray-500 dark:text-gray-400 mb-4">
          {error || "No analytics data available"}
        </div>
        <RefreshButton onClick={refetch} />
      </div>
    );
  }

  const activeChartConfig = ANALYTICS_CHARTS.find((c) => c.id === activeChart);
  const ChartComponent = CHART_COMPONENTS[activeChart];
  const chartData = data[activeChartConfig?.dataKey];

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

          <RefreshButton onClick={refetch} />

          <button
            onClick={handleExport}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
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
          {DATE_RANGES.map((range) => (
            <button
              key={range.value}
              onClick={() => setDateRange(range.value)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                dateRange === range.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Overview */}
      {showDetails && data?.platformMetrics && (
        <div>
          <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">
            Key Metrics
          </h4>
          <MetricsGrid platformMetrics={data.platformMetrics} />
        </div>
      )}

      {/* Chart Selector */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 overflow-x-auto">
          {ANALYTICS_CHARTS.map((chart) => {
            const Icon = chart.icon;
            return (
              <button
                key={chart.id}
                onClick={() => setActiveChart(chart.id)}
                className={`py-4 px-1 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  activeChart === chart.id
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
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
        <div className="h-80">
          {ChartComponent && <ChartComponent data={chartData} />}
        </div>
      </div>

      {/* Additional Insights */}
      {showDetails && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopContent contentPerformance={data.contentPerformance} />
          <UserSegmentation
            userSegments={data.userSegments}
            platformMetrics={data.platformMetrics}
          />
        </div>
      )}

      {/* Quick Stats */}
      <QuickStats platformMetrics={data.platformMetrics} />
    </div>
  );
};

export default AnalyticsChart;
