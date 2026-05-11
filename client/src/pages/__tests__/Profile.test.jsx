import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../test-utils";
import Profile from "../Profile";
import * as dashboardHook from "../../hooks/useDashboardData";
import { useAuth } from "../../context";

vi.mock("../../context", async () => {
  const actual = await vi.importActual("../../context");
  return { ...actual, useAuth: vi.fn() };
});

vi.mock("../../hooks/useDashboardData", () => ({
  useDashboardData: vi.fn(),
}));

describe("Profile Component", () => {
  const mockUser = {
    username: "PythonPro",
    email: "pro@python.com",
    _id: "user123",
    privacySettings: {
      showOnLeaderboards: true,
      showAsAnonymous: false,
      showUsernameOnLeaderboards: true,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      loading: false,
      isAuthenticated: true,
      updateUser: vi.fn(),
      triggerLeaderboardRefresh: vi.fn(),
    });
  });

  it("renders the loading state initially", () => {
    vi.mocked(dashboardHook.useDashboardData).mockReturnValue({
      loading: true,
      userProgress: null,
      earnedBadgeIds: [],
      error: null,
      surroundingLeaderboard: null,
    });

    renderWithProviders(<Profile />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders user stats and earned badges correctly", () => {
    vi.mocked(dashboardHook.useDashboardData).mockReturnValue({
      loading: false,
      userProgress: {
        xp: 2500,
        level: 15,
        courseProgressPercentage: 75,
        currentModule: {
          lessonsCompleted: 5,
          lessonCount: 10,
        },
      },
      earnedBadgeIds: ["python_starter", "logic_leaper"],
      error: null,
      surroundingLeaderboard: null,
    });

    renderWithProviders(<Profile />);

    // Target the heading specifically
    expect(
      screen.getByRole("heading", { name: /welcome back, pythonpro/i }),
    ).toBeInTheDocument();

    // Check Stats - Level 15 is rendered in a few places
    const levelElements = screen.getAllByText("15");
    expect(levelElements.length).toBeGreaterThan(0);

    // Check Badges - We check for the "02" badge count in the UI
    expect(screen.getByText("02")).toBeInTheDocument();
  });

  it("opens the badge modal when clicking an earned badge", async () => {
    vi.mocked(dashboardHook.useDashboardData).mockReturnValue({
      loading: false,
      userProgress: {
        xp: 100,
        level: 1,
        currentModule: {
          lessonsCompleted: 0,
          lessonCount: 10,
        },
      },
      earnedBadgeIds: ["python_starter"],
      error: null,
      surroundingLeaderboard: null,
    });

    renderWithProviders(<Profile />);

    // Find the badge grid item by its aria-label
    const badge = screen.getByRole("button", {
      name: /view details for python_starter badge/i,
    });
    fireEvent.click(badge);

    // Check that the modal opens - look for the badge name in the modal
    const modalTitle = await screen.findByText(/Python Starter/i);
    expect(modalTitle).toBeInTheDocument();
  });

  it("shows error state when data fetching fails", () => {
    vi.mocked(dashboardHook.useDashboardData).mockReturnValue({
      loading: false,
      userProgress: null,
      earnedBadgeIds: [],
      error: "Failed to fetch data",
      surroundingLeaderboard: null,
    });

    renderWithProviders(<Profile />);

    expect(
      screen.getByText(/couldn't load your badge progress/i),
    ).toBeInTheDocument();
  });

  it("shows empty state when no badges are earned", () => {
    vi.mocked(dashboardHook.useDashboardData).mockReturnValue({
      loading: false,
      userProgress: {
        xp: 100,
        level: 1,
        currentModule: {
          lessonsCompleted: 0,
          lessonCount: 10,
        },
      },
      earnedBadgeIds: [],
      error: null,
      surroundingLeaderboard: null,
    });

    renderWithProviders(<Profile />);

    expect(screen.getByText(/no badges yet/i)).toBeInTheDocument();
    expect(screen.getByText(/complete lessons/i)).toBeInTheDocument();
  });
});
