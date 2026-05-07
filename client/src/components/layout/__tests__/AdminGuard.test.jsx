import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminGuard from "../AdminGuard";

// Mock contexts
vi.mock("../../../context", () => ({
  useAuth: vi.fn(),
  useNotification: vi.fn(),
}));

// Mock LoadingState
vi.mock("../../ui", () => ({
  LoadingState: ({ message }) => (
    <div data-testid="loading-state">{message}</div>
  ),
}));

import { useAuth, useNotification } from "../../../context";

// ============================================================================
// Helpers
// ============================================================================

const renderWithRouter = (children, redirectTo = "/") => {
  return render(
    <MemoryRouter>
      <AdminGuard redirectTo={redirectTo}>{children}</AdminGuard>
    </MemoryRouter>,
  );
};

// ============================================================================
// AdminGuard
// ============================================================================

describe("AdminGuard", () => {
  beforeEach(() => {
    useNotification.mockReturnValue({ showToast: vi.fn() });
  });

  it("shows loading state while auth is loading", () => {
    useAuth.mockReturnValue({ user: null, loading: true });

    renderWithRouter(<div>Admin Content</div>);

    expect(screen.getByTestId("loading-state")).toBeInTheDocument();
    expect(screen.getByText("Checking permissions...")).toBeInTheDocument();
    expect(screen.queryByText("Admin Content")).not.toBeInTheDocument();
  });

  it("redirects when user is null", () => {
    useAuth.mockReturnValue({ user: null, loading: false });

    renderWithRouter(<div>Admin Content</div>);

    expect(screen.queryByText("Admin Content")).not.toBeInTheDocument();
  });

  it("redirects when user is not admin", () => {
    useAuth.mockReturnValue({
      user: { isAdmin: false },
      loading: false,
    });

    renderWithRouter(<div>Admin Content</div>);

    expect(screen.queryByText("Admin Content")).not.toBeInTheDocument();
  });

  it("renders children when user is admin", () => {
    useAuth.mockReturnValue({
      user: { isAdmin: true },
      loading: false,
    });

    renderWithRouter(<div>Admin Content</div>);

    expect(screen.getByText("Admin Content")).toBeInTheDocument();
  });

  it("prioritises loading over admin check", () => {
    useAuth.mockReturnValue({
      user: { isAdmin: true },
      loading: true,
    });

    renderWithRouter(<div>Admin Content</div>);

    expect(screen.getByTestId("loading-state")).toBeInTheDocument();
    expect(screen.queryByText("Admin Content")).not.toBeInTheDocument();
  });
});
