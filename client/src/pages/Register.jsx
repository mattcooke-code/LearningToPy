import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context";
import { Spinner } from "../components/ui";

/**
 * User registration page with comprehensive form validation and password confirmation.
 * This page handles new user account creation with username, email, and password fields,
 * including real-time password matching validation and automatic redirect after successful registration.
 */

/**
 * Registration page component for creating new user accounts with comprehensive validation.
 *
 * This component manages user registration with form fields for username, email, password,
 * and password confirmation. Features real-time password validation, character limits,
 * accessibility attributes, and automatic redirect for authenticated users. Includes
 * error handling, loading states, and responsive design for optimal user experience.
 *
 * @component
 * @returns {JSX.Element} Registration form with validation and user creation
 *
 * @stateManagement
 * - username: User's chosen username (3-30 characters)
 * - email: User's email address for account
 * - password: User's password for authentication
 * - confirmPassword: Password confirmation field
 * - dateOfBirth: Age verification field
 * - passwordError: Real-time validation error for password mismatch
 *
 * @validationLogic
 * - Username length validation (3-30 characters)
 * - Email format validation through HTML5 input type
 * - Password matching validation in real-time
 * - Age verification > 13 years old (GDPR)
 * - Form validation before submission
 * - Disabled submit button when validation fails
 *
 * @userExperience
 * - Real-time password mismatch feedback
 * - Loading spinner during registration process
 * - Error messages for failed registration attempts
 * - Auto-complete attributes for better UX
 * - Responsive design for all screen sizes
 *
 * @securityFeatures
 * - Password confirmation to prevent typos
 * - Secure password handling through AuthContext
 * - Auto-complete attributes for password managers
 * - Form validation before API submission
 *
 * @navigationLogic
 * - Automatic redirect for authenticated users
 * - Link to login page for existing users
 * - Prevents access when already authenticated
 */
const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showAgeInfo, setShowAgeInfo] = useState(false);
  const [showPrivacyInfo, setShowPrivacyInfo] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);

  const { register, loading, authError, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate("/");
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    if (confirmPassword && password !== confirmPassword) {
      setPasswordError("Passwords do not match");
    } else {
      setPasswordError("");
    }
  }, [password, confirmPassword]);

  // Calculate age bracket based on selected date for dynamic messaging
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

  // Calculate the latest valid date of birth (must be at least 13 years old)
  const maxDateOfBirth = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 13);
    return d.toISOString().split("T")[0];
  })();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    const result = await register(username, email, password, dateOfBirth);

    if (result?.success) {
      setRegistrationData(result);
      setRegistrationSuccess(true);
    }
  };

  const handleContinue = () => {
    navigate("/");
  };

  const handleStartLearning = () => {
    // Navigate to dashboard, modals will appear on profile page
    navigate("/");
  };

  // Age-appropriate information based on selected DOB
  const getAgeInfo = (bracket) => {
    switch (bracket) {
      case "13-15":
        return {
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
        };
      case "16-17":
        return {
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
        };
      case "18+":
        return {
          icon: "🎉",
          title: "Welcome!",
          description: "Your learning journey starts here.",
          details: [
            "Customize your privacy preferences in Settings",
            "Full access to all platform features",
            "Export or delete your data anytime",
          ],
          color: "purple",
        };
      default:
        return null;
    }
  };

  const ageInfo = getAgeInfo(ageBracket);

  return (
    <div className="min-h-screen flex justify-center items-start md:items-center bg-gray-200 dark:bg-gray-900 pt-10 pb-12 px-6 sm:px-10">
      <div className="max-w-sm sm:max-w-md w-full space-y-8 bg-white dark:bg-slate-800 p-8 sm:p-10 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-python-blue dark:text-python-yellow">
            Register
          </h2>
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

          {/* Date of Birth with hover info */}
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
              max={maxDateOfBirth}
              disabled={loading}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-python-blue dark:bg-slate-700 dark:border-slate-600 dark:text-gray-200"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              You must be at least 13 years old to register.
            </p>

            {/* Hoverable age info panel */}
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

          {/* Dynamic age bracket info panel */}
          {dateOfBirth && ageBracket && (
            <div
              className={`bg-${ageInfo.color}-50 dark:bg-${ageInfo.color}-900/20 border border-${ageInfo.color}-200 dark:border-${ageInfo.color}-800 rounded-lg p-4`}
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

          {/* Privacy Policy Checkbox */}
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
              <button
                type="button"
                onClick={() => setShowPrivacyInfo(true)}
                className="text-python-blue dark:text-python-yellow hover:underline font-medium"
              >
                Privacy Policy
              </button>{" "}
              (
              <a
                href="/privacy#young-learners"
                className="text-python-blue dark:text-python-light hover:text-purple-600"
              >
                see summary for younger users
              </a>
              ) and understand how my data will be used. I confirm I am at least
              13 years old.
            </label>
          </div>

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

      {/* Privacy Policy Modal */}
      {showPrivacyInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-2xl font-bold text-python-blue dark:text-python-yellow mb-2">
                Privacy Policy
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Last updated: May 2026
              </p>
            </div>

            <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
              <section>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  What We Collect
                </h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Username and email address</li>
                  <li>Age bracket (13-15, 16-17, or 18+)</li>
                  <li>Learning progress and achievements</li>
                  <li>Quiz and exercise results</li>
                  <li>Activity timestamps for streaks</li>
                </ul>
                <p className="mt-2 text-xs italic">
                  Note: Your date of birth is verified but NEVER stored.
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  How We Use Your Data
                </h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>To provide personalized learning experiences</li>
                  <li>To track your progress and award achievements</li>
                  <li>To maintain learning streaks and leaderboards</li>
                  <li>To improve our platform and fix bugs</li>
                  <li>To comply with UK GDPR and children's privacy laws</li>
                </ul>
              </section>

              <section>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Your Rights Under GDPR
                </h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Access your data anytime (Settings → Export Data)</li>
                  <li>Correct inaccurate information</li>
                  <li>Delete your account and all data permanently</li>
                  <li>Object to data processing</li>
                  <li>Data portability (receive your data in JSON format)</li>
                </ul>
              </section>

              <section>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Data Retention
                </h4>
                <p>
                  Your account data is retained until you delete your account.
                  Activity logs are automatically deleted after 90 days. You can
                  request immediate deletion at any time.
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Special Protections for Under-16s
                </h4>
                <p>
                  If you're under 16, we automatically enable enhanced privacy
                  settings. Your profile won't be visible to other users, and
                  certain social features are limited. These protections follow
                  the UK Age Appropriate Design Code.
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Contact Us
                </h4>
                <p>
                  For privacy-related questions or to exercise your data rights,
                  contact us at:{" "}
                  <a
                    href="mailto:learning2py@gmail.com"
                    className="text-python-blue dark:text-python-yellow underline"
                  >
                    learning2py@gmail.com
                  </a>
                </p>
              </section>
            </div>

            <button
              onClick={() => setShowPrivacyInfo(false)}
              className="mt-6 w-full py-3 px-4 bg-python-blue hover:bg-python-dark dark:bg-python-yellow dark:hover:bg-python-light text-white dark:text-python-dark font-bold rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
