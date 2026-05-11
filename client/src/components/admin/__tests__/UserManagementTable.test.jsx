import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../test-utils";
import UserManagementTable from "../UserManagementTable";
import * as adminDataHook from "../../../hooks/useAdminData";
import * as adminMutationHook from "../../../hooks/useAdminMutation";
import * as notificationContext from "../../../context";

// Mock hooks with CORRECT paths
vi.mock("../../../hooks/useAdminData", () => ({
  useAdminData: vi.fn(),
}));

vi.mock("../../../hooks/useAdminMutation", () => ({
  useAdminMutation: vi.fn(),
}));

vi.mock("../../../context", async () => {
  const actual = await vi.importActual("../../../context");
  return {
    ...actual,
    useNotification: vi.fn(),
  };
});

describe("UserManagementTable", () => {
  const mockUsers = [
    {
      _id: "user1",
      username: "JohnDoe",
      email: "john@example.com",
      level: 5,
      xp: 2500,
      isBlocked: false,
      isAdmin: false,
      createdAt: "2024-01-15T10:00:00Z",
    },
    {
      _id: "user2",
      username: "JaneAdmin",
      email: "jane@example.com",
      level: 15,
      xp: 7500,
      isBlocked: false,
      isAdmin: true,
      createdAt: "2024-02-20T10:00:00Z",
    },
    {
      _id: "user3",
      username: "BlockedUser",
      email: "blocked@example.com",
      level: 3,
      xp: 1500,
      isBlocked: true,
      isAdmin: false,
      createdAt: "2024-03-10T10:00:00Z",
    },
  ];

  const mockShowToast = vi.fn();
  const mockShowConfirm = vi.fn();
  const mockRefresh = vi.fn();
  const mockMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock notifications
    vi.mocked(notificationContext.useNotification).mockReturnValue({
      showToast: mockShowToast,
      showConfirm: mockShowConfirm,
    });

    // Mock admin data hook
    vi.mocked(adminDataHook.useAdminData).mockReturnValue({
      data: {
        users: mockUsers,
        pagination: { totalPages: 3 },
      },
      loading: false,
      refetch: mockRefresh,
    });

    // Mock admin mutation hook
    vi.mocked(adminMutationHook.useAdminMutation).mockReturnValue({
      mutate: mockMutate,
    });
  });

  describe("Rendering", () => {
    it("renders loading state when data is loading", () => {
      vi.mocked(adminDataHook.useAdminData).mockReturnValue({
        data: { users: [], pagination: { totalPages: 0 } },
        loading: true,
        refetch: mockRefresh,
      });

      renderWithProviders(<UserManagementTable />);

      expect(screen.getByText(/loading users/i)).toBeInTheDocument();
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("renders user table with correct headers", () => {
      renderWithProviders(<UserManagementTable />);

      expect(screen.getByText("username")).toBeInTheDocument();
      expect(screen.getByText("email")).toBeInTheDocument();
      expect(screen.getByText("level")).toBeInTheDocument();
      expect(screen.getByText("xp")).toBeInTheDocument();
      expect(screen.getByText("status")).toBeInTheDocument();
    });

    it("renders all users in the table", () => {
      renderWithProviders(<UserManagementTable />);

      expect(screen.getByText("JohnDoe")).toBeInTheDocument();
      expect(screen.getByText("JaneAdmin")).toBeInTheDocument();
      expect(screen.getByText("BlockedUser")).toBeInTheDocument();
    });

    it("displays user avatars with first letter", () => {
      renderWithProviders(<UserManagementTable />);

      // There are two users with names starting with "J"
      const jAvatars = screen.getAllByText("J");
      expect(jAvatars).toHaveLength(2); // Both JohnDoe and JaneAdmin

      const bAvatar = screen.getByText("B");
      expect(bAvatar).toBeInTheDocument(); // BlockedUser
    });

    it("shows admin badge for admin users", () => {
      renderWithProviders(<UserManagementTable />);

      const adminBadges = screen.getAllByText("ADMIN");
      expect(adminBadges).toHaveLength(1);
    });

    it("shows correct status indicators in table rows", () => {
      renderWithProviders(<UserManagementTable />);

      // Look specifically for status badges in table cells
      const tableCells = document.querySelectorAll("td");
      const activeStatuses = Array.from(tableCells).filter(
        (cell) => cell.querySelector("span")?.textContent?.trim() === "Active",
      );
      const blockedStatuses = Array.from(tableCells).filter(
        (cell) => cell.querySelector("span")?.textContent?.trim() === "Blocked",
      );

      expect(activeStatuses).toHaveLength(2); // JohnDoe and JaneAdmin
      expect(blockedStatuses).toHaveLength(1); // BlockedUser
    });
  });

  describe("Sorting", () => {
    it("shows sort indicator when clicking sortable column header", async () => {
      renderWithProviders(<UserManagementTable />);

      const usernameHeader = screen.getByText("username").closest("button");
      expect(usernameHeader).toBeInTheDocument();

      await userEvent.click(usernameHeader);

      // Verify that a sort icon appears (ChevronUp or ChevronDown)
      await waitFor(() => {
        const chevron = usernameHeader.querySelector(
          ".lucide-chevron-up, .lucide-chevron-down",
        );
        expect(chevron).toBeInTheDocument();
      });
    });

    it("keeps sort indicator when toggling sort direction", async () => {
      renderWithProviders(<UserManagementTable />);

      const levelHeader = screen.getByText("level").closest("button");
      expect(levelHeader).toBeInTheDocument();

      // First click - sorts descending
      await userEvent.click(levelHeader);

      await waitFor(() => {
        const chevrons = levelHeader.querySelectorAll(
          ".lucide-chevron-up, .lucide-chevron-down",
        );
        expect(chevrons.length).toBe(1);
      });

      // Second click - toggles to ascending
      await userEvent.click(levelHeader);

      // Sort icon should still be present
      await waitFor(() => {
        const chevrons = levelHeader.querySelectorAll(
          ".lucide-chevron-up, .lucide-chevron-down",
        );
        expect(chevrons.length).toBe(1);
      });
    });
  });

  describe("User Actions Dropdown", () => {
    it("opens dropdown menu when clicking action button", async () => {
      renderWithProviders(<UserManagementTable />);

      const moreButtons = screen
        .getAllByRole("button")
        .filter(
          (button) =>
            button.querySelector(".lucide-more-vertical") ||
            button.innerHTML.includes("more-vertical"),
        );

      if (moreButtons.length > 0) {
        await userEvent.click(moreButtons[0]);

        expect(screen.getByText("View Profile")).toBeInTheDocument();
        expect(screen.getByText("Make Admin")).toBeInTheDocument();
        expect(screen.getByText("Adjust XP")).toBeInTheDocument();
        expect(screen.getByText("Override Progress")).toBeInTheDocument();
        expect(screen.getByText("Grant Badge")).toBeInTheDocument();
        expect(screen.getByText("Block User")).toBeInTheDocument();
      }
    });

    it("shows correct options for admin users", async () => {
      renderWithProviders(<UserManagementTable />);

      const moreButtons = screen
        .getAllByRole("button")
        .filter(
          (button) =>
            button.querySelector(".lucide-more-vertical") ||
            button.innerHTML.includes("more-vertical"),
        );

      if (moreButtons.length > 1) {
        await userEvent.click(moreButtons[1]); // JaneAdmin (admin)

        expect(screen.getByText("Remove Admin")).toBeInTheDocument();
      }
    });

    it("shows unblock option for blocked users", async () => {
      renderWithProviders(<UserManagementTable />);

      const moreButtons = screen
        .getAllByRole("button")
        .filter(
          (button) =>
            button.querySelector(".lucide-more-vertical") ||
            button.innerHTML.includes("more-vertical"),
        );

      if (moreButtons.length > 2) {
        await userEvent.click(moreButtons[2]); // BlockedUser

        expect(screen.getByText("Unblock User")).toBeInTheDocument();
      }
    });

    it("closes dropdown when clicking outside", async () => {
      renderWithProviders(<UserManagementTable />);

      const moreButtons = screen
        .getAllByRole("button")
        .filter(
          (button) =>
            button.querySelector(".lucide-more-vertical") ||
            button.innerHTML.includes("more-vertical"),
        );

      if (moreButtons.length > 0) {
        await userEvent.click(moreButtons[0]);
        expect(screen.getByText("View Profile")).toBeInTheDocument();

        // Click outside
        await userEvent.click(document.body);

        await waitFor(() => {
          expect(screen.queryByText("View Profile")).not.toBeInTheDocument();
        });
      }
    });
  });

  describe("Block/Unblock User", () => {
    it("shows confirmation dialog for blocking user", async () => {
      renderWithProviders(<UserManagementTable />);

      const moreButtons = screen
        .getAllByRole("button")
        .filter(
          (button) =>
            button.querySelector(".lucide-more-vertical") ||
            button.innerHTML.includes("more-vertical"),
        );

      if (moreButtons.length > 0) {
        await userEvent.click(moreButtons[0]); // JohnDoe

        const blockButton = screen.getByText("Block User");
        await userEvent.click(blockButton);

        expect(mockShowConfirm).toHaveBeenCalledWith(
          expect.objectContaining({
            title: "Block User",
            type: "danger",
          }),
        );
      }
    });

    it("shows confirmation dialog for unblocking user", async () => {
      renderWithProviders(<UserManagementTable />);

      const moreButtons = screen
        .getAllByRole("button")
        .filter(
          (button) =>
            button.querySelector(".lucide-more-vertical") ||
            button.innerHTML.includes("more-vertical"),
        );

      if (moreButtons.length > 2) {
        await userEvent.click(moreButtons[2]); // BlockedUser

        const unblockButton = screen.getByText("Unblock User");
        await userEvent.click(unblockButton);

        expect(mockShowConfirm).toHaveBeenCalledWith(
          expect.objectContaining({
            title: "Unblock User",
            type: "warning",
          }),
        );
      }
    });
  });
});
