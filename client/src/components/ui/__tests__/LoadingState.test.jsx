import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import LoadingState from "../LoadingState";

describe("LoadingState", () => {
  it("renders the default loading message", () => {
    render(<LoadingState />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders a custom message", () => {
    render(<LoadingState message="Fetching data..." />);
    expect(screen.getByText("Fetching data...")).toBeInTheDocument();
  });

  it("renders a Spinner", () => {
    const { container } = render(<LoadingState />);
    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("applies default height class", () => {
    const { container } = render(<LoadingState />);
    const wrapper = container.firstChild.firstChild;
    expect(wrapper).toHaveClass("h-64");
  });

  it("applies custom height class", () => {
    const { container } = render(<LoadingState height="h-32" />);
    const wrapper = container.firstChild.firstChild;
    expect(wrapper).toHaveClass("h-32");
  });
});
