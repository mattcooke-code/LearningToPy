// /client/src/services/api.js

/**
 * @fileoverview Axios API client factory and interceptor setup.
 *
 * @module services/api
 * @requires axios
 * @requires ./session
 * @requires ../utils/deviceInfo
 * @requires ../utils/tokenUtils
 */

import axios from "axios";
import { getSessionId } from "./session";
import { getDeviceInfo } from "../utils/deviceInfo";
import { getStoredAccessToken, isTokenValid } from "../utils/tokenUtils";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

export const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

// ---------------------------------------------------------------------------
// Axios Instances
// ---------------------------------------------------------------------------

const createClient = (baseURL) =>
  axios.create({
    baseURL,
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  });

export const apiClient = createClient(`${BACKEND_URL}/api`);
export const authApiClient = createClient(BACKEND_URL);
export const adminApiClient = createClient(`${BACKEND_URL}/api/admin`);

// ---------------------------------------------------------------------------
// Analytics Request Interceptor
// ---------------------------------------------------------------------------

// Cached: device info doesn't change during a page load.
// URL-encoded so header values are always plain ASCII (the server decodes it).
let cachedDeviceInfoHeader = null;

const getDeviceInfoHeader = () => {
  if (!cachedDeviceInfoHeader) {
    try {
      cachedDeviceInfoHeader = encodeURIComponent(
        JSON.stringify(getDeviceInfo()),
      );
    } catch {
      return "";
    }
  }
  return cachedDeviceInfoHeader;
};

const setupAnalyticsHeaders = (instance) => {
  instance.interceptors.request.use((config) => {
    // Sessions are tracked for logged-in users only: no token in memory means
    // no session ID is created or sent, so nothing is stored for anonymous visitors.
    if (
      config.skipAnalytics === true ||
      typeof window === "undefined" ||
      !getStoredAccessToken()
    ) {
      return config;
    }

    config.headers["x-session-id"] = getSessionId();

    const deviceHeader = getDeviceInfoHeader();
    if (deviceHeader) config.headers["x-device-info"] = deviceHeader;

    config.headers["x-page-path"] = window.location.pathname;
    return config;
  });
};

[apiClient, authApiClient, adminApiClient].forEach(setupAnalyticsHeaders);

// ---------------------------------------------------------------------------
// Response Unwrapper
// ---------------------------------------------------------------------------

// Matches the server's sendJsonResponse envelope: { success, message, data }.
// Only real envelopes are unwrapped; any other body (e.g. { received: true },
// a blob, or a payload that merely contains a `data` key) passes through intact.
const isEnvelope = (body) =>
  body !== null &&
  typeof body === "object" &&
  typeof body.success === "boolean" &&
  "data" in body;

const unwrapResponse = (response) =>
  isEnvelope(response.data) ? response.data.data : response.data;

// Registered at module load, i.e. BEFORE the auth interceptors that
// setupInterceptors() adds later. Axios runs response interceptors in
// registration order, so auth handlers always see already-unwrapped
// successes and untouched errors. Keep it that way.
[apiClient, adminApiClient, authApiClient].forEach((instance) => {
  instance.interceptors.response.use(unwrapResponse);
});

// ---------------------------------------------------------------------------
// Auth Interceptors (called by AuthProvider)
// ---------------------------------------------------------------------------

/**
 * Build a 401 handler: refresh the access token once, then retry the request.
 * Never refreshes while a logout is in progress.
 */
const createRefreshRetryHandler =
  (instance, refreshAuthTokenFn, logoutInitiatedRef) => async (err) => {
    const originalRequest = err.config;

    const shouldRefresh =
      err.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !logoutInitiatedRef.current;

    if (!shouldRefresh) return Promise.reject(err);

    originalRequest._retry = true;

    let newToken;
    try {
      newToken = await refreshAuthTokenFn();
    } catch {
      return Promise.reject(err); // surface the original 401
    }

    originalRequest.headers.Authorization = `Bearer ${newToken}`;
    return instance(originalRequest);
  };

export const setupInterceptors = (
  refreshAuthTokenFn,
  showToastFn,
  logoutInitiatedRef,
) => {
  // Fallback token injection for requests made before AuthProvider has
  // finished initialising and set default headers via setAuthHeader.
  const injectFallbackToken = (config) => {
    const token = getStoredAccessToken();
    if (token && isTokenValid(token) && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  };

  const apiRequestInterceptor =
    apiClient.interceptors.request.use(injectFallbackToken);
  const adminRequestInterceptor =
    adminApiClient.interceptors.request.use(injectFallbackToken);

  // apiClient: 401 -> refresh -> retry once
  const apiResponseInterceptor = apiClient.interceptors.response.use(
    (res) => res,
    createRefreshRetryHandler(
      apiClient,
      refreshAuthTokenFn,
      logoutInitiatedRef,
    ),
  );

  // adminApiClient: 403 toast, otherwise the same 401 handling
  const retryAdmin = createRefreshRetryHandler(
    adminApiClient,
    refreshAuthTokenFn,
    logoutInitiatedRef,
  );
  const adminResponseInterceptor = adminApiClient.interceptors.response.use(
    (res) => res,
    (err) => {
      if (err.response?.status === 403) {
        showToastFn("Admin access required", "error");
        // Keep the original axios error so callers can still read
        // err.response.status / err.response.data.
        err.message = "Admin access required";
        return Promise.reject(err);
      }
      return retryAdmin(err);
    },
  );

  return () => {
    apiClient.interceptors.request.eject(apiRequestInterceptor);
    adminApiClient.interceptors.request.eject(adminRequestInterceptor);
    apiClient.interceptors.response.eject(apiResponseInterceptor);
    adminApiClient.interceptors.response.eject(adminResponseInterceptor);
  };
};
