import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test-utils";
import Dashboard from "../Dashboard";
import * as dashboardHook from "../../hooks/useDashboardData";
import { useAuth } from "../../context";

vi.mock("../../context", async () => {
  const actual = await vi.importActual("../../context");
  return { ...actual, useAuth: vi.fn() };
});

vi.mock("../../hooks/useDashboardData", () => ({
  useDashboardData: vi.fn(),
}));

describe("Dashboard Component", () => {
  const mockUser = {
    username: "TestLearner",
    xp: 500,
    level: 5,
    _id: "123456",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      loading: false,
      isAuthenticated: true,
    });
  });

  it("shows the loading spinner when data is fetching", () => {
    vi.mocked(dashboardHook.useDashboardData).mockReturnValue({
      loading: true,
      userProgress: null,
      surroundingLeaderboard: null,
      error: null,
    });

    renderWithProviders(<Dashboard />);

    // 1. Check for role="status" which you added to the Spinner
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders progress data correctly after a successful fetch", () => {
    vi.mocked(dashboardHook.useDashboardData).mockReturnValue({
      loading: false,
      userProgress: {
        xp: 1400,
        level: 10,
        courseProgressPercentage: 50,
        currentModule: {
          order: 1,
          title: "Fundamentals",
          lessonsCompleted: 2,
          lessonCount: 5,
        },
        badges: [],
      },
      surroundingLeaderboard: { users: [], currentUserRank: 1 },
      error: null,
    });

    renderWithProviders(<Dashboard />);

    expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
    expect(screen.getByText(/1400 XP/i)).toBeInTheDocument();

    // 2. Fix "Multiple elements found" by using getAllByText
    // and asserting that at least one exists.
    const levelElements = screen.getAllByText(/Level 10/i);
    expect(levelElements.length).toBeGreaterThan(0);
    expect(levelElements[0]).toBeInTheDocument();
  });

  it('displays the "Course Complete" message for level 20 users', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { ...mockUser, level: 20 },
      loading: false,
      isAuthenticated: true,
    });

    vi.mocked(dashboardHook.useDashboardData).mockReturnValue({
      loading: false,
      userProgress: {
        level: 20,
        xp: 5000,
        badges: [],
        courseProgressPercentage: 100,
      },
      surroundingLeaderboard: null,
      error: null,
    });

    renderWithProviders(<Dashboard />);

    expect(
      screen.getByText(/Congratulations, Python Master!/i),
    ).toBeInTheDocument();
  });
});
