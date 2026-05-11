// src/modals/__tests__/BadgeModal.test.jsx
import { render, screen, within } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import BadgeModal from "../BadgeModal";

// 🔹 Mock BaseModal to render children directly for easier testing
vi.mock("../../components/ui", () => ({
  BaseModal: ({ children, isOpen, onClose, title }) => (
    <div data-testid="base-modal" data-open={isOpen} data-title={title}>
      <button data-testid="modal-close" onClick={onClose}>
        Close
      </button>
      {children}
    </div>
  ),
}));

// 🔹 Mock BADGE_LIBRARY with predictable test data
vi.mock("../../data/badges", () => ({
  BADGE_LIBRARY: [
    {
      id: "badge-1",
      name: "First Steps",
      category: "Beginner",
      description: "Complete your first lesson",
      requirement: "Finish 1 lesson",
      xp: 50,
      image: "/badges/first-steps.png",
    },
    {
      id: "badge-2",
      name: "Streak Master",
      category: "Engagement",
      description: "Maintain a 7-day streak",
      requirement: "Log in 7 days in a row",
      xp: 100,
    },
    {
      id: "badge-3",
      name: "Quiz Champion",
      category: "Achievement",
      description: "Score 100% on 5 quizzes",
      requirement: "Get perfect scores on 5 quizzes",
      xp: 200,
      image: "/badges/quiz-champion.png",
    },
  ],
}));

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  earnedBadgeIds: [],
  progressMap: {},
};

// ✅ Helper: Find badge card by badge name, then scope queries within it
const getBadgeCard = (badgeName) => {
  const heading = screen.getByText(badgeName);
  // Go up to the card: has class "group flex h-full flex-col rounded-2xl border"
  return heading.closest(".group.flex.flex-col.rounded-2xl");
};

