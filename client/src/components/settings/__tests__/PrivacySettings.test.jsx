import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";

// 🚨 vi.mock MUST be at the very top
vi.mock("../../../services", () => ({
  apiClient: { patch: vi.fn() },
}));

vi.mock("../../../utils", () => ({
  getErrorMessage: vi.fn((_, defaultMsg) => defaultMsg),
  getSuccessMessage: vi.fn(
    (action, name) => `${action.trim()} ${name.trim()} successfully`,
  ),
}));

import PrivacySettings from "../PrivacySettings";
import { apiClient } from "../../../services";

describe("PrivacySettings Component", () => {
  const mockUser = {
    _id: "user123abc",
    username: "testuser",
    privacySettings: {
      showOnLeaderboards: true,
      showAsAnonymous: false,
      showUsernameOnLeaderboards: true,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const renderComponent = (props = {}) => {
    return render(
      <PrivacySettings
        user={props.user || mockUser}
        onUpdate={props.onUpdate || vi.fn()}
      />,
    );
  };

  it("renders with initial settings from props", () => {
    renderComponent();
    expect(screen.getByText("Privacy Settings")).toBeInTheDocument();
    expect(
      screen.getByText("Control how you appear to other learners"),
    ).toBeInTheDocument();

    const checkboxes = screen.getAllByRole("checkbox", { hidden: true });
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).toBeChecked();
    expect(screen.getByText("testuser")).toBeInTheDocument();
  });

  it("disables and unchecks username toggle when leaderboard is turned off", () => {
    renderComponent();
    const [leaderboardCheckbox, usernameCheckbox] = screen.getAllByRole(
      "checkbox",
      { hidden: true },
    );

    fireEvent.click(leaderboardCheckbox);

    expect(leaderboardCheckbox).not.toBeChecked();
    expect(usernameCheckbox).not.toBeChecked();
    expect(usernameCheckbox).toBeDisabled();
  });

  it('updates leaderboard preview to show "Anon" when username is hidden', () => {
    renderComponent();
    const usernameCheckbox = screen.getAllByRole("checkbox", {
      hidden: true,
    })[1];

    fireEvent.click(usernameCheckbox);

    expect(screen.queryByText("testuser")).not.toBeInTheDocument();
    expect(screen.getByText(/Anon/i)).toBeInTheDocument();
  });

  it("calls API and onUpdate callback on successful save", async () => {
    const mockOnUpdate = vi.fn();
    const mockResponse = { privacySettings: { ...mockUser.privacySettings } };
    apiClient.patch.mockResolvedValue(mockResponse);

    renderComponent({ onUpdate: mockOnUpdate });
    const saveButton = screen.getByRole("button", { name: /Save Settings/i });

    fireEvent.click(saveButton);
    expect(saveButton).toBeDisabled();
    expect(saveButton).toHaveTextContent(/Saving.../i);

    await waitFor(() => {
      // ✅ Use stringMatching to ignore trailing whitespace in URL
      expect(apiClient.patch).toHaveBeenCalledWith(
        expect.stringMatching(/\/auth\/privacy-settings\s*$/),
        expect.objectContaining(mockUser.privacySettings),
      );
      expect(mockOnUpdate).toHaveBeenCalledWith(mockResponse.privacySettings);
      expect(
        screen.getByText(/Privacy settings successfully/i),
      ).toBeInTheDocument();
    });
  });

  it("displays error message when API call fails", async () => {
    apiClient.patch.mockRejectedValue(new Error("Network Error"));

    renderComponent();
    fireEvent.click(screen.getByRole("button", { name: /Save Settings/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Failed to update settings/i),
      ).toBeInTheDocument();
    });
  });

  // ✅ Option A: Use real timers (simpler and more reliable)
  it("automatically clears success message after 3 seconds", async () => {
    apiClient.patch.mockResolvedValue({ privacySettings: {} });

    renderComponent();
    fireEvent.click(screen.getByRole("button", { name: /Save Settings/i }));

    // Wait for success message to appear
    await waitFor(() => {
      expect(
        screen.getByText(/Privacy settings successfully/i),
      ).toBeInTheDocument();
    });

    // Wait for the 3-second auto-clear (real time)
    await new Promise((resolve) => setTimeout(resolve, 3100));

    expect(
      screen.queryByText(/Privacy settings successfully/i),
    ).not.toBeInTheDocument();
  });
});
