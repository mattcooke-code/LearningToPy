/**
 * Integration tests for learningEngine service
 * 
 * These tests use a real in-memory MongoDB instance to test
 * the actual database interactions of the service functions.
 * 
 * Tests covered:
 * - processLessonCompletion
 * - processModuleCompletion
 * - getCurriculumProgressStats
 */

import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { connectDB, clearDatabase, disconnectDB } from '../../test/helpers/db';
import { createFixtures, createFreshUser } from '../../test/fixtures/data';

// Import the service functions to test
const {
  processLessonCompletion,
  processModuleCompletion,
  getCurriculumProgressStats,
} = require('../../services/learningEngine');

// Import models for direct database operations
const User = require('../../models/User');
const Lesson = require('../../models/Lesson');
const Module = require('../../models/Module');

import { connectDB, disconnectDB } from '../../test/helpers/db';

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await disconnectDB();
});

describe('learningEngine Integration Tests', () => {
  let fixtures;
  let freshUser;

  beforeEach(async () => {
    // Clear database and create fresh fixtures for each test
    await clearDatabase();
    fixtures = await createFixtures();
    freshUser = await createFreshUser();
  });

  afterEach(async () => {
    // Clean up after each test
    await clearDatabase();
  });

  describe('processLessonCompletion', () => {
    it('prevents duplicate lesson completion', async () => {
      const { lessons, modules } = fixtures;
      
      // First completion should succeed
      const result1 = await processLessonCompletion(
        freshUser,
        lessons.lesson1_1,
        {}
      );

      expect(result1.newlyCompleted).toBe(true);
      expect(result1.xpIncrease).toBeGreaterThan(0);
      expect(freshUser.completedLessons).toContain(lessons.lesson1_1._id.toString());

      // Second completion should be prevented
      const result2 = await processLessonCompletion(
        freshUser,
        lessons.lesson1_1,
        {}
      );

      expect(result2.newlyCompleted).toBe(false);
      expect(result2.xpIncrease).toBe(0);
    });

    it('awards base XP for theory lesson', async () => {
      const { lessons } = fixtures;
      
      const result = await processLessonCompletion(
        freshUser,
        lessons.lesson1_1, // Theory lesson
        {}
      );

      expect(result.newlyCompleted).toBe(true);
      expect(result.xpIncrease).toBe(25); // Base lesson completion XP (Lesson model default)
      expect(freshUser.completedLessons).toContain(lessons.lesson1_1._id.toString());
      expect(freshUser.xp).toBe(25);
      expect(freshUser.level).toBe(1); // Still level 1 (25 XP < 100 per level)
    });

    it('awards project bonus for project lessons', async () => {
      const { lessons } = fixtures;
      
      const result = await processLessonCompletion(
        freshUser,
        lessons.lesson20_1, // Project lesson
        {}
      );

      expect(result.newlyCompleted).toBe(true);
      expect(result.xpIncrease).toBe(195); // 25 base + 15 project bonus + 155 M20 capstone bonus
      expect(freshUser.completedLessons).toContain(lessons.lesson20_1._id.toString());
    });

    it('auto-completes quiz-less module when all lessons are done (Module 20 capstone)', async () => {
      const { lessons, modules } = fixtures;
      
      // Module 20 has only one lesson (lesson20_1)
      // Complete the lesson
      const result = await processLessonCompletion(
        freshUser,
        lessons.lesson20_1,
        {}
      );

      expect(result.newlyCompleted).toBe(true);
      expect(result.xpIncrease).toBeGreaterThan(35); // Should include module completion bonus
      
      // Module should be auto-completed
      expect(freshUser.completedModules).toContain(modules.module20._id.toString());
      
      // Check module completion history
      const moduleCompletion = freshUser.moduleCompletionHistory.find(
        (h) => h.moduleId.toString() === modules.module20._id.toString()
      );
      expect(moduleCompletion).toBeDefined();
      expect(moduleCompletion.quizScore).toBeUndefined(); // No quiz (undefined, not null)
    });

    it('does not auto-complete module if it has a quiz', async () => {
      const { lessons, modules } = fixtures;
      
      // Complete all lessons in Module 1 (has quiz)
      await processLessonCompletion(freshUser, lessons.lesson1_1, {});
      await processLessonCompletion(freshUser, lessons.lesson1_2, {});
      await processLessonCompletion(freshUser, lessons.lesson1_3, {});

      // Module should NOT be auto-completed (needs quiz)
      expect(freshUser.completedModules).not.toContain(modules.module1._id.toString());
    });

    it('awards special M20 capstone bonus', async () => {
      const { lessons } = fixtures;
      
      const result = await processLessonCompletion(
        freshUser,
        lessons.lesson20_1, // Capstone project
        {}
      );

      // XP breakdown should include M20 project bonus
      const m20Bonus = result.xpBreakdown.find(
        (log) => log.source === 'BONUS' && log.meta.reason === 'capstone_auto_complete'
      );
      expect(m20Bonus).toBeDefined();
      expect(m20Bonus.amount).toBe(40); // M20_PROJECT_BONUS
    });

    it('tracks lesson completion history', async () => {
      const { lessons } = fixtures;
      
      await processLessonCompletion(
        freshUser,
        lessons.lesson1_1,
        {
          elapsedSeconds: 300,
          attemptNumber: 1,
          usedHints: false,
          wasOptimalSolution: true,
        }
      );

      expect(freshUser.lessonCompletionHistory).toHaveLength(1);
      const history = freshUser.lessonCompletionHistory[0];
      expect(history.lessonId.toString()).toBe(lessons.lesson1_1._id.toString());
      expect(history.elapsedSeconds).toBe(300);
      expect(history.attemptNumber).toBe(1);
      expect(history.usedHints).toBe(false);
      expect(history.wasOptimal).toBe(true);
    });

    it('updates user stats for exercise lessons', async () => {
      const { lessons } = fixtures;
      
      await processLessonCompletion(
        freshUser,
        lessons.lesson1_2, // Exercise lesson
        {
          elapsedSeconds: 25, // Fast challenge (< 30s)
          attemptNumber: 1, // First try
          usedHints: false,
          wasOptimalSolution: true,
        }
      );

      expect(freshUser.stats.fastChallengeCount).toBe(1);
      expect(freshUser.stats.firstTryChallengeCount).toBe(1);
      expect(freshUser.stats.optimalSolutionCount).toBe(1);
    });
  });

  describe('processModuleCompletion', () => {
    it('prevents duplicate module completion', async () => {
      const { modules } = fixtures;
      
      // First completion should succeed
      const result1 = await processModuleCompletion(
        freshUser,
        modules.module1,
        80, // quiz score
        [
          { isCorrect: true },
          { isCorrect: true },
          { isCorrect: false },
        ]
      );

      expect(result1.newlyCompleted).toBe(true);
      expect(result1.xpIncrease).toBeGreaterThan(0);
      expect(freshUser.completedModules).toContain(modules.module1._id.toString());

      // Second completion should be prevented
      const result2 = await processModuleCompletion(
        freshUser,
        modules.module1,
        80,
        [
          { isCorrect: true },
          { isCorrect: true },
          { isCorrect: false },
        ]
      );

      expect(result2.newlyCompleted).toBe(false);
      expect(result2.xpIncrease).toBe(0);
    });

    it('awards quiz XP and module completion bonus', async () => {
      const { modules } = fixtures;
      
      const quizResults = [
        { isCorrect: true },
        { isCorrect: true },
        { isCorrect: false },
      ];

      const result = await processModuleCompletion(
        freshUser,
        modules.module1,
        67, // 2/3 correct = 67%
        quizResults
      );

      expect(result.newlyCompleted).toBe(true);
      expect(freshUser.completedModules).toContain(modules.module1._id.toString());
      
      // Should include quiz XP (2 correct answers) and module completion bonus
      expect(result.xpIncrease).toBeGreaterThan(0);
      
      // Check XP breakdown
      const quizXP = result.xpBreakdown.find((log) => log.source === 'MODULE_QUIZ');
      expect(quizXP).toBeDefined();
      expect(quizXP.amount).toBe(20); // 2 correct * 10 each
      
      const completionXP = result.xpBreakdown.find((log) => log.source === 'MODULE_COMPLETION');
      expect(completionXP).toBeDefined();
      expect(completionXP.amount).toBe(50); 
    });

    it('awards perfect score bonus', async () => {
      const { modules } = fixtures;
      
      const quizResults = [
        { isCorrect: true },
        { isCorrect: true },
      ];

      const result = await processModuleCompletion(
        freshUser,
        modules.module5, // Module 5 has 1 question
        100, // Perfect score
        quizResults
      );

      const perfectBonus = result.xpBreakdown.find(
        (log) => log.source === 'MODULE_QUIZ' && log.meta.perfectScore
      );
      expect(perfectBonus).toBeDefined();
      expect(perfectBonus.amount).toBe(20); // PERFECT_SCORE_BONUS
    });

    it('does not award quiz XP for M0 (tutorial module)', async () => {
      // Create M0 module
      const module0 = await Module.create({
        order: 0,
        phase: 0,
        title: 'Getting Started',
        description: 'Tutorial module',
        isPublished: true,
      });

      const result = await processModuleCompletion(
        freshUser,
        module0,
        100,
        [{ isCorrect: true }]
      );

      // Should only award small completion XP, no quiz XP
      const quizXP = result.xpBreakdown.find((log) => log.source === 'MODULE_QUIZ');
      expect(quizXP).toBeUndefined();
      
      const completionXP = result.xpBreakdown.find(
        (log) => log.source === 'MODULE_COMPLETION' && log.meta.reason === 'tutorial_completion'
      );
      expect(completionXP).toBeDefined();
      expect(completionXP.amount).toBe(10); // M0_COMPLETION
    });

    it('tracks module completion history', async () => {
      const { modules } = fixtures;
      
      await processModuleCompletion(
        freshUser,
        modules.module1,
        85,
        [
          { isCorrect: true },
          { isCorrect: true },
          { isCorrect: false },
        ]
      );

      expect(freshUser.moduleCompletionHistory).toHaveLength(1);
      const history = freshUser.moduleCompletionHistory[0];
      expect(history.moduleId.toString()).toBe(modules.module1._id.toString());
      expect(history.quizScore).toBeUndefined(); // Quiz score not stored in history
      expect(history.completedAt).toBeInstanceOf(Date);
    });
  });

  describe('getCurriculumProgressStats', () => {
    it('calculates total curriculum lessons excluding M0', async () => {
      const stats = await getCurriculumProgressStats(freshUser, { Lesson, Module });

      // Should count all lessons from modules with order > 0
      expect(stats.totalCurriculumLessons).toBeGreaterThan(0);
      // Should exclude M0 lessons (none in our fixtures)
      expect(stats.completedCurriculumCount).toBe(0); // Fresh user has no completed lessons
    });

    it('counts completed curriculum lessons correctly', async () => {
      const { lessons } = fixtures;
      
      // Complete some lessons
      freshUser.completedLessons.push(
        lessons.lesson1_1._id.toString(),
        lessons.lesson5_1._id.toString()
      );
      await freshUser.save();

      const stats = await getCurriculumProgressStats(freshUser, { Lesson, Module });

      expect(stats.completedCurriculumCount).toBe(2);
    });

    it('excludes M0 module from curriculum stats', async () => {
      // Create M0 module with lessons
      const module0 = await Module.create({
        order: 0,
        phase: 0,
        title: 'Getting Started',
        description: 'Tutorial module',
        isPublished: true,
      });

      await Lesson.create({
        moduleId: module0._id,
        order: 1,
        title: 'Tutorial Lesson',
        description: 'Getting started tutorial',
        content: 'Test content for this lesson. Minimum ten characters.',
        contentType: 'THEORY',
        difficulty: 'BEGINNER',
        isPublished: true,
      });

      // Complete the M0 lesson
      freshUser.completedLessons.push(module0._id.toString());
      await freshUser.save();

      const stats = await getCurriculumProgressStats(freshUser, { Lesson, Module });

      // M0 lessons should not be counted in curriculum stats
      expect(stats.totalCurriculumLessons).toBeGreaterThan(0);
      expect(stats.completedCurriculumCount).toBe(0); // M0 lesson excluded
    });
  });
});
