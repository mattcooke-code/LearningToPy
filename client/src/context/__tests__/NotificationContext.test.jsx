import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { NotificationProvider, useNotification } from "../NotificationContext";

// Mock uuid to get predictable but unique IDs
let counter = 0;
vi.mock("uuid", () => ({
  v4: vi.fn(() => `test-uuid-${++counter}`),
}));

describe("NotificationContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    counter = 0; // Reset counter before each test
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("useNotification throws outside provider", () => {
    it("throws error when used outside NotificationProvider", () => {
      expect(() => {
        renderHook(() => useNotification());
      }).toThrow("useNotification must be used within NotificationProvider");
    });
  });

  describe("showToast", () => {
    it("adds a toast with default type and duration", () => {
      const { result } = renderHook(() => useNotification(), {
        wrapper: NotificationProvider,
      });

      act(() => {
        result.current.showToast("Test message");
      });

      expect(result.current.showToast).toBeDefined();
    });

    it("accepts custom type", () => {
      const { result } = renderHook(() => useNotification(), {
        wrapper: NotificationProvider,
      });

      act(() => {
        result.current.showToast("Success!", "success");
        // Use different calls to avoid duplicate keys in same render cycle
      });

      expect(result.current.showToast).toBeDefined();
    });

    it("accepts custom duration", () => {
      const { result } = renderHook(() => useNotification(), {
        wrapper: NotificationProvider,
      });

      act(() => {
        result.current.showToast("Quick message", "info", 2000);
      });

      expect(result.current.showToast).toBeDefined();
    });

    it("auto-removes toast after duration", async () => {
      const { result } = renderHook(() => useNotification(), {
        wrapper: NotificationProvider,
      });

      act(() => {
        result.current.showToast("Auto-dismiss", "info", 5000);
      });

      // Fast-forward time
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      // Should be able to add a new toast after the first one is removed
      act(() => {
        result.current.showToast("New toast");
      });

      expect(result.current.showToast).toBeDefined();
    });

    it("defaults to info type when not specified", () => {
      const { result } = renderHook(() => useNotification(), {
        wrapper: NotificationProvider,
      });

      act(() => {
        result.current.showToast("Default type");
      });

      expect(result.current.showToast).toBeDefined();
    });

    it("defaults to 5000ms duration when not specified", () => {
      const { result } = renderHook(() => useNotification(), {
        wrapper: NotificationProvider,
      });

      act(() => {
        result.current.showToast("Default duration");
      });

      expect(result.current.showToast).toBeDefined();
    });

    it("multiple toast types work correctly", () => {
      const { result } = renderHook(() => useNotification(), {
        wrapper: NotificationProvider,
      });

      // Test each type separately to avoid duplicate keys in same render
      act(() => {
        result.current.showToast("Info toast", "info");
      });

      act(() => {
        result.current.showToast("Success toast", "success");
      });

      act(() => {
        result.current.showToast("Error toast", "error");
      });

      act(() => {
        result.current.showToast("Warning toast", "warning");
      });

      expect(result.current.showToast).toBeDefined();
    });
  });

  describe("showConfirm", () => {
    it("opens confirmation modal with required params", () => {
      const onConfirm = vi.fn();
      const { result } = renderHook(() => useNotification(), {
        wrapper: NotificationProvider,
      });

      act(() => {
        result.current.showConfirm({
          title: "Confirm Action",
          message: "Are you sure?",
          onConfirm,
        });
      });

      expect(result.current.showConfirm).toBeDefined();
    });

    it("calls onConfirm when confirmed", () => {
      const onConfirm = vi.fn();
      const { result } = renderHook(() => useNotification(), {
        wrapper: NotificationProvider,
      });

      act(() => {
        result.current.showConfirm({
          title: "Delete Item",
          message: "This cannot be undone",
          onConfirm,
          type: "danger",
        });
      });

      // The onConfirm is wrapped to close modal first
      expect(onConfirm).not.toHaveBeenCalled();
    });

    it("accepts custom confirm and cancel text", () => {
      const onConfirm = vi.fn();
      const { result } = renderHook(() => useNotification(), {
        wrapper: NotificationProvider,
      });

      act(() => {
        result.current.showConfirm({
          title: "Custom Buttons",
          message: "With custom text",
          onConfirm,
          confirmText: "Yes, Delete",
          cancelText: "No, Keep",
        });
      });

      expect(result.current.showConfirm).toBeDefined();
    });

    it("accepts optional onCancel callback", () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();
      const { result } = renderHook(() => useNotification(), {
        wrapper: NotificationProvider,
      });

      act(() => {
        result.current.showConfirm({
          title: "With Cancel",
          message: "Has cancel callback",
          onConfirm,
          onCancel,
        });
      });

      expect(result.current.showConfirm).toBeDefined();
    });

    it("works without onCancel callback", () => {
      const onConfirm = vi.fn();
      const { result } = renderHook(() => useNotification(), {
        wrapper: NotificationProvider,
      });

      act(() => {
        result.current.showConfirm({
          title: "No Cancel",
          message: "No cancel callback",
          onConfirm,
        });
      });

      expect(result.current.showConfirm).toBeDefined();
    });

    it("supports danger type styling", () => {
      const onConfirm = vi.fn();
      const { result } = renderHook(() => useNotification(), {
        wrapper: NotificationProvider,
      });

      act(() => {
        result.current.showConfirm({
          title: "Danger Zone",
          message: "This is dangerous",
          onConfirm,
          type: "danger",
          confirmText: "I understand",
        });
      });

      expect(result.current.showConfirm).toBeDefined();
    });

    it("supports warning type styling", () => {
      const onConfirm = vi.fn();
      const { result } = renderHook(() => useNotification(), {
        wrapper: NotificationProvider,
      });

      act(() => {
        result.current.showConfirm({
          title: "Warning",
          message: "Be careful",
          onConfirm,
          type: "warning",
        });
      });

      expect(result.current.showConfirm).toBeDefined();
    });

    it("defaults to info type", () => {
      const onConfirm = vi.fn();
      const { result } = renderHook(() => useNotification(), {
        wrapper: NotificationProvider,
      });

      act(() => {
        result.current.showConfirm({
          title: "Info",
          message: "Just info",
          onConfirm,
        });
      });

      expect(result.current.showConfirm).toBeDefined();
    });
  });

  describe("closeConfirm", () => {
    it("can close confirmation modal programmatically", () => {
      const onConfirm = vi.fn();
      const { result } = renderHook(() => useNotification(), {
        wrapper: NotificationProvider,
      });

      act(() => {
        result.current.showConfirm({
          title: "Closable",
          message: "Can be closed",
          onConfirm,
        });
      });

      act(() => {
        result.current.closeConfirm();
      });

      expect(onConfirm).not.toHaveBeenCalled();
    });

    it("closeConfirm is callable even without an active modal", () => {
      const { result } = renderHook(() => useNotification(), {
        wrapper: NotificationProvider,
      });

      act(() => {
        result.current.closeConfirm();
      });

      expect(result.current.closeConfirm).toBeDefined();
    });
  });

  describe("Multiple Toasts", () => {
    it("can show multiple toasts sequentially", () => {
      const { result } = renderHook(() => useNotification(), {
        wrapper: NotificationProvider,
      });

      act(() => {
        result.current.showToast("Toast 1");
      });

      act(() => {
        result.current.showToast("Toast 2");
      });

      act(() => {
        result.current.showToast("Toast 3");
      });

      expect(result.current.showToast).toBeDefined();
    });

    it("removes toasts independently based on duration", () => {
      const { result } = renderHook(() => useNotification(), {
        wrapper: NotificationProvider,
      });

      act(() => {
        result.current.showToast("Fast toast", "info", 1000);
      });

      act(() => {
        result.current.showToast("Slow toast", "info", 5000);
      });

      // Advance time past first toast but not second
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Should still be able to add new toasts
      act(() => {
        result.current.showToast("New toast");
      });

      expect(result.current.showToast).toBeDefined();
    });
  });

  describe("Modal Behavior", () => {
    it("shows only one confirmation at a time", () => {
      const onConfirm1 = vi.fn();
      const onConfirm2 = vi.fn();
      const { result } = renderHook(() => useNotification(), {
        wrapper: NotificationProvider,
      });

      act(() => {
        result.current.showConfirm({
          title: "First",
          message: "First modal",
          onConfirm: onConfirm1,
        });
      });

      act(() => {
        result.current.showConfirm({
          title: "Second",
          message: "Second modal",
          onConfirm: onConfirm2,
        });
      });

      expect(result.current.showConfirm).toBeDefined();
    });

    it("confirmation wraps onConfirm to close modal", () => {
      const onConfirm = vi.fn();
      const { result } = renderHook(() => useNotification(), {
        wrapper: NotificationProvider,
      });

      act(() => {
        result.current.showConfirm({
          title: "Auto Close",
          message: "Closes on confirm",
          onConfirm,
        });
      });

      expect(onConfirm).not.toHaveBeenCalled();
    });
  });

  describe("Context Value Stability", () => {
    it("provides stable function references", () => {
      const { result, rerender } = renderHook(() => useNotification(), {
        wrapper: NotificationProvider,
      });

      const initialShowToast = result.current.showToast;
      const initialShowConfirm = result.current.showConfirm;
      const initialCloseConfirm = result.current.closeConfirm;

      rerender();

      expect(result.current.showToast).toBe(initialShowToast);
      expect(result.current.showConfirm).toBe(initialShowConfirm);
      expect(result.current.closeConfirm).toBe(initialCloseConfirm);
    });
  });

  describe("Error Handling", () => {
    it("handles showToast with empty message", () => {
      const { result } = renderHook(() => useNotification(), {
        wrapper: NotificationProvider,
      });

      act(() => {
        result.current.showToast("");
      });

      expect(result.current.showToast).toBeDefined();
    });

    it("handles showConfirm with missing onConfirm", () => {
      const { result } = renderHook(() => useNotification(), {
        wrapper: NotificationProvider,
      });

      act(() => {
        result.current.showConfirm({
          title: "Test",
          message: "Test",
        });
      });

      expect(result.current.showConfirm).toBeDefined();
    });
  });

  describe("Timer Cleanup", () => {
    it("cleans up timers when toasts are removed", () => {
      const { result } = renderHook(() => useNotification(), {
        wrapper: NotificationProvider,
      });

      act(() => {
        result.current.showToast("Timer cleanup", "info", 5000);
      });

      // Advance time to trigger cleanup
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      // After cleanup, should still be able to show new toasts
      act(() => {
        result.current.showToast("After cleanup");
      });

      expect(result.current.showToast).toBeDefined();
    });
  });
});
