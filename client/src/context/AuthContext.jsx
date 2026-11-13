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
  useMemo,
} from "react";
import { useNotification } from "../context/NotificationContext";
import {
  getUserLocalDate,
  getErrorMessage,
  getStoredAccessToken,
  isTokenValid,
  setTokenMemory,
} from "../utils";
import { syncStoredConsentToBackend } from "../hooks/useCookieConsent";
import {
  apiClient,
  authApiClient,
  adminApiClient,
  setupInterceptors,
  setupSessionEndTracking,
  clearSessionId,
  sendSessionEnd,
  BACKEND_URL,
} from "../services";

// ---------------------------------------------------------------------------
// Re-export API clients for consumers that need direct access
// ---------------------------------------------------------------------------
export { apiClient, authApiClient, adminApiClient };

// ---------------------------------------------------------------------------
// Context Definition
// ---------------------------------------------------------------------------

const AuthContext = createContext(null);

// ---------------------------------------------------------------------------
// AuthProvider Component
// ---------------------------------------------------------------------------

export const AuthProvider = ({ children }) => {
  const { showToast } = useNotification();

  // ---- State ----
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [leaderboardVersion, setLeaderboardVersion] = useState(0);

  // ---- Refs ----
  const refreshPromise = useRef(null);
  const logoutInitiated = useRef(false);

  /**
   * Set the Authorization header on all three API client instances.
   * @param {string|null} token - The access token, or null to clear the header
   */
  const setAuthHeader = useCallback((token) => {
    if (token) {
      const authHeader = `Bearer ${token}`;
      apiClient.defaults.headers.common["Authorization"] = authHeader;
      authApiClient.defaults.headers.common["Authorization"] = authHeader;
      adminApiClient.defaults.headers.common["Authorization"] = authHeader;
    } else {
      delete apiClient.defaults.headers.common["Authorization"];
      delete authApiClient.defaults.headers.common["Authorization"];
      delete adminApiClient.defaults.headers.common["Authorization"];
    }
  }, []);

  /**
   * Persist user data and token in memory, update Axios default headers,
   * and clear any existing auth error.
   *
   * ✅ Uses shallow field comparison including streakLastCheckedDate and username
   */
  const setAuthData = useCallback(
    (userData, newAccessToken, isRememberMe = false) => {
      setUser((prevUser) => {
        if (
          prevUser &&
          userData &&
          prevUser._id === userData._id &&
          prevUser.xp === userData.xp &&
          prevUser.level === userData.level &&
          prevUser.streak === userData.streak &&
          prevUser.streakLastCheckedDate === userData.streakLastCheckedDate &&
          prevUser.username === userData.username
        ) {
          return prevUser;
        }
        return userData;
      });

      setAccessToken(newAccessToken);
      setTokenMemory(newAccessToken);

      if (newAccessToken) {
        if (isRememberMe) {
          localStorage.setItem("rememberMe", "true");
        } else {
          localStorage.removeItem("rememberMe");
        }
      }

      setAuthHeader(
        newAccessToken && isTokenValid(newAccessToken) ? newAccessToken : null,
      );
      setAuthError(null);
    },
    [setAuthHeader],
  );

  const updateUser = useCallback((newUserData) => {
    setUser((prevUser) =>
      prevUser ? { ...prevUser, ...newUserData } : newUserData,
    );
  }, []);

  const isUserAdmin = useCallback(() => user?.isAdmin === true, [user]);

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
        setAuthHeader(null);
        setTokenMemory(null);
        localStorage.removeItem("rememberMe");
        setAuthData(null, null);
        showToast(message || "You have been logged out", "info");
        setLoading(false);
        sendSessionEnd(BACKEND_URL);
        clearSessionId();
        refreshPromise.current = null;
        logoutInitiated.current = false;
      }
    },
    [setAuthData, showToast, setAuthHeader],
  );

  const refreshAuthToken = useCallback(() => {
    if (refreshPromise.current) return refreshPromise.current;

    const p = (async () => {
      try {
        const payload = await authApiClient.post("/api/auth/refresh-token", {
          userLocalDate: getUserLocalDate(),
        });
        const { accessToken: newAccessToken, user: newUserData } = payload;
        if (!newAccessToken || !newUserData)
          throw new Error("Invalid refresh response");

        if (!logoutInitiated.current) {
          setAuthData(
            newUserData,
            newAccessToken,
            !!localStorage.getItem("rememberMe"),
          );
        }
        return newAccessToken;
      } catch (err) {
        if (!logoutInitiated.current) {
          setAuthData(null, null);
          setAuthError("Session expired. Please log in again.");
          showToast("Session expired. Please log in again.", "error");
        }
        throw err;
      }
    })();

    refreshPromise.current = p;
    const clear = () => {
      if (refreshPromise.current === p) refreshPromise.current = null;
    };
    p.then(clear, clear);
    return p;
  }, [setAuthData, showToast]);

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

  const login = useCallback(
    async (email, password, rememberMe) => {
      const userLocalDate = getUserLocalDate();

      return executeAuthAction(
        "login",
        () =>
          authApiClient.post("/api/auth/login", {
            email,
            password,
            rememberMe,
            userLocalDate,
          }),
        async (payload) => {
          const { accessToken: receivedAccessToken, user: userData } = payload;
          if (receivedAccessToken && userData) {
            setAuthData(userData, receivedAccessToken, rememberMe);
            await syncStoredConsentToBackend();
            showToast("Login Successful!", "success");
            return { success: true };
          }
          throw new Error("Invalid response format.");
        },
      );
    },
    [executeAuthAction, setAuthData, showToast],
  );

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
        async (payload) => {
          const {
            accessToken: receivedAccessToken,
            user: userData,
            ageNotice,
            privacyNotice,
          } = payload;
          if (receivedAccessToken && userData) {
            setAuthData(userData, receivedAccessToken, false);
            await syncStoredConsentToBackend();
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
   */
  const fetchUserProfile = useCallback(async () => {
    const token = getStoredAccessToken();

    if (!token || !isTokenValid(token)) {
      try {
        await refreshAuthToken();
        const freshToken = getStoredAccessToken();
        if (!freshToken) {
          setLoading(false);
          return;
        }
        setAuthHeader(freshToken);
      } catch {
        setAuthData(null, null);
        setLoading(false);
        return;
      }
    } else {
      setAuthHeader(token);
    }

    try {
      setLoading(true);
      const payload = await apiClient.get("/auth/user");
      const userData = payload.user || payload;
      const storedToken = getStoredAccessToken();
      const isRememberMe = !!localStorage.getItem("rememberMe");
      setAuthData(userData, storedToken, isRememberMe);
    } catch {
      setAuthData(null, null);
    } finally {
      setLoading(false);
    }
  }, [setAuthData, refreshAuthToken, setAuthHeader]);

  // ---------------------------------------------------------------------------
  // Effects
  // ---------------------------------------------------------------------------

  const isAuthenticated = !!user;
  useEffect(() => {
    if (!isAuthenticated) return;
    return setupSessionEndTracking(BACKEND_URL);
  }, [isAuthenticated]);

  /**
   * On mount: attempt to restore auth state via the httpOnly refresh cookie.
   * Safe to run once — refreshAuthToken reads from refs, not stale state.
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
  }, [fetchUserProfile]);

  /**
   * One-time interceptor setup.
   */
  useEffect(() => {
    const cleanup = setupInterceptors(
      refreshAuthToken,
      showToast,
      logoutInitiated,
    );
    return cleanup;
  }, [refreshAuthToken, showToast]);

  // ---------------------------------------------------------------------------
  // Context Value — ✅ Memoized to prevent unnecessary consumer re-renders
  // ---------------------------------------------------------------------------

  const authContextValue = useMemo(
    () => ({
      user,
      accessToken,
      loading,
      authError,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      refreshAuthToken,
      updateUser,
      leaderboardVersion,
      triggerLeaderboardRefresh: () => setLeaderboardVersion((v) => v + 1),
      isUserAdmin,
    }),
    [
      user,
      accessToken,
      loading,
      authError,
      login,
      register,
      logout,
      refreshAuthToken,
      updateUser,
      leaderboardVersion,
      isUserAdmin,
    ],
  );

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// ---------------------------------------------------------------------------
// Consumer Hook
// ---------------------------------------------------------------------------

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
