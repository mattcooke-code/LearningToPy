import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Spinner from "../Spinner";

describe("Spinner", () => {
  // ---- Default rendering ----
  it("renders a spinning element", () => {
    const { container } = render(<Spinner />);
    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("is centered by default", () => {
    const { container } = render(<Spinner />);
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass("flex");
    expect(wrapper).toHaveClass("justify-center");
  });

  it("does not show text by default", () => {
    render(<Spinner />);
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  });

  // ---- Size classes ----
  it("applies medium size by default", () => {
    const { container } = render(<Spinner />);
    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toHaveClass("h-12");
    expect(spinner).toHaveClass("w-12");
  });

  it("applies small size class", () => {
    const { container } = render(<Spinner size="sm" />);
    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toHaveClass("h-4");
    expect(spinner).toHaveClass("w-4");
  });

  it("applies large size class", () => {
    const { container } = render(<Spinner size="lg" />);
    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toHaveClass("h-16");
    expect(spinner).toHaveClass("w-16");
  });

  // ---- Color classes ----
  it("applies python-blue color by default", () => {
    const { container } = render(<Spinner />);
    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toHaveClass("border-python-blue");
  });

  it("applies white color class", () => {
    const { container } = render(<Spinner color="white" />);
    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toHaveClass("border-white");
  });

  it("applies gray color class", () => {
    const { container } = render(<Spinner color="gray" />);
    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toHaveClass("border-gray-400");
  });

  // ---- Center prop ----
  it("renders inline when center is false", () => {
    const { container } = render(<Spinner center={false} />);
    // Without center, the spinner is returned directly — no wrapper div
    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
    // The spinner itself should be the root element
    expect(container.firstChild).toHaveClass("animate-spin");
  });

  // ---- Text display ----
  it("shows text when showText is true", () => {
    render(<Spinner showText={true} />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("shows custom text when provided", () => {
    render(<Spinner showText={true} text="Please wait..." />);
    expect(screen.getByText("Please wait...")).toBeInTheDocument();
  });

  it("applies text color matching the spinner color", () => {
    render(<Spinner showText={true} color="white" />);
    const text = screen.getByText("Loading...");
    expect(text).toHaveClass("text-white");
  });

  it("centers text with spinner when centered", () => {
    const { container } = render(<Spinner showText={true} center={true} />);
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass("justify-center");
  });

  // ---- Custom className ----
  it("appends custom className to the spinner", () => {
    const { container } = render(<Spinner className="my-custom-spinner" />);
    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toHaveClass("my-custom-spinner");
  });
});
