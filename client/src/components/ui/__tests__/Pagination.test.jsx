import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Pagination from "../Pagination";

describe("Pagination", () => {
  it("renders nothing when total is 1 or less", () => {
    const { container } = render(
      <Pagination page={1} total={1} onPageChange={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when total is 0", () => {
    const { container } = render(
      <Pagination page={1} total={0} onPageChange={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders page info and buttons when total > 1", () => {
    render(<Pagination page={2} total={5} onPageChange={vi.fn()} />);

    expect(screen.getByText(/Page/)).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("Previous")).toBeInTheDocument();
    expect(screen.getByText("Next")).toBeInTheDocument();
  });

  it("disables Previous button on first page", () => {
    render(<Pagination page={1} total={3} onPageChange={vi.fn()} />);

    expect(screen.getByText("Previous")).toBeDisabled();
    expect(screen.getByText("Next")).not.toBeDisabled();
  });

  it("disables Next button on last page", () => {
    render(<Pagination page={3} total={3} onPageChange={vi.fn()} />);

    expect(screen.getByText("Next")).toBeDisabled();
    expect(screen.getByText("Previous")).not.toBeDisabled();
  });

  it("both buttons enabled on middle page", () => {
    render(<Pagination page={2} total={5} onPageChange={vi.fn()} />);

    expect(screen.getByText("Previous")).not.toBeDisabled();
    expect(screen.getByText("Next")).not.toBeDisabled();
  });

  it("calls onPageChange with page - 1 when Previous clicked", async () => {
    const onPageChange = vi.fn();
    render(<Pagination page={3} total={5} onPageChange={onPageChange} />);

    await userEvent.click(screen.getByText("Previous"));

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("calls onPageChange with page + 1 when Next clicked", async () => {
    const onPageChange = vi.fn();
    render(<Pagination page={3} total={5} onPageChange={onPageChange} />);

    await userEvent.click(screen.getByText("Next"));

    expect(onPageChange).toHaveBeenCalledWith(4);
  });
});
