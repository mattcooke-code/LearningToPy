// src/components/lesson/__tests__/QuizComponent.test.jsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import QuizComponent from "../QuizComponent";

// ✅ Use @ alias for mocks (matches vitest.config.js resolve.alias)
vi.mock("@/services", () => ({
  apiClient: { post: vi.fn() },
}));

vi.mock("@/context", () => ({
  useNotification: vi.fn().mockReturnValue({ showToast: vi.fn() }),
  useTheme: vi.fn().mockReturnValue({ isDarkMode: false }),
}));

vi.mock("@/ui", () => ({
  MarkdownRenderer: ({ content }) => <>{content}</>,
}));

vi.mock("@/utils/quizUtils", () => ({
  areAllQuestionsAnswered: vi.fn(),
  resetQuestionState: vi.fn((qId, setAnswers, setResults) => {
    setAnswers((prev) => {
      const n = { ...prev };
      delete n[qId];
      return n;
    });
    setResults((prev) => {
      const n = { ...prev };
      delete n[qId];
      return n;
    });
  }),
  processModuleQuizResults: vi.fn((results) => results),
  getOptionButtonClass: vi.fn((isSelected, showResults, isCorrect) => {
    if (showResults && isCorrect) return "border-green-500 bg-green-100";
    if (isSelected) return "border-blue-500 bg-blue-50";
    return "border-gray-200";
  }),
  isLessonQuizComplete: vi.fn((quizArray, results) =>
    quizArray.every((q) => results[q._id || q.id]?.isCorrect === true),
  ),
}));

// ✅ Use @ alias for imports AFTER mocks
import { apiClient } from "@/services";
import { useNotification } from "@/context";
import {
  areAllQuestionsAnswered,
  isLessonQuizComplete,
} from "@/utils/quizUtils";

const mockQuizArray = [
  {
    _id: "q1",
    question: "What is 2 + 2?",
    options: ["3", "4", "5"],
    correctAnswer: 1,
  },
  {
    _id: "q2",
    question: "Capital of France?",
    options: ["Paris", "London"],
    correctAnswer: 0,
  },
];

const defaultProps = {
  quizArray: mockQuizArray,
  lessonId: "lesson-123",
  moduleId: "module-456",
  onAnswerSubmit: vi.fn(),
  isModuleQuiz: false,
  onQuizComplete: vi.fn(),
};

describe("QuizComponent", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    apiClient.post.mockResolvedValue({});
    areAllQuestionsAnswered.mockReturnValue(false);
    useNotification.mockReturnValue({ showToast: vi.fn() });
  });

  it("renders all questions and options", () => {
    render(<QuizComponent {...defaultProps} />);
    expect(screen.getByText("Lesson Quiz")).toBeInTheDocument();
    expect(screen.getByText("Question 1")).toBeInTheDocument();
    expect(screen.getByText("What is 2 + 2?")).toBeInTheDocument();
  });

  it("allows selecting an answer", async () => {
    render(<QuizComponent {...defaultProps} />);
    const optionBtn = screen.getByRole("button", { name: /4/i });
    await user.click(optionBtn);
    await waitFor(() => expect(optionBtn).toHaveClass("border-blue-500"));
  });

  it("submits correct answer and triggers completion", async () => {
    apiClient.post.mockResolvedValue({
      isCorrect: true,
      xpEarned: 10,
      feedback: "Great job!",
      completed: true,
    });
    isLessonQuizComplete.mockReturnValue(true);

    render(<QuizComponent {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: /4/i }));
    await user.click(
      screen.getAllByRole("button", { name: /check answer/i })[0],
    );

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith(
        "/content/lessons/lesson-123/submit",
        expect.objectContaining({
          answer: 1,
          questionIndex: 0,
          attemptNumber: 1,
        }),
      );
      expect(screen.getByText(/Quiz Completed!/i)).toBeInTheDocument();
      expect(defaultProps.onQuizComplete).toHaveBeenCalledWith(true);
    });
  });

  it("shows progressive hints on incorrect attempts", async () => {
    apiClient.post.mockResolvedValueOnce({
      isCorrect: false,
      xpEarned: 0,
      feedback: "",
      completed: false,
    });
    apiClient.post.mockResolvedValueOnce({
      isCorrect: false,
      xpEarned: 0,
      feedback: "",
      completed: false,
    });

    render(<QuizComponent {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: /5/i }));
    await user.click(
      screen.getAllByRole("button", { name: /check answer/i })[0],
    );

    await waitFor(() => {
      expect(screen.getByText(/Not quite.*Try again/i)).toBeInTheDocument();
    });

    await user.click(
      screen.getAllByRole("button", { name: /check answer/i })[0],
    );
    await waitFor(() => {
      expect(screen.getByText(/The correct answer is: 4/i)).toBeInTheDocument();
    });
  });

  it("shows module submit button only when all questions are answered", () => {
    areAllQuestionsAnswered.mockReturnValue(false);
    render(<QuizComponent {...defaultProps} isModuleQuiz />);
    expect(screen.queryByText("Submit Final Quiz")).not.toBeInTheDocument();

    areAllQuestionsAnswered.mockReturnValue(true);
    render(<QuizComponent {...defaultProps} isModuleQuiz />);
    expect(screen.getByText("Submit Final Quiz")).toBeInTheDocument();
  });

  it("handles API errors gracefully", async () => {
    apiClient.post.mockRejectedValueOnce(new Error("Network Error"));
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(<QuizComponent {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: /4/i }));
    await user.click(
      screen.getAllByRole("button", { name: /check answer/i })[0],
    );

    await waitFor(
      () => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Submission error:",
          expect.any(Error),
        );
      },
      { timeout: 2000 },
    );

    consoleSpy.mockRestore();
  });
});
