// AuthContext.jsx
/**
 * @fileoverview Authentication context provider and hooks.
 *
 * Manages the full auth lifecycle: login, register, logout, token refresh,
 * user profile fetching, and automatic Authorization header injection.
 *
 * Access tokens are held in memory only (via tokenUtils.setTokenMemory) —
 * never written to localStorage or sessionStorage. On page refresh the
 * httpOnly refresh token cookie is used to silently restore a fresh access
 * token via refreshAuthToken().
 *
 * The only auth-related item in localStorage is the "rememberMe" boolean
 * preference (not a credential), used to determine the refresh token lifespan
 * on the next token refresh.
 *
 * @module AuthContext
 * @requires react
 * @requires ../services/api
 * @requires ../services/session
 * @requires ../utils/tokenUtils
 * @requires ../utils
 * @requires ../context/NotificationContext
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useNotification } from "../context/NotificationContext";
import {
  getErrorMessage,
  getStoredAccessToken,
  isTokenValid,
  setTokenMemory,
} from "../utils";
import {
  apiClient,
  authApiClient,
  adminApiClient,
  setupInterceptors,
  getSessionId,
  setupSessionEndTracking,
} from "../services";

// ---------------------------------------------------------------------------
// Re-export API clients for consumers that need direct access
// ---------------------------------------------------------------------------
export { apiClient, authApiClient, adminApiClient };

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** Base URL for all API requests, read from Vite env or defaulted to localhost. */
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

// ---------------------------------------------------------------------------
// Context Definition
// ---------------------------------------------------------------------------

/**
 * React Context holding all authentication state and actions.
 *
 * @type {React.Context<object|null>}
 */
const AuthContext = createContext(null);

// ---------------------------------------------------------------------------
// AuthProvider Component
// ---------------------------------------------------------------------------

/**
 * Top-level provider that wraps the application with authentication state.
 *
 * @param {{ children: React.ReactNode }} props
 * @returns {JSX.Element}
 */
