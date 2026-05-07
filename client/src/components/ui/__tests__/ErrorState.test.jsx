import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ErrorState from "../ErrorState";

describe("ErrorState", () => {
  it("renders the error message", () => {
    render(<ErrorState error="Something went wrong" />);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("renders the Back to Modules button", () => {
    render(<ErrorState error="Error" />);
    expect(
      screen.getByRole("button", { name: "Back to Modules" }),
    ).toBeInTheDocument();
  });

  it("calls onBack when the button is clicked", async () => {
    const onBack = vi.fn();
    render(<ErrorState error="Error" onBack={onBack} />);

    await userEvent.click(
      screen.getByRole("button", { name: "Back to Modules" }),
    );

    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("renders without errors when onBack is not provided", () => {
    // Button still renders, just with undefined onClick
    render(<ErrorState error="Error" />);
    expect(
      screen.getByRole("button", { name: "Back to Modules" }),
    ).toBeInTheDocument();
  });

  it("renders the error text in red styling", () => {
    render(<ErrorState error="Failure" />);
    const errorText = screen.getByText("Failure");
    expect(errorText).toHaveClass("text-red-700");
  });

  it("has a red-themed container background", () => {
    const { container } = render(<ErrorState error="Error" />);
    const box = container.querySelector(".bg-red-50");
    expect(box).toBeInTheDocument();
    expect(box).toHaveClass("border-red-200");
  });
});
