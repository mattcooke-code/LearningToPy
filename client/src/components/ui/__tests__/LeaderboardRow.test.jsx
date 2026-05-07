import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import LeaderboardRow from "../LeaderboardRow";

// ============================================================================
// Helpers
// ============================================================================

const baseUser = {
  _id: "user123456789",
  username: "alice",
  xp: 1500,
  isAnonymous: false,
};

// ============================================================================
// Rank display
// ============================================================================

describe("LeaderboardRow", () => {
  it("displays gold medal for rank 1", () => {
    render(<LeaderboardRow rank={1} user={baseUser} />);
    expect(screen.getByText("🥇")).toBeInTheDocument();
  });

  it("displays silver medal for rank 2", () => {
    render(<LeaderboardRow rank={2} user={baseUser} />);
    expect(screen.getByText("🥈")).toBeInTheDocument();
  });

  it("displays bronze medal for rank 3", () => {
    render(<LeaderboardRow rank={3} user={baseUser} />);
    expect(screen.getByText("🥉")).toBeInTheDocument();
  });

  it("displays numeric rank for rank 4+", () => {
    render(<LeaderboardRow rank={7} user={baseUser} />);
    expect(screen.getByText("7")).toBeInTheDocument();
  });

  // ---- User display ----
  it("displays the username", () => {
    render(<LeaderboardRow rank={1} user={baseUser} />);
    expect(screen.getByText("alice")).toBeInTheDocument();
  });

  it("displays formatted XP", () => {
    render(<LeaderboardRow rank={1} user={baseUser} />);
    expect(screen.getByText("1,500 XP")).toBeInTheDocument();
  });

  // ---- Anonymous users ----
  it("masks username when user is anonymous", () => {
    const anonUser = { ...baseUser, isAnonymous: true };
    render(<LeaderboardRow rank={4} user={anonUser} />);

    // Last 6 characters of "user123456789" is "456789"
    expect(screen.getByText(/Learner #456789/)).toBeInTheDocument();
    expect(screen.getByText("(Anonymous)")).toBeInTheDocument();
  });

  it("does not show (Anonymous) tag for public users", () => {
    render(<LeaderboardRow rank={1} user={baseUser} />);
    expect(screen.queryByText("(Anonymous)")).not.toBeInTheDocument();
  });

  // ---- Current user highlight ----
  it("applies highlight styling when isCurrent is true", () => {
    const { container } = render(
      <LeaderboardRow rank={3} user={baseUser} isCurrent={true} />,
    );

    const row = container.firstChild;
    expect(row).toHaveClass("bg-blue-50");
    expect(row).toHaveClass("border-blue-200");
  });

  it("does not apply highlight styling when isCurrent is false", () => {
    const { container } = render(
      <LeaderboardRow rank={3} user={baseUser} isCurrent={false} />,
    );

    const row = container.firstChild;
    expect(row).toHaveClass("bg-gray-50");
    expect(row).not.toHaveClass("bg-blue-50");
  });

  it("applies highlight styling by default (isCurrent undefined)", () => {
    const { container } = render(<LeaderboardRow rank={3} user={baseUser} />);

    // isCurrent is undefined → falsy → no highlight
    const row = container.firstChild;
    expect(row).toHaveClass("bg-gray-50");
  });

  // ---- Rank badge styling ----
  it("uses gold badge styling for top 3 ranks", () => {
    const { container } = render(<LeaderboardRow rank={2} user={baseUser} />);
    const badge = container.querySelector(".rounded-full");
    expect(badge).toHaveClass("bg-yellow-100");
  });

  it("uses gray badge styling for rank 4+", () => {
    const { container } = render(<LeaderboardRow rank={5} user={baseUser} />);
    const badge = container.querySelector(".rounded-full");
    expect(badge).toHaveClass("bg-gray-200");
  });

  it("uses blue badge styling for current user", () => {
    const { container } = render(
      <LeaderboardRow rank={5} user={baseUser} isCurrent={true} />,
    );
    const badge = container.querySelector(".rounded-full");
    expect(badge).toHaveClass("bg-blue-500");
  });
});
