// src/components/module_lesson/__tests__/ProgressCircle.test.jsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ProgressCircle from "../ProgressCircle";

describe("ProgressCircle", () => {
  const defaultProps = {
    progress: 75,
    completedLessons: 3,
    totalLessons: 4,
    accentColor: "#3b82f6",
  };

  it("renders progress percentage text", () => {
    render(<ProgressCircle {...defaultProps} />);
    expect(screen.getByText("75%")).toBeInTheDocument();
  });

  it("renders completed/total lessons text", () => {
    render(<ProgressCircle {...defaultProps} />);
    expect(screen.getByText("3/4 lessons")).toBeInTheDocument();
  });

  it("applies accent color to progress text", () => {
    render(<ProgressCircle {...defaultProps} />);
    const progressText = screen.getByText("75%");
    expect(progressText).toHaveStyle({ color: "#3b82f6" });
  });

  it("calculates correct strokeDashoffset for 0% progress", () => {
    // circumference = 2 * π * 36 ≈ 226.19
    // offset = circumference - (0/100) * circumference = circumference
    render(<ProgressCircle {...defaultProps} progress={0} />);

    const progressCircle = document.querySelector("svg circle:nth-child(2)");
    const circumference = 2 * Math.PI * 36;

    expect(progressCircle).toHaveAttribute(
      "stroke-dasharray",
      circumference.toString(),
    );
    expect(
      parseFloat(progressCircle.getAttribute("stroke-dashoffset")),
    ).toBeCloseTo(circumference, 1);
  });

  it("calculates correct strokeDashoffset for 100% progress", () => {
    // offset = circumference - (100/100) * circumference = 0
    render(<ProgressCircle {...defaultProps} progress={100} />);

    const progressCircle = document.querySelector("svg circle:nth-child(2)");

    expect(
      parseFloat(progressCircle.getAttribute("stroke-dashoffset")),
    ).toBeCloseTo(0, 1);
  });

  it("calculates correct strokeDashoffset for 50% progress", () => {
    // offset = circumference - 0.5 * circumference = 0.5 * circumference
    render(<ProgressCircle {...defaultProps} progress={50} />);

    const progressCircle = document.querySelector("svg circle:nth-child(2)");
    const circumference = 2 * Math.PI * 36;
    const expectedOffset = circumference * 0.5;

    expect(
      parseFloat(progressCircle.getAttribute("stroke-dashoffset")),
    ).toBeCloseTo(expectedOffset, 1);
  });

  it("applies accent color to SVG circle stroke", () => {
    render(<ProgressCircle {...defaultProps} />);
    const progressCircle = document.querySelector("svg circle:nth-child(2)");
    expect(progressCircle).toHaveAttribute("stroke", "#3b82f6");
  });

  it("has transition class for smooth animation", () => {
    render(<ProgressCircle {...defaultProps} />);
    const progressCircle = document.querySelector("svg circle:nth-child(2)");
    expect(progressCircle).toHaveClass("transition-all", "duration-500");
  });

  it("handles edge case: progress above 100 caps at 100%", () => {
    render(<ProgressCircle {...defaultProps} progress={150} />);

    // Should still show 150% text (component doesn't clamp display)
    expect(screen.getByText("150%")).toBeInTheDocument();

    // But stroke offset should be 0 (fully filled)
    const progressCircle = document.querySelector("svg circle:nth-child(2)");
    expect(
      parseFloat(progressCircle.getAttribute("stroke-dashoffset")),
    ).toBeLessThanOrEqual(0.1);
  });

  it("handles edge case: negative progress shows 0 offset", () => {
    render(<ProgressCircle {...defaultProps} progress={-10} />);

    expect(screen.getByText("-10%")).toBeInTheDocument();

    const progressCircle = document.querySelector("svg circle:nth-child(2)");
    const circumference = 2 * Math.PI * 36;
    // Negative progress = offset > circumference (empty circle)
    expect(
      parseFloat(progressCircle.getAttribute("stroke-dashoffset")),
    ).toBeGreaterThan(circumference);
  });

  it("updates when props change", () => {
    const { rerender } = render(<ProgressCircle {...defaultProps} />);
    expect(screen.getByText("75%")).toBeInTheDocument();

    rerender(
      <ProgressCircle {...defaultProps} progress={100} completedLessons={4} />,
    );
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getByText("4/4 lessons")).toBeInTheDocument();
  });

  it("has accessible structure with proper SVG attributes", () => {
    render(<ProgressCircle {...defaultProps} />);

    const svg = document.querySelector("svg");
    expect(svg).toHaveAttribute(
      "class",
      expect.stringContaining("transform -rotate-90"),
    );

    // Background circle should have gray stroke
    const bgCircle = document.querySelector("svg circle:first-child");
    expect(bgCircle).toHaveAttribute("stroke", "#e5e7eb");
    expect(bgCircle).toHaveAttribute("fill", "none");
  });
});
