// Register.jsx
import { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context";
import { Spinner, LoadingState } from "../components/ui";

// ── Constants (computed once on module load) ──────────────────────

const MAX_DATE_OF_BIRTH = (() => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 13);
  return d.toISOString().split("T")[0];
})();

const AGE_INFO_MAP = {
  "13-15": {
    icon: "🛡️",
    title: "Enhanced Privacy Protection",
    description:
      "As a young learner, your privacy is especially important to us.",
    details: [
      "Your profile is private by default - other learners won't see your username or progress",
      "We don't store your date of birth, only your age bracket",
      "Some social features are limited until you turn 16",
      "You can download or delete your data anytime in Settings",
      "Talk to a parent or guardian if you have any questions",
    ],
    color: "blue",
  },
  "16-17": {
    icon: "🔐",
    title: "You're in Control",
    description: "You have full control over your privacy and data.",
    details: [
      "Customize what information is visible to others in Privacy Settings",
      "We only collect data needed to provide learning services",
      "Export your data anytime under Settings > Export Data",
      "Delete your account and all associated data permanently",
      "Review our full privacy policy in Settings",
    ],
    color: "green",
  },
  "18+": {
    icon: "🎉",
    title: "Welcome!",
    description: "Your learning journey starts here.",
    details: [
      "Customize your privacy preferences in Settings",
      "Full access to all platform features",
      "Export or delete your data anytime",
    ],
    color: "purple",
  },
};

const AGE_COLORS = {
  blue: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-200 dark:border-blue-800",
  },
  green: {
    bg: "bg-green-50 dark:bg-green-900/20",
    border: "border-green-200 dark:border-green-800",
  },
  purple: {
    bg: "bg-purple-50 dark:bg-purple-900/20",
    border: "border-purple-200 dark:border-purple-800",
  },
};

/**
 * User registration page with comprehensive form validation and age-appropriate UX.
 */
