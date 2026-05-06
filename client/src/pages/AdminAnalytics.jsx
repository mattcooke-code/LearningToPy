import { useState, useMemo } from "react";
import { adminApiClient } from "../services";
import { AdminPage } from "../components/admin";
import { RefreshButton, LoadingState, ErrorState } from "../components/ui";
import { useAdminData } from "../hooks";
import {
  MetricsGrid,
  QuickStats,
  TopContent,
  UserSegmentation,
} from "../components/analytics";
import { ActivityChart, GrowthChart, DevicesChart } from "../components/charts";
import { ANALYTICS_TIME_RANGES } from "../constants/adminConstants";

const AdminAnalytics = () => {
  const [dateRange, setDateRange] = useState("30d");
  const [groupBy, setGroupBy] = useState("day");

  const fetchAnalytics = async () => {
    const response = await adminApiClient.get("/analytics", {
      params: { range: dateRange, groupBy },
    });
    return response;
  };

  const { data, loading, error, refetch } = useAdminData(
    fetchAnalytics,
    [dateRange, groupBy],
    { showToastOnError: true },
  );

  // Transform daily activity for charts
  const chartData = useMemo(() => {
    if (!data?.trends?.daily) return [];
    return data.trends.daily.map((day) => ({
      date: day.date,
      activeUsers: day.activeUsers,
      lessonsCompleted: day.lessonCompletes,
      xpEarned: day.xpEarned || 0,
    }));
  }, [data]);

  // Transform growth data
  const growthData = useMemo(() => {
    if (!data?.trends?.growth) return [];
    return data.trends.growth;
  }, [data]);

  // Transform device data for pie chart
  const deviceData = useMemo(() => {
    if (!data?.demographics?.devices) return [];
    return data.demographics.devices;
  }, [data]);

  if (loading) return <LoadingState message="Loading analytics..." />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (!data) return null;

  const { summary, trends, demographics, timeframe } = data;

  return (
    <AdminPage
      title="Analytics Dashboard"
      description={`${new Date(timeframe.start).toLocaleDateString()} - ${new Date(timeframe.end).toLocaleDateString()}`}
      headerAction={
        <div className="flex gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 dark:text-gray-200"
          >
            {ANALYTICS_TIME_RANGES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <RefreshButton onClick={refetch} loading={loading} />
        </div>
      }
    >
      <div className="space-y-6">
        {/* Quick Stats Cards */}
        <QuickStats
          platformMetrics={{
            monthlyActiveUsers: summary.users.active,
            totalLessonsCompleted: summary.content.lessonsCompleted,
            totalXP: summary.content.totalXP,
            avgSessionDuration: Math.round(
              summary.engagement.avgSessionDuration / 60,
            ),
          }}
        />

        {/* Metrics Grid */}
        <MetricsGrid
          platformMetrics={{
            dailyActiveUsers:
              trends.daily[trends.daily.length - 1]?.activeUsers || 0,
            avgSessionDuration: Math.round(
              summary.engagement.avgSessionDuration / 60,
            ),
            totalXP: summary.content.totalXP,
            totalLessonsCompleted: summary.content.lessonsCompleted,
          }}
        />

        {/* Charts Grid - Added min-h to prevent zero-height issues */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <h3 className="text-lg font-medium mb-4 dark:text-gray-200">
              User Activity
            </h3>
            <div className="w-full">
              <ActivityChart data={chartData} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <h3 className="text-lg font-medium mb-4 dark:text-gray-200">
              User Growth
            </h3>
            <div className="w-full">
              <GrowthChart data={growthData} />
            </div>
          </div>
        </div>

        {/* Content Performance & Demographics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopContent contentPerformance={trends.popularContent} />

          <div className="space-y-6">
            <UserSegmentation
              userSegments={demographics.segments}
              platformMetrics={{
                monthlyActiveUsers: summary.users.active,
              }}
            />

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
              <h3 className="text-lg font-medium mb-4 dark:text-gray-200">
                Device Breakdown
              </h3>
              <div className="w-full">
                <DevicesChart data={deviceData} />
              </div>
            </div>
          </div>
        </div>

        {/* Struggling Content Table (optional) */}
        {trends.strugglingContent?.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <h3 className="text-lg font-medium mb-4">
              Content Needing Attention
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Lesson</th>
                    <th className="text-left py-2">Starts</th>
                    <th className="text-left py-2">Completions</th>
                    <th className="text-left py-2">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {trends.strugglingContent.map((lesson) => (
                    <tr key={lesson._id} className="border-b">
                      <td className="py-2">{lesson.title}</td>
                      <td className="py-2">{lesson.starts}</td>
                      <td className="py-2">{lesson.completions}</td>
                      <td className="py-2">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            lesson.completionRate < 30
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {lesson.completionRate.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminPage>
  );
};

export default AdminAnalytics;
