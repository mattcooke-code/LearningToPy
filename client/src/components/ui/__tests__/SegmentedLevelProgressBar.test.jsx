// src/components/ui/__tests__/SegmentedLevelProgressBar.test.jsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import SegmentedLevelProgressBar from "../SegmentedLevelProgressBar";

// 🔹 Mock context (imported but unused in component logic, mocked for safety)
vi.mock("@/context", () => ({
  useTheme: vi.fn(() => ({
    getModuleThemeColor: vi.fn(() => "#3b82f6"),
  })),
}));

describe("SegmentedLevelProgressBar", () => {
  const defaultProps = {
    currentLevel: 1,
    currentModule: {
      order: 1,
      title: "Intro to Python",
      lessonCount: 5,
      lessonsCompleted: 2,
    },
    lessonsCompleted: 2,
    totalLessons: 5,
    showLabels: true,
  };

  // Helper to get all segment elements
  const getSegments = () => screen.getAllByTitle(/Lesson \d+|Module \d+ ✓/i);

  it("renders active course details correctly", () => {
    render(<SegmentedLevelProgressBar {...defaultProps} />);

    expect(screen.getByText("Level 1")).toBeInTheDocument();
    expect(screen.getByText("Module 1: Intro to Python")).toBeInTheDocument();
    expect(screen.getByText("40%")).toBeInTheDocument();
    expect(screen.getByText("Complete")).toBeInTheDocument();
    expect(screen.getByText("2 / 5 Lessons")).toBeInTheDocument();
  });

  it("shows course complete state when currentLevel >= 20", () => {
    render(
      <SegmentedLevelProgressBar currentLevel={20} currentModule={null} />,
    );

    expect(screen.getByText("🎉 Course Complete")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getByText("🏆 20/20 Modules Mastered")).toBeInTheDocument();
  });

  it("hides labels when showLabels is false", () => {
    render(<SegmentedLevelProgressBar {...defaultProps} showLabels={false} />);

    expect(screen.queryByText("Level 1")).not.toBeInTheDocument();
    expect(screen.queryByText("2 / 5 Lessons")).not.toBeInTheDocument();
    expect(getSegments()).toHaveLength(5);
  });

  it("renders correct segment count based on totalLessons", () => {
    render(<SegmentedLevelProgressBar {...defaultProps} totalLessons={8} />);
    expect(getSegments()).toHaveLength(8);
  });

  it("defaults to 6 segments when totalLessons is 0 and course is active", () => {
    render(<SegmentedLevelProgressBar {...defaultProps} totalLessons={0} />);
    expect(getSegments()).toHaveLength(6);
  });

  it("shows exactly 20 segments when course is complete", () => {
    render(<SegmentedLevelProgressBar currentLevel={20} />);
    expect(getSegments()).toHaveLength(20);
  });

  it("applies correct colors to filled segments based on progress thresholds", () => {
    render(<SegmentedLevelProgressBar {...defaultProps} />);
    const segments = getSegments();

    // idx 0: 20% progress -> Red (#ef4444 → rgb(239, 68, 68))
    expect(segments[0]).toHaveStyle({ backgroundColor: "rgb(239, 68, 68)" });
    expect(segments[0]).toHaveStyle({ borderColor: "rgb(239, 68, 68)" });

    // idx 1: 40% progress -> Orange (#f97316 → rgb(249, 115, 22))
    expect(segments[1]).toHaveStyle({ backgroundColor: "rgb(249, 115, 22)" });

    // idx 2: Unfilled -> transparent background, gray border (#e5e7eb → rgb(229, 231, 235))
    expect(segments[2].style.backgroundColor).toMatch(
      /transparent|rgba\(0, 0, 0, 0\)/,
    );
    expect(segments[2]).toHaveStyle({ borderColor: "rgb(229, 231, 235)" });
  });

  it("applies purple (#800080) to all segments when course is complete", () => {
    render(<SegmentedLevelProgressBar currentLevel={20} />);
    const segments = getSegments();

    segments.forEach((seg) => {
      // #800080 → rgb(128, 0, 128)
      expect(seg).toHaveStyle({ backgroundColor: "rgb(128, 0, 128)" });
      expect(seg).toHaveStyle({ borderColor: "rgb(128, 0, 128)" });
    });
  });

  it("shows segment numbers inside segments when count <= 12", () => {
    render(<SegmentedLevelProgressBar {...defaultProps} totalLessons={10} />);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
  });

  it("hides segment numbers inside segments when count > 12", () => {
    render(<SegmentedLevelProgressBar {...defaultProps} totalLessons={15} />);
    expect(screen.queryByText("1")).not.toBeInTheDocument();
    expect(screen.queryByText("15")).not.toBeInTheDocument();
  });

  it("renders correct tooltips on segments", () => {
    render(<SegmentedLevelProgressBar {...defaultProps} />);
    const segments = getSegments();

    expect(segments[0].title).toBe("Lesson 1");
    expect(segments[4].title).toBe("Lesson 5");
  });

  it("shows checked module tooltips when course is complete", () => {
    render(<SegmentedLevelProgressBar currentLevel={20} />);
    const segments = getSegments();

    expect(segments[0].title).toBe("Module 1 ✓");
    expect(segments[19].title).toBe("Module 20 ✓");
  });

  it("calculates 0% progress and empty segments when nothing is completed", () => {
    render(
      <SegmentedLevelProgressBar {...defaultProps} lessonsCompleted={0} />,
    );

    expect(screen.getByText("0%")).toBeInTheDocument();
    const segments = getSegments();
    segments.forEach((seg) => {
      // Unfilled segments have transparent/empty background
      expect(seg.style.backgroundColor).toMatch(
        /transparent|rgba\(0, 0, 0, 0\)|^$/,
      );
      expect(seg).toHaveStyle({ borderColor: "rgb(229, 231, 235)" });
    });
  });
});
