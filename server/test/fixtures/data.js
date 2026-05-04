/**
 * Test fixtures for integration tests
 * 
 * Provides minimal test data:
 * - 3 modules (orders 1, 5, 20 - Module 20 has no quiz)
 * - 2-3 lessons per module
 * - A user with some completed lessons/modules
 * 
 * Usage:
 *   import { createFixtures } from '../test/fixtures/data';
 *   await createFixtures();
 */

const User = require('../../models/User');
const Module = require('../../models/Module');
const Lesson = require('../../models/Lesson');

/**
 * Create all test fixtures in the database
 * Returns the created documents for use in tests
 */
const createFixtures = async () => {
  // Create modules
  const module1 = await Module.create({
    order: 1,
    phase: 1,
    title: 'Python Essentials',
    description: 'Master the foundational syntax of Python',
    shortDescription: 'Variables, dynamic typing, and I/O basics',
    isPublished: true,
    moduleQuiz: [
      {
        id: 'q1',
        question: 'What is Python?',
        options: ['A programming language', 'A snake', 'A fruit'],
        correctAnswer: 0,
      },
      {
        id: 'q2',
        question: 'How do you print in Python?',
        options: ['echo()', 'print()', 'console.log()'],
        correctAnswer: 1,
      },
    ],
  });

  const module5 = await Module.create({
    order: 5,
    phase: 1,
    title: 'Control Flow & Decision Making',
    description: 'Teach your programs how to think and make decisions',
    shortDescription: 'If-else logic, conditions, and decision making',
    isPublished: true,
    moduleQuiz: [
      {
        id: 'q3',
        question: 'What keyword is used for conditional statements?',
        options: ['if', 'when', 'case'],
        correctAnswer: 0,
      },
    ],
  });

  const module20 = await Module.create({
    order: 20,
    phase: 3,
    title: 'Capstone Project',
    description: 'Build your own Python project from scratch',
    shortDescription: 'Build a portfolio project from scratch',
    isPublished: true,
    // No quiz - this is the capstone project module
  });

  // Create lessons for Module 1
  const lesson1_1 = await Lesson.create({
    moduleId: module1._id,
    order: 1,
    title: 'Variables and Data Types',
    description: 'Learn about Python variables and basic data types',
    content: 'Test content for this lesson. Minimum ten characters.',
    contentType: 'THEORY',
    difficulty: 'BEGINNER',
    isPublished: true,
    tags: ['variables', 'basics'],
  });

  const lesson1_2 = await Lesson.create({
    moduleId: module1._id,
    order: 2,
    title: 'Input and Output',
    description: 'Learn how to get input and display output',
    content: 'Test content for this lesson. Minimum ten characters.',
    contentType: 'EXERCISE',
    difficulty: 'BEGINNER',
    isPublished: true,
    tags: ['io', 'basics'],
    starterCode: '# Write your code here\nprint("Hello, World!")',
    exerciseConfig: {
      testCases: [
        {
          input: '',
          expectedOutput: 'Hello, World!',
          description: 'Print greeting',
        },
      ],
    },
  });

  const lesson1_3 = await Lesson.create({
    moduleId: module1._id,
    order: 3,
    title: 'Module 1 Quiz',
    description: 'Test your knowledge of Python basics',
    content: 'Test content for this lesson. Minimum ten characters.',
    contentType: 'QUIZ',
    difficulty: 'BEGINNER',
    isPublished: true,
    tags: ['quiz'],
    quiz: [
      {
        id: 'quiz1',
        question: 'What is the output of print(2 + 2)?',
        options: ['4', '22', 'Error'],
        correctAnswer: 0,
      },
    ],
  });

  // Create lessons for Module 5
  const lesson5_1 = await Lesson.create({
    moduleId: module5._id,
    order: 1,
    title: 'If Statements',
    description: 'Learn conditional logic with if statements',
    content: 'Test content for this lesson. Minimum ten characters.',
    contentType: 'THEORY',
    difficulty: 'BEGINNER',
    isPublished: true,
    tags: ['conditionals', 'if'],
  });

  const lesson5_2 = await Lesson.create({
    moduleId: module5._id,
    order: 2,
    title: 'Loops Practice',
    description: 'Practice with for and while loops',
    content: 'Test content for this lesson. Minimum ten characters.',
    contentType: 'EXERCISE',
    difficulty: 'INTERMEDIATE',
    isPublished: true,
    tags: ['loops', 'practice'],
    starterCode: '# Write a loop here',
    exerciseConfig: {
      testCases: [
        {
          input: '',
          expectedOutput: '0\n1\n2\n3\n4\n',
          description: 'Print numbers 0-4',
        },
      ],
    },
  });

  // Create lessons for Module 20 (Capstone - no quiz)
  const lesson20_1 = await Lesson.create({
    moduleId: module20._id,
    order: 1,
    title: 'Final Capstone Project',
    description: 'Build your portfolio project',
    content: 'Test content for this lesson. Minimum ten characters.',
    contentType: 'PROJECT',
    difficulty: 'ADVANCED',
    isPublished: true,
    tags: ['project', 'capstone'],
    starterCode: '# Start your capstone project here',
    exerciseConfig: {
      testCases: [
        {
          input: '',
          expectedOutput: 'Project completed successfully',
          description: 'Complete the capstone project',
        },
      ],
    },
  });

  // Create a test user
  const user = await User.create({
    username: 'testuser',
    email: 'test@example.com',
    password: 'Test@1234',
    xp: 150,
    level: 2,
    streak: 5,
    completedLessons: [lesson1_1._id.toString()], // Completed first lesson of Module 1
    completedModules: [], // No modules completed yet
    lessonCompletionHistory: [
      {
        lessonId: lesson1_1._id,
        completedAt: new Date('2024-01-01'),
        tags: ['variables', 'basics'],
        contentType: 'THEORY',
        difficulty: 'BEGINNER',
        challengeGroup: null,
        elapsedSeconds: 300,
        attemptNumber: 1,
        usedHints: false,
        wasOptimal: true,
      },
    ],
    moduleCompletionHistory: [],
    lessonQuizProgress: [],
    quizAttempts: [],
    badges: [],
    stats: {
      fastChallengeCount: 0,
      firstTryChallengeCount: 0,
      optimalSolutionCount: 0,
      functionChallengeCount: 0,
      apiChallengeCount: 0,
      fileChallengeCount: 0,
    },
    xpHistory: [
      {
        amount: 20,
        source: 'LESSON_COMPLETION',
        meta: { lessonId: lesson1_1._id },
        awardedAt: new Date('2024-01-01'),
      },
    ],
    weeklyProgress: {
      weekStartDate: new Date('2024-01-01'),
      daysActive: 3,
      completionsThisWeek: 2,
      warningIssued: false,
      warningDay: 5,
    },
    streakStatus: 'ACTIVE',
    lastActiveDate: new Date('2024-01-03'),
    lastCompletionDate: new Date('2024-01-02'),
    privacySettings: {
      showOnLeaderboards: true,
      showProfile: true,
      showProgress: true,
    },
  });

  return {
    modules: {
      module1,
      module5,
      module20,
    },
    lessons: {
      lesson1_1,
      lesson1_2,
      lesson1_3,
      lesson5_1,
      lesson5_2,
      lesson20_1,
    },
    user,
  };
};

/**
 * Create a fresh user for tests that need a clean slate
 */
const createFreshUser = async (overrides = {}) => {
  return User.create({
    username: 'freshuser',
    email: 'fresh@example.com',
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

module.exports = {
  createFixtures,
  createFreshUser,
};
