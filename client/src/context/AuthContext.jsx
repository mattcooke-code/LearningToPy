// AuthContext.jsx (updated with analytics headers)
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import axios from "axios";
import { useNotification } from "../context/NotificationContext";
import { jwtDecode } from "jwt-decode";
import { getErrorMessage } from "../utils";
import { v4 as uuidv4 } from "uuid"; // Make sure to install: npm install uuid

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

// --- ANALYTICS HELPER FUNCTIONS ---
const getDeviceInfo = () => {
  const ua = navigator.userAgent;
  const platform = navigator.platform;

  // Detect platform
  let platformName = "unknown";
  if (platform.includes("Win")) platformName = "Windows";
  else if (platform.includes("Mac")) platformName = "macOS";
  else if (platform.includes("Linux")) platformName = "Linux";
  else if (/Android/.test(ua)) platformName = "Android";
  else if (/iPhone|iPad|iPod/.test(ua)) platformName = "iOS";

  // Detect if mobile
  const isMobile = /Mobile|Android|iPhone|iPad|iPod/i.test(ua);

  // Get screen size
  const screenSize = `${window.screen.width}x${window.screen.height}`;

  return {
    userAgent: ua,
    platform: platformName,
    isMobile,
    screenSize,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
};

// Get or create session ID
const getSessionId = () => {
  let sessionId = localStorage.getItem("sessionId");
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem("sessionId", sessionId);
  }
  return sessionId;
};

// --- AXIOS INSTANCES ---
export const apiClient = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

