import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock axios
vi.mock("axios", () => {
  const interceptors = {
    request: { use: vi.fn(), eject: vi.fn() },
    response: { use: vi.fn(), eject: vi.fn() },
  };

  const mockInstance = {
    interceptors,
    defaults: { headers: { common: {} } },
  };

  return {
    default: {
      create: vi.fn(() => mockInstance),
    },
  };
});

vi.mock("../session", () => ({
  getSessionId: () => "mock-session-id-123",
}));

vi.mock("../../utils/deviceInfo", () => ({
  getDeviceInfo: () => ({
    userAgent: "MockAgent/1.0",
    platform: "MockOS",
    browser: "MockBrowser",
    isMobile: false,
    screenSize: "1920x1080",
    language: "en-GB",
    timezone: "Europe/London",
  }),
}));

vi.mock("../../utils/tokenUtils", () => ({
  getStoredAccessToken: () => "mock-stored-token",
  isTokenValid: () => true,
}));

import {
  apiClient,
  authApiClient,
  adminApiClient,
  setupInterceptors,
} from "../api";

// ---------------------------------------------------------------------------
// Capture the interceptor functions at module scope BEFORE any beforeEach
// clears the mock call history. These are registered when api.js loads.
// ---------------------------------------------------------------------------

/**
 * The analytics request interceptor — the first call to request.use on each client.
 * Registered at module load time by the forEach loop in api.js.
 */
const analyticsFn = apiClient.interceptors.request.use.mock.calls[0]?.[0];

/**
 * The response unwrapper success function — the first call to response.use.
 */
const unwrapFn = apiClient.interceptors.response.use.mock.calls[0]?.[0];

/**
 * The response error handler — the second argument to the first response.use call.
 */
const errorFn = apiClient.interceptors.response.use.mock.calls[0]?.[1];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  // Only clear mocks for setupInterceptors tests — don't wipe module-load calls
  // vi.clearAllMocks(); ← REMOVED
});

// ============================================================================
// Exported instances exist
// ============================================================================

describe("Exported API clients", () => {
  it("exports apiClient", () => {
    expect(apiClient).toBeDefined();
    expect(apiClient.interceptors).toBeDefined();
    expect(apiClient.defaults).toBeDefined();
  });

  it("exports authApiClient", () => {
    expect(authApiClient).toBeDefined();
    expect(authApiClient.interceptors).toBeDefined();
  });

  it("exports adminApiClient", () => {
    expect(adminApiClient).toBeDefined();
    expect(adminApiClient.interceptors).toBeDefined();
  });

  it("all instances have request and response interceptor hooks", () => {
    [apiClient, authApiClient, adminApiClient].forEach((client) => {
      expect(client.interceptors.request).toBeDefined();
      expect(client.interceptors.response).toBeDefined();
      expect(typeof client.interceptors.request.use).toBe("function");
      expect(typeof client.interceptors.response.use).toBe("function");
    });
  });
});

// ============================================================================
// Analytics headers interceptor
// ============================================================================

describe("Analytics headers interceptor", () => {
  it("analytics interceptor function was registered at module load", () => {
    expect(analyticsFn).toBeDefined();
    expect(typeof analyticsFn).toBe("function");
  });

  it("attaches analytics headers when skipAnalytics is not set", () => {
    const config = { headers: {} };
    const result = analyticsFn(config);

    expect(result.headers["x-session-id"]).toBe("mock-session-id-123");
    expect(result.headers["x-device-info"]).toBeDefined();
    expect(result.headers["x-page-path"]).toBeDefined();
  });

  it("skips analytics headers when skipAnalytics is true", () => {
    const config = { headers: {}, skipAnalytics: true };
    const result = analyticsFn(config);

    expect(result.headers["x-session-id"]).toBeUndefined();
    expect(result.headers["x-device-info"]).toBeUndefined();
  });
});

// ============================================================================
// Response unwrapper
// ============================================================================

