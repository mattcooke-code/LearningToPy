// AuthContext.jsx
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

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

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

/**
 * Shared Helper: Unwraps the backend "envelope" (response.data.data)
 * so the application only sees the actual payload.
 */
const unwrapResponse = (response) => {
  return response.data?.data !== undefined ? response.data.data : response.data;
};

// Apply unwrapper to  interceptors
[apiClient, adminApiClient, authApiClient].forEach((instance) => {
  instance.interceptors.response.use(
    (response) => unwrapResponse(response),
    (err) => Promise.reject(err)
  );
});

// --- AUTHCONTEXT DEFINITION ---
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { showToast } = useNotification();

  const getStoredAccessToken = () => {
    return (
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken")
    );
  };

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

  const isTokenValid = useCallback((token) => {
    if (!token) return false;
    try {
      const decoded = jwtDecode(token);
      return decoded.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  }, []);

  const setAuthData = useCallback(
    (userData, newAccessToken, isRememberMe = false) => {
      setUser((prevUser) =>
        JSON.stringify(prevUser) === JSON.stringify(userData)
          ? prevUser
          : userData
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
    [isTokenValid]
  );

  const updateUser = useCallback((newUserData) => {
    setUser((prevUser) =>
      prevUser ? { ...prevUser, ...newUserData } : newUserData
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
          authApiClient.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${currentAccessToken}`;
        }
        await authApiClient.post("/api/auth/logout");
      } catch (err) {
        // Silent fail
      } finally {
        delete authApiClient.defaults.headers.common["Authorization"];
        localStorage.removeItem("accessToken");
        sessionStorage.removeItem("accessToken");
        setAuthData(null, null);
        showToast(message || "You have been logged out", "info");
        setLoading(false);
        refreshPromise.current = null;
        failedQueue.current = [];
        isRefreshing.current = false;
        logoutInitiated.current = false;
      }
    },
    [setAuthData, showToast]
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
    [showToast]
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
        }
      );
    },
    [executeAuthAction, setAuthData, showToast]
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
        }
      );
    },
    [executeAuthAction, setAuthData, showToast]
  );

  const fetchUserProfile = useCallback(async () => {
    if (user) {
      setLoading(false);
      return;
    }
    const token = getStoredAccessToken();
    if (!token || !isTokenValid(token)) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const payload = await apiClient.get("/auth/user");
      const userData = payload.user || payload;

      setAuthData(userData, token, !!localStorage.getItem("accessToken"));
    } catch (err) {
      if (err.response?.status !== 401) setAuthData(null, null);
    } finally {
      setLoading(false);
    }
  }, [setAuthData, user, isTokenValid]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  // --- INTERCEPTOR SETUP ---
  useEffect(() => {
    const requestInterceptor = apiClient.interceptors.request.use((config) => {
      const token = getStoredAccessToken();
      if (token && isTokenValid(token) && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    const responseInterceptor = apiClient.interceptors.response.use(
      (res) => res,
      async (err) => {
        const originalRequest = err.config;
        if (
          err.response?.status === 401 &&
          !originalRequest._retry &&
          !logoutInitiated.current
        ) {
          originalRequest._retry = true;
          try {
            const newToken = await refreshAuthToken();
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return apiClient(originalRequest);
          } catch {
            return Promise.reject(err);
          }
        }
        return Promise.reject(err);
      }
    );

    const adminResponseInterceptor = adminApiClient.interceptors.response.use(
      (res) => res,
      async (err) => {
        const originalRequest = err.config;
        if (err.response?.status === 403) {
          showToast("Admin access required", "error");
          return Promise.reject(new Error("Admin access required"));
        }
        if (err.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const newToken = await refreshAuthToken();
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return adminApiClient(originalRequest);
          } catch {
            return Promise.reject(err);
          }
        }
        return Promise.reject(err);
      }
    );

    return () => {
      apiClient.interceptors.request.eject(requestInterceptor);
      apiClient.interceptors.response.eject(responseInterceptor);
      adminApiClient.interceptors.response.eject(adminResponseInterceptor);
    };
  }, [refreshAuthToken, isTokenValid, showToast]);

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
