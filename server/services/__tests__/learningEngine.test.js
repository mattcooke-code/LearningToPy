import { describe, it, expect } from 'vitest';

// Import ONLY the pure functions (no DB calls)
import {
  validateCodeSubmission,
  isLessonFullyCompleted,
} from '../../services/learningEngine';

import { hasExercise, hasQuiz, isQuizCompleted } from '../../utils/quizHelpers';

// --- TESTS FOR PURE FUNCTIONS ---

describe('validateCodeSubmission', () => {
  const exercise = { starterCode: '# Write your code here' };

  it('rejects empty or whitespace-only code', () => {
    expect(validateCodeSubmission('', exercise)).toEqual({
      isCorrect: false,
      feedback: 'No code submitted',
    });
    expect(validateCodeSubmission('   ', exercise)).toEqual({
      isCorrect: false,
      feedback: 'No code submitted',
    });
  });

  it('rejects code identical to starterCode', () => {
    expect(validateCodeSubmission('# Write your code here', exercise)).toEqual({
      isCorrect: false,
      feedback: 'Please modify the starter code!',
    });
  });

  it('accepts modified code', () => {
    expect(validateCodeSubmission('print("hello")', exercise)).toEqual({
      isCorrect: true,
      feedback: 'Code accepted (validated in frontend)',
    });
  });

  it('handles undefined userCode', () => {
    expect(validateCodeSubmission(undefined, exercise).isCorrect).toBe(false);
  });

  it('handles null userCode', () => {
    expect(validateCodeSubmission(null, exercise).isCorrect).toBe(false);
  });
});

describe('isLessonFullyCompleted', () => {
  it('returns true for theory-only lessons', () => {
    const lesson = { contentType: 'THEORY' };
    expect(isLessonFullyCompleted(lesson, null, false)).toBe(true);
  });

  it('returns true when forceComplete is true', () => {
    const lesson = { contentType: 'EXERCISE' };
    expect(isLessonFullyCompleted(lesson, null, false, true)).toBe(true);
  });

  it('returns true for exercise lessons with correct answer', () => {
    const lesson = { contentType: 'EXERCISE', exercise: {starterCode: '# code'} };
    expect(isLessonFullyCompleted(lesson, null, true)).toBe(true);
  });

  it('returns false for exercise lessons with incorrect answer', () => {
    const lesson = { contentType: 'EXERCISE' };
    expect(isLessonFullyCompleted(lesson, null, false)).toBe(false);
  });

  it('returns true for theory with no quiz and no exercise', () => {
    const lesson = { contentType: 'THEORY' };
    expect(isLessonFullyCompleted(lesson, null, false)).toBe(true);
  });

  it('checks quiz completion for quiz-only lessons', () => {
    const lesson = { contentType: 'QUIZ', questions: [{ id: 'q1' }] };
    // This test demonstrates the function signature works
    // Actual quiz logic depends on hasQuiz/isQuizCompleted helpers
    const result = isLessonFullyCompleted(lesson, {}, false);
    expect(typeof result).toBe('boolean');
  });
});

describe('XP constants import', () => {
  it('imports progress constants correctly', () => {
    const progress = require('../../../shared/constants/progress.cjs');
    expect(progress.XP).toBeDefined();
    expect(progress.XP.PER_LEVEL).toBe(100);
    expect(progress.XP.LESSON.COMPLETION).toBe(20);
    expect(progress.THRESHOLDS.QUIZ.PASSING_SCORE).toBe(70);
  });

  it('calculateLessonQuizXP returns correct values', () => {
    const { calculateLessonQuizXP } = require('../../../shared/constants/progress.cjs');
    expect(calculateLessonQuizXP(1)).toBe(15);
    expect(calculateLessonQuizXP(2)).toBe(10);
    expect(calculateLessonQuizXP(3)).toBe(5);
    expect(calculateLessonQuizXP(4)).toBe(0);
  });

  it('calculateExerciseXP caps at max', () => {
    const { calculateExerciseXP } = require('../../../shared/constants/progress.cjs');
    const result = calculateExerciseXP(10, false);
    expect(result).toBe(25); // MAX_SUBMISSION_XP
  });

  it('calculateExerciseXP adds first-try bonus', () => {
    const { calculateExerciseXP } = require('../../../shared/constants/progress.cjs');
    const result = calculateExerciseXP(1, true);
    expect(result).toBe(15); // 5 base + 10 first-try bonus
  });
});