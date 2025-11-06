import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="continer mx-auto px-4 py-8">
      {/*Welcome Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-python-blue">
          Welcome back, {user?.username}!
        </h1>
        <p className="text-gray-600 mt-2">
          Continue your Python journey where you left off
        </p>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-700">Current Level</h3>
          <p className="text-3xl font-bold text-python-blue mt-2">
            {user?.level || 1}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-700">Total XP</h3>
          <p className="text-3xl font-bold text-python-yellow mt-2">
            {user?.xp || 0}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-700">
            Current Streak
          </h3>
          <p className="text-3xl font-bold text-green-500 mt-2">
            {user?.streak || 0}
          </p>
        </div>
      </div>

      {/* Continue Learning */}
      <div className="bg-white rounded-lg shadow-md p-8 text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Ready to continue learning?
        </h2>
        <Link
          to="/modules"
          className="bg-python-blue text-white px-8 py-3 rounded-lg font-semibold hover:bg-python-dark transition inline-block"
        >
          Continue Learning
        </Link>
      </div>

      {/* Placeholder for future sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Recent Badges
          </h3>
          <p className="text-gray-600">Your earned badges will appear here</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Progress Overview
          </h3>
          <p className="text-gray-600">
            Your learning progress vizualization will appear here
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
