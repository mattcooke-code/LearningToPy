import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RefreshButton from "../RefreshButton";

describe("RefreshButton", () => {
  it("renders with default text 'Refresh'", () => {
    render(<RefreshButton onClick={vi.fn()} />);
    expect(screen.getByText("Refresh")).toBeInTheDocument();
  });

  it("renders custom children text", () => {
    render(<RefreshButton onClick={vi.fn()}>Reload Data</RefreshButton>);
    expect(screen.getByText("Reload Data")).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const onClick = vi.fn();
    render(<RefreshButton onClick={onClick} />);

    await userEvent.click(screen.getByText("Refresh"));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("disables the button when isLoading is true", () => {
    render(<RefreshButton onClick={vi.fn()} isLoading={true} />);

    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("does not call onClick when disabled", async () => {
    const onClick = vi.fn();
    render(<RefreshButton onClick={onClick} isLoading={true} />);

    await userEvent.click(screen.getByText("Refresh"));

    expect(onClick).not.toHaveBeenCalled();
  });

  it("shows spinning icon when isLoading", () => {
    const { container } = render(
      <RefreshButton onClick={vi.fn()} isLoading={true} />,
    );

    const icon = container.querySelector(".animate-spin");
    expect(icon).toBeInTheDocument();
  });

  it("does not show spinning icon when not loading", () => {
    const { container } = render(<RefreshButton onClick={vi.fn()} />);

    const icon = container.querySelector(".animate-spin");
    expect(icon).not.toBeInTheDocument();
  });
});
