import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { authApiClient, useNotification } from "../context";
import { getErrorMessage, getSuccessMessage } from "../utils";
import { LoadingState, ErrorState, Spinner } from "../components/ui";

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { showToast } = useNotification();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      setIsValidating(true);
      setError("");

      if (!token) {
        setError("No reset token provided. Please check your reset link.");
        setIsValidating(false);
        return;
      }

      try {
        await authApiClient.get(`/api/auth/validate-reset-token/${token}`);
        setIsTokenValid(true);
        showToast(
          "Reset link is valid. Please enter your new password.",
          "info",
        );
      } catch (err) {
        const errorMessage = getErrorMessage(
          err,
          "This password reset link is invalid or has expired.",
        );
        setError(errorMessage);
        showToast(errorMessage, "error");
        setIsTokenValid(false);
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token, showToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (password !== confirmPassword) {
      const errorMessage = "Passwords do not match!";
      setError(errorMessage);
      showToast(errorMessage, "error");
      return;
    }

    if (password.length < 6) {
      const errorMessage = "Password must be at least 6 characters long.";
      setError(errorMessage);
      showToast(errorMessage, "error");
      return;
    }

    setLoading(true);

    try {
      const response = await authApiClient.post("/api/auth/reset-password", {
        token,
        newPassword: password,
      });

      const successMessage =
        response.message || getSuccessMessage("update", "Password");

      setMessage(successMessage);
      showToast(successMessage, "success");

      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      const errorMessage = getErrorMessage(
        err,
        "Failed to reset password. The link may be invalid or expired.",
      );
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  // Show full-page loading during token validation
  if (isValidating) {
    return <LoadingState message="Validating your reset link..." />;
  }

  // Show error state if token is invalid and we're not loading
  if (!isValidating && !isTokenValid && error) {
    return (
      <ErrorState error={error} onBack={() => navigate("/forgot-password")} />
    );
  }

  return (
    <div className="min-h-screen flex justify-center items-start md:items-center bg-gray-200 dark:bg-gray-900 pt-10 pb-12 px-6 sm:px-10">
      <div className="max-w-sm sm:max-w-md w-full space-y-8 bg-white dark:bg-slate-800 p-8 sm:p-10 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-python-blue dark:text-python-yellow">
            Reset Your Password
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Enter your new password below
          </p>
        </div>

        {message && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-md">
            {message}
          </div>
        )}

        {error && !isValidating && isTokenValid && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {isTokenValid ? (
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-python-dark dark:text-python-light"
                >
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  disabled={loading}
                  placeholder="Enter new password"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-python-blue focus:border-python-blue dark:focus:border-python-light disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-700 dark:text-gray-200"
                />
              </div>
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-python-dark dark:text-python-light"
                >
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  disabled={loading}
                  placeholder="Confirm new password"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-python-blue focus:border-python-blue dark:focus:border-python-light disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-700 dark:text-gray-200"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm rounded-md text-python-yellow hover:text-python-light bg-python-blue hover:bg-python-dark dark:bg-python-yellow dark:hover:bg-python-light dark:text-python-dark dark:hover:text-python-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-python-blue disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-extrabold"
            >
              {loading ? (
                <Spinner
                  size="sm"
                  color="white"
                  showText={true}
                  text="Resetting..."
                  center={false}
                />
              ) : (
                "Reset Password"
              )}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              This password reset link is invalid or has expired.
            </p>
            <Link
              to="/forgot-password"
              className="inline-flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-python-yellow hover:text-python-light bg-python-blue hover:bg-python-dark dark:bg-python-yellow dark:hover:bg-python-light dark:text-python-dark dark:hover:text-python-blue transition-colors"
            >
              Request New Reset Link
            </Link>
          </div>
        )}

        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            <Link
              to="/login"
              className="font-medium text-python-blue hover:text-python-dark dark:text-python-yellow dark:hover:text-python-light transition-colors"
            >
              Return to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
