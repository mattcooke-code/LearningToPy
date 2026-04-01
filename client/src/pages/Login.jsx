import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context";
import { Spinner } from "../components/ui";

const Login = () => {
  // --- STATE MANAGEMENT ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const { login, loading, authError, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // --- EFFECTS AND HANDLERS ---
  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate("/");
    }
  }, [isAuthenticated, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password, rememberMe);
  };

  // --- RENDER ---
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-python-blue dark:text-python-yellow">
            Log In
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Continue your Python journey
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {authError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {authError}
            </div>
          )}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-python-dark dark:text-python-light"
            >
              Email:
            </label>
            <input
              type="email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              disabled={loading}
              placeholder="Enter your email"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-python-blue disabled:bg-gray-100 dark:focus:border-python-light dark:text-gray-200"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-python-dark dark:text-python-light"
            >
              Password:
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={loading}
              placeholder="Enter your password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-python-blue focus:border-python-blue dark:focus:border-python-light  disabled:bg-gray-100 dark:text-gray-200"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={loading}
              className="h-4 w-4 text-python-blue focus:ring-python-blue border-gray-300 rounded"
            />
            <label
              htmlFor="rememberMe"
              className="ml-2 block text-sm text-gray-900 dark:text-gray-200"
            >
              Remember Me (30 days)
            </label>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm  rounded-md text-python-yellow hover:text-python-light bg-python-blue hover:bg-python-dark dark:bg-python-yellow dark:hover:bg-python-light dark:text-python-dark dark:hover:text-python-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-python-blue disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-extrabold"
          >
            {loading ? (
              <Spinner
                size="sm"
                color="white"
                showText={true}
                text="Logging In..."
                center={false}
              />
            ) : (
              "Log In"
            )}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-medium text-python-blue hover:text-python-dark transition-colors dark:hover:text-purple-400 dark:text-python-yellow"
              >
                Register here
              </Link>
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">
              <Link
                to="/forgot-password"
                className="font-medium text-python-blue hover:text-python-dark dark:hover:text-purple-400 dark:text-python-yellow transition-colors"
              >
                Forgot your password?{" "}
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
