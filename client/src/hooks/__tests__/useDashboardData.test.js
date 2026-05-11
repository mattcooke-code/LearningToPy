import { renderHook, waitFor } from "@testing-library/react";
import { useDashboardData } from "../useDashboardData";
import { apiClient } from "../../services";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock the apiClient module
vi.mock("../../services", () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe("useDashboardData", () => {
  const mockUser = {
    id: "user123",
    username: "testuser",
  };

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  it("should fetch and format data correctly", async () => {
    // Mock API responses
    apiClient.get.mockImplementation((url) => {
      if (url.includes("progress/current")) {
        return Promise.resolve({
          courseProgressPercentage: 50,
          xp: 100,
          level: 1,
        });
      }
      if (url.includes("achievements")) {
        return Promise.resolve({
          earnedBadges: [{ id: "b1" }],
        });
      }
      if (url.includes("leaderboard/around-me")) {
        return Promise.resolve({
          users: [],
          currentUserRank: 1,
        });
      }
      return Promise.resolve({});
    });

    const updateTheme = vi.fn();
    const { result } = renderHook(() =>
      useDashboardData(mockUser, true, false, "/", updateTheme),
    );

    // Wait for the async useEffect to finish
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.earnedBadgeIds).toEqual(["b1"]);
    expect(result.current.userProgress).toEqual({
      courseProgressPercentage: 50,
      xp: 100,
      level: 1,
    });
    expect(updateTheme).toHaveBeenCalledWith(50);
  });

  it("should handle API errors gracefully", async () => {
    // Mock API error
    apiClient.get.mockRejectedValue(new Error("Network error"));

    const updateTheme = vi.fn();
    const { result } = renderHook(() =>
      useDashboardData(mockUser, true, false, "/", updateTheme),
    );

    // Wait for the async useEffect to finish
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeDefined();
    expect(result.current.userProgress).toBeNull();
    expect(result.current.earnedBadgeIds).toEqual([]);
  });

  it("should not fetch data when not authenticated", () => {
    const updateTheme = vi.fn();
    const { result } = renderHook(() =>
      useDashboardData(mockUser, false, false, "/", updateTheme),
    );

    expect(result.current.loading).toBe(false);
    expect(result.current.userProgress).toBeNull();
    expect(apiClient.get).not.toHaveBeenCalled();
  });

  it("should not fetch data during auth loading", () => {
    const updateTheme = vi.fn();
    const { result } = renderHook(() =>
      useDashboardData(mockUser, true, true, "/", updateTheme),
    );

    expect(result.current.loading).toBe(false);
    expect(result.current.userProgress).toBeNull();
    expect(apiClient.get).not.toHaveBeenCalled();
  });
});
