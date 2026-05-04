/**
 * Integration tests for streakManager service
 * 
 * These tests use a real in-memory MongoDB instance to test
 * the actual database interactions of the streakManager functions.
 * 
 * Tests covered:
 * - getStreakInfo
 * - trackLessonView (indirectly tested through getStreakInfo)
 * - trackCompletion (indirectly tested through getStreakInfo)
 */

import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { connectDB, clearDatabase, disconnectDB } from '../../test/helpers/db';
import { createFixtures, createFreshUser } from '../../test/fixtures/data';

// Import the service function to test
const { getStreakInfo } = require('../../services/streakManager');

// Import models for direct database operations
const User = require('../../models/User');

import { connectDB, disconnectDB } from '../../test/helpers/db';

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await disconnectDB();
});

describe('streakManager Integration Tests', () => {
  let freshUser;

  beforeEach(async () => {
    // Clear database and create fresh user for each test
    await clearDatabase();
    freshUser = await createFreshUser();
  });

  afterEach(async () => {
    // Clean up after each test
    await clearDatabase();
  });

  describe('getStreakInfo', () => {
    it('returns basic streak information for new user', async () => {
      const info = await getStreakInfo(freshUser._id);

      expect(info).toBeDefined();
      expect(info.streak).toBe(0);
      expect(info.status).toBe('ACTIVE');
      expect(info.daysActiveThisWeek).toBe(0);
      expect(info.completionsThisWeek).toBe(0);
      expect(info.requiredCompletions).toBe(1);
      expect(info.warningDay).toBe(5);
      expect(info.daysRemaining).toBeGreaterThanOrEqual(0);
      expect(info.daysRemaining).toBeLessThanOrEqual(7);
    });

    it('calculates correct day of week', async () => {
      // Set week start to Monday (default)
      const monday = new Date('2024-01-01'); // This is a Monday
      freshUser.weeklyProgress.weekStartDate = monday;
      await freshUser.save();

      const info = await getStreakInfo(freshUser._id);

      expect(info.currentDayOfWeek).toBe(1); // Monday
      expect(info.daysRemaining).toBe(6); // 6 days left in week
    });

    it('tracks days active correctly', async () => {
      // Simulate activity over multiple days
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      freshUser.lastActiveDate = twoDaysAgo;
      freshUser.lessonCompletionHistory = [
        {
          lessonId: 'lesson1',
          completedAt: twoDaysAgo,
        },
        {
          lessonId: 'lesson2',
          completedAt: yesterday,
        },
      ];
      await freshUser.save();

      const info = await getStreakInfo(freshUser._id);

      expect(info.daysActiveThisWeek).toBe(2); // Should count unique days
    });

    it('counts module completions for active days', async () => {
      const today = new Date();
      
      freshUser.lastCompletionDate = today;
      freshUser.weeklyProgress.completionsThisWeek = 3;
      await freshUser.save();

      const info = await getStreakInfo(freshUser._id);

      expect(info.completionsThisWeek).toBe(3);
    });

    it('includes last activity timestamps', async () => {
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);

      freshUser.lastActiveDate = yesterday;
      freshUser.lastCompletionDate = now;
      await freshUser.save();

      const info = await getStreakInfo(freshUser._id);

      expect(info.lastActive).toBeInstanceOf(Date);
      expect(info.lastCompletion).toBeInstanceOf(Date);
      expect(info.lastActive.getTime()).toBe(yesterday.getTime());
      expect(info.lastCompletion.getTime()).toBe(now.getTime());
    });

    it('handles user with existing streak', async () => {
      freshUser.streak = 15;
      freshUser.streakStatus = 'ACTIVE';
      freshUser.weeklyProgress.daysActive = 5;
      freshUser.weeklyProgress.completionsThisWeek = 3;
      await freshUser.save();

      const info = await getStreakInfo(freshUser._id);

      expect(info.streak).toBe(15);
      expect(info.status).toBe('ACTIVE');
      expect(info.daysActiveThisWeek).toBe(5);
      expect(info.completionsThisWeek).toBe(3);
    });

    it('handles user with warning status', async () => {
      freshUser.streak = 10;
      freshUser.streakStatus = 'WARNING';
      freshUser.weeklyProgress.warningIssued = true;
      await freshUser.save();

      const info = await getStreakInfo(freshUser._id);

      expect(info.streak).toBe(10);
      expect(info.status).toBe('WARNING');
    });

    it('handles user with at-risk status', async () => {
      freshUser.streak = 5;
      freshUser.streakStatus = 'AT_RISK';
      await freshUser.save();

      const info = await getStreakInfo(freshUser._id);

      expect(info.streak).toBe(5);
      expect(info.status).toBe('AT_RISK');
    });

    it('handles user with resetting status', async () => {
      freshUser.streak = 0;
      freshUser.streakStatus = 'RESETTING';
      await freshUser.save();

      const info = await getStreakInfo(freshUser._id);

      expect(info.streak).toBe(0);
      expect(info.status).toBe('RESETTING');
    });

    it('returns null for non-existent user', async () => {
      const fakeUserId = '507f1f77bcf86cd799439011';
      
      const info = await getStreakInfo(fakeUserId);

      expect(info).toBeNull();
    });

    it('calculates days remaining correctly', async () => {
      // Test different days of the week
      const testCases = [
        { dayOffset: 0, expectedDaysRemaining: 6 }, // Monday
        { dayOffset: 1, expectedDaysRemaining: 5 }, // Tuesday
        { dayOffset: 2, expectedDaysRemaining: 4 }, // Wednesday
        { dayOffset: 3, expectedDaysRemaining: 3 }, // Thursday
        { dayOffset: 4, expectedDaysRemaining: 2 }, // Friday
        { dayOffset: 5, expectedDaysRemaining: 1 }, // Saturday
        { dayOffset: 6, expectedDaysRemaining: 0 }, // Sunday
      ];

      for (const testCase of testCases) {
        // Clear and create fresh user for each test case
        await clearDatabase();
        const user = await createFreshUser();

        // Set week start to Monday
        const monday = new Date('2024-01-01'); // Monday
        user.weeklyProgress.weekStartDate = monday;
        
        // Set current date to test day
        const currentDay = new Date(monday);
        currentDay.setDate(currentDay.getDate() + testCase.dayOffset);
        user.lastActiveDate = currentDay;
        await user.save();

        const info = await getStreakInfo(user._id);

        expect(info.daysRemaining).toBe(testCase.expectedDaysRemaining);
      }
    });

    it('handles edge case of week boundaries', async () => {
      // Test Sunday (end of week)
      const sunday = new Date('2024-01-07'); // Sunday
      const monday = new Date('2024-01-01'); // Previous Monday
      
      freshUser.weeklyProgress.weekStartDate = monday;
      freshUser.lastActiveDate = sunday;
      await freshUser.save();

      const info = await getStreakInfo(freshUser._id);

      expect(info.currentDayOfWeek).toBe(7); // Sunday
      expect(info.daysRemaining).toBe(0); // Last day of week
    });

    it('includes all required fields in response', async () => {
      const info = await getStreakInfo(freshUser._id);

      // Check all expected fields are present
      const expectedFields = [
        'streak',
        'status',
        'daysActiveThisWeek',
        'completionsThisWeek',
        'requiredCompletions',
        'warningDay',
        'currentDayOfWeek',
        'daysRemaining',
        'lastActive',
        'lastCompletion',
      ];

      expectedFields.forEach((field) => {
        expect(info).toHaveProperty(field);
      });

      // Check data types
      expect(typeof info.streak).toBe('number');
      expect(typeof info.status).toBe('string');
      expect(typeof info.daysActiveThisWeek).toBe('number');
      expect(typeof info.completionsThisWeek).toBe('number');
      expect(typeof info.requiredCompletions).toBe('number');
      expect(typeof info.warningDay).toBe('number');
      expect(typeof info.currentDayOfWeek).toBe('number');
      expect(typeof info.daysRemaining).toBe('number');
      expect(info.lastActive).toBeInstanceOf(Date);
      expect(info.lastCompletion).toBeInstanceOf(Date);
    });
  });
});
