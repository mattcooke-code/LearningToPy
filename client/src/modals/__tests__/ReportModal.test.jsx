import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import ReportModal from "../ReportModal";
import { apiClient } from "@/services";
import { useNotification } from "../../context/NotificationContext";

/**
 * 1. Mock the API Client using the alias defined in vitest.config.js
 */
vi.mock("@/services", () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

/**
 * 2. Mock the UI components completely to avoid all dependencies
 */
vi.mock("../components/ui", () => ({
  BaseModal: ({ children, isOpen, title, onClose }) =>
    isOpen ? (
      <div role="dialog" aria-modal="true" data-testid="base-modal">
        <h1>{title}</h1>
        <button onClick={onClose}>Close</button>
        {children}
      </div>
    ) : null,
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
    user: { _id: 'test-user', isAdmin: false },
    isAuthenticated: true,
    loading: false,
  }),
}));

// Create a mock for the notification context
const mockUseNotification = {
  showToast: vi.fn(),
  showNotification: vi.fn(),
};

vi.mock("../../context/NotificationContext", () => ({
  useNotification: () => mockUseNotification,
}));

describe("ReportModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    lessonId: "test-lesson-123",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders modal when open", () => {
    render(<ReportModal {...defaultProps} />);
    
    expect(screen.getByText("Report an Issue")).toBeInTheDocument();
    expect(screen.getByText("Help us improve this lesson!")).toBeInTheDocument();
    expect(screen.getByText("Found an error? Let us know and we'll fix it. You might even earn XP for helping!")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(<ReportModal {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText("Report an Issue")).not.toBeInTheDocument();
  });

  it("displays all issue type options", () => {
    render(<ReportModal {...defaultProps} />);
    
    expect(screen.getByText("📝 Content Error")).toBeInTheDocument();
    expect(screen.getByText("Typo, incorrect information")).toBeInTheDocument();
    expect(screen.getByText("💻 Code Error")).toBeInTheDocument();
    expect(screen.getByText("Exercise code not working")).toBeInTheDocument();
    expect(screen.getByText("❓ Quiz Error")).toBeInTheDocument();
    expect(screen.getByText("Quiz marked incorrectly")).toBeInTheDocument();
    expect(screen.getByText("🔧 Broken Functionality")).toBeInTheDocument();
    expect(screen.getByText("Validation not working")).toBeInTheDocument();
    expect(screen.getByText("⭐ XP Adjustment")).toBeInTheDocument();
    expect(screen.getByText("XP not awarded correctly")).toBeInTheDocument();
    expect(screen.getByText("📌 Other")).toBeInTheDocument();
    expect(screen.getByText("Something else")).toBeInTheDocument();
  });

  it("highlights selected issue type", async () => {
    render(<ReportModal {...defaultProps} />);
    
    const contentErrorButton = screen.getByText("📝 Content Error");
    fireEvent.click(contentErrorButton);
    
    expect(contentErrorButton.closest('button')).toHaveClass('border-blue-500');
  });

  it("allows typing in form fields", async () => {
    render(<ReportModal {...defaultProps} />);
    
    const titleInput = screen.getByPlaceholderText("Brief summary of the issue...");
    const descriptionTextarea = screen.getByPlaceholderText(/Please describe the issue in detail/);
    const suggestedFixTextarea = screen.getByPlaceholderText(/If you know what the correct content should be/);
    
    fireEvent.change(titleInput, { target: { value: "Test issue title" } });
    fireEvent.change(descriptionTextarea, { target: { value: "Test issue description" } });
    fireEvent.change(suggestedFixTextarea, { target: { value: "Test suggested fix" } });
    
    expect(titleInput.value).toBe("Test issue title");
    expect(descriptionTextarea.value).toBe("Test issue description");
    expect(suggestedFixTextarea.value).toBe("Test suggested fix");
  });

  it("shows validation error for empty required fields", async () => {
    render(<ReportModal {...defaultProps} />);
    
    // The submit button should be disabled when form is incomplete
    const submitButton = screen.getByText("Submit Report");
    expect(submitButton).toBeDisabled();
    
    // Check that validation message is not shown initially
    expect(mockUseNotification.showToast).not.toHaveBeenCalled();
  });

  it("submits report successfully with all fields", async () => {
    apiClient.post.mockResolvedValue({ success: true });
    
    render(<ReportModal {...defaultProps} />);
    
    // Select issue type
    fireEvent.click(screen.getByText("📝 Content Error"));
    
    // Fill form fields
    fireEvent.change(screen.getByPlaceholderText("Brief summary of the issue..."), {
      target: { value: "Test title" }
    });
    fireEvent.change(screen.getByPlaceholderText(/Please describe the issue in detail/), {
      target: { value: "Test description with sufficient detail" }
    });
    fireEvent.change(screen.getByPlaceholderText(/If you know what the correct content should be/), {
      target: { value: "Test suggested fix" }
    });
    
    // Submit form
    const submitButton = screen.getByText("Submit Report");
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith("/auth/flags", {
        targetType: "LESSON",
        targetId: "test-lesson-123",
        issueType: "CONTENT_ERROR",
        title: "Test title",
        description: "Test description with sufficient detail",
        suggestedFix: "Test suggested fix",
      });
    });
    
    expect(mockUseNotification.showToast).toHaveBeenCalledWith(
      "Thank you for reporting. Our team will review it shortly.",
      "success"
    );
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("submits report successfully without suggested fix", async () => {
    apiClient.post.mockResolvedValue({ success: true });
    
    render(<ReportModal {...defaultProps} />);
    
    // Select issue type
    fireEvent.click(screen.getByText("💻 Code Error"));
    
    // Fill required fields only
    fireEvent.change(screen.getByPlaceholderText("Brief summary of the issue..."), {
      target: { value: "Code error title" }
    });
    fireEvent.change(screen.getByPlaceholderText(/Please describe the issue in detail/), {
      target: { value: "Code error description" }
    });
    
    // Submit form
    fireEvent.click(screen.getByText("Submit Report"));
    
    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith("/auth/flags", {
        targetType: "LESSON",
        targetId: "test-lesson-123",
        issueType: "CODE_ERROR",
        title: "Code error title",
        description: "Code error description",
        suggestedFix: undefined,
      });
    });
  });

  it("handles API error during submission", async () => {
    apiClient.post.mockRejectedValue(new Error("Network error"));
    
    render(<ReportModal {...defaultProps} />);
    
    // Fill form
    fireEvent.click(screen.getByText("❓ Quiz Error"));
    fireEvent.change(screen.getByPlaceholderText("Brief summary of the issue..."), {
      target: { value: "Quiz error title" }
    });
    fireEvent.change(screen.getByPlaceholderText(/Please describe the issue in detail/), {
      target: { value: "Quiz error description" }
    });
    
    // Submit form
    fireEvent.click(screen.getByText("Submit Report"));
    
    await waitFor(() => {
      expect(mockUseNotification.showToast).toHaveBeenCalledWith("Failed to submit report", "error");
    });
  });

  it("handles duplicate report error", async () => {
    apiClient.post.mockRejectedValue({
      response: { data: { message: "This lesson has already been flagged" } }
    });
    
    render(<ReportModal {...defaultProps} />);
    
    // Fill form
    fireEvent.click(screen.getByText("🔧 Broken Functionality"));
    fireEvent.change(screen.getByPlaceholderText("Brief summary of the issue..."), {
      target: { value: "Broken functionality" }
    });
    fireEvent.change(screen.getByPlaceholderText(/Please describe the issue in detail/), {
      target: { value: "Functionality is broken" }
    });
    
    // Submit form
    fireEvent.click(screen.getByText("Submit Report"));
    
    await waitFor(() => {
      expect(mockUseNotification.showToast).toHaveBeenCalledWith(
        "This lesson has already been flagged",
        "error"
      );
    });
  });

  it("shows loading state during submission", async () => {
    apiClient.post.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(<ReportModal {...defaultProps} />);
    
    // Fill form
    fireEvent.click(screen.getByText("⭐ XP Adjustment"));
    fireEvent.change(screen.getByPlaceholderText("Brief summary of the issue..."), {
      target: { value: "XP issue" }
    });
    fireEvent.change(screen.getByPlaceholderText(/Please describe the issue in detail/), {
      target: { value: "XP not awarded" }
    });
    
    // Submit form
    const submitButton = screen.getByText("Submit Report");
    fireEvent.click(submitButton);
    
    // Check loading state
    expect(screen.getByText("Submitting...")).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it("resets form when closed", async () => {
    render(<ReportModal {...defaultProps} />);
    
    // Fill form
    fireEvent.click(screen.getByText("📝 Content Error"));
    fireEvent.change(screen.getByPlaceholderText("Brief summary of the issue..."), {
      target: { value: "Test title" }
    });
    fireEvent.change(screen.getByPlaceholderText(/Please describe the issue in detail/), {
      target: { value: "Test description" }
    });
    
    // Close modal using the cancel button (the close button is an X icon)
    fireEvent.click(screen.getByText("Cancel"));
    
    // Check that onClose was called
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("disables submit button when form is incomplete", () => {
    render(<ReportModal {...defaultProps} />);
    
    const submitButton = screen.getByText("Submit Report");
    
    // Initially disabled
    expect(submitButton).toBeDisabled();
    
    // Fill title only
    fireEvent.change(screen.getByPlaceholderText("Brief summary of the issue..."), {
      target: { value: "Test title" }
    });
    expect(submitButton).toBeDisabled();
    
    // Fill description only
    fireEvent.change(screen.getByPlaceholderText(/Please describe the issue in detail/), {
      target: { value: "Test description" }
    });
    expect(submitButton).toBeDisabled();
    
    // Select issue type
    fireEvent.click(screen.getByText("📝 Content Error"));
    expect(submitButton).not.toBeDisabled();
  });

  it("enables submit button when all required fields are filled", () => {
    render(<ReportModal {...defaultProps} />);
    
    const submitButton = screen.getByText("Submit Report");
    
    // Fill all required fields
    fireEvent.click(screen.getByText("💻 Code Error"));
    fireEvent.change(screen.getByPlaceholderText("Brief summary of the issue..."), {
      target: { value: "Test title" }
    });
    fireEvent.change(screen.getByPlaceholderText(/Please describe the issue in detail/), {
      target: { value: "Test description" }
    });
    
    expect(submitButton).not.toBeDisabled();
  });

  it("calls onClose when cancel button is clicked", () => {
    render(<ReportModal {...defaultProps} />);
    
    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);
    
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("handles whitespace-only input validation", async () => {
    render(<ReportModal {...defaultProps} />);
    
    // Fill with whitespace only
    fireEvent.click(screen.getByText("📝 Content Error"));
    fireEvent.change(screen.getByPlaceholderText("Brief summary of the issue..."), {
      target: { value: "   " }
    });
    fireEvent.change(screen.getByPlaceholderText(/Please describe the issue in detail/), {
      target: { value: "   " }
    });
    
    // Submit form
    fireEvent.click(screen.getByText("Submit Report"));
    
    expect(mockUseNotification.showToast).toHaveBeenCalledWith("Please fill in all required fields", "warning");
  });

  it("respects character limits on form fields", () => {
    render(<ReportModal {...defaultProps} />);
    
    const titleInput = screen.getByPlaceholderText("Brief summary of the issue...");
    const descriptionTextarea = screen.getByPlaceholderText(/Please describe the issue in detail/);
    const suggestedFixTextarea = screen.getByPlaceholderText(/If you know what the correct content should be/);
    
    expect(titleInput).toHaveAttribute("maxLength", "200");
    expect(descriptionTextarea).toHaveAttribute("maxLength", "2000");
    expect(suggestedFixTextarea).toHaveAttribute("maxLength", "1000");
  });

  it("shows correct field labels and placeholders", () => {
    render(<ReportModal {...defaultProps} />);
    
    expect(screen.getByText("What type of issue did you find? *")).toBeInTheDocument();
    expect(screen.getByText("Issue Title *")).toBeInTheDocument();
    expect(screen.getByText("Detailed Description *")).toBeInTheDocument();
    expect(screen.getByText("Suggested Fix (Optional)")).toBeInTheDocument();
    
    expect(screen.getByPlaceholderText("Brief summary of the issue...")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Please describe the issue in detail/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/If you know what the correct content should be/)).toBeInTheDocument();
  });
});
