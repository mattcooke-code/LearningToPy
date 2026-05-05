import { describe, it, expect } from "vitest";
import {
  hasQuiz,
  hasExercise,
  isQuizCompleted,
  getQuestionAttempts,
  calculateQuizAnswerXP,
  getQuizResultsForXP,
} from "../../utils/quizHelpers";

describe("hasQuiz", () => {
  it("returns false when quiz is missing", () => {
    expect(hasQuiz({})).toBe(false);
    expect(hasQuiz({ quiz: null })).toBe(false);
    expect(hasQuiz({ quiz: [] })).toBe(false);
  });

  it("returns true when quiz has questions", () => {
    expect(hasQuiz({ quiz: [{ id: "q1" }] })).toBe(true);
    expect(hasQuiz({ quiz: [{ id: "q1" }, { id: "q2" }] })).toBe(true);
  });
});

describe("hasExercise", () => {
  it("returns false when exercise is missing", () => {
    expect(hasExercise({})).toBe(false);
    expect(hasExercise({ exercise: null })).toBe(false);
    expect(hasExercise({ exercise: undefined })).toBe(false);
  });

  it("returns true when exercise exists", () => {
    expect(hasExercise({ exercise: { starterCode: "# code" } })).toBe(true);
    expect(hasExercise({ exercise: {} })).toBe(true);
  });
});

describe("isQuizCompleted", () => {
  it("returns false when quizProgress is missing", () => {
    expect(isQuizCompleted(null, { quiz: [{ id: "q1" }] })).toBe(false);
  });

  it("returns false when lesson has no quiz", () => {
    expect(isQuizCompleted({ questionAttempts: [] }, {})).toBe(false);
  });

  it("returns false when not all questions answered correctly", () => {
    const quizProgress = {
      questionAttempts: [
        { questionIndex: 0, correct: true },
        { questionIndex: 1, correct: false },
      ],
    };
    const lesson = { quiz: [{ id: "q1" }, { id: "q2" }] };
    expect(isQuizCompleted(quizProgress, lesson)).toBe(false);
  });

  it("returns true when all questions answered correctly", () => {
    const quizProgress = {
      questionAttempts: [
        { questionIndex: 0, correct: true },
        { questionIndex: 1, correct: true },
      ],
    };
    const lesson = { quiz: [{ id: "q1" }, { id: "q2" }] };
    expect(isQuizCompleted(quizProgress, lesson)).toBe(true);
  });

  it("handles empty questionAttempts array", () => {
    const quizProgress = { questionAttempts: [] };
    const lesson = { quiz: [{ id: "q1" }] };
    expect(isQuizCompleted(quizProgress, lesson)).toBe(false);
  });
});

describe("getQuestionAttempts", () => {
  it("returns 1 when no progress exists", () => {
    expect(getQuestionAttempts(null, 0)).toBe(1);
    expect(getQuestionAttempts({}, 0)).toBe(1);
  });

  it("returns attempt count for a specific question", () => {
    const quizProgress = {
      questionAttempts: [
        { questionIndex: 0, attempts: 3 },
        { questionIndex: 1, attempts: 1 },
      ],
    };
    expect(getQuestionAttempts(quizProgress, 0)).toBe(3);
    expect(getQuestionAttempts(quizProgress, 1)).toBe(1);
  });

  it("returns 1 for question with no attempt record", () => {
    const quizProgress = {
      questionAttempts: [{ questionIndex: 0, attempts: 2 }],
    };
    expect(getQuestionAttempts(quizProgress, 5)).toBe(1);
  });
});

describe("calculateQuizAnswerXP", () => {
  it("returns 15 XP for first attempt", () => {
    expect(calculateQuizAnswerXP(1)).toBe(15);
  });

  it("returns 10 XP for second attempt", () => {
    expect(calculateQuizAnswerXP(2)).toBe(10);
  });

  it("returns 5 XP for third attempt", () => {
    expect(calculateQuizAnswerXP(3)).toBe(5);
  });

  it("returns 0 XP for fourth or later attempts", () => {
    expect(calculateQuizAnswerXP(4)).toBe(0);
    expect(calculateQuizAnswerXP(10)).toBe(0);
  });
});

describe("getQuizResultsForXP", () => {
  it("returns empty array when quizProgress is missing", () => {
    expect(getQuizResultsForXP(null, { quiz: [{ id: "q1" }] })).toEqual([]);
  });

  it("returns empty array when lesson has no quiz", () => {
    expect(getQuizResultsForXP({ questionAttempts: [] }, {})).toEqual([]);
  });

  it("returns results with attempt counts and correctness", () => {
    const quizProgress = {
      questionAttempts: [
        { questionIndex: 0, attempts: 1, correct: true },
        { questionIndex: 1, attempts: 3, correct: false },
      ],
    };
    const lesson = {
      quiz: [{ id: "q1" }, { id: "q2" }],
    };

    const results = getQuizResultsForXP(quizProgress, lesson);

    expect(results).toHaveLength(2);
    expect(results[0]).toEqual({
      questionIndex: 0,
      attempts: 1,
      correct: true,
    });
    expect(results[1]).toEqual({
      questionIndex: 1,
      attempts: 3,
      correct: false,
    });
  });

  it("defaults unanswered questions to 1 attempt and false", () => {
    const quizProgress = { questionAttempts: [] };
    const lesson = { quiz: [{ id: "q1" }, { id: "q2" }] };

    const results = getQuizResultsForXP(quizProgress, lesson);

    expect(results).toHaveLength(2);
    expect(results[0]).toEqual({
      questionIndex: 0,
      attempts: 1,
      correct: false,
    });
    expect(results[1]).toEqual({
      questionIndex: 1,
      attempts: 1,
      correct: false,
    });
  });
});
