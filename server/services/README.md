# Services

Business logic layer. Called by controllers, not routes directly.

## analytics.js

- **Called by:** `progressController.getCurrentProgress`, `contentController.getAllModules`, `contentController.getModule`, `contentController.submitLesson`, `contentController.submitModuleQuiz`
- **Responsibility:** Formats user progress into API response shape, calculates percentages, deduplicates lesson counts, aggregates active days, provides tag/category lookup helpers
- **Depends on:** `levelUtils.js`, `shared/constants/progress.cjs`

## analyticsCache.js (in /utils)

- **Called by:** `analyticsController.getPlatformAnalytics`, `analyticsController.getContentAnalytics`, `analyticsController.getUserAnalytics`
- **Responsibility:** Read-through caching with prefix-based invalidation, 5-min TTL
- **Design:** In-memory only — clears on restart, not suitable for critical data
- **Depends on:** `node-cache`

## gamification.js

- **Called by:** `progressController.getAchievements`, `progressController.completeLesson` (indirectly), `progressController.completeModule` (indirectly), `contentController.submitLesson`, `contentController.submitModuleQuiz`, `adminController.awardBadges` (indirectly via leaderboard)
- **Responsibility:** Badge evaluation, badge progress calculation, leaderboard badge triggers, level-from-XP calculation
- **Depends on:** `User` model, `shared/constants/badgeDefinitions.cjs`, `generalUtils.js`

## learningEngine.js

- **Called by:** `progressController.completeLesson`, `progressController.completeModule`, `progressController.getCurrentProgress`, `contentController.submitLesson`, `contentController.submitModuleQuiz`, `contentController.fixModuleProgress`
- **Responsibility:** Lesson/module completion orchestration, XP calculation, auto-completion of quiz-less modules, curriculum progress stats, code validation, user stats tracking
- **Depends on:** `quizHelpers.js`, `navigation.js`, `shared/constants/progress.cjs`, `generalUtils.js`

## mailer.js

- **Called by:** `authController.forgotPassword`, `supportController.sendSupportMessage`
- **Responsibility:** Email transport via Nodemailer, Ethereal fallback in development without credentials, password reset email template
- **Design:** Lazy-initialized transporter, soft-fails in development, throws in production
- **Depends on:** `envConfig.js`, `nodemailer`

## moduleProgress.js

- **Called by:** `contentController.getAllModules`, `contentController.getModule`, `contentController.submitModuleQuiz`, `contentController.fixModuleProgress`
- **Responsibility:** Module prerequisites check, quiz pass verification, lesson completion counting
- **Depends on:** No external services — pure data checks

## streakManager.js

- **Called by:** `progressController.completeLesson`, `progressController.completeModule`, `progressController.checkStreak`, `progressController.getCurrentProgress`, `authController.login`, `authController.refreshToken`, `authController.register` (indirectly via trackLessonView)
- **Responsibility:** Streak tracking with weekly completion requirements, warning system, and streak reset logic
- **Design:** Uses pre-fetched user documents — callers must call `user.save()` after mutating
- **Config:** `STREAK_CONFIG` object at top of file controls warning day, required completions, and view qualification window
