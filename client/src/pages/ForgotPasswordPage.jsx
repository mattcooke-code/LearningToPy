// ForgotPasswordPage.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { useNotification, authApiClient, useAuth } from "../context";
import { getErrorMessage } from "../utils";
import { Spinner } from "../components/ui";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { showToast } = useNotification();
  const { authError } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await authApiClient.post("/api/auth/forgot-password", {
        email,
      });

      const successMessage =
        response.message ||
        "If an account with that email exists, a password reset link has been sent.";

      setMessage(successMessage);
      showToast(successMessage, "info");
      setEmail("");
    } catch (err) {
      const errorMessage = getErrorMessage(
        err,
        "Failed to send reset email. Please try again.",
      );
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-start md:items-center bg-gray-200 dark:bg-gray-900 pt-10 pb-12 px-6 sm:px-10">
      <div className="max-w-sm sm:max-w-md w-full space-y-8 bg-white dark:bg-slate-800 p-8 sm:p-10 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-python-blue dark:text-python-yellow">
            Forgot Password?
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Enter your email address and we'll send you a link to reset your
            password.
          </p>
        </div>

        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {authError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-python-light"
            >
              Email Address:
            </label>
            <input
              type="email"
              id="email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              disabled={loading}
              placeholder="Enter your email"
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-python-blue dark:bg-slate-700 dark:border-slate-600 dark:text-gray-200"
            />
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
                text="Sending..."
                center={false}
              />
            ) : (
              "Send Reset Link"
            )}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Remember your password?{" "}
              <Link
                to="/login"
                className="font-medium text-python-blue hover:text-python-dark dark:text-python-yellow dark:hover:text-purple-400 transition-colors"
              >
                Log in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
