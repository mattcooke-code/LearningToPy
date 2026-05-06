import { describe, it, expect, vi } from "vitest";
import {
  areAllQuestionsCorrect,
  areAllQuestionsAnswered,
  getCorrectAnswerCount,
  getAnsweredQuestionCount,
  resetQuestionState,
  processModuleQuizResults,
  getOptionButtonClass,
  isLessonQuizComplete,
} from "../quizUtils";

// ============================================================================
// areAllQuestionsCorrect
// ============================================================================

describe("areAllQuestionsCorrect", () => {
  const quiz = [{ _id: "q1" }, { _id: "q2" }, { _id: "q3" }];

  it("returns true when all questions are correct", () => {
    const results = {
      q1: { isCorrect: true },
      q2: { isCorrect: true },
      q3: { isCorrect: true },
    };
    expect(areAllQuestionsCorrect(quiz, results)).toBe(true);
  });

  it("returns false when any question is incorrect", () => {
    const results = {
      q1: { isCorrect: true },
      q2: { isCorrect: false },
      q3: { isCorrect: true },
    };
    expect(areAllQuestionsCorrect(quiz, results)).toBe(false);
  });

  it("returns false when a question has no result", () => {
    const results = {
      q1: { isCorrect: true },
      q2: { isCorrect: true },
    };
    expect(areAllQuestionsCorrect(quiz, results)).toBe(false);
  });

  it("works with questions using id instead of _id", () => {
    const quizWithId = [{ id: "a" }, { id: "b" }];
    const results = {
      a: { isCorrect: true },
      b: { isCorrect: true },
    };
    expect(areAllQuestionsCorrect(quizWithId, results)).toBe(true);
  });

  it("returns false for empty results", () => {
    expect(areAllQuestionsCorrect(quiz, {})).toBe(false);
  });
});

// ============================================================================
// areAllQuestionsAnswered
// ============================================================================

describe("areAllQuestionsAnswered", () => {
  const quiz = [{ _id: "q1" }, { _id: "q2" }];

  it("returns true when all questions have answers", () => {
    const answers = { q1: "answer1", q2: "answer2" };
    expect(areAllQuestionsAnswered(quiz, answers)).toBe(true);
  });

  it("returns false when a question is unanswered", () => {
    const answers = { q1: "answer1" };
    expect(areAllQuestionsAnswered(quiz, answers)).toBe(false);
  });

  it("returns false when answers is empty", () => {
    expect(areAllQuestionsAnswered(quiz, {})).toBe(false);
  });
});

// ============================================================================
// getCorrectAnswerCount
// ============================================================================

describe("getCorrectAnswerCount", () => {
  const quiz = [{ _id: "q1" }, { _id: "q2" }, { _id: "q3" }];

  it("returns the number of correct answers", () => {
    const results = {
      q1: { isCorrect: true },
      q2: { isCorrect: false },
      q3: { isCorrect: true },
    };
    expect(getCorrectAnswerCount(quiz, results)).toBe(2);
  });

  it("returns 0 when none are correct", () => {
    const results = {
      q1: { isCorrect: false },
      q2: { isCorrect: false },
    };
    expect(getCorrectAnswerCount(quiz, results)).toBe(0);
  });

  it("returns 0 when results is empty", () => {
    expect(getCorrectAnswerCount(quiz, {})).toBe(0);
  });
});

// ============================================================================
// getAnsweredQuestionCount
// ============================================================================

describe("getAnsweredQuestionCount", () => {
  it("returns the number of keys in the answers object", () => {
    expect(getAnsweredQuestionCount({ q1: "a", q2: "b" })).toBe(2);
  });

  it("returns 0 for empty object", () => {
    expect(getAnsweredQuestionCount({})).toBe(0);
  });
});

// ============================================================================
// resetQuestionState
// ============================================================================

describe("resetQuestionState", () => {
  it("removes the question from both answers and results", () => {
    const setAnswers = vi.fn();
    const setResults = vi.fn();

    resetQuestionState("q1", setAnswers, setResults);

    expect(setAnswers).toHaveBeenCalledTimes(1);
    expect(setResults).toHaveBeenCalledTimes(1);

    // Call the updater functions to verify they delete the key
    const answersUpdater = setAnswers.mock.calls[0][0];
    const resultsUpdater = setResults.mock.calls[0][0];

    const prevAnswers = { q1: "a", q2: "b" };
    const prevResults = { q1: { isCorrect: true }, q2: { isCorrect: false } };

    const newAnswers = answersUpdater(prevAnswers);
    const newResults = resultsUpdater(prevResults);

    expect(newAnswers).toEqual({ q2: "b" });
    expect(newAnswers).not.toHaveProperty("q1");
    expect(newResults).toEqual({ q2: { isCorrect: false } });
    expect(newResults).not.toHaveProperty("q1");
  });
});

// ============================================================================
// processModuleQuizResults
// ============================================================================

describe("processModuleQuizResults", () => {
  it("transforms server results to client shape", () => {
    const serverResults = [
      { questionId: "q1", isCorrect: true },
      { questionId: "q2", isCorrect: false },
    ];

    const result = processModuleQuizResults(serverResults);

    expect(result).toEqual({
      q1: { show: true, isCorrect: true },
      q2: { show: true, isCorrect: false },
    });
  });

  it("returns empty object for empty array", () => {
    expect(processModuleQuizResults([])).toEqual({});
  });
});

// ============================================================================
// getOptionButtonClass
// ============================================================================

describe("getOptionButtonClass", () => {
  it("returns green classes for correct answer when results shown", () => {
    const classes = getOptionButtonClass(false, true, true);
    expect(classes).toContain("border-green-500");
    expect(classes).toContain("bg-green-100");
  });

  it("returns red classes for selected wrong answer when results shown", () => {
    const classes = getOptionButtonClass(true, true, false);
    expect(classes).toContain("border-red-500");
    expect(classes).toContain("bg-red-100");
  });

  it("returns neutral classes for unselected wrong answer when results shown", () => {
    const classes = getOptionButtonClass(false, true, false);
    expect(classes).toContain("border-gray-200");
  });

  it("returns blue classes for selected answer before submission", () => {
    const classes = getOptionButtonClass(true, false, false);
    expect(classes).toContain("border-blue-500");
    expect(classes).toContain("bg-blue-50");
  });

  it("returns default classes for unselected answer before submission", () => {
    const classes = getOptionButtonClass(false, false, false);
    expect(classes).toContain("border-gray-200");
  });
});

// ============================================================================
// isLessonQuizComplete
// ============================================================================

describe("isLessonQuizComplete", () => {
  const quiz = [{ _id: "q1" }, { _id: "q2" }];

  it("returns true when all questions are correct", () => {
    const results = {
      q1: { isCorrect: true },
      q2: { isCorrect: true },
    };
    expect(isLessonQuizComplete(quiz, results)).toBe(true);
  });

  it("returns false when not all correct", () => {
    const results = {
      q1: { isCorrect: true },
      q2: { isCorrect: false },
    };
    expect(isLessonQuizComplete(quiz, results)).toBe(false);
  });

  it("returns false for null/undefined quiz array", () => {
    expect(isLessonQuizComplete(null, {})).toBe(false);
    expect(isLessonQuizComplete(undefined, {})).toBe(false);
  });

  it("returns false for empty quiz array", () => {
    expect(isLessonQuizComplete([], {})).toBe(false);
  });
});
