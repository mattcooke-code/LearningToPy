// AuthContext.jsx
/**
 * @fileoverview Authentication context provider and hooks.
 *
 * Manages the full auth lifecycle: login, register, logout, token refresh,
 * user profile fetching, and automatic Authorization header injection.
 *
 * Delegates API client management and interceptor setup to
 * `/client/src/services/api.js`, session tracking to
 * `/client/src/services/session.js`, and token validation to
 * `/client/src/utils/tokenUtils.js`.
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
import { getErrorMessage, getStoredAccessToken, isTokenValid } from "../utils";
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
 * **State managed:**
 * - `user` — the current user object (or null)
 * - `accessToken` — the current JWT (or null)
 * - `loading` — true during initial auth check and auth actions
 * - `authError` — the most recent auth-related error message
 * - `leaderboardVersion` — a monotonically increasing number used to
 *   invalidate leaderboard caches
 *
 * **Key actions exposed via context:**
 * - `login(email, password, rememberMe)`
 * - `register(username, email, password)`
 * - `logout([message])`
 * - `refreshAuthToken()`
 * - `updateUser(newUserData)`
 * - `isUserAdmin()`
 * - `triggerLeaderboardRefresh()`
 *
 * @param {{ children: React.ReactNode }} props
 * @returns {JSX.Element}
 */
export const AuthProvider = ({ children }) => {
  const { showToast } = useNotification();

  // ---- State ----
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(getStoredAccessToken());
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
   * @param {Error|null} error - If provided, all queued promises reject with
   *   this error.
   * @param {string|null} token - If provided, all queued promises resolve
   *   with this new token.
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
   * Persist user data and token, update Axios default headers, and clear any
   * existing auth error.
   *
   * Avoids unnecessary re-renders by performing a deep equality check on the
   * user object before calling `setUser`.
   *
   * @param {object|null} userData - The user object to persist (or null to clear).
   * @param {string|null} newAccessToken - The JWT to persist (or null to clear).
   * @param {boolean} [isRememberMe=false] - If true, store the token in
   *   localStorage; otherwise sessionStorage.
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

      // Clear previous tokens from both storages
      localStorage.removeItem("accessToken");
      sessionStorage.removeItem("accessToken");

      if (newAccessToken && isTokenValid(newAccessToken)) {
        if (isRememberMe) {
          localStorage.setItem("accessToken", newAccessToken);
        } else {
          sessionStorage.setItem("accessToken", newAccessToken);
        }

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
   * Merge partial user data into the current user object without a full
   * fetch. Useful for optimistically updating profile fields or XP/level
   * changes received via WebSocket or after a mutation.
   *
   * @param {object} newUserData - Partial user fields to merge.
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
   * 1. Sets a guard ref to prevent concurrent logouts and token refresh races.
   * 2. Calls the global `window.resetTheme` if available.
   * 3. POSTs to `/api/auth/logout` (best-effort; failures are swallowed).
   * 4. Clears all stored tokens and auth state.
   * 5. Displays a toast notification.
   *
   * @param {string|null} [message=null] - Optional custom toast message.
   *   Defaults to "You have been logged out".
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
        // Silent fail — the client-side cleanup is what matters
      } finally {
        delete authApiClient.defaults.headers.common["Authorization"];
        localStorage.removeItem("accessToken");
        sessionStorage.removeItem("accessToken");
        localStorage.removeItem("sessionId");
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
   * On failure the user is logged out and an error toast is shown.
   *
   * @returns {Promise<string>} The new access token.
   * @throws {Error} If the refresh request fails or the response is malformed.
   */
  const refreshAuthToken = useCallback(async () => {
    // If a refresh is already in flight, queue this caller
    if (isRefreshing.current) {
      return new Promise((resolve, reject) => {
        failedQueue.current.push({ resolve, reject });
      });
    }

    // Return the existing promise if available (dedup within the same tick)
    if (refreshPromise.current) return refreshPromise.current;

    isRefreshing.current = true;
    const refreshP = (async () => {
      try {
        const payload = await authApiClient.post("/api/auth/refresh-token");
        const { accessToken: newAccessToken, user: newUserData } = payload;

        if (!newAccessToken || !newUserData)
          throw new Error("Invalid refresh response");

        const isRememberMe = !!localStorage.getItem("accessToken");
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
   * Generic wrapper for auth actions (login, register) that manages loading
   * state, error extraction, and toast notifications.
   *
   * @param {string} actionName - Human-readable name used in error messages
   *   (e.g. "login", "registration").
   * @param {Function} apiCall - Async function that performs the API request
   *   and returns the unwrapped payload.
   * @param {Function} successHandler - Async function that receives the
   *   payload and processes it (calls setAuthData, shows success toast, etc.).
   * @returns {Promise<*>} The return value of `successHandler`.
   * @throws {Error} Re-throws with a user-friendly message on failure.
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
   * @param {boolean} rememberMe - If true, persist token in localStorage;
   *   otherwise sessionStorage.
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
   * On success the user is immediately authenticated (token stored in
   * sessionStorage, not localStorage).
   *
   * @param {string} username
   * @param {string} email
   * @param {string} password
   * @param {string} dateOfBirth - ISO date string (YYYY-MM-DD)
   * @returns {Promise<{ success: boolean }>}
   */
  const register = useCallback(
    async (username, email, password, dateOfBirth) => {
      return executeAuthAction(
        "registration",
        () =>
          authApiClient.post("/api/auth/register", {
            username,
            email,
            dateOfBirth,
            password,
          }),
        (payload) => {
          const {
            accessToken: receivedAccessToken,
            user: userData,
            ageNotice,
            privacyNotice,
          } = payload;

          if (receivedAccessToken && userData) {
            setAuthData(userData, receivedAccessToken, false);
            showToast("Registration successful!", "success");

            return {
              success: true,
              user: userData,
              ageNotice,
              privacyNotice,
            };
          }
          throw new Error("Invalid response format.");
        },
      );
    },
    [executeAuthAction, setAuthData, showToast],
  );
  /**
   * Fetch the current user's profile from `/api/auth/user`.
   *
   * Handles several edge cases:
   * - No stored token → clears user and loading.
   * - Valid token with existing user object → skips fetch.
   * - Expired token → attempts a refresh first; on failure logs out.
   * - 401 during fetch → attempts a refresh; on failure logs out.
   * - Any other error → logs out.
   */
  const fetchUserProfile = useCallback(async () => {
    const token = getStoredAccessToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    // Ensure the API client has the auth header set
    if (token && isTokenValid(token)) {
      const authHeader = `Bearer ${token}`;
      apiClient.defaults.headers.common["Authorization"] = authHeader;
      authApiClient.defaults.headers.common["Authorization"] = authHeader;
      adminApiClient.defaults.headers.common["Authorization"] = authHeader;
    }

    if (!isTokenValid(token)) {
      try {
        await refreshAuthToken();
        // After successful refresh the token will be set by setAuthData —
        // the effect will re-run
        return;
      } catch {
        setAuthData(null, null);
        setLoading(false);
        return;
      }
    }

    // If we already have user data and token is valid, no need to refetch
    if (user && isTokenValid(token)) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const payload = await apiClient.get("/auth/user");
      const userData = payload.user || payload;

      setAuthData(userData, token, !!localStorage.getItem("accessToken"));
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
  }, [setAuthData, user, refreshAuthToken]);

  // ---------------------------------------------------------------------------
  // Effects
  // ---------------------------------------------------------------------------

  /**
   * When the user object changes from null → authenticated, register the
   * beforeunload session-end beacon via the session service. Remove it when
   * the user logs out.
   */
  useEffect(() => {
    if (user) {
      const cleanup = setupSessionEndTracking(BACKEND_URL);
      return cleanup;
    }
  }, [user]);

  /**
   * One-time initialisation on mount:
   * 1. Read any stored token and pre-set Authorization headers.
   * 2. Fetch the user profile (or refresh if the stored token is expired).
   */
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      const token = getStoredAccessToken();

      if (token && isTokenValid(token)) {
        const authHeader = `Bearer ${token}`;
        apiClient.defaults.headers.common["Authorization"] = authHeader;
        authApiClient.defaults.headers.common["Authorization"] = authHeader;
        adminApiClient.defaults.headers.common["Authorization"] = authHeader;
      }

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

  /**
   * One-time setup of Axios request/response interceptors via the API
   * service. The cleanup function ejects them on unmount.
   */
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

  /**
   * The complete set of values and functions exposed to consumers via
   * `useAuth()`.
   *
   * @type {object}
   */
  const authContextValue = {
    /** @type {object|null} Current authenticated user */
    user,
    /** @type {string|null} Current JWT access token */
    accessToken,
    /** @type {boolean} True during initial auth check and auth actions */
    loading,
    /** @type {string|null} Most recent auth error message */
    authError,
    /** @type {boolean} Convenience flag: true when user or token exists */
    isAuthenticated: !!user || !!accessToken,
    /** @type {Function} login(email, password, rememberMe) */
    login,
    /** @type {Function} register(username, email, password) */
    register,
    /** @type {Function} logout([message]) */
    logout,
    /** @type {Function} refreshAuthToken() */
    refreshAuthToken,
    /** @type {Function} updateUser(partialUser) */
    updateUser,
    /** @type {number} Monotonically increasing version for leaderboard invalidation */
    leaderboardVersion,
    /** @type {Function} Increments leaderboardVersion by 1 */
    triggerLeaderboardRefresh: () => setLeaderboardVersion((v) => v + 1),
    /** @type {Function} isUserAdmin() */
    isUserAdmin,
    /** @type {string|null} Current analytics session ID */
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
 * `<AuthProvider>`.
 *
 * @returns {object} The auth context value (see `authContextValue` above).
 * @throws {Error} If called outside of an AuthProvider.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
