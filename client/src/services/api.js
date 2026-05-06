// /client/src/services/api.js
/**
 * @fileoverview Axios API client factory and interceptor setup.
 *
 * Creates and exports three pre-configured Axios instances:
 *
 * - `apiClient` — general-purpose, targets `${BACKEND_URL}/api`
 * - `authApiClient` — auth-specific, targets bare `BACKEND_URL`
 * - `adminApiClient` — admin-only, targets `${BACKEND_URL}/api/admin`
 *
 * All instances share:
 * - JSON content-type headers
 * - `withCredentials: true` (sends cookies with cross-origin requests)
 * - Analytics headers (session ID, device info, page path) on every request
 *   unless `config.skipAnalytics === true`
 * - Response unwrapping that extracts `response.data.data` so consumers
 *   receive the payload directly
 *
 * Additionally exports `setupInterceptors` which wires up auth token
 * injection and 401/403 refresh-and-retry logic. This is called once by
 * AuthProvider on mount.
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

/** Base URL for all API requests, read from Vite env or defaulted to localhost. */
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

// ---------------------------------------------------------------------------
// Axios Instances
// ---------------------------------------------------------------------------

/**
 * General-purpose API client targeting `${BACKEND_URL}/api`.
 * Used for most authenticated data requests (progress, modules, lessons, etc.).
 *
 * @type {import('axios').AxiosInstance}
 */
export const apiClient = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

/**
 * Auth-specific API client targeting the bare BACKEND_URL.
 * Used for login, register, logout, refresh-token, forgot-password, etc.
 *
 * @type {import('axios').AxiosInstance}
 */
export const authApiClient = axios.create({
  baseURL: BACKEND_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

/**
 * Admin API client targeting `${BACKEND_URL}/api/admin`.
 * All admin-only routes live under this prefix.
 *
 * @type {import('axios').AxiosInstance}
 */
export const adminApiClient = axios.create({
  baseURL: `${BACKEND_URL}/api/admin`,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// ---------------------------------------------------------------------------
// Analytics Request Interceptor
// ---------------------------------------------------------------------------

/**
 * Attach analytics headers (session ID, device info, page path) to every
 * outgoing request on the given Axios instance — unless the request config
 * explicitly sets `skipAnalytics: true`.
 *
 * Headers added:
 * - `x-session-id` — the current session UUID
 * - `x-device-info` — JSON-stringified device info object
 * - `x-page-path` — the current `window.location.pathname`
 *
 * @param {import('axios').AxiosInstance} instance - The Axios instance to decorate.
 */
const setupAnalyticsHeaders = (instance) => {
  instance.interceptors.request.use((config) => {
    const skipAnalytics = config.skipAnalytics === true;

    if (!skipAnalytics && typeof window !== "undefined") {
      config.headers["x-session-id"] = getSessionId();

      const deviceInfo = getDeviceInfo();
      config.headers["x-device-info"] = JSON.stringify(deviceInfo);

      if (window.location) {
        config.headers["x-page-path"] = window.location.pathname;
      }
    }

    return config;
  });
};

// Apply analytics headers to all three clients
[apiClient, authApiClient, adminApiClient].forEach(setupAnalyticsHeaders);

// ---------------------------------------------------------------------------
// Response Unwrapper
// ---------------------------------------------------------------------------

/**
 * Unwrap the backend's standard response envelope.
 *
 * The backend wraps successful payloads as `{ data: <actual> }`. This
 * interceptor extracts `<actual>` so consumers receive the payload directly.
 * If the response does not contain a `data` key the raw response body is
 * returned unchanged.
 *
 * @param {import('axios').AxiosResponse} response - The raw Axios response.
 * @returns {*} The unwrapped payload (response.data.data) or the full
 *   response body if no envelope is detected.
 */
const unwrapResponse = (response) => {
  return response.data?.data !== undefined ? response.data.data : response.data;
};

// Apply the unwrapper as a success response interceptor on all three clients.
// Error responses are passed through unchanged via Promise.reject.
[apiClient, adminApiClient, authApiClient].forEach((instance) => {
  instance.interceptors.response.use(
    (response) => unwrapResponse(response),
    (err) => Promise.reject(err),
  );
});

// ---------------------------------------------------------------------------
// Auth Interceptors (called by AuthProvider)
// ---------------------------------------------------------------------------

/**
 * Wire up request and response interceptors for the API and admin clients.
 *
 * **Request interceptor (apiClient):**
 * Attaches the stored Bearer token to every request if one is available and
 * valid.
 *
 * **Response interceptor (apiClient):**
 * On 401 responses, attempts a silent token refresh and retries the original
 * request exactly once. If the refresh fails the error is re-thrown.
 *
 * **Response interceptor (adminApiClient):**
 * Handles 403 (shows an "Admin access required" toast) and 401 with the same
 * refresh-and-retry pattern.
 *
 * @param {Function} refreshAuthTokenFn - The `refreshAuthToken` function from
 *   the AuthProvider closure.
 * @param {Function} showToastFn - The `showToast` function from
 *   NotificationContext.
 * @param {React.MutableRefObject<boolean>} logoutInitiatedRef - A ref
 *   preventing refresh attempts during an active logout.
 * @returns {Function} A cleanup function that ejects all three interceptors.
 */
export const setupInterceptors = (
  refreshAuthTokenFn,
  showToastFn,
  logoutInitiatedRef,
) => {
  // ---- Request interceptor (apiClient) ----
  const requestInterceptor = apiClient.interceptors.request.use((config) => {
    const token = getStoredAccessToken();
    if (token && isTokenValid(token) && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // ---- Response interceptor (apiClient) ----
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

  // ---- Response interceptor (adminApiClient) ----
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