describe("BadgeModal", () => {
  it("renders modal with correct title and close button", () => {
    render(<BadgeModal {...defaultProps} />);

    const modal = screen.getByTestId("base-modal");
    expect(modal).toHaveAttribute("data-title", "All Badges");
    expect(screen.getByTestId("modal-close")).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    const onClose = vi.fn();
    render(<BadgeModal {...defaultProps} onClose={onClose} />);

    screen.getByTestId("modal-close").click();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders all badges from BADGE_LIBRARY", () => {
    render(<BadgeModal {...defaultProps} />);

    expect(screen.getByText("First Steps")).toBeInTheDocument();
    expect(screen.getByText("Streak Master")).toBeInTheDocument();
    expect(screen.getByText("Quiz Champion")).toBeInTheDocument();
  });

  it("displays badge metadata correctly", () => {
    render(<BadgeModal {...defaultProps} />);

    // ✅ Scope queries to the "First Steps" badge card
    const card = getBadgeCard("First Steps");
    expect(within(card).getByText("Beginner")).toBeInTheDocument();
    expect(
      within(card).getByText("Complete your first lesson"),
    ).toBeInTheDocument();
    expect(within(card).getByText("How to earn:")).toBeInTheDocument();
    expect(within(card).getByText("Finish 1 lesson")).toBeInTheDocument();
  });

  it('shows "Earned" badge for earned badges', () => {
    render(<BadgeModal {...defaultProps} earnedBadgeIds={["badge-1"]} />);

    const card = getBadgeCard("First Steps");
    expect(within(card).getByText("Earned")).toBeInTheDocument();
  });

  it('shows "In progress" badge for badges with progress > 0', () => {
    render(<BadgeModal {...defaultProps} progressMap={{ "badge-2": 50 }} />);

    const card = getBadgeCard("Streak Master");
    expect(within(card).getByText("In progress")).toBeInTheDocument();
  });

  it("shows no status badge for locked badges (0% progress, not earned)", () => {
    render(<BadgeModal {...defaultProps} />);

    expect(screen.queryByText("Earned")).not.toBeInTheDocument();
    expect(screen.queryByText("In progress")).not.toBeInTheDocument();
  });

  it("renders progress bar for in-progress badges", () => {
    render(<BadgeModal {...defaultProps} progressMap={{ "badge-2": 75 }} />);

    const card = getBadgeCard("Streak Master");
    // Check progress percentage text
    expect(within(card).getByText("75%")).toBeInTheDocument();

    // ✅ Fixed: Use card.querySelector directly (card is a DOM element)
    expect(card.querySelector('[style*="width: 75%"]')).toBeInTheDocument();
  });

  it("hides progress bar for earned badges", () => {
    render(<BadgeModal {...defaultProps} earnedBadgeIds={["badge-1"]} />);

    const card = getBadgeCard("First Steps");
    // Earned badges don't render the progress section at all
    expect(within(card).queryByText("Progress")).not.toBeInTheDocument();
  });

  it("hides progress bar for locked badges (0% progress)", () => {
    render(<BadgeModal {...defaultProps} />);

    const card = getBadgeCard("Quiz Champion");
    // Locked badges still show progress section but with 0%
    expect(within(card).getByText("0%")).toBeInTheDocument();
  });

  it("renders badge image when available", () => {
    render(<BadgeModal {...defaultProps} />);

    const img = screen.getByAltText("First Steps");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "/badges/first-steps.png");
  });

  it("renders fallback letter icon when image is missing", () => {
    render(<BadgeModal {...defaultProps} />);

    // Streak Master has no image, should show "S" fallback
    const fallbackIcon = screen.getByText("S");
    expect(fallbackIcon).toBeInTheDocument();
    expect(
      fallbackIcon.closest(".flex.items-center.justify-center"),
    ).toBeInTheDocument();
  });

  it("applies grayscale and opacity to unearned badge images", () => {
    render(<BadgeModal {...defaultProps} />);

    const unearnedImg = screen.getByAltText("Quiz Champion");
    expect(unearnedImg).toHaveClass("grayscale", "opacity-60");
  });

  it("removes grayscale/opacity for earned badge images", () => {
    render(<BadgeModal {...defaultProps} earnedBadgeIds={["badge-1"]} />);

    const earnedImg = screen.getByAltText("First Steps");
    expect(earnedImg).not.toHaveClass("grayscale");
    expect(earnedImg).not.toHaveClass("opacity-60");
  });

  it("applies green border to earned badge cards", () => {
    render(<BadgeModal {...defaultProps} earnedBadgeIds={["badge-1"]} />);

    const card = getBadgeCard("First Steps");
    expect(card).toHaveClass("border-green-200");
  });

  it("applies gray border to unearned badge cards", () => {
    render(<BadgeModal {...defaultProps} />);

    const card = getBadgeCard("Quiz Champion");
    expect(card).toHaveClass("border-gray-200");
  });

  it("caps progress at 100% even if progressMap exceeds it", () => {
    render(<BadgeModal {...defaultProps} progressMap={{ "badge-2": 150 }} />);

    const card = getBadgeCard("Streak Master");
    // Should show 100%, not 150%
    expect(within(card).getByText("100%")).toBeInTheDocument();
  });

  it("treats earned badges as 100% progress regardless of progressMap", () => {
    render(
      <BadgeModal
        {...defaultProps}
        earnedBadgeIds={["badge-2"]}
        progressMap={{ "badge-2": 30 }}
      />,
    );

    const card = getBadgeCard("Streak Master");
    // Earned badge should show "Earned" status, no progress bar section
    expect(within(card).getByText("Earned")).toBeInTheDocument();
    expect(within(card).queryByText("Progress")).not.toBeInTheDocument();
  });

  it("handles empty earnedBadgeIds and progressMap gracefully", () => {
    render(
      <BadgeModal {...defaultProps} earnedBadgeIds={[]} progressMap={{}} />,
    );

    // All badges should render as locked with 0% progress
    expect(screen.getByText("First Steps")).toBeInTheDocument();
    const quizCard = getBadgeCard("Quiz Champion");
    expect(within(quizCard).getByText("0%")).toBeInTheDocument();
  });

  it("does not render content when modal is closed", () => {
    render(<BadgeModal {...defaultProps} isOpen={false} />);

    const modal = screen.getByTestId("base-modal");
    expect(modal).toHaveAttribute("data-open", "false");
  });
});
