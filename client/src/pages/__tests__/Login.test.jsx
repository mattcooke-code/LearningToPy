import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../test-utils";
import Login from "../Login";
import { useAuth } from "../../context";

// Mock useAuth and useNavigate
vi.mock("../../context", async () => {
  const actual = await vi.importActual("../../context");
  return { ...actual, useAuth: vi.fn() };
});

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Login Component", () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      login: mockLogin,
      loading: false,
      authError: null,
      isAuthenticated: false,
    });
  });

  it("renders the login form correctly", () => {
    renderWithProviders(<Login />);

    expect(
      screen.getByRole("heading", { name: /log in/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/remember me/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
    expect(screen.getByText(/forgot your password/i)).toBeInTheDocument();
  });

  it("allows user to type in email and password fields", async () => {
    renderWithProviders(<Login />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passwordInput, "password123");

    expect(emailInput).toHaveValue("test@example.com");
    expect(passwordInput).toHaveValue("password123");
  });

  it("toggles remember me checkbox", async () => {
    renderWithProviders(<Login />);

    const checkbox = screen.getByLabelText(/remember me/i);
    expect(checkbox).not.toBeChecked();

    await userEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    await userEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it("calls login function with correct parameters on form submission", async () => {
    renderWithProviders(<Login />);

    await userEvent.type(screen.getByLabelText(/email/i), "test@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "password123");
    await userEvent.click(screen.getByLabelText(/remember me/i));

    await userEvent.click(screen.getByRole("button", { name: /log in/i }));

    expect(mockLogin).toHaveBeenCalledWith(
      "test@example.com",
      "password123",
      true,
    );
    expect(mockLogin).toHaveBeenCalledTimes(1);
  });

  it("displays auth error message when present", () => {
    vi.mocked(useAuth).mockReturnValue({
      login: mockLogin,
      loading: false,
      authError: "Invalid email or password",
      isAuthenticated: false,
    });

    renderWithProviders(<Login />);

    expect(screen.getByText("Invalid email or password")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("shows loading state during authentication", () => {
    vi.mocked(useAuth).mockReturnValue({
      login: mockLogin,
      loading: true,
      authError: null,
      isAuthenticated: false,
    });

    renderWithProviders(<Login />);

    expect(screen.getByText(/logging in/i)).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();
    expect(screen.getByLabelText(/email/i)).toBeDisabled();
    expect(screen.getByLabelText(/password/i)).toBeDisabled();
    expect(screen.getByLabelText(/remember me/i)).toBeDisabled();
  });

  it("disables form fields and button while loading", () => {
    vi.mocked(useAuth).mockReturnValue({
      login: mockLogin,
      loading: true,
      authError: null,
      isAuthenticated: false,
    });

    renderWithProviders(<Login />);

    expect(screen.getByLabelText(/email/i)).toBeDisabled();
    expect(screen.getByLabelText(/password/i)).toBeDisabled();
    expect(screen.getByLabelText(/remember me/i)).toBeDisabled();
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("redirects authenticated users to home page", () => {
    vi.mocked(useAuth).mockReturnValue({
      login: mockLogin,
      loading: false,
      authError: null,
      isAuthenticated: true,
    });

    renderWithProviders(<Login />);

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("does not redirect when still loading", () => {
    vi.mocked(useAuth).mockReturnValue({
      login: mockLogin,
      loading: true,
      authError: null,
      isAuthenticated: true,
    });

    renderWithProviders(<Login />);

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("has correct navigation links", () => {
    renderWithProviders(<Login />);

    const registerLink = screen.getByText(/register here/i);
    const forgotPasswordLink = screen.getByText(/forgot your password/i);

    expect(registerLink.closest("a")).toHaveAttribute("href", "/register");
    expect(forgotPasswordLink.closest("a")).toHaveAttribute(
      "href",
      "/forgot-password",
    );
  });
});
