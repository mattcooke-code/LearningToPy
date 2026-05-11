import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../test-utils";
import ContentManagementTable from "../ContentManagementTable";
import * as notificationContext from "../../../context";
import * as confirmActionsHook from "../../../hooks/useConfirmActions";
import * as contentFilterHook from "../../../hooks/useContentFilter";
import { adminApiClient } from "../../../services";

// Partially mock the services module to keep setupInterceptors
vi.mock("../../../services", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    adminApiClient: {
      get: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
      post: vi.fn(),
    },
  };
});

// Mock hooks
vi.mock("../../../hooks/useConfirmActions", () => ({
  useConfirmActions: vi.fn(),
}));

vi.mock("../../../hooks/useContentFilter", () => ({
  useContentFilter: vi.fn(),
}));

vi.mock("../../../context", async () => {
  const actual = await vi.importActual("../../../context");
  return {
    ...actual,
    useNotification: vi.fn(),
  };
});

describe("ContentManagementTable", () => {
  const mockLessons = [
    {
      _id: "lesson1",
      title: "Python Basics",
      type: "lesson",
      order: 1,
      isPublished: true,
      difficulty: "beginner",
      xpReward: 100,
      moduleId: { _id: "module1", title: "Getting Started", order: 1 },
      updatedAt: "2024-01-15T10:00:00Z",
      tags: ["python", "basics"],
      description: "Learn Python basics",
    },
    {
      _id: "lesson2",
      title: "Advanced Functions",
      type: "lesson",
      order: 2,
      isPublished: false,
      difficulty: "advanced",
      xpReward: 300,
      moduleId: { _id: "module1", title: "Getting Started", order: 1 },
      updatedAt: "2024-02-20T10:00:00Z",
      tags: ["functions", "advanced"],
      description: "Advanced function concepts",
    },
  ];

  const mockModulesData = [
    {
      _id: "module1",
      title: "Getting Started",
      type: "module",
      order: 1,
      isPublished: true,
      updatedAt: "2024-01-10T10:00:00Z",
      description: "Introduction to Python",
    },
  ];

  const mockShowToast = vi.fn();
  const mockConfirmDelete = vi.fn();
  const mockConfirmAction = vi.fn();
  const mockSetFilters = vi.fn();
  const mockHandleSort = vi.fn();
  const mockClearFilters = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock window.innerWidth for desktop view
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });

    // Mock notifications
    vi.mocked(notificationContext.useNotification).mockReturnValue({
      showToast: mockShowToast,
    });

    // Mock confirm actions
    vi.mocked(confirmActionsHook.useConfirmActions).mockReturnValue({
      confirmDelete: mockConfirmDelete,
      confirmAction: mockConfirmAction,
    });

    // Mock content filter
    vi.mocked(contentFilterHook.useContentFilter).mockReturnValue({
      filters: {
        search: "",
        type: "all",
        status: "all",
        difficulty: "all",
        moduleId: "",
      },
      setFilters: mockSetFilters,
      sortConfig: { field: "title", direction: "ascend" },
      handleSort: mockHandleSort,
      filteredContent: [...mockLessons, ...mockModulesData],
      clearFilters: mockClearFilters,
    });

    // Mock API responses
    vi.mocked(adminApiClient.get).mockResolvedValue({
      lessons: mockLessons,
      modules: mockModulesData,
    });
  });

  describe("Loading State", () => {
    it("shows loading spinner when content is being fetched", () => {
      // Mock API to never resolve to keep loading state
      vi.mocked(adminApiClient.get).mockImplementation(
        () => new Promise(() => {}),
      );

      renderWithProviders(<ContentManagementTable />);

      // The component shows a loading spinner initially
      const spinner = document.querySelector(".animate-spin");
      expect(spinner).toBeInTheDocument();
    });
  });

  describe("Content Display", () => {
    it("renders stats cards after loading", async () => {
      renderWithProviders(<ContentManagementTable />);

      await waitFor(() => {
        expect(screen.getByText("Total Lessons")).toBeInTheDocument();
      });

      expect(screen.getByText("Total Modules")).toBeInTheDocument();
      expect(screen.getByText("Published Total")).toBeInTheDocument();
      expect(screen.getByText("Drafts")).toBeInTheDocument();
    });

    it("displays content items after loading", async () => {
      renderWithProviders(<ContentManagementTable />);

      await waitFor(() => {
        expect(screen.getByText("Python Basics")).toBeInTheDocument();
      });

      expect(screen.getByText("Advanced Functions")).toBeInTheDocument();
      expect(screen.getByText("Getting Started")).toBeInTheDocument();
    });

    it("shows summary count", async () => {
      renderWithProviders(<ContentManagementTable />);

      await waitFor(() => {
        expect(screen.getByText(/Showing 3 of 3 items/)).toBeInTheDocument();
      });
    });
  });

  describe("Search and Filters", () => {
    it("renders search input", async () => {
      renderWithProviders(<ContentManagementTable />);

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText("Search content...");
        expect(searchInput).toBeInTheDocument();
      });
    });

    it("renders filter dropdowns", async () => {
      renderWithProviders(<ContentManagementTable />);

      await waitFor(() => {
        // The filter selects are rendered with their default options
        const typeFilter = screen.getByDisplayValue("All Types");
        expect(typeFilter).toBeInTheDocument();
      });
    });
  });

  describe("Add New Content", () => {
    it("shows add new menu", async () => {
      renderWithProviders(<ContentManagementTable />);

      await waitFor(() => {
        const addButton = screen.getByText("Add New");
        expect(addButton).toBeInTheDocument();
      });

      await userEvent.click(screen.getByText("Add New"));

      await waitFor(() => {
        expect(screen.getByText("New Lesson")).toBeInTheDocument();
        expect(screen.getByText("New Module")).toBeInTheDocument();
      });
    });

    it("opens new lesson modal from add menu", async () => {
      renderWithProviders(<ContentManagementTable />);

      await waitFor(() => {
        expect(screen.getByText("Add New")).toBeInTheDocument();
      });

      // Open the add menu
      await userEvent.click(screen.getByText("Add New"));

      await waitFor(() => {
        expect(screen.getByText("New Lesson")).toBeInTheDocument();
      });

      // Click New Lesson
      await userEvent.click(screen.getByText("New Lesson"));

      // Menu should close after selection
      await waitFor(() => {
        expect(screen.queryByText("New Lesson")).not.toBeInTheDocument();
      });
    });
  });

  describe("Delete Content", () => {
    it("shows confirmation before deleting", async () => {
      mockConfirmDelete.mockResolvedValue(true);
      vi.mocked(adminApiClient.delete).mockResolvedValue({});

      renderWithProviders(<ContentManagementTable />);

      await waitFor(() => {
        expect(screen.getByText("Python Basics")).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByTitle("Delete");
      await userEvent.click(deleteButtons[0]);

      expect(mockConfirmDelete).toHaveBeenCalledWith("lesson");
    });

    it("deletes content after confirmation", async () => {
      mockConfirmDelete.mockResolvedValue(true);
      vi.mocked(adminApiClient.delete).mockResolvedValue({});

      renderWithProviders(<ContentManagementTable />);

      await waitFor(() => {
        expect(screen.getByText("Python Basics")).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByTitle("Delete");
      await userEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(mockConfirmDelete).toHaveBeenCalled();
        expect(mockShowToast).toHaveBeenCalledWith(
          "lesson deleted successfully",
          "success",
        );
      });
    });

    it("does not delete when not confirmed", async () => {
      mockConfirmDelete.mockResolvedValue(false);

      renderWithProviders(<ContentManagementTable />);

      await waitFor(() => {
        expect(screen.getByText("Python Basics")).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByTitle("Delete");
      await userEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(mockConfirmDelete).toHaveBeenCalled();
      });

      // API should not be called since delete was cancelled
      expect(adminApiClient.delete).not.toHaveBeenCalled();
    });
  });

  describe("Empty State", () => {
    it("shows empty message when no content matches filters", async () => {
      // Mock API to return empty arrays so the component loads with no content
      vi.mocked(adminApiClient.get).mockResolvedValue({
        lessons: [],
        modules: [],
      });

      // Mock content filter to return empty filtered content
      vi.mocked(contentFilterHook.useContentFilter).mockReturnValue({
        filters: {
          search: "",
          type: "all",
          status: "all",
          difficulty: "all",
          moduleId: "",
        },
        setFilters: mockSetFilters,
        sortConfig: { field: "title", direction: "ascend" },
        handleSort: mockHandleSort,
        filteredContent: [],
        clearFilters: mockClearFilters,
      });

      renderWithProviders(<ContentManagementTable />);

      // Wait for the component to finish loading (API call completes)
      await waitFor(() => {
        expect(screen.getByText("No content found")).toBeInTheDocument();
      });

      expect(screen.getByText("Clear all filters")).toBeInTheDocument();
    });
  });
});