describe("Response unwrapper", () => {
  it("unwrapper function was registered at module load", () => {
    expect(unwrapFn).toBeDefined();
    expect(typeof unwrapFn).toBe("function");
  });

  it("extracts response.data.data when present", () => {
    const response = {
      data: { data: { user: { id: 1, name: "Test" } } },
    };
    expect(unwrapFn(response)).toEqual({ user: { id: 1, name: "Test" } });
  });

  it("returns response.data unchanged when no .data envelope", () => {
    const response = {
      data: { user: { id: 1, name: "Test" } },
    };
    expect(unwrapFn(response)).toEqual({ user: { id: 1, name: "Test" } });
  });

  it("passes errors through to Promise.reject", () => {
    const error = new Error("Network error");
    const result = errorFn(error);
    expect(result).toBeInstanceOf(Promise);
    void expect(result).rejects.toBe(error);
  });
});

// ============================================================================
// setupInterceptors
// ============================================================================

describe("setupInterceptors", () => {
  const mockRefreshFn = vi.fn().mockResolvedValue("new-mock-token");
  const mockShowToast = vi.fn();
  const mockLogoutRef = { current: false };

  it("returns a cleanup function", () => {
    const cleanup = setupInterceptors(
      mockRefreshFn,
      mockShowToast,
      mockLogoutRef,
    );
    expect(typeof cleanup).toBe("function");
  });

  it("registers a request interceptor on apiClient", () => {
    const beforeCount = apiClient.interceptors.request.use.mock.calls.length;

    setupInterceptors(mockRefreshFn, mockShowToast, mockLogoutRef);

    expect(
      apiClient.interceptors.request.use.mock.calls.length,
    ).toBeGreaterThan(beforeCount);
  });

  it("registers response interceptors on apiClient and adminApiClient", () => {
    const beforeApiCount =
      apiClient.interceptors.response.use.mock.calls.length;
    const beforeAdminCount =
      adminApiClient.interceptors.response.use.mock.calls.length;

    setupInterceptors(mockRefreshFn, mockShowToast, mockLogoutRef);

    expect(
      apiClient.interceptors.response.use.mock.calls.length,
    ).toBeGreaterThan(beforeApiCount);
    expect(
      adminApiClient.interceptors.response.use.mock.calls.length,
    ).toBeGreaterThan(beforeAdminCount);
  });

  it("cleanup function ejects interceptors", () => {
    const cleanup = setupInterceptors(
      mockRefreshFn,
      mockShowToast,
      mockLogoutRef,
    );

    apiClient.interceptors.request.eject.mockClear();
    apiClient.interceptors.response.eject.mockClear();
    adminApiClient.interceptors.response.eject.mockClear();

    cleanup();

    expect(apiClient.interceptors.request.eject).toHaveBeenCalled();
    expect(apiClient.interceptors.response.eject).toHaveBeenCalled();
    expect(adminApiClient.interceptors.response.eject).toHaveBeenCalled();
  });

  it("injects auth token into requests when a valid token is available", () => {
    setupInterceptors(mockRefreshFn, mockShowToast, mockLogoutRef);

    const calls = apiClient.interceptors.request.use.mock.calls;
    const lastCall = calls[calls.length - 1];
    const authInterceptorFn = lastCall[0];

    const config = { headers: {} };
    const result = authInterceptorFn(config);

    expect(result.headers.Authorization).toBe("Bearer mock-stored-token");
  });

  it("does not overwrite existing Authorization header", () => {
    setupInterceptors(mockRefreshFn, mockShowToast, mockLogoutRef);

    const calls = apiClient.interceptors.request.use.mock.calls;
    const lastCall = calls[calls.length - 1];
    const authInterceptorFn = lastCall[0];

    const config = { headers: { Authorization: "Bearer existing-token" } };
    const result = authInterceptorFn(config);

    expect(result.headers.Authorization).toBe("Bearer existing-token");
  });
});
