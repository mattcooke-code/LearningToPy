import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context";
import { Spinner } from "../components/ui";

const Register = () => {
  // --- STATE MANAGEMENT ---
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const { register, loading, authError, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // --- EFFECTS AND HANDLERS ---
  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate("/");
    }
  }, [isAuthenticated, loading, navigate]);

  // Clear password error when passwords match
  useEffect(() => {
    if (confirmPassword && password !== confirmPassword) {
      setPasswordError("Passwords do not match");
    } else {
      setPasswordError("");
    }
  }, [password, confirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords match before submitting
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    await register(username, email, password);
  };

  // --- RENDER ---
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-python-blue dark:text-python-yellow">
            Register
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Start your Python journey today
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
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 dark:text-python-light"
            >
              Username:
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              minLength="3"
              maxLength="30"
              disabled={loading}
              placeholder="Enter your username"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-python-blue dark:focus:border-python-light disabled:bg-gray-100 dark:text-gray-200"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-python-light"
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-python-blue dark:focus:border-python-light disabled:bg-gray-100 dark:text-gray-200"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-python-light"
            >
              Password:
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              disabled={loading}
              placeholder="Enter your password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-python-blue focus:border-python-blue dark:focus:border-python-light disabled:bg-gray-100 dark:text-gray-200"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 dark:text-python-light"
            >
              Confirm Password:
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              disabled={loading}
              placeholder="Confirm your password"
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-python-blue dark:focus:border-python-light disabled:bg-gray-100 dark:text-gray-200 ${
                passwordError && confirmPassword
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-300"
              }`}
            />
            {passwordError && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {passwordError}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !!passwordError}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm rounded-md text-python-yellow hover:text-python-light bg-python-blue hover:bg-python-dark dark:bg-python-yellow dark:hover:bg-python-light dark:text-python-dark dark:hover:text-python-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-python-blue disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-extrabold"
          >
            {loading ? (
              <Spinner
                size="sm"
                color="white"
                showText={true}
                text="Registering..."
                center={false}
              />
            ) : (
              "Register"
            )}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-python-blue hover:text-python-dark dark:text-python-yellow dark:hover:text-purple-400 transition-colors"
              >
                Log In Here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
