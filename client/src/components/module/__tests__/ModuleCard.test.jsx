// src/components/module/__tests__/ModuleCard.test.jsx
import { render, screen, within } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ModuleCard from "../ModuleCard";

// 🔹 Mock router BEFORE component import
vi.mock("react-router-dom", () => ({
  Link: ({ to, children, className, ...props }) => (
    <a href={to} className={className} data-testid="router-link" {...props}>
      {children}
    </a>
  ),
}));

// ✅ Use @/ alias to target src/context exactly
vi.mock("@/context", () => ({
  useTheme: vi.fn(() => ({
    getModuleThemeColor: vi.fn(() => "#3b82f6"), // Predictable accent color
  })),
}));

// 🔹 Mock Lucide icons
vi.mock("lucide-react", () => ({
  Lock: () => <svg data-testid="icon-lock" />,
  CheckCircle: () => <svg data-testid="icon-check" />,
  PlayCircle: () => <svg data-testid="icon-play" />,
  Clock: () => <svg data-testid="icon-clock" />,
  BookOpen: () => <svg data-testid="icon-book" />,
  Star: () => <svg data-testid="icon-star" />,
}));

const defaultModule = {
  _id: "mod-123",
  title: "Intro to Python",
  shortDescription: "Master the basics of Python programming.",
  moduleLessonProgress: 0,
  isCompleted: false,
  estimatedHours: 5,
  lessonCount: 10,
  xpReward: 100,
  icon: "🐍",
};

describe("ModuleCard", () => {
  it("renders module details correctly", () => {
    render(<ModuleCard module={defaultModule} isLocked={false} />);

    expect(screen.getByText("Intro to Python")).toBeInTheDocument();
    expect(
      screen.getByText("Master the basics of Python programming."),
    ).toBeInTheDocument();
    expect(screen.getByText("🐍")).toBeInTheDocument();

    // Stats
    expect(screen.getByText("5h")).toBeInTheDocument();
    expect(screen.getByText("10 lessons")).toBeInTheDocument();
    expect(screen.getByText("100 XP")).toBeInTheDocument();
  });

  it('shows "Start Learning" button when progress is 0', () => {
    render(<ModuleCard module={defaultModule} isLocked={false} />);

    const link = screen.getByRole("link", { name: /start learning/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/modules/mod-123/lessons");
  });

  it('shows "Continue" button when progress > 0', () => {
    render(
      <ModuleCard
        module={{ ...defaultModule, moduleLessonProgress: 50 }}
        isLocked={false}
      />,
    );

    const link = screen.getByRole("link", { name: /continue/i });
    expect(link).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it('shows disabled "Complete Prerequisites" when locked', () => {
    render(<ModuleCard module={defaultModule} isLocked={true} />);

    const button = screen.getByRole("button", {
      name: /complete prerequisites/i,
    });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
    expect(screen.getByTestId("icon-lock")).toBeInTheDocument();
  });

  it('shows "Review" link and badge when completed', () => {
    render(
      <ModuleCard
        module={{ ...defaultModule, isCompleted: true }}
        isLocked={false}
      />,
    );

    const link = screen.getByRole("link", { name: /review/i });
    expect(link).toBeInTheDocument();

    // ✅ Scope the query to the link to avoid finding the badge icon as well
    expect(within(link).getByTestId("icon-check")).toBeInTheDocument();
  });
});
