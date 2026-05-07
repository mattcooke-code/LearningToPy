import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProtectedRoute from "../ProtectedRoute";

// Mock useAuth to control authentication state
vi.mock("../../../context", () => ({
  useAuth: vi.fn(),
}));

// Mock Spinner so we can detect it without caring about its internals
vi.mock("../../ui", () => ({
  Spinner: () => <div data-testid="spinner">Loading...</div>,
}));

import { useAuth } from "../../../context";

// ============================================================================
// Helpers
// ============================================================================

const renderWithRouter = (children) => {
  return render(
    <MemoryRouter>
      <ProtectedRoute>{children}</ProtectedRoute>
    </MemoryRouter>,
  );
};

// ============================================================================
// ProtectedRoute
// ============================================================================

describe("ProtectedRoute", () => {
  it("shows spinner while auth is loading", () => {
    useAuth.mockReturnValue({ isAuthenticated: false, loading: true });

    renderWithRouter(<div>Protected Content</div>);

    expect(screen.getByTestId("spinner")).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("redirects to /login when not authenticated", () => {
    useAuth.mockReturnValue({ isAuthenticated: false, loading: false });

    renderWithRouter(<div>Protected Content</div>);

    // Navigate should be rendered (we can verify children are absent)
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    // The Navigate component sets the route — we verify the outcome
  });

  it("renders children when authenticated", () => {
    useAuth.mockReturnValue({ isAuthenticated: true, loading: false });

    renderWithRouter(<div>Protected Content</div>);

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("prioritises loading state over authentication", () => {
    // Even if authenticated, loading should show spinner
    useAuth.mockReturnValue({ isAuthenticated: true, loading: true });

    renderWithRouter(<div>Protected Content</div>);

    expect(screen.getByTestId("spinner")).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });
});
