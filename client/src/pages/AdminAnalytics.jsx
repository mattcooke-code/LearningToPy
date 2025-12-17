// AdminAnalytics.jsx
import { AdminPage, AnalyticsChart } from "../components/admin";

const AdminAnalytics = () => {
  return (
    <AdminPage
      title="Analytics Dashboard"
      description="Track platform performance and user engagement metrics"
    >
      <AnalyticsChart />
    </AdminPage>
  );
};

export default AdminAnalytics;
