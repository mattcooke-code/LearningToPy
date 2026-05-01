# Services

Business logic layer. Called by controllers, not routes directly.

## analytics.js
- **Called by:** `progressController.getCurrentProgress`
- **Responsibility:** Formats user progress into API response shape, calculates percentages, deduplicates lesson counts, aggregates active days
- **Depends on:** `levelUtils.js`, `shared/constants/progress.cjs`


## gamification.js
- **Called by:** `progressController.completeLesson` (indirectly), `progressController.getAchievements`
- **Responsibility:** Badge evaluation, leaderboard badge checks
- **Depends on:** `User` model, `shared/constants/badgeDefinitions.cjs`


## learningEngine.js
- **Called by:** `progressController.completeLesson`, `progressController.completeModule`
- **Responsibility:** Lesson/module completion orchestration, XP calculation, auto-completion of quiz-less modules
- **Depends on:** `quizHelpers.js`, `navigation.js`, `shared/constants/progress.cjs`


## mailer.js
- **Called by:** `authController` (password reset, email verification)
- **Responsibility:** Email transport via Nodemailer, Ethereal fallback in development without credentials
- **Design:** Lazy-initialized transporter, soft-fails in development, throws in production
- **Depends on:** `envConfig.js`, `nodemailer`


## moduleProgress.js
- **Called by:** `progressController.getCurrentProgress`, lesson page components
- **Responsibility:** Module prerequisites check, quiz pass verification, lesson completion counting
- **Depends on:** No external services — pure data checks


## streakManager.js
- **Called by:** `progressController.completeLesson`, `progressController.completeModule`, `progressController.checkStreak`
- **Responsibility:** Streak tracking with weekly completion requirements, warning system, and streak reset logic
- **Design:** Uses pre-fetched user documents — callers must call `user.save()` after mutating
- **Config:** `STREAK_CONFIG` object at top of file controls warning day, required completions, and view qualification window