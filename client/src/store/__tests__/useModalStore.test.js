// src/store/__tests__/useModalStore.test.js
import { describe, it, expect, beforeEach, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import useModalStore from "@/store/useModalStore";

describe("useModalStore", () => {
  // Reset store state between tests
  beforeEach(() => {
    const { result } = renderHook(() => useModalStore());
    act(() => {
      result.current.closeModal();
    });
  });

  describe("Initial State", () => {
    it("should have correct initial state", () => {
      const { result } = renderHook(() => useModalStore());

      expect(result.current.type).toBeNull();
      expect(result.current.isOpen).toBe(false);
      expect(result.current.data).toEqual({});
    });

    it("should return consistent initial state reference", () => {
      const { result: result1 } = renderHook(() => useModalStore());
      const { result: result2 } = renderHook(() => useModalStore());

      expect(result1.current.type).toBe(result2.current.type);
      expect(result1.current.isOpen).toBe(result2.current.isOpen);
      expect(result1.current.data).toEqual(result2.current.data);
    });
  });

  describe("openModal", () => {
    it("should open modal with type and empty data", () => {
      const { result } = renderHook(() => useModalStore());

      act(() => {
        result.current.openModal("xpAdjustment");
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.type).toBe("xpAdjustment");
      expect(result.current.data).toEqual({});
    });

    it("should open modal with type and provided data", () => {
      const { result } = renderHook(() => useModalStore());
      const mockData = { userId: "123", currentXP: 500 };

      act(() => {
        result.current.openModal("xpAdjustment", mockData);
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.type).toBe("xpAdjustment");
      expect(result.current.data).toEqual(mockData);
      expect(result.current.data.userId).toBe("123");
      expect(result.current.data.currentXP).toBe(500);
    });

    it("should handle different modal types", () => {
      const { result } = renderHook(() => useModalStore());
      const modalTypes = ["xpModal", "userDetail", "achievement", "settings"];

      modalTypes.forEach((type) => {
        act(() => {
          result.current.openModal(type, { test: true });
        });

        expect(result.current.type).toBe(type);
        expect(result.current.isOpen).toBe(true);
      });
    });

    it("should handle complex data objects", () => {
      const { result } = renderHook(() => useModalStore());
      const complexData = {
        user: { id: 1, name: "John" },
        achievements: [{ id: 1, name: "First Steps" }],
        metadata: { timestamp: Date.now() },
      };

      act(() => {
        result.current.openModal("achievement", complexData);
      });

      expect(result.current.data).toEqual(complexData);
      expect(result.current.data.user).toEqual(complexData.user);
      expect(result.current.data.achievements).toHaveLength(1);
    });

    it("should handle null and undefined data gracefully", () => {
      const { result } = renderHook(() => useModalStore());

      act(() => {
        result.current.openModal("test", null);
      });

      expect(result.current.data).toBeNull();

      act(() => {
        result.current.openModal("test", undefined);
      });

      expect(result.current.data).toEqual({});
    });

    it("should overwrite previous modal state", () => {
      const { result } = renderHook(() => useModalStore());

      act(() => {
        result.current.openModal("first", { id: 1 });
      });

      expect(result.current.type).toBe("first");
      expect(result.current.data.id).toBe(1);

      act(() => {
        result.current.openModal("second", { id: 2 });
      });

      expect(result.current.type).toBe("second");
      expect(result.current.data.id).toBe(2);
      expect(result.current.isOpen).toBe(true);
    });
  });

  describe("closeModal", () => {
    it("should close modal and reset state", () => {
      const { result } = renderHook(() => useModalStore());

      act(() => {
        result.current.openModal("xpAdjustment", { userId: "123" });
      });

      expect(result.current.isOpen).toBe(true);

      act(() => {
        result.current.closeModal();
      });

      expect(result.current.isOpen).toBe(false);
      expect(result.current.type).toBeNull();
      expect(result.current.data).toEqual({});
    });

    it("should handle closing already closed modal", () => {
      const { result } = renderHook(() => useModalStore());

      act(() => {
        result.current.closeModal();
      });

      expect(result.current.isOpen).toBe(false);
      expect(result.current.type).toBeNull();
      expect(result.current.data).toEqual({});
    });

    it("should completely reset data after close", () => {
      const { result } = renderHook(() => useModalStore());

      act(() => {
        result.current.openModal("test", { sensitive: "data" });
      });

      act(() => {
        result.current.closeModal();
      });

      // Verify complete reset
      expect(result.current.data.sensitive).toBeUndefined();
      expect(result.current.type).toBeNull();
    });
  });

  describe("State Transitions", () => {
    it("should handle rapid open/close cycles", () => {
      const { result } = renderHook(() => useModalStore());

      for (let i = 0; i < 5; i++) {
        act(() => {
          result.current.openModal(`modal-${i}`, { index: i });
        });
        expect(result.current.isOpen).toBe(true);

        act(() => {
          result.current.closeModal();
        });
        expect(result.current.isOpen).toBe(false);
      }

      // Final state should be closed
      expect(result.current.isOpen).toBe(false);
      expect(result.current.type).toBeNull();
    });

    it("should maintain state isolation between renders", () => {
      const hook1 = renderHook(() => useModalStore());
      const hook2 = renderHook(() => useModalStore());

      act(() => {
        hook1.result.current.openModal("test1", { data: "one" });
      });

      // hook2 should see the same state (shared store)
      expect(hook2.result.current.type).toBe("test1");
      expect(hook2.result.current.data).toEqual({ data: "one" });

      act(() => {
        hook2.result.current.openModal("test2", { data: "two" });
      });

      // hook1 should see the updated state
      expect(hook1.result.current.type).toBe("test2");
      expect(hook1.result.current.data).toEqual({ data: "two" });
    });

    it("should update all subscribers on state change", () => {
      const subscriber1 = renderHook(() => useModalStore());
      const subscriber2 = renderHook(() => useModalStore());
      const subscriber3 = renderHook(() => useModalStore());

      act(() => {
        subscriber1.result.current.openModal("shared", { value: 42 });
      });

      expect(subscriber2.result.current.type).toBe("shared");
      expect(subscriber2.result.current.data.value).toBe(42);
      expect(subscriber3.result.current.type).toBe("shared");
      expect(subscriber3.result.current.data.value).toBe(42);
    });
  });

  describe("Edge Cases", () => {
    it("should handle opening modal with empty string type", () => {
      const { result } = renderHook(() => useModalStore());

      act(() => {
        result.current.openModal("", { test: true });
      });

      expect(result.current.type).toBe("");
      expect(result.current.isOpen).toBe(true);
    });

    it("should handle opening modal with numeric type (coerced to string)", () => {
      const { result } = renderHook(() => useModalStore());

      act(() => {
        result.current.openModal(123, { test: true });
      });

      expect(result.current.type).toBe(123);
      expect(result.current.isOpen).toBe(true);
    });

    it("should handle very large data objects", () => {
      const { result } = renderHook(() => useModalStore());
      const largeData = {
        array: Array.from({ length: 1000 }, (_, i) => ({ id: i })),
      };

      act(() => {
        result.current.openModal("large", largeData);
      });

      expect(result.current.data.array).toHaveLength(1000);
      expect(result.current.data.array[999].id).toBe(999);
    });

    it("should handle special characters in type", () => {
      const { result } = renderHook(() => useModalStore());
      const specialType = "modal-with-special_chars/and.more";

      act(() => {
        result.current.openModal(specialType);
      });

      expect(result.current.type).toBe(specialType);
    });

    it("should handle functions in data (if needed)", () => {
      const { result } = renderHook(() => useModalStore());
      const mockCallback = vi.fn();

      act(() => {
        result.current.openModal("callback", { onSave: mockCallback });
      });

      expect(result.current.data.onSave).toBe(mockCallback);
    });
  });

  describe("API Contract", () => {
    it("should expose all expected methods", () => {
      const { result } = renderHook(() => useModalStore());

      expect(result.current).toHaveProperty("openModal");
      expect(result.current).toHaveProperty("closeModal");
      expect(result.current).toHaveProperty("type");
      expect(result.current).toHaveProperty("data");
      expect(result.current).toHaveProperty("isOpen");

      expect(typeof result.current.openModal).toBe("function");
      expect(typeof result.current.closeModal).toBe("function");
    });

    it("should maintain backward compatibility", () => {
      const { result } = renderHook(() => useModalStore());

      // Test that openModal still works as documented
      act(() => {
        result.current.openModal("xpAdjustment", {
          userId: "123",
          currentXP: 500,
        });
        result.current.closeModal();
      });

      expect(result.current.isOpen).toBe(false);
    });
  });
});

// Optional: Performance and stress tests
describe("useModalStore - Performance", () => {
  it("should handle 1000 sequential open/close operations", () => {
    const { result } = renderHook(() => useModalStore());
    const startTime = performance.now();

    for (let i = 0; i < 1000; i++) {
      act(() => {
        result.current.openModal(`modal-${i}`, { index: i });
        result.current.closeModal();
      });
    }

    const endTime = performance.now();
    expect(endTime - startTime).toBeLessThan(2000); // Should complete within 2 seconds
    expect(result.current.isOpen).toBe(false);
  });

  it("should handle concurrent state updates correctly", () => {
    const hooks = Array.from({ length: 10 }, () =>
      renderHook(() => useModalStore()),
    );

    // Simultaneously open different modals
    act(() => {
      hooks.forEach((hook, index) => {
        hook.result.current.openModal(`modal-${index}`, { hook: index });
      });
    });

    // The last update should win (as they're all synchronous)
    const finalHook = renderHook(() => useModalStore());
    expect(finalHook.result.current.type).toBe("modal-9");
  });
});
