import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getSessionId, setupSessionEndTracking } from "../session";

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
  // Freeze time so Date.now() is predictable
  vi.setSystemTime(new Date("2026-05-06T12:00:00Z"));
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
  // Clean up sendBeacon if we added it
  if (
    "sendBeacon" in navigator &&
    navigator.sendBeacon.toString().includes("vi.fn")
  ) {
    delete navigator.sendBeacon;
  }
});

// ============================================================================
// getSessionId
// ============================================================================

describe("getSessionId", () => {
  it("returns a string", () => {
    const id = getSessionId();
    expect(typeof id).toBe("string");
  });

  it("returns a UUID-like string (36 characters, 4 hyphens)", () => {
    const id = getSessionId();
    // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it("persists the session ID in localStorage", () => {
    const id = getSessionId();
    expect(localStorage.getItem("sessionId")).toBe(id);
  });

  it("returns the same ID on subsequent calls (idempotent)", () => {
    const first = getSessionId();
    const second = getSessionId();
    const third = getSessionId();
    expect(first).toBe(second);
    expect(second).toBe(third);
  });

  it("generates a new ID after the old one is cleared from localStorage", () => {
    const first = getSessionId();
    localStorage.removeItem("sessionId");
    const second = getSessionId();
    expect(first).not.toBe(second);
  });
});

// ============================================================================
// setupSessionEndTracking
// ============================================================================

describe("setupSessionEndTracking", () => {
  it("returns undefined when called in a non-browser environment (SSR safety)", () => {
    // Simulate server-side rendering by temporarily removing window
    const originalWindow = globalThis.window;
    // @ts-ignore
    delete globalThis.window;

    const result = setupSessionEndTracking("http://localhost:5000");
    expect(result).toBeUndefined();

    globalThis.window = originalWindow;
  });

  it("returns a cleanup function when window is available", () => {
    const cleanup = setupSessionEndTracking("http://localhost:5000");
    expect(typeof cleanup).toBe("function");
    cleanup(); // clean up the listener
  });

  it("registers a beforeunload event listener", () => {
    const addEventListenerSpy = vi.spyOn(window, "addEventListener");

    const cleanup = setupSessionEndTracking("http://localhost:5000");

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "beforeunload",
      expect.any(Function),
    );

    cleanup();
  });

  it("cleanup function removes the beforeunload listener", () => {
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

    const cleanup = setupSessionEndTracking("http://localhost:5000");
    cleanup();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "beforeunload",
      expect.any(Function),
    );
  });

  it("sends a beacon with the correct payload structure on beforeunload", () => {
    Object.defineProperty(navigator, "sendBeacon", {
      value: vi.fn().mockReturnValue(true),
      configurable: true,
      writable: true,
    });
    const sendBeaconSpy = vi.spyOn(navigator, "sendBeacon");

    const cleanup = setupSessionEndTracking("http://localhost:5000");

    // Advance time AFTER setup to simulate session duration
    vi.advanceTimersByTime(5 * 60 * 1000);

    window.dispatchEvent(new Event("beforeunload"));

    expect(sendBeaconSpy).toHaveBeenCalledTimes(1);

    const [url, body] = sendBeaconSpy.mock.calls[0];
    expect(url).toBe("http://localhost:5000/api/analytics/session-end");

    const parsed = JSON.parse(body);
    expect(parsed).toHaveProperty("sessionId");
    expect(parsed).toHaveProperty("duration");
    expect(parsed).toHaveProperty("actionType", "SESSION_END");
    expect(parsed).toHaveProperty("deviceInfo");
    expect(parsed.duration).toBe(300);

    cleanup();
  });

  it("uses a custom backend URL in the beacon endpoint", () => {
    // Reset sendBeacon mock fresh for this test
    Object.defineProperty(navigator, "sendBeacon", {
      value: vi.fn().mockReturnValue(true),
      configurable: true,
      writable: true,
    });
    const sendBeaconSpy = vi.spyOn(navigator, "sendBeacon");

    const cleanup = setupSessionEndTracking("https://api.example.com");
    window.dispatchEvent(new Event("beforeunload"));

    expect(sendBeaconSpy).toHaveBeenCalledTimes(1);
    const [url] = sendBeaconSpy.mock.calls[0];
    expect(url).toBe("https://api.example.com/api/analytics/session-end");

    cleanup();
  });

  it("does not fire beacon before beforeunload", () => {
    Object.defineProperty(navigator, "sendBeacon", {
      value: vi.fn().mockReturnValue(true),
      configurable: true,
      writable: true,
    });
    const sendBeaconSpy = vi.spyOn(navigator, "sendBeacon");

    const cleanup = setupSessionEndTracking("http://localhost:5000");
    // Don't dispatch beforeunload — beacon should not fire yet
    expect(sendBeaconSpy).not.toHaveBeenCalled();

    cleanup();
  });
});
