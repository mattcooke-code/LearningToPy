// AuthContext.jsx - Cleaned version
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

  // Refs for token refresh management
  const isRefreshing = useRef(false);
  const refreshPromise = useRef(null);
  const failedQueue = useRef([]);
  const logoutInitiated = useRef(false);

  // Process queued requests after successful refresh
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

  // Decode token to check expiration
  const isTokenValid = useCallback((token) => {
    if (!token) return false;

    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch {
      return false;
    }
  }, []);

  // Update Auth State
  const setAuthData = useCallback(
    (userData, newAccessToken, isRememberMe = false) => {
      setUser((prevUser) => {
        if (JSON.stringify(prevUser) === JSON.stringify(userData)) {
          return prevUser;
        }
        return userData;
      });

      setAccessToken((prevToken) => {
        if (prevToken === newAccessToken) return prevToken;
        return newAccessToken;
      });

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

  // Update user
  const updateUser = useCallback((newUserData) => {
    setUser((prevUser) => {
      if (!prevUser) return newUserData;
      return { ...prevUser, ...newUserData };
    });
  }, []);

  // Admin status
  const isUserAdmin = useCallback(() => {
    return user?.isAdmin === true;
  }, [user]);

  // Logout Function
  const logout = useCallback(
    async (message = null) => {
      if (logoutInitiated.current) {
        return;
      }

      logoutInitiated.current = true;
      setLoading(true);
      setAuthError(null);

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
        // Silent fail - token might already be invalid
      } finally {
        delete authApiClient.defaults.headers.common["Authorization"];

        localStorage.removeItem("accessToken");
        sessionStorage.removeItem("accessToken");
        setAuthData(null, null);

        if (message) {
          showToast(message, "info");
        } else {
          showToast("You have been logged out", "info");
        }

        setLoading(false);
        refreshPromise.current = null;
        failedQueue.current = [];
        isRefreshing.current = false;
        logoutInitiated.current = false;
      }
    },
    [setAuthData, showToast]
  );

  // Refresh Access Token with queue management
  const refreshAuthToken = useCallback(async () => {
    if (isRefreshing.current) {
      return new Promise((resolve, reject) => {
        failedQueue.current.push({ resolve, reject });
      });
    }

    if (refreshPromise.current) {
      return refreshPromise.current;
    }

    isRefreshing.current = true;
    setAuthError(null);

    const refreshP = (async () => {
      try {
        const response = await authApiClient.post("/api/auth/refresh-token");
        const { accessToken: newAccessToken, user: newUserData } =
          response.data.data;

        if (!newAccessToken || !newUserData) {
          throw new Error("Invalid refresh response from server");
        }

        const originalRememberMePreference =
          !!localStorage.getItem("accessToken");
        setAuthData(newUserData, newAccessToken, originalRememberMePreference);
        showToast("Session refreshed!", "success");
        processQueue(null, newAccessToken);

        return newAccessToken;
      } catch (refreshError) {
        processQueue(refreshError, null);

        if (!logoutInitiated.current) {
          localStorage.removeItem("accessToken");
          sessionStorage.removeItem("accessToken");
          setAuthData(null, null);
          setAuthError("Your session has expired. Please log in again.");
          showToast("Your session has expired. Please log in again.", "error");
        }
        throw refreshError;
      } finally {
        isRefreshing.current = false;
        refreshPromise.current = null;
      }
    })();

    refreshPromise.current = refreshP;
    return refreshP;
  }, [setAuthData, showToast, processQueue]);

  // Reusable auth action executor with error handling
  const executeAuthAction = useCallback(
    async (actionName, apiCall, successHandler) => {
      setLoading(true);
      setAuthError(null);

      try {
        const response = await apiCall();
        return await successHandler(response);
      } catch (err) {
        let errorMessage;

        if (err.response?.status === 429) {
          errorMessage = `Too many ${actionName} attempts. Please wait 15 minutes and try again.`;
        } else if (
          err.code === "ERR_NETWORK" ||
          err.message === "Network Error"
        ) {
          errorMessage =
            "Network error. Please check your connection and try again.";
        } else if (err.response?.status === 403 && actionName === "login") {
          errorMessage =
            "Invalid email or password. Please check your credentials.";
        } else {
          errorMessage = getErrorMessage(
            err,
            `${
              actionName.charAt(0).toUpperCase() + actionName.slice(1)
            } failed. Please try again.`
          );
        }

        setAuthError(errorMessage);
        showToast(errorMessage, "error");
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [showToast]
  );

  // Login Function
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
        (response) => {
          const { accessToken: receivedAccessToken, user: userData } =
            response.data.data;
          if (receivedAccessToken && userData) {
            setAuthData(userData, receivedAccessToken, rememberMe);
            showToast("Login Successful!", "success");
            return { success: true };
          } else {
            throw new Error("Invalid response from the server during login.");
          }
        }
      );
    },
    [executeAuthAction, setAuthData, showToast]
  );

  // Register Function
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
        (response) => {
          const { accessToken: receivedAccessToken, user: userData } =
            response.data.data;
          if (receivedAccessToken && userData) {
            setAuthData(userData, receivedAccessToken, false);
            showToast(
              "Registration successful! You are now logged in.",
              "success"
            );
            return { success: true };
          } else {
            throw new Error(
              "Invalid response from server during registration."
            );
          }
        }
      );
    },
    [executeAuthAction, setAuthData, showToast]
  );

  // Initial user profile fetch
  const fetchUserProfile = useCallback(async () => {
    if (user) {
      setLoading(false);
      return;
    }

    const storedAccessToken = getStoredAccessToken();
    if (!storedAccessToken) {
      setLoading(false);
      return;
    }

    // Check token validity before making request
    if (!isTokenValid(storedAccessToken)) {
      localStorage.removeItem("accessToken");
      sessionStorage.removeItem("accessToken");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const authHeader = `Bearer ${storedAccessToken}`;
      apiClient.defaults.headers.common["Authorization"] = authHeader;
      adminApiClient.defaults.headers.common["Authorization"] = authHeader;

      const response = await apiClient.get("/auth/user");
      const { user: userData } = response.data.data;

      setAuthData(
        userData,
        storedAccessToken,
        !!localStorage.getItem("accessToken")
      );
    } catch (err) {
      if (err.response?.status !== 401) {
        // 401 will be handled by interceptor
        localStorage.removeItem("accessToken");
        sessionStorage.removeItem("accessToken");
        setAuthData(null, null);
      }
    } finally {
      setLoading(false);
    }
  }, [setAuthData, user, isTokenValid]);

  // Initial Token Validation & User Load
  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  // Axios Interceptors
  useEffect(() => {
    const requestInterceptor = apiClient.interceptors.request.use(
      (config) => {
        if (!config.headers.Authorization) {
          const currentAccessToken = getStoredAccessToken();
          if (currentAccessToken && isTokenValid(currentAccessToken)) {
            config.headers.Authorization = `Bearer ${currentAccessToken}`;
          }
        }
        return config;
      },
      (err) => Promise.reject(err)
    );

    const responseInterceptor = apiClient.interceptors.response.use(
      (response) => response,
      async (err) => {
        const originalRequest = err.config;

        if (
          logoutInitiated.current ||
          originalRequest.url?.includes("/auth/logout")
        ) {
          return Promise.reject(err);
        }

        if (err.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newAccessToken = await refreshAuthToken();
            if (newAccessToken) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              return apiClient(originalRequest);
            }
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
    };
  }, [refreshAuthToken, isTokenValid]);

  // Admin Interceptors
  adminApiClient.interceptors.request.use(
    (config) => {
      const currentAccessToken = getStoredAccessToken();
      if (currentAccessToken && isTokenValid(currentAccessToken)) {
        config.headers.Authorization = `Bearer ${currentAccessToken}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  adminApiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (logoutInitiated.current) {
        return Promise.reject(error);
      }

      if (error.response?.status === 403) {
        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
        return Promise.reject(new Error("Admin access required"));
      }

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const newAccessToken = await refreshAuthToken();
          if (newAccessToken) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return adminApiClient(originalRequest);
          }
        } catch {
          return Promise.reject(error);
        }
      }

      if (error.response) {
        const { status, data } = error.response;
        switch (status) {
          case 404:
            error.message = data?.message || "Admin resource not found";
            break;
          case 429:
            error.message = "Too many admin requests. Please slow down.";
            break;
          case 500:
            error.message = "Admin server error. Please try again later.";
            break;
        }
      }

      return Promise.reject(error);
    }
  );

  const triggerLeaderboardRefresh = () =>
    setLeaderboardVersion((version) => version + 1);

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
    triggerLeaderboardRefresh,
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
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
