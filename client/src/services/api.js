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

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

// ---------------------------------------------------------------------------
// Axios Instances
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Analytics Request Interceptor
// ---------------------------------------------------------------------------

// Cache device info header string — device doesn't change during a session
let cachedDeviceInfoHeader = null;

const getDeviceInfoHeader = () => {
  if (!cachedDeviceInfoHeader) {
    cachedDeviceInfoHeader = JSON.stringify(getDeviceInfo());
  }
  return cachedDeviceInfoHeader;
};

const setupAnalyticsHeaders = (instance) => {
  instance.interceptors.request.use((config) => {
    const skipAnalytics = config.skipAnalytics === true;

    if (!skipAnalytics && typeof window !== "undefined") {
      config.headers["x-session-id"] = getSessionId();
      config.headers["x-device-info"] = getDeviceInfoHeader();
      if (window.location) {
        config.headers["x-page-path"] = window.location.pathname;
      }
    }

    return config;
  });
};

[apiClient, authApiClient, adminApiClient].forEach(setupAnalyticsHeaders);

// ---------------------------------------------------------------------------
// Response Unwrapper
// ---------------------------------------------------------------------------

const unwrapResponse = (response) => {
  return response.data?.data !== undefined ? response.data.data : response.data;
};

// Error handler omitted — Axios passes errors through automatically
[apiClient, adminApiClient, authApiClient].forEach((instance) => {
  instance.interceptors.response.use(unwrapResponse);
});

// ---------------------------------------------------------------------------
// Auth Interceptors (called by AuthProvider)
// ---------------------------------------------------------------------------

export const setupInterceptors = (
  refreshAuthTokenFn,
  showToastFn,
  logoutInitiatedRef,
) => {
  // Request interceptor: fallback token injection for requests made before
  // AuthProvider has finished initializing and set default headers via setAuthHeader.
  const requestInterceptor = apiClient.interceptors.request.use((config) => {
    const token = getStoredAccessToken();
    if (token && isTokenValid(token) && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Response interceptor (apiClient): 401 → refresh → retry once
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

  // Response interceptor (adminApiClient): 403 toast + 401 refresh-and-retry
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

  return () => {
    apiClient.interceptors.request.eject(requestInterceptor);
    apiClient.interceptors.response.eject(responseInterceptor);
    adminApiClient.interceptors.response.eject(adminResponseInterceptor);
  };
};