export const authApiClient = axios.create({
  baseURL: BACKEND_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

export const adminApiClient = axios.create({
  baseURL: `${BACKEND_URL}/api/admin`,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// --- ANALYTICS REQUEST INTERCEPTOR ---
const setupAnalyticsHeaders = (instance) => {
  instance.interceptors.request.use((config) => {
    // Skip analytics headers for certain endpoints if needed
    const skipAnalytics = config.skipAnalytics === true;

    if (!skipAnalytics && typeof window !== "undefined") {
      // Add session ID
      config.headers["x-session-id"] = getSessionId();

      // Add device info (stringified to avoid complex objects in headers)
      const deviceInfo = getDeviceInfo();
      config.headers["x-device-info"] = JSON.stringify(deviceInfo);

      // Add page path for page views
      if (window.location) {
        config.headers["x-page-path"] = window.location.pathname;
      }
    }

    return config;
  });
};

// Apply analytics headers to all clients
[apiClient, authApiClient, adminApiClient].forEach(setupAnalyticsHeaders);

/**
 * Shared Helper: Unwraps the backend "envelope" (response.data.data)
 * so the application only sees the actual payload.
 */
const unwrapResponse = (response) => {
  return response.data?.data !== undefined ? response.data.data : response.data;
};

// Apply unwrapper to interceptors
[apiClient, adminApiClient, authApiClient].forEach((instance) => {
  instance.interceptors.response.use(
    (response) => unwrapResponse(response),
    (err) => Promise.reject(err),
  );
});

// --- HELPER FUNCTIONS (OUTSIDE COMPONENT) ---

/**
 * Get stored access token from localStorage or sessionStorage
 */
const getStoredAccessToken = () => {
  return (
    localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken")
  );
};

/**
 * Check if a JWT token is valid (not expired)
 */
const isTokenValid = (token) => {
  if (!token) return false;
  try {
    const decoded = jwtDecode(token);
    return decoded.exp > Date.now() / 1000;
  } catch {
    return false;
  }
};

// --- INTERCEPTOR SETUP (OUTSIDE COMPONENT) ---

/**
 * Setup interceptors for API clients
 * @param {Function} refreshAuthTokenFn - Function to refresh token
 * @param {Function} showToastFn - Function to show toast notifications
 * @param {Object} logoutInitiatedRef - Ref tracking logout state
 * @returns {Function} Cleanup function to eject interceptors
 */
const setupInterceptors = (
  refreshAuthTokenFn,
  showToastFn,
  logoutInitiatedRef,
) => {
  // Request interceptor for apiClient
  const requestInterceptor = apiClient.interceptors.request.use((config) => {
    const token = getStoredAccessToken();
    if (token && isTokenValid(token) && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Response interceptor for apiClient (handles 401 errors)
  const responseInterceptor = apiClient.interceptors.response.use(
    (res) => res,
    async (err) => {
      const originalRequest = err.config;
      if (
        err.response?.status === 401 &&
        !originalRequest._retry &&
        !logoutInitiatedRef.current
      ) {
        originalRequest._retry = true;
        try {
          const newToken = await refreshAuthTokenFn();
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        } catch {
          return Promise.reject(err);
        }
      }
      return Promise.reject(err);
    },
  );

  // Response interceptor for adminApiClient (handles 403 and 401 errors)
  const adminResponseInterceptor = adminApiClient.interceptors.response.use(
    (res) => res,
    async (err) => {
      const originalRequest = err.config;
      if (err.response?.status === 403) {
        showToastFn("Admin access required", "error");
        return Promise.reject(new Error("Admin access required"));
      }
      if (err.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const newToken = await refreshAuthTokenFn();
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return adminApiClient(originalRequest);
        } catch {
          return Promise.reject(err);
        }
      }
      return Promise.reject(err);
    },
  );

  // Return cleanup function
  return () => {
    apiClient.interceptors.request.eject(requestInterceptor);
    apiClient.interceptors.response.eject(responseInterceptor);
    adminApiClient.interceptors.response.eject(adminResponseInterceptor);
  };
};

// --- SESSION END TRACKER ---

const setupSessionEndTracking = () => {
  if (typeof window === "undefined") return;

  const startTime = Date.now();
  const sessionId = getSessionId();

  const handleBeforeUnload = () => {
    const duration = Math.round((Date.now() - startTime) / 1000);

    // Get device info one more time
    const deviceInfo = getDeviceInfo();

    const data = JSON.stringify({
      sessionId,
      duration,
      actionType: "SESSION_END",
      deviceInfo, // Include device info in body as backup
    });

    // Use sendBeacon for reliable last request
    navigator.sendBeacon(`${BACKEND_URL}/api/analytics/session-end`, data);
  };

  window.addEventListener("beforeunload", handleBeforeUnload);

  return () => {
    window.removeEventListener("beforeunload", handleBeforeUnload);
  };
};

// --- AUTHCONTEXT DEFINITION ---
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { showToast } = useNotification();

  // STATE MANAGEMENT
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(getStoredAccessToken());
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [leaderboardVersion, setLeaderboardVersion] = useState(0);

  const isRefreshing = useRef(false);
  const refreshPromise = useRef(null);
  const failedQueue = useRef([]);
  const logoutInitiated = useRef(false);

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

  const setAuthData = useCallback(
    (userData, newAccessToken, isRememberMe = false) => {
      setUser((prevUser) =>
        JSON.stringify(prevUser) === JSON.stringify(userData)
          ? prevUser
          : userData,
      );

      setAccessToken(newAccessToken);

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
      } catch (err) {
        // Silent fail
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

  const register = useCallback(
    async (username, email, password) => {
      return executeAuthAction(
        "registration",
        () =>
          authApiClient.post("/api/auth/register", {
            username,
            email,
            password,
          }),
        (payload) => {
          const { accessToken: receivedAccessToken, user: userData } = payload;
          if (receivedAccessToken && userData) {
            setAuthData(userData, receivedAccessToken, false);
            showToast("Registration successful!", "success");
            return { success: true };
          }
          throw new Error("Invalid response format.");
        },
      );
    },
    [executeAuthAction, setAuthData, showToast],
  );

  const fetchUserProfile = useCallback(async () => {
    const token = getStoredAccessToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    // Always ensure the API client has the auth header set
    if (token && isTokenValid(token)) {
      const authHeader = `Bearer ${token}`;
      apiClient.defaults.headers.common["Authorization"] = authHeader;
      authApiClient.defaults.headers.common["Authorization"] = authHeader;
      adminApiClient.defaults.headers.common["Authorization"] = authHeader;
    }

    if (!isTokenValid(token)) {
      try {
        await refreshAuthToken();
        // After successful refresh, the token will be set by setAuthData
        // Don't set loading false here - let the effect re-run
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
        // Token expired during request, try to refresh
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

  // Setup session end tracking when user is authenticated
  useEffect(() => {
    if (user) {
      const cleanup = setupSessionEndTracking();
      return cleanup;
    }
  }, [user]);

  // Initial auth check - only run once on mount
  useEffect(() => {
    let isMounted = true;
    
    const initAuth = async () => {
      const token = getStoredAccessToken();
      
      // If we have a token, ensure it's set on API clients before any requests
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
  }, []); // Empty dependency array - only run once on mount

  // --- SETUP INTERCEPTORS (SIMPLE NOW!) ---
  useEffect(() => {
    const cleanup = setupInterceptors(
      refreshAuthToken,
      showToast,
      logoutInitiated,
    );
    return cleanup;
  }, []); // Empty dependency array - runs once on mount

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
    // Expose analytics helpers if needed elsewhere
    sessionId: typeof window !== "undefined" ? getSessionId() : null,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