const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showAgeInfo, setShowAgeInfo] = useState(false);

  const { register, loading, authError, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Real-time password match validation
  useEffect(() => {
    if (confirmPassword && password !== confirmPassword) {
      setPasswordError("Passwords do not match");
    } else {
      setPasswordError("");
    }
  }, [password, confirmPassword]);

  // Mirrors server/utils/userUtils.js calculateAge + getAgeBracket
  // Client-side preview only — server validates independently
  const getAgeBracket = (dob) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    if (age < 13) return null;
    if (age < 16) return "13-15";
    if (age < 18) return "16-17";
    return "18+";
  };

  const ageBracket = getAgeBracket(dateOfBirth);
  const ageInfo = AGE_INFO_MAP[ageBracket] || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    await register(
      username,
      email,
      password,
      dateOfBirth,
      ageBracket === "13-15",
    );
  };

  // Show loading state during initial auth check
  if (loading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-200 dark:bg-gray-900">
        <LoadingState message="Checking authentication..." height="h-screen" />
      </div>
    );
  }

  // Don't render form if already authenticated
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex justify-center items-start md:items-center bg-gray-200 dark:bg-gray-900 pt-10 pb-12 px-6 sm:px-10">
      <div className="max-w-sm sm:max-w-md w-full space-y-8 bg-white dark:bg-slate-800 p-8 sm:p-10 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
        <div className="text-center">
          <h1 className="mt-6 text-3xl font-extrabold text-python-blue dark:text-python-yellow">
            Register
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Start your Python journey today
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 sm:mt-8 space-y-4">
          {authError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {authError}
            </div>
          )}

          {/* Username */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-python-dark dark:text-python-light"
            >
              Username:
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              minLength="3"
              maxLength="30"
              disabled={loading}
              placeholder="Enter your username"
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-python-blue dark:bg-slate-700 dark:border-slate-600 dark:text-gray-200"
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-python-dark dark:text-python-light"
            >
              Email:
            </label>
            <input
              id="email"
              type="email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              disabled={loading}
              placeholder="Enter your email"
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-python-blue dark:bg-slate-700 dark:border-slate-600 dark:text-gray-200"
            />
          </div>

          {/* Date of Birth */}
          <div className="relative">
            <div className="flex items-center justify-between">
              <label
                htmlFor="dateOfBirth"
                className="block text-sm font-medium text-python-dark dark:text-python-light"
              >
                Date of Birth:
              </label>
              <button
                type="button"
                onMouseEnter={() => setShowAgeInfo(true)}
                onMouseLeave={() => setShowAgeInfo(false)}
                onClick={() => setShowAgeInfo(!showAgeInfo)}
                className="text-python-blue dark:text-python-yellow hover:underline text-xs font-medium"
              >
                Why do we need this?
              </button>
            </div>
            <input
              id="dateOfBirth"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              required
              max={MAX_DATE_OF_BIRTH}
              disabled={loading}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-python-blue dark:bg-slate-700 dark:border-slate-600 dark:text-gray-200"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              You must be at least 13 years old to register.
            </p>

            {showAgeInfo && (
              <div className="absolute z-10 mt-2 w-full bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg shadow-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">
                  Why We Ask for Your Age
                </h4>
                <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                  <li>
                    • We need to verify you're at least 13 (required by law)
                  </li>
                  <li>• We provide enhanced privacy for younger learners</li>
                  <li>• Your date of birth is NEVER stored on our servers</li>
                  <li>
                    • We only keep your age bracket (13-15, 16-17, or 18+)
                  </li>
                  <li>
                    • This helps us comply with UK GDPR and children's privacy
                    laws
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Dynamic age bracket info — uses complete Tailwind class strings */}
          {dateOfBirth && ageBracket && ageInfo && (
            <div
              className={`${AGE_COLORS[ageInfo.color].bg} ${AGE_COLORS[ageInfo.color].border} rounded-lg p-4`}
            >
              <div className="flex items-start space-x-3">
                <span className="text-2xl">{ageInfo.icon}</span>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                    {ageInfo.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {ageInfo.description}
                  </p>
                  <ul className="mt-2 space-y-1">
                    {ageInfo.details.map((detail, index) => (
                      <li
                        key={index}
                        className="text-xs text-gray-500 dark:text-gray-400 flex items-start"
                      >
                        <span className="mr-2 mt-0.5">•</span>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-python-dark dark:text-python-light"
            >
              Password:
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              disabled={loading}
              placeholder="Enter your password"
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-python-blue dark:bg-slate-700 dark:border-slate-600 dark:text-gray-200"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Must contain uppercase, lowercase, number, and special character
              (@$!%*?&)
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-python-dark dark:text-python-light"
            >
              Confirm Password:
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              disabled={loading}
              placeholder="Confirm your password"
              className={`mt-1 block w-full px-4 py-3 border rounded-md shadow-sm focus:outline-none focus:ring-python-blue dark:bg-slate-700 dark:border-slate-600 dark:text-gray-200 ${
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

          {/* Privacy Policy */}
          <div className="flex items-start space-x-3">
            <input
              id="privacyPolicy"
              type="checkbox"
              required
              className="mt-1 h-4 w-4 text-python-blue focus:ring-python-blue border-gray-300 rounded"
            />
            <label
              htmlFor="privacyPolicy"
              className="text-xs text-gray-600 dark:text-gray-300"
            >
              I agree to the{" "}
              <Link
                to="/privacy"
                target="_blank"
                className="text-python-blue dark:text-python-yellow hover:underline font-medium"
              >
                Privacy Policy
              </Link>{" "}
              (
              <Link
                to="/privacy#young-learners"
                target="_blank"
                className="text-python-blue dark:text-python-light hover:text-purple-600 underline"
              >
                summary for younger users
              </Link>
              ) and confirm I am at least 13 years old.
            </label>
          </div>

          {/* Parental Consent */}
          {ageBracket === "13-15" && (
            <div className="flex items-start space-x-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <input
                id="parentalConsent"
                type="checkbox"
                required
                className="mt-1 h-4 w-4 text-python-blue focus:ring-python-blue border-gray-300 rounded"
              />
              <label
                htmlFor="parentalConsent"
                className="text-xs text-gray-600 dark:text-gray-300"
              >
                I confirm that I have discussed creating this account with a
                parent or guardian...
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !!passwordError}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm rounded-md text-white hover:text-python-light bg-python-blue hover:bg-python-dark dark:bg-python-yellow dark:hover:bg-python-light dark:text-python-dark dark:hover:text-python-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-python-blue disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-extrabold"
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
              "Create Account"
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
