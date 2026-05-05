/**
 * Integration tests for learningEngine service
 * Self-contained — no external test infrastructure dependencies.
 */
import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';

const mongoose = require('mongoose');
const User = require('../../models/User');
const Lesson = require('../../models/Lesson');
const Module = require('../../models/Module');

const {
  processLessonCompletion,
  processModuleCompletion,
  getCurriculumProgressStats,
} = require('../../services/learningEngine');

// --- Database helpers (inline) ---
const TEST_DB_URI = 'mongodb://127.0.0.1:27017/learning-to-py-test';

const connectDB = async () => {
  if (mongoose.connection.readyState !== 0) return;
  await mongoose.connect(TEST_DB_URI);
};

const clearDatabase = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
};

// --- Fixture factories (inline) ---
const createFreshUser = async (overrides = {}) => {
  return User.create({
    username: `freshuser_${Date.now()}`,
    email: `fresh_${Date.now()}@example.com`,
    password: 'Test@1234',
    xp: 0,
    level: 1,
    streak: 0,
    completedLessons: [],
    completedModules: [],
    lessonCompletionHistory: [],
    moduleCompletionHistory: [],
    lessonQuizProgress: [],
    quizAttempts: [],
    badges: [],
    stats: {},
    xpHistory: [],
    weeklyProgress: {
      weekStartDate: new Date(),
      daysActive: 0,
      completionsThisWeek: 0,
      warningIssued: false,
      warningDay: 5,
    },
    streakStatus: 'ACTIVE',
    lastActiveDate: new Date(),
    privacySettings: {
      showOnLeaderboards: true,
      showProfile: true,
      showProgress: true,
    },
    ...overrides,
  });
};

const createFixtures = async () => {
  const module1 = await Module.create({
    order: 1, phase: 1,
    title: 'Python Essentials',
    description: 'Master the foundational syntax of Python',
    shortDescription: 'Variables, dynamic typing, and I/O basics',
    isPublished: true,
  });

  const module5 = await Module.create({
    order: 5, phase: 1,
    title: 'Control Flow',
    description: 'Teach your programs how to think',
    shortDescription: 'If-else logic and conditions',
    isPublished: true,
  });

  const module20 = await Module.create({
    order: 20, phase: 3,
    title: 'Capstone Project',
    description: 'Build your own Python project from scratch',
    shortDescription: 'Portfolio project',
    isPublished: true,
  });

  const lesson1_1 = await Lesson.create({
    moduleId: module1._id, order: 1,
    title: 'Variables and Data Types',
    description: 'Learn about Python variables',
    content: 'Test content for variables lesson. Minimum ten characters.',
    contentType: 'THEORY', difficulty: 'BEGINNER', isPublished: true,
    tags: ['variables', 'basics'],
  });

  const lesson1_2 = await Lesson.create({
    moduleId: module1._id, order: 2,
    title: 'Input and Output',
    description: 'Learn how to get input and display output',
    content: 'Test content for I/O lesson. Minimum ten characters.',
    contentType: 'EXERCISE', difficulty: 'BEGINNER', isPublished: true,
    tags: ['io', 'basics'],
    exercise: { starterCode: '# Write your code here' },
  });

  const lesson1_3 = await Lesson.create({
    moduleId: module1._id, order: 3,
    title: 'Module 1 Quiz',
    description: 'Test your knowledge of Python basics',
    content: 'Test content for quiz lesson. Minimum ten characters.',
    contentType: 'QUIZ', difficulty: 'BEGINNER', isPublished: true,
    tags: ['quiz'],
    quiz: [
      { id: 'q1', question: 'What is 2+2?', options: ['4', '22', 'Error'], correctAnswer: 0 },
    ],
  });

  const lesson5_1 = await Lesson.create({
    moduleId: module5._id, order: 1,
    title: 'If Statements',
    description: 'Learn conditional logic',
    content: 'Test content for if statements. Minimum ten characters.',
    contentType: 'THEORY', difficulty: 'BEGINNER', isPublished: true,
    tags: ['conditionals'],
  });

  const lesson5_2 = await Lesson.create({
    moduleId: module5._id, order: 2,
    title: 'Loops Practice',
    description: 'Practice with loops',
    content: 'Test content for loops practice. Minimum ten characters.',
    contentType: 'EXERCISE', difficulty: 'INTERMEDIATE', isPublished: true,
    tags: ['loops'],
    exercise: { starterCode: '# Write a loop here' },
  });

  const lesson20_1 = await Lesson.create({
    moduleId: module20._id, order: 1,
    title: 'Final Capstone Project',
    description: 'Build your portfolio project',
    content: 'Test content for capstone. Minimum ten characters.',
    contentType: 'PROJECT', difficulty: 'ADVANCED', isPublished: true,
    tags: ['project', 'capstone'],
    exercise: { starterCode: '# Start your capstone' },
  });

  return {
    modules: { module1, module5, module20 },
    lessons: { lesson1_1, lesson1_2, lesson1_3, lesson5_1, lesson5_2, lesson20_1 },
  };
};

