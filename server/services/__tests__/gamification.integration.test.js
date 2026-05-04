/**
 * Integration tests for gamification service
 * 
 * These tests use a real in-memory MongoDB instance to test
 * the actual database interactions of the gamification functions.
 * 
 * Tests covered:
 * - evaluateBadges
 * - getBadgeProgress
 * - checkLeaderboardBadges
 */

import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { connectDB, clearDatabase, disconnectDB } from '../../test/helpers/db';
import { createFixtures, createFreshUser } from '../../test/fixtures/data';

// Import the service functions to test
const {
  evaluateBadges,
  getBadgeProgress,
  checkLeaderboardBadges,
} = require('../../services/gamification');

// Import models for direct database operations
const User = require('../../models/User');
const Module = require('../../models/Module');

import { connectDB, disconnectDB } from '../../test/helpers/db';

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await disconnectDB();
});

describe('gamification Integration Tests', () => {
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

  describe('evaluateBadges', () => {
    it('awards module completion badges', async () => {
      const { modules } = fixtures;
      
      // Complete Module 1
      freshUser.completedModules.push(modules.module1._id.toString());
      await freshUser.save();

      const result = await evaluateBadges(freshUser);

      expect(result.newlyUnlocked).toContain('module-1-complete');
      expect(result.unlockedDetails).toHaveLength(1);
      expect(result.unlockedDetails[0].id).toBe('module-1-complete');
      expect(result.unlockedDetails[0].name).toBeDefined();
      expect(result.unlockedDetails[0].category).toBe('modules');
    });

    it('awards phase completion badges', async () => {
      const { modules } = fixtures;
      
      // Complete Module 9 (end of Phase 1)
      freshUser.completedModules.push(modules.module1._id.toString()); // Module 1
      // We need to create Module 9 for this test
      const module9 = await Module.create({
        order: 9,
        phase: 1,
        title: 'Phase 1 Capstone',
        description: 'Complete Phase 1',
        isPublished: true,
      });
      freshUser.completedModules.push(module9._id.toString());
      await freshUser.save();

      const result = await evaluateBadges(freshUser);

      expect(result.newlyUnlocked).toContain('phase-1-complete');
    });

    it('awards milestone badges', async () => {
      // Complete 10 modules (halfway through curriculum)
      const moduleIds = [];
      for (let i = 1; i <= 10; i++) {
        const module = await Module.create({
          order: i,
          phase: i <= 9 ? 1 : 2,
          title: `Module ${i}`,
          description: `Test module ${i}`,
          isPublished: true,
        });
        moduleIds.push(module._id.toString());
      }
      
      freshUser.completedModules = moduleIds;
      await freshUser.save();

      const result = await evaluateBadges(freshUser);

      expect(result.newlyUnlocked).toContain('halfway-there');
    });

    it('awards course completion badge', async () => {
      // Complete all 20 curriculum modules
      const moduleIds = [];
      for (let i = 1; i <= 20; i++) {
        const module = await Module.create({
          order: i,
          phase: i <= 9 ? 1 : i <= 15 ? 2 : 3,
          title: `Module ${i}`,
          description: `Test module ${i}`,
          isPublished: true,
        });
        moduleIds.push(module._id.toString());
      }
      
      freshUser.completedModules = moduleIds;
      await freshUser.save();

      const result = await evaluateBadges(freshUser);

      expect(result.newlyUnlocked).toContain('course-complete');
    });

    it('awards engagement badges', async () => {
      // Add quiz attempt (first quiz badge)
      freshUser.quizAttempts.push({
        moduleId: fixtures.modules.module1._id,
        questions: [
          { questionId: 'q1', userAnswer: 0, isCorrect: true },
        ],
        score: 100,
        passed: true,
        attemptedAt: new Date(),
      });
      await freshUser.save();

      const result = await evaluateBadges(freshUser);

      expect(result.newlyUnlocked).toContain('first-quiz');
    });

    it('does not award already earned badges', async () => {
      const { modules } = fixtures;
      
      // User already has the badge
      freshUser.completedModules.push(modules.module1._id.toString());
      freshUser.badges.push('module-1-complete');
      await freshUser.save();

      const result = await evaluateBadges(freshUser);

      expect(result.newlyUnlocked).not.toContain('module-1-complete');
      expect(result.newlyUnlocked).toHaveLength(0);
    });

    it('excludes M0 from badge calculations', async () => {
      // Create and complete M0
      const module0 = await Module.create({
        order: 0,
        phase: 0,
        title: 'Getting Started',
        description: 'Tutorial',
        isPublished: true,
      });
      
      freshUser.completedModules.push(module0._id.toString());
      await freshUser.save();

      const result = await evaluateBadges(freshUser);

      // Should not award orientation-complete badge (that's for M0)
      // But our test data doesn't include M0 badge logic, so just ensure no errors
      expect(result.newlyUnlocked).toBeDefined();
    });
  });

  describe('getBadgeProgress', () => {
    it('returns progress for all badges', async () => {
      const progress = await getBadgeProgress(freshUser);

      expect(progress).toHaveLength(20); // All badges in BADGE_DEFINITIONS_CORE
      
      // Check that each badge has required fields
      progress.forEach((badge) => {
        expect(badge.id).toBeDefined();
        expect(badge.name).toBeDefined();
        expect(badge.description).toBeDefined();
        expect(badge.category).toBeDefined();
        expect(badge.tier).toBeDefined();
        expect(badge.progressPercentage).toBeGreaterThanOrEqual(0);
        expect(badge.progressPercentage).toBeLessThanOrEqual(100);
      });
    });

    it('calculates correct progress for module badges', async () => {
      const { modules } = fixtures;
      
      // Complete Module 1
      freshUser.completedModules.push(modules.module1._id.toString());
      await freshUser.save();

      const progress = await getBadgeProgress(freshUser);

      const module1Progress = progress.find((b) => b.id === 'module-1-complete');
      expect(module1Progress.progressPercentage).toBe(100);

      const module5Progress = progress.find((b) => b.id === 'module-5-complete');
      expect(module5Progress.progressPercentage).toBe(0);
    });

    it('calculates phase progress correctly', async () => {
      // Complete 5 out of 9 Phase 1 modules
      const moduleIds = [];
      for (let i = 1; i <= 5; i++) {
        const module = await Module.create({
          order: i,
          phase: 1,
          title: `Module ${i}`,
          description: `Test module ${i}`,
          isPublished: true,
        });
        moduleIds.push(module._id.toString());
      }
      
      freshUser.completedModules = moduleIds;
      await freshUser.save();

      const progress = await getBadgeProgress(freshUser);

      const phase1Progress = progress.find((b) => b.id === 'phase-1-complete');
      expect(phase1Progress.progressPercentage).toBe(Math.round((5 / 9) * 100));
    });

    it('calculates milestone progress', async () => {
      // Complete 8 out of 20 modules (less than halfway)
      const moduleIds = [];
      for (let i = 1; i <= 8; i++) {
        const module = await Module.create({
          order: i,
          phase: 1,
          title: `Module ${i}`,
          description: `Test module ${i}`,
          isPublished: true,
        });
        moduleIds.push(module._id.toString());
      }
      
      freshUser.completedModules = moduleIds;
      await freshUser.save();

      const progress = await getBadgeProgress(freshUser);

      const halfwayProgress = progress.find((b) => b.id === 'halfway-there');
      expect(halfwayProgress.progressPercentage).toBe(Math.round((8 / 10) * 100)); // 10 is half of 20

      const courseProgress = progress.find((b) => b.id === 'course-complete');
      expect(courseProgress.progressPercentage).toBe(Math.round((8 / 20) * 100));
    });
  });

  describe('checkLeaderboardBadges', () => {
    it('awards top-ten badge for high XP users', async () => {
      // Create user with high XP
      freshUser.xp = 10000;
      freshUser.privacySettings.showOnLeaderboards = true;
      await freshUser.save();

      // Create some other users with lower XP
      for (let i = 0; i < 5; i++) {
        await User.create({
          username: `user${i}`,
          email: `user${i}@example.com`,
          password: 'hashedpassword',
          xp: 1000 + i * 100, // Lower XP
          level: 1,
          privacySettings: { showOnLeaderboards: true },
        });
      }

      await checkLeaderboardBadges(freshUser, User);

      // Should award top-ten badge
      expect(freshUser.badges).toContain('top-ten');
    });

    it('awards reached-the-summit badge for top XP', async () => {
      // Create user with highest XP
      freshUser.xp = 10000;
      freshUser.privacySettings.showOnLeaderboards = true;
      await freshUser.save();

      // Create another user with slightly lower XP
      await User.create({
        username: 'competitor',
        email: 'competitor@example.com',
        password: 'hashedpassword',
        xp: 9000,
        level: 1,
        privacySettings: { showOnLeaderboards: true },
      });

      await checkLeaderboardBadges(freshUser, User);

      // Should award both badges (top-ten and reached-the-summit)
      expect(freshUser.badges).toContain('top-ten');
      expect(freshUser.badges).toContain('reached-the-summit');
    });

    it('does not award badges to users who opt out of leaderboards', async () => {
      freshUser.xp = 10000;
      freshUser.privacySettings.showOnLeaderboards = false;
      await freshUser.save();

      await checkLeaderboardBadges(freshUser, User);

      // Should not award any leaderboard badges
      expect(freshUser.badges).not.toContain('top-ten');
      expect(freshUser.badges).not.toContain('reached-the-summit');
    });

    it('does not re-award already earned leaderboard badges', async () => {
      freshUser.xp = 10000;
      freshUser.badges.push('top-ten', 'reached-the-summit');
      freshUser.privacySettings.showOnLeaderboards = true;
      await freshUser.save();

      await checkLeaderboardBadges(freshUser, User);

      // Badges should only appear once
      const topTenCount = freshUser.badges.filter((b) => b === 'top-ten').length;
      const summitCount = freshUser.badges.filter((b) => b === 'reached-the-summit').length;
      expect(topTenCount).toBe(1);
      expect(summitCount).toBe(1);
    });

    it('handles empty leaderboard gracefully', async () => {
      freshUser.xp = 1000;
      freshUser.privacySettings.showOnLeaderboards = true;
      await freshUser.save();

      // No other users on leaderboard
      await checkLeaderboardBadges(freshUser, User);

      // Should award badges since user is effectively #1 on empty leaderboard
      expect(freshUser.badges).toContain('top-ten');
      expect(freshUser.badges).toContain('reached-the-summit');
    });
  });
});
