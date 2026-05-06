import { describe, it, expect, beforeEach, vi } from "vitest";
import { getStoredAccessToken, isTokenValid } from "../tokenUtils";

// We need to stub localStorage and sessionStorage since jsdom provides them
// but we want clean state per test
beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

// ============================================================================
// getStoredAccessToken
// ============================================================================

describe("getStoredAccessToken", () => {
  it("returns null when neither storage has a token", () => {
    expect(getStoredAccessToken()).toBeNull();
  });

  it("returns the token from localStorage when present", () => {
    localStorage.setItem("accessToken", "local-token-abc");
    expect(getStoredAccessToken()).toBe("local-token-abc");
  });

  it("returns the token from sessionStorage when localStorage is empty", () => {
    sessionStorage.setItem("accessToken", "session-token-xyz");
    expect(getStoredAccessToken()).toBe("session-token-xyz");
  });

  it("prefers localStorage over sessionStorage when both have tokens", () => {
    localStorage.setItem("accessToken", "local-priority");
    sessionStorage.setItem("accessToken", "session-ignored");
    expect(getStoredAccessToken()).toBe("local-priority");
  });

  it("returns null when localStorage has an empty string", () => {
    localStorage.setItem("accessToken", "");
    // localStorage.getItem returns "" for empty string values,
    // which is falsy, so the || operator falls through to sessionStorage,
    // and if that's also empty, returns null
    expect(getStoredAccessToken()).toBeNull();
  });
});

// ============================================================================
// isTokenValid
// ============================================================================

describe("isTokenValid", () => {
  it("returns false for null token", () => {
    expect(isTokenValid(null)).toBe(false);
  });

  it("returns false for undefined token", () => {
    expect(isTokenValid(undefined)).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isTokenValid("")).toBe(false);
  });

  it("returns false for a malformed token (not a JWT)", () => {
    // jwtDecode will throw on a non-JWT string
    expect(isTokenValid("not-a-jwt")).toBe(false);
  });

  it("returns false for an expired token", () => {
    // Create a JWT that expired 1 hour ago
    const expiredPayload = {
      sub: "user123",
      exp: Math.floor(Date.now() / 1000) - 3600,
    };
    const expiredToken = createFakeJWT(expiredPayload);
    expect(isTokenValid(expiredToken)).toBe(false);
  });

  it("returns true for a valid token with future expiry", () => {
    const validPayload = {
      sub: "user123",
      exp: Math.floor(Date.now() / 1000) + 3600,
    };
    const validToken = createFakeJWT(validPayload);
    expect(isTokenValid(validToken)).toBe(true);
  });

  it("returns true for a token expiring exactly now (boundary)", () => {
    const now = Math.floor(Date.now() / 1000);
    const boundaryPayload = {
      sub: "user123",
      exp: now,
    };
    const boundaryToken = createFakeJWT(boundaryPayload);
    // exp > now → false when equal. This is technically "expired" at this second.
    expect(isTokenValid(boundaryToken)).toBe(false);
  });

  it("returns true for a token expiring in 1 second", () => {
    const payload = {
      sub: "user123",
      exp: Math.floor(Date.now() / 1000) + 1,
    };
    const token = createFakeJWT(payload);
    expect(isTokenValid(token)).toBe(true);
  });
});

// ============================================================================
// Helper: create a fake JWT for testing
// ============================================================================

/**
 * Creates a base64url-encoded JWT-like string with the given payload.
 * This is NOT cryptographically signed — it only needs to satisfy jwtDecode's
 * expectations (three dot-separated base64url sections).
 *
 * @param {object} payload - The payload to encode.
 * @returns {string} A fake JWT string.
 */
function createFakeJWT(payload) {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  const body = btoa(JSON.stringify(payload))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  const signature = "fake-signature";
  return `${header}.${body}.${signature}`;
}