export const AuthProvider = ({ children }) => {
  const { showToast } = useNotification();

  // ---- State ----
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null); // never seeded from storage
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [leaderboardVersion, setLeaderboardVersion] = useState(0);

  // ---- Refs for token refresh queue ----
  const isRefreshing = useRef(false);
  const refreshPromise = useRef(null);
  const failedQueue = useRef([]);
  const logoutInitiated = useRef(false);

  /**
   * Resolve or reject every promise that was queued while a token refresh
   * was in flight.
   *
   * @param {Error|null} error
   * @param {string|null} token
   */
  const processQueue = useCallback((error, token = null) => {
    failedQueue.current.forEach((promise) => {
      if (error) {
        promise.reject(error);
      } else {
        promise.resolve(token);
      }
    });
    failedQueue.current = [];
  }, []);

  /**
   * Persist user data and token in memory, update Axios default headers,
   * and clear any existing auth error.
   *
   * The token is stored via setTokenMemory (module variable) — never written
   * to localStorage or sessionStorage.
   *
   * @param {object|null} userData
   * @param {string|null} newAccessToken
   * @param {boolean} [isRememberMe=false] - Stored as a plain boolean
   *   preference in localStorage (not a credential).
   */
  const setAuthData = useCallback(
    (userData, newAccessToken, isRememberMe = false) => {
      // Only update user state if the object has actually changed
      setUser((prevUser) =>
        JSON.stringify(prevUser) === JSON.stringify(userData)
          ? prevUser
          : userData,
      );

      setAccessToken(newAccessToken);

      // ✅ Token lives in memory only — no localStorage / sessionStorage writes
      setTokenMemory(newAccessToken);

      // Persist only the remember-me preference (not the token itself)
      if (newAccessToken) {
        if (isRememberMe) {
          localStorage.setItem("rememberMe", "true");
        } else {
          localStorage.removeItem("rememberMe");
        }
      }

      if (newAccessToken && isTokenValid(newAccessToken)) {
        const authHeader = `Bearer ${newAccessToken}`;
        apiClient.defaults.headers.common["Authorization"] = authHeader;
        authApiClient.defaults.headers.common["Authorization"] = authHeader;
        adminApiClient.defaults.headers.common["Authorization"] = authHeader;
      } else {
        delete apiClient.defaults.headers.common["Authorization"];
        delete authApiClient.defaults.headers.common["Authorization"];
        delete adminApiClient.defaults.headers.common["Authorization"];
      }

      setAuthError(null);
    },
    [],
  );

  /**
   * Merge partial user data into the current user object without a full fetch.
   *
   * @param {object} newUserData
   */
  const updateUser = useCallback((newUserData) => {
    setUser((prevUser) =>
      prevUser ? { ...prevUser, ...newUserData } : newUserData,
    );
  }, []);

  /**
   * Check whether the currently authenticated user has admin privileges.
   *
   * @returns {boolean}
   */
  const isUserAdmin = useCallback(() => user?.isAdmin === true, [user]);

  /**
   * Log the current user out.
   *
   * @param {string|null} [message=null]
   */
  const logout = useCallback(
    async (message = null) => {
      if (logoutInitiated.current) return;

      logoutInitiated.current = true;
      setLoading(true);

      if (window.resetTheme) window.resetTheme();

      try {
        const currentAccessToken = getStoredAccessToken();
        if (currentAccessToken) {
          authApiClient.defaults.headers.common["Authorization"] =
            `Bearer ${currentAccessToken}`;
        }
        await authApiClient.post("/api/auth/logout");
      } catch {
        // Silent fail — client-side cleanup is what matters
      } finally {
        delete authApiClient.defaults.headers.common["Authorization"];

        // ✅ Clear memory token and remember-me preference only
        setTokenMemory(null);
        localStorage.removeItem("rememberMe");

        setAuthData(null, null);
        showToast(message || "You have been logged out", "info");
        setLoading(false);
        refreshPromise.current = null;
        failedQueue.current = [];
        isRefreshing.current = false;
        logoutInitiated.current = false;
      }
    },
    [setAuthData, showToast],
  );

  /**
   * Obtain a fresh access token using the refresh-token cookie.
   *
   * Implements request deduplication: if a refresh is already in flight,
   * concurrent callers receive the same promise (or queue behind it).
   *
   * @returns {Promise<string>} The new access token.
   * @throws {Error} If the refresh request fails or the response is malformed.
   */
  const refreshAuthToken = useCallback(async () => {
    if (isRefreshing.current) {
      return new Promise((resolve, reject) => {
        failedQueue.current.push({ resolve, reject });
      });
    }

    if (refreshPromise.current) return refreshPromise.current;

    isRefreshing.current = true;
    const refreshP = (async () => {
      try {
        const payload = await authApiClient.post("/api/auth/refresh-token");
        const { accessToken: newAccessToken, user: newUserData } = payload;

        if (!newAccessToken || !newUserData)
          throw new Error("Invalid refresh response");

        // ✅ Determine remember-me from the preference flag, not storage token
        const isRememberMe = !!localStorage.getItem("rememberMe");
        setAuthData(newUserData, newAccessToken, isRememberMe);
        processQueue(null, newAccessToken);
        return newAccessToken;
      } catch (err) {
        processQueue(err, null);
        if (!logoutInitiated.current) {
          setAuthData(null, null);
          setAuthError("Session expired. Please log in again.");
          showToast("Session expired. Please log in again.", "error");
        }
        throw err;
      } finally {
        isRefreshing.current = false;
        refreshPromise.current = null;
      }
    })();

    refreshPromise.current = refreshP;
    return refreshP;
  }, [setAuthData, showToast, processQueue]);

  /**
   * Generic wrapper for auth actions (login, register).
   *
   * @param {string} actionName
   * @param {Function} apiCall
   * @param {Function} successHandler
   * @returns {Promise<*>}
   */
  const executeAuthAction = useCallback(
    async (actionName, apiCall, successHandler) => {
      setLoading(true);
      setAuthError(null);
      try {
        const payload = await apiCall();
        return await successHandler(payload);
      } catch (err) {
        const errorMessage = getErrorMessage(err, `${actionName} failed.`);
        setAuthError(errorMessage);
        showToast(errorMessage, "error");
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [showToast],
  );

  /**
   * Authenticate with email/password.
   *
   * @param {string} email
   * @param {string} password
   * @param {boolean} rememberMe
   * @returns {Promise<{ success: boolean }>}
   */
  const login = useCallback(
    async (email, password, rememberMe) => {
      return executeAuthAction(
        "login",
        () =>
          authApiClient.post("/api/auth/login", {
            email,
            password,
            rememberMe,
          }),
        (payload) => {
          const { accessToken: receivedAccessToken, user: userData } = payload;
          if (receivedAccessToken && userData) {
            setAuthData(userData, receivedAccessToken, rememberMe);
            showToast("Login Successful!", "success");
            return { success: true };
          }
          throw new Error("Invalid response format.");
        },
      );
    },
    [executeAuthAction, setAuthData, showToast],
  );

  /**
   * Register a new account.
   *
   * @param {string} username
   * @param {string} email
   * @param {string} password
   * @param {string} dateOfBirth
   * @param {boolean} parentalConsent
   * @returns {Promise<{ success: boolean }>}
   */
  const register = useCallback(
    async (username, email, password, dateOfBirth, parentalConsent) => {
      return executeAuthAction(
        "registration",
        () =>
          authApiClient.post("/api/auth/register", {
            username,
            email,
            dateOfBirth,
            password,
            parentalConsent,
          }),
        (payload) => {
          const {
            accessToken: receivedAccessToken,
            user: userData,
            ageNotice,
            privacyNotice,
          } = payload;

          if (receivedAccessToken && userData) {
            // Registration never sets remember-me
            setAuthData(userData, receivedAccessToken, false);
            showToast("Registration successful!", "success");
            return { success: true, user: userData, ageNotice, privacyNotice };
          }
          throw new Error("Invalid response format.");
        },
      );
    },
    [executeAuthAction, setAuthData, showToast],
  );

  /**
   * Fetch the current user's profile from /api/auth/user.
   *
   * On mount, the memory token will be null (page refresh), so this
   * immediately attempts a silent token refresh via the httpOnly cookie
   * before fetching the profile.
   */
  const fetchUserProfile = useCallback(async () => {
    const token = getStoredAccessToken(); // reads from memory

    // No token in memory — attempt silent refresh via httpOnly cookie
    if (!token || !isTokenValid(token)) {
      try {
        await refreshAuthToken();

        const freshToken = getStoredAccessToken();
        if (!freshToken) {
          setLoading(false);
          return;
        }
        const authHeader = `Bearer ${freshToken}`;
        apiClient.defaults.headers.common["Authorization"] = authHeader;
        authApiClient.defaults.headers.common["Authorization"] = authHeader;
        adminApiClient.defaults.headers.common["Authorization"] = authHeader;
      } catch {
        // No valid refresh token cookie — user is logged out
        setAuthData(null, null);
        setLoading(false);
        return;
      }
    } else {
      const authHeader = `Bearer ${token}`;
      apiClient.defaults.headers.common["Authorization"] = authHeader;
      authApiClient.defaults.headers.common["Authorization"] = authHeader;
      adminApiClient.defaults.headers.common["Authorization"] = authHeader;
    }

    try {
      setLoading(true);
      const payload = await apiClient.get("/auth/user");
      const userData = payload.user || payload;
      const storedToken = getStoredAccessToken();
      // ✅ Determine remember-me from preference flag, not storage token presence
      const isRememberMe = !!localStorage.getItem("rememberMe");
      setAuthData(userData, storedToken, isRememberMe);
    } catch (err) {
      if (err.response?.status === 401) {
        try {
          await refreshAuthToken();
        } catch {
          setAuthData(null, null);
        }
      } else {
        setAuthData(null, null);
      }
    } finally {
      setLoading(false);
    }
  }, [setAuthData, refreshAuthToken]);

  // ---------------------------------------------------------------------------
  // Effects
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (user) {
      const cleanup = setupSessionEndTracking(BACKEND_URL);
      return cleanup;
    }
  }, [user]);

  /**
   * On mount: attempt to restore auth state via the httpOnly refresh cookie.
   * No storage reads needed — the cookie is sent automatically.
   */
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      if (isMounted) {
        await fetchUserProfile();
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const cleanup = setupInterceptors(
      refreshAuthToken,
      showToast,
      logoutInitiated,
    );
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------------------
  // Context Value
  // ---------------------------------------------------------------------------

  const authContextValue = {
    user,
    accessToken,
    loading,
    authError,
    isAuthenticated: !!user || !!accessToken,
    login,
    register,
    logout,
    refreshAuthToken,
    updateUser,
    leaderboardVersion,
    triggerLeaderboardRefresh: () => setLeaderboardVersion((v) => v + 1),
    isUserAdmin,
    sessionId: typeof window !== "undefined" ? getSessionId() : null,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// ---------------------------------------------------------------------------
// Consumer Hook
// ---------------------------------------------------------------------------

/**
 * Access the auth context. Must be called from a component wrapped in
 * <AuthProvider>.
 *
 * @returns {object}
 * @throws {Error} If called outside of an AuthProvider.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
