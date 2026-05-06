import { describe, it, expect } from "vitest";
import {
  getErrorMessage,
  getAdminErrorMessage,
  getAuthErrorMessage,
} from "../getErrorMessage";

describe("getErrorMessage", () => {
  // ---- String errors ----
  it("returns a plain string error as-is", () => {
    expect(getErrorMessage("Something broke")).toBe("Something broke");
  });

  // ---- HTTP status codes (general context) ----
  it("returns the response data message if present", () => {
    const error = {
      response: { status: 400, data: { message: "Invalid input" } },
    };
    expect(getErrorMessage(error)).toBe("Invalid input");
  });

  it("returns the response data error if no message key", () => {
    const error = {
      response: { status: 400, data: { error: "Bad request" } },
    };
    expect(getErrorMessage(error)).toBe("Bad request");
  });

  it("returns error.message for standard Error objects", () => {
    const error = new Error("Standard error message");
    expect(getErrorMessage(error)).toBe("Standard error message");
  });

  // ---- Network errors ----
  it("returns a network error message for ERR_NETWORK", () => {
    const error = { code: "ERR_NETWORK" };
    expect(getErrorMessage(error)).toBe(
      "Network error. Please check your connection.",
    );
  });

  // ---- Fallback ----
  it("returns the default message when nothing matches", () => {
    expect(getErrorMessage({})).toBe("Something went wrong");
  });

  it("returns a custom default message when provided", () => {
    expect(getErrorMessage({}, "Custom fallback")).toBe("Custom fallback");
  });

  it("returns the default message for null error", () => {
    expect(getErrorMessage(null)).toBe("Something went wrong");
  });

  it("returns the default message for undefined error", () => {
    expect(getErrorMessage(undefined)).toBe("Something went wrong");
  });
});

// ============================================================================
// getAdminErrorMessage
// ============================================================================

describe("getAdminErrorMessage", () => {
  it("returns admin-specific 401 message", () => {
    const error = { response: { status: 401 } };
    expect(getAdminErrorMessage(error)).toBe(
      "Your session has expired. Please log in again.",
    );
  });

  it("returns admin-specific 403 message", () => {
    const error = { response: { status: 403 } };
    expect(getAdminErrorMessage(error)).toBe(
      "You don't have permission to access this resource.",
    );
  });

  it("returns admin-specific 404 message", () => {
    const error = { response: { status: 404 } };
    expect(getAdminErrorMessage(error)).toBe(
      "The requested resource was not found.",
    );
  });

  it("returns admin-specific 429 message", () => {
    const error = { response: { status: 429 } };
    expect(getAdminErrorMessage(error)).toBe(
      "Too many requests. Please try again later.",
    );
  });

  it("returns admin-specific 500 message", () => {
    const error = { response: { status: 500 } };
    expect(getAdminErrorMessage(error)).toBe(
      "Server error. Our team has been notified.",
    );
  });

  it("returns admin-specific 503 message", () => {
    const error = { response: { status: 503 } };
    expect(getAdminErrorMessage(error)).toBe(
      "Service temporarily unavailable. Please try again later.",
    );
  });

  it("falls back to default message for non-admin status codes", () => {
    const error = { response: { status: 418 } };
    expect(getAdminErrorMessage(error)).toBe("Admin operation failed");
  });
});

// ============================================================================
// getAuthErrorMessage
// ============================================================================

describe("getAuthErrorMessage", () => {
  it("returns invalid credentials message for 401", () => {
    const error = { response: { status: 401 } };
    expect(getAuthErrorMessage(error)).toBe(
      "Invalid credentials. Please check your email and password.",
    );
  });

  it("returns account not verified message for 403", () => {
    const error = { response: { status: 403 } };
    expect(getAuthErrorMessage(error)).toBe(
      "Account not verified. Please check your email.",
    );
  });

  it("falls through to getErrorMessage for other errors", () => {
    const error = new Error("Some other error");
    expect(getAuthErrorMessage(error)).toBe("Some other error");
  });

  it("uses default message when error is empty", () => {
    expect(getAuthErrorMessage({})).toBe("Authentication failed");
  });
});
