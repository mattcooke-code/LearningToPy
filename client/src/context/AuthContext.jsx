// AuthContext.jsx (Improved with failedQueue and isRefreshing)
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import axios from "axios";
import { useNotification } from "../context";
import { jwtDecode } from "jwt-decode";
import { getErrorMessage } from "../utils/getErrorMessage";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

// --- AXIOS INSTANCES ---
// Main API client for authenticated requests
export const apiClient = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Separate client for auth endpoints to avoid interceptor loops
export const authApiClient = axios.create({
  baseURL: BACKEND_URL,
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

      if (newAccessToken) {
        if (isRememberMe) {
          localStorage.setItem("accessToken", newAccessToken);
        } else {
          sessionStorage.setItem("accessToken", newAccessToken);
        }
      }

      setAuthError(null);
    },
    []
  ); // Logout Function

  // AuthContext.jsx (Lines ~160 - 208)

  const logout = useCallback(
    async (message = null) => {
      if (logoutInitiated.current) {
        return;
      }

      logoutInitiated.current = true;
      console.log("🚪 Initiating logout...");

      setLoading(true);
      setAuthError(null); // Reset theme if function exists

      if (window.resetTheme) window.resetTheme();

      try {
        // --- START: 401 FIX CODE ---
        const currentAccessToken = getStoredAccessToken(); // Only attach the header if we have a token

        if (currentAccessToken) {
          authApiClient.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${currentAccessToken}`;
        } // 1. Attempt API call (must be first!)

        await authApiClient.post("/api/auth/logout");
        console.log("✅ Logout API call successful (cookie cleared)");
      } catch (err) {
        console.log(
          "⚠️ Logout API call failed (token may already be gone):",
          err.message
        );
      } finally {
        // 2. Clean up the Authorization header from authApiClient defaults
        delete authApiClient.defaults.headers.common["Authorization"];
      } // --- END: 401 FIX CODE --- // 3. Client-side cleanup (always happens regardless of API success/failure)
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
    },
    [setAuthData, showToast]
  );

  // Refresh Access Token with queue management
  const refreshAuthToken = useCallback(async () => {
    // If already refreshing, queue this request
    if (isRefreshing.current) {
      return new Promise((resolve, reject) => {
        failedQueue.current.push({ resolve, reject });
      });
    }

    // If we have an active refresh promise, return it
    if (refreshPromise.current) {
      return refreshPromise.current;
    }

    isRefreshing.current = true;
    setAuthError(null);

    const refreshP = (async () => {
      try {
        console.log("🔄 Attempting token refresh...");
        const response = await authApiClient.post("/api/auth/refresh-token");

        const { accessToken: newAccessToken, user: newUserData } =
          response.data;

        if (!newAccessToken || !newUserData) {
          throw new Error("Invalid refresh response from server");
        }

        const originalRememberMePreference =
          !!localStorage.getItem("accessToken");

        setAuthData(newUserData, newAccessToken, originalRememberMePreference);

        console.log("✅ Token refreshed successfully");
        showToast("Session refreshed!", "success");

        // Process all queued requests with new token
        processQueue(null, newAccessToken);

        return newAccessToken;
      } catch (refreshError) {
        console.error("❌ Token refresh failed:", refreshError);

        // Reject all queued requests
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

        // Common auth errors
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
            response.data;
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
            response.data;
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

    setAuthError(null);
    const storedAccessToken = getStoredAccessToken();

    if (!storedAccessToken) {
      setLoading(false);
      return;
    }

    try {
      const decodedToken = jwtDecode(storedAccessToken);
      const tokenExpiry = decodedToken.exp * 1000;
      const timeUntilExpiry = tokenExpiry - Date.now();

      // If token expires in less than 5 seconds, refresh immediately
      if (timeUntilExpiry < 5000) {
        console.warn("Token about to expire, refreshing...");
        await refreshAuthToken();
      } else {
        // Token is valid, fetch user profile
        apiClient.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${storedAccessToken}`;

        const response = await apiClient.get("/auth/user");
        const { user: userData } = response.data;

        const isRememberMe = !!localStorage.getItem("accessToken");
        setAuthData(userData, storedAccessToken, isRememberMe);
        showToast("Welcome back!", "info");
      }
    } catch (err) {
      console.error("🔐 Failed to fetch user profile on load:", err);

      // Try to refresh the token
      try {
        await refreshAuthToken();
      } catch (refreshError) {
        console.error("Failed to refresh on initial load:", refreshError);
        if (!logoutInitiated.current) {
          logout("Authentication error. Please log in again.");
        }
      }
    } finally {
      setLoading(false);
    }
  }, [setAuthData, refreshAuthToken, logout, showToast, user]);

  // Initial Token Validation & User Load
  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  // Axios Interceptors
  useEffect(() => {
    // REQUEST Interceptor: Attaches the Access Token
    const requestInterceptor = apiClient.interceptors.request.use(
      (config) => {
        const currentAccessToken = getStoredAccessToken();

        if (currentAccessToken && !config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${currentAccessToken}`;
        }
        return config;
      },
      (err) => Promise.reject(err)
    );

    // RESPONSE Interceptor: Handles 401s and Token Renewal
    const responseInterceptor = apiClient.interceptors.response.use(
      (response) => response,
      async (err) => {
        const originalRequest = err.config;

        // Don't retry logout or if already initiated
        if (
          logoutInitiated.current ||
          originalRequest.url?.includes("/auth/logout")
        ) {
          return Promise.reject(err);
        }

        // Handle 401 errors with token refresh
        if (err.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          console.log(
            "🔄 Interceptor: Detected 401, attempting token refresh..."
          );

          try {
            const newAccessToken = await refreshAuthToken();
            console.log(
              "✅ Interceptor: Refresh successful, token:",
              newAccessToken
            );

            if (newAccessToken) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              console.log(
                "🔄 Interceptor: Retrying original request with new token"
              );
              return apiClient(originalRequest);
            } else {
              throw new Error("No token received from refresh");
            }
          } catch (refreshError) {
            console.log("❌ Interceptor refresh failed:", refreshError.message);
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
  }, [refreshAuthToken]);

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