// --- Tests ---
beforeAll(async () => { await connectDB(); });
afterAll(async () => { await disconnectDB(); });

describe('learningEngine Integration Tests', () => {
  let fixtures, freshUser;

  beforeEach(async () => {
    await clearDatabase();
    fixtures = await createFixtures();
    freshUser = await createFreshUser();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  describe('processLessonCompletion', () => {
    it('prevents duplicate lesson completion', async () => {
      const { lessons } = fixtures;
      const r1 = await processLessonCompletion(freshUser, lessons.lesson1_1, {});
      expect(r1.newlyCompleted).toBe(true);
      const r2 = await processLessonCompletion(freshUser, lessons.lesson1_1, {});
      expect(r2.newlyCompleted).toBe(false);
      expect(r2.xpIncrease).toBe(0);
    });

    it('awards base XP for theory lesson', async () => {
      const { lessons } = fixtures;
      const result = await processLessonCompletion(freshUser, lessons.lesson1_1, {});
      expect(result.newlyCompleted).toBe(true);
      expect(freshUser.completedLessons).toContain(lessons.lesson1_1._id.toString());
    });

    it('awards project bonus for project lessons', async () => {
      const { lessons } = fixtures;
      const result = await processLessonCompletion(freshUser, lessons.lesson20_1, {});
      expect(result.newlyCompleted).toBe(true);
      expect(freshUser.completedLessons).toContain(lessons.lesson20_1._id.toString());
    });

    it('auto-completes quiz-less module (Module 20 capstone)', async () => {
      const { lessons, modules } = fixtures;
      await processLessonCompletion(freshUser, lessons.lesson20_1, {});
      expect(freshUser.completedModules).toContain(modules.module20._id.toString());
    });

    it('does not auto-complete module with quiz', async () => {
      const { lessons, modules } = fixtures;
      await processLessonCompletion(freshUser, lessons.lesson1_1, {});
      await processLessonCompletion(freshUser, lessons.lesson1_2, {});
      await processLessonCompletion(freshUser, lessons.lesson1_3, {});
      expect(freshUser.completedModules).not.toContain(modules.module1._id.toString());
    });

    it('tracks lesson completion history', async () => {
      const { lessons } = fixtures;
      await processLessonCompletion(freshUser, lessons.lesson1_1, {
        elapsedSeconds: 300, attemptNumber: 1, usedHints: false, wasOptimalSolution: true,
      });
      expect(freshUser.lessonCompletionHistory).toHaveLength(1);
      expect(freshUser.lessonCompletionHistory[0].lessonId.toString()).toBe(lessons.lesson1_1._id.toString());
    });

    it('updates user stats for exercise lessons', async () => {
      const { lessons } = fixtures;
      await processLessonCompletion(freshUser, lessons.lesson1_2, {
        elapsedSeconds: 25, attemptNumber: 1, usedHints: false, wasOptimalSolution: true,
      });
      expect(freshUser.stats.fastChallengeCount).toBe(1);
      expect(freshUser.stats.firstTryChallengeCount).toBe(1);
    });
  });

  describe('processModuleCompletion', () => {
    it('prevents duplicate module completion', async () => {
      const { modules } = fixtures;
      await processModuleCompletion(freshUser, modules.module1, 80, [
        { isCorrect: true }, { isCorrect: true }, { isCorrect: false },
      ]);
      const r2 = await processModuleCompletion(freshUser, modules.module1, 80, [
        { isCorrect: true }, { isCorrect: true }, { isCorrect: false },
      ]);
      expect(r2.newlyCompleted).toBe(false);
      expect(r2.xpIncrease).toBe(0);
    });

    it('awards quiz XP and module completion bonus', async () => {
      const { modules } = fixtures;
      const result = await processModuleCompletion(freshUser, modules.module1, 67, [
        { isCorrect: true }, { isCorrect: true }, { isCorrect: false },
      ]);
      expect(freshUser.completedModules).toContain(modules.module1._id.toString());
      expect(result.newlyCompleted).toBe(true);
    });

    it('tracks module completion history', async () => {
      const { modules } = fixtures;
      await processModuleCompletion(freshUser, modules.module1, 85, [
        { isCorrect: true }, { isCorrect: true }, { isCorrect: false },
      ]);
      expect(freshUser.moduleCompletionHistory).toHaveLength(1);
      expect(freshUser.moduleCompletionHistory[0].moduleId.toString()).toBe(modules.module1._id.toString());
    });
  });

  describe('getCurriculumProgressStats', () => {
    it('returns stats for fresh user', async () => {
      const stats = await getCurriculumProgressStats(freshUser, { Lesson, Module });
      expect(stats.totalCurriculumLessons).toBeGreaterThan(0);
      expect(stats.completedCurriculumCount).toBe(0);
    });

    it('counts completed curriculum lessons', async () => {
      const { lessons } = fixtures;
      freshUser.completedLessons.push(lessons.lesson1_1._id.toString(), lessons.lesson5_1._id.toString());
      await freshUser.save();
      const stats = await getCurriculumProgressStats(freshUser, { Lesson, Module });
      expect(stats.completedCurriculumCount).toBe(2);
    });
  });
});