import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import React from "react";
import FlaggedLessonPreviewModal from "../FlaggedLessonPreviewModal";
import { apiClient } from "@/services";

/**
 * 1. Mock the API Client using the alias defined in vitest.config.js
 */
vi.mock("@/services", () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

/**
 * 2. Mock the UI components completely to avoid all dependencies
 */
vi.mock("../components/ui", () => ({
  BaseModal: ({ children, isOpen, title, onClose }) =>
    isOpen ? (
      <div role="dialog" aria-modal="true" data-testid="base-modal">
        {typeof title === 'string' ? <h1>{title}</h1> : <h1>{title?.props?.children?.[1]?.props?.children || 'Review Reported Lesson'}</h1>}
        <button onClick={onClose}>Close Preview</button>
        {children}
      </div>
    ) : null,
  MarkdownRenderer: ({ content, className }) => (
    <div data-testid="markdown-mock" className={className}>{content}</div>
  ),
}));

// Force the mock to be used by clearing require cache
vi.unmock("../components/ui");
vi.mock("../components/ui", () => ({
  BaseModal: ({ children, isOpen, title, onClose }) =>
    isOpen ? (
      <div role="dialog" aria-modal="true" data-testid="base-modal">
        {typeof title === 'string' ? <h1>{title}</h1> : <h1>{title?.props?.children?.[1]?.props?.children || 'Review Reported Lesson'}</h1>}
        <button onClick={onClose}>Close Preview</button>
        {children}
      </div>
    ) : null,
  MarkdownRenderer: ({ content, className }) => (
    <div data-testid="markdown-mock" className={className}>{content}</div>
  ),
}));

/**
 * 3. Mock all contexts to prevent any hook errors
 */
vi.mock("../../context/ThemeContext", () => ({
  useTheme: () => ({
    themeColor: "#3B82F6",
    isDarkMode: false,
    setThemeColor: vi.fn(),
    toggleDarkMode: vi.fn(),
  }),
}));

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({
    user: { _id: 'test-user', isAdmin: true },
    isAuthenticated: true,
    loading: false,
  }),
}));

vi.mock("../../context/NotificationContext", () => ({
  useNotification: () => ({
    showToast: vi.fn(),
    showNotification: vi.fn(),
  }),
}));

/**
 * 3. Mock Date.toLocaleString to avoid locale issues in tests
 */
const mockDate = new Date('2024-01-01T00:00:00.000Z');
const mockToLocaleString = vi.fn(() => '1/1/2024, 12:00:00 AM');
Object.defineProperty(global.Date.prototype, 'toLocaleString', {
  value: mockToLocaleString,
  writable: true,
});

const mockLesson = {
  _id: "lesson_123",
  title: "Test Lesson",
  type: "Lesson",
  xpReward: 100,
  difficulty: "Beginner",
  content: "Success Content",
  exercise: { instructions: "Test Exercise" },
  createdAt: mockDate.toISOString(),
  updatedAt: mockDate.toISOString(),
  moduleId: "module_456",
  isPublished: true,
  tags: ["python", "beginner"],
  estimatedTime: 30,
  description: "Test lesson description",
  quiz: {
    questions: [
      { question: "Test question 1", options: ["A", "B", "C", "D"] },
      { question: "Test question 2", options: ["A", "B", "C", "D"] },
    ]
  }
};

describe("FlaggedLessonPreviewModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    lessonId: "123",
    semanticId: "LESSON-ALPHA",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state initially", async () => {
    apiClient.get.mockReturnValue(new Promise(() => {}));
    render(<FlaggedLessonPreviewModal {...defaultProps} />);
    
    // Wait for the loading state to appear
    await waitFor(() => {
      expect(screen.getByText(/Loading lesson content/i)).toBeInTheDocument();
    });
  });

  it("renders lesson content successfully", async () => {
    apiClient.get.mockResolvedValue(mockLesson);

    render(<FlaggedLessonPreviewModal {...defaultProps} />);

    // Wait for the content to load
    await waitFor(() => {
      expect(screen.getByText("Test Lesson")).toBeInTheDocument();
    });

    // Check for lesson metadata
    expect(screen.getByText(/100 XP/i)).toBeInTheDocument();
    expect(screen.getByText(/Difficulty: Beginner/i)).toBeInTheDocument();
    expect(screen.getByText(/~30 min/i)).toBeInTheDocument();
    
    // Check for content sections - test what's actually rendered
    expect(screen.getByText("Test Lesson")).toBeInTheDocument();
    expect(screen.getByText("Test Exercise")).toBeInTheDocument();
    expect(screen.getByText("Test lesson description")).toBeInTheDocument();
    
    // Check for quiz section
    expect(screen.getByText(/Quiz \(2 questions\)/i)).toBeInTheDocument();
    
    // Check for metadata footer - just verify lesson ID exists
    expect(screen.getByText("lesson_123")).toBeInTheDocument();
  });

  it("renders error state when API fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    apiClient.get.mockRejectedValue(new Error("API Error"));

    render(<FlaggedLessonPreviewModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load lesson content/i)).toBeInTheDocument();
    });
  });

  it("calls onClose when the close button is clicked", async () => {
    apiClient.get.mockResolvedValue(mockLesson);

    render(<FlaggedLessonPreviewModal {...defaultProps} />);

    // Wait for the modal to render content
    await waitFor(() => {
      expect(screen.getByText("Test Lesson")).toBeInTheDocument();
    });

    // Find and click the close button
    const closeBtn = screen.getByText("Close Preview");
    fireEvent.click(closeBtn);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("does not fetch data when modal is closed", () => {
    const closedProps = { ...defaultProps, isOpen: false };
    render(<FlaggedLessonPreviewModal {...closedProps} />);

    // API should not be called when modal is closed
    expect(apiClient.get).not.toHaveBeenCalled();
  });

  it("displays semantic ID in header when provided", async () => {
    apiClient.get.mockResolvedValue(mockLesson);

    render(<FlaggedLessonPreviewModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("LESSON-ALPHA")).toBeInTheDocument();
    });
  });

  it("handles lesson without optional fields", async () => {
    const minimalLesson = {
      _id: "lesson_minimal",
      title: "Minimal Lesson",
      content: "Basic content",
      createdAt: mockDate.toISOString(),
      updatedAt: mockDate.toISOString(),
    };

    apiClient.get.mockResolvedValue(minimalLesson);

    render(<FlaggedLessonPreviewModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("Minimal Lesson")).toBeInTheDocument();
    });

    // Should show defaults for missing fields - use more specific selectors
    expect(screen.getByText("Minimal Lesson")).toBeInTheDocument();
    expect(screen.getByText("0 XP")).toBeInTheDocument();
    expect(screen.getByText("Difficulty: Beginner")).toBeInTheDocument();
  });

  it("shows reported content warning", async () => {
    apiClient.get.mockResolvedValue(mockLesson);

    render(<FlaggedLessonPreviewModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(/Reported content - please review carefully/i)).toBeInTheDocument();
    });
  });
});
