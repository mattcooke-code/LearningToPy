# Controllers

Request-handling layer. Controllers parse HTTP requests, delegate to services,
and send responses. They contain minimal business logic.

## adminController.js — 34 endpoints

**Depends on:** `AdminLog`, `FlaggedContent`, `Lesson`, `Module`, `User` models,
`levelUtils.js`, `responseHelpers.js`, `parseDeviceInfo.js`

**Every action is audit-logged** via the `createAdminLog` helper (IP anonymised).

| Category         | Functions                                                                                                                                                                                                                                          |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| User management  | `toggleAdminStatus`, `getAdmins`, `searchUsers`, `adjustUserXp`, `updateUserStatus`, `getUserDetails`, `getUserActivity`, `getUserBadges`, `getUserProgress`, `overrideUserProgress`, `awardBadges`, `removeBadges`                                |
| Flag management  | `getFlaggedContent`, `getFlagStats`, `resolveFlag`                                                                                                                                                                                                 |
| Content CRUD     | `getAllLessons`, `getAllModules`, `createLesson`, `createModule`, `updateLesson`, `updateModule`, `deleteLesson`, `deleteModule`, `duplicateLesson`, `duplicateModule`, `updateLessonOrder`, `updateModuleOrder`, `publishLesson`, `publishModule` |
| Settings & stats | `getAdminStats`, `getContentStats`, `getSettings`, `updateSettings`, `getActivityLogs`                                                                                                                                                             |

---

## analyticsController.js — 3 endpoints

**Depends on:** `Activity`, `Lesson`, `Module`, `User` models,
`analyticsCache.js`, `responseHelpers.js`

**Heavy aggregation** — MongoDB pipelines for retention cohorts, time-series activity,
content performance rankings, device breakdowns, and user segmentation.
All results read-through cached (5-min TTL).

| Function               | Route                                 | Description                                                      |
| ---------------------- | ------------------------------------- | ---------------------------------------------------------------- |
| `getPlatformAnalytics` | GET /api/analytics/platform           | Full dashboard: users, content, trends, demographics, engagement |
| `getContentAnalytics`  | GET /api/analytics/content/:contentId | Per-lesson/module activity and completion rates                  |
| `getUserAnalytics`     | GET /api/analytics/users/:userId      | Per-user activity history and stats                              |

---

## authController.js — 13 endpoints

**Depends on:** `User`, `Lesson`, `FlaggedContent`, `ActivityLog`, `AdminLog` models,
`envConfig.js`, `authUtils.js`, `userUtils.js`, `emailTemplates.js`, `mailer.js`,
`responseHelpers.js`, `streakManager.js`, `validationHelpers.js`

| Function                | Route                               | Auth   | Description                                    |
| ----------------------- | ----------------------------------- | ------ | ---------------------------------------------- |
| `register`              | POST /api/auth/register             | No     | Create account, return tokens                  |
| `login`                 | POST /api/auth/login                | No     | Authenticate, return tokens, track streak      |
| `getUser`               | GET /api/auth/me                    | Yes    | Current user profile                           |
| `refreshToken`          | POST /api/auth/refresh-token        | Cookie | Issue new access + refresh tokens              |
| `logout`                | POST /api/auth/logout               | Yes    | Invalidate all refresh tokens                  |
| `forgotPassword`        | POST /api/auth/forgot-password      | No     | Send reset email (generic response)            |
| `validateResetToken`    | GET /api/auth/reset-password/:token | No     | Verify token validity                          |
| `resetPassword`         | POST /api/auth/reset-password       | No     | Set new password, invalidate sessions          |
| `changePassword`        | POST /api/auth/change-password      | Yes    | Change password (requires current password)    |
| `deleteAccount`         | DELETE /api/auth/delete-account     | Yes    | Permanently delete account and associated data |
| `updatePrivacySettings` | PUT /api/auth/privacy               | Yes    | Update leaderboard/profile visibility          |
| `createFlag`            | POST /api/auth/flag                 | Yes    | Report content issue                           |
| `exportUserData`        | GET /api/auth/export-data           | Yes    | Export all user data (GDPR Right of Access)    |

### Key Behaviour Notes

**Registration** — Age verification is performed via `userUtils.calculateAge()` and `userUtils.getAgeCompliancePackage()`, which assigns an age bracket and appropriate default privacy settings. The date of birth itself is never stored — only the verification status and bracket are persisted for GDPR/UK Children's Code compliance.

**Account Deletion** — Uses a MongoDB session/transaction for atomicity:

- **User document** — deleted (removes all embedded progress, badges, stats, streaks, xpHistory, quizAttempts, privacySettings)
- **ActivityLog** — all entries for the user are deleted
- **FlaggedContent** — all reports by the user are deleted
- **AdminLog** — if user was an admin, logs are anonymised (adminId set to null) rather than deleted for audit integrity
- **Auth cookies** — cleared

Password confirmation is required to prevent accidental or CSRF-triggered deletion.

**Email/Username Duplicate Check** — Both queries run in parallel via `Promise.all()` to reduce registration latency.

---

## contentController.js — 7 endpoints

**Depends on:** `Module`, `Lesson`, `User` models,
`validationHelpers.js`, `learningEngine.js`, `quizHelpers.js`,
`moduleProgress.js`, `navigation.js`, `analytics.js`, `gamification.js`,
`responseHelpers.js`, `streakManager.js`

| Function            | Route                                  | Auth  | Description                                   |
| ------------------- | -------------------------------------- | ----- | --------------------------------------------- |
| `getAllModules`     | GET /api/content/modules               | Yes   | All modules with user progress                |
| `getModule`         | GET /api/content/modules/:id           | Yes   | Single module with quiz history               |
| `getModuleLessons`  | GET /api/content/modules/:id/lessons   | Yes   | Lessons with completion status                |
| `getLessonContent`  | GET /api/content/lessons/:id           | Yes   | Lesson content (answers hidden if incomplete) |
| `submitLesson`      | POST /api/content/lessons/:id/submit   | Yes   | Submit exercise/quiz/theory — full or partial |
| `submitModuleQuiz`  | POST /api/content/modules/:id/quiz     | Yes   | Grade quiz, complete module if passed         |
| `fixModuleProgress` | POST /api/content/modules/fix-progress | Admin | Repair inconsistent module states             |

---

## imageController.js — 1 endpoint

**Depends on:** `fs`, `path` (Node built-ins)

| Function           | Route                                       | Description                         |
| ------------------ | ------------------------------------------- | ----------------------------------- |
| `serveModuleImage` | GET /api/images/module/:moduleId/:imageName | Serve badge images with 1-day cache |

---

## progressController.js — 9 endpoints

**Depends on:** `User`, `Lesson`, `Module` models,
`analytics.js`, `learningEngine.js`, `levelUtils.js`, `gamification.js`,
`streakManager.js`, `badgeDefinitions.cjs`, `responseHelpers.js`

| Function                    | Route                                    | Auth | Description                                          |
| --------------------------- | ---------------------------------------- | ---- | ---------------------------------------------------- |
| `getCurrentProgress`        | GET /api/progress/current                | Yes  | Dashboard data (level, XP, course %, current module) |
| `getAchievements`           | GET /api/progress/achievements           | Yes  | Badges categorised as earned/in-progress/locked      |
| `getSurroundingLeaderboard` | GET /api/progress/leaderboard/around-me  | Yes  | ±2 ranks around current user                         |
| `getTopLeaderboard`         | GET /api/progress/leaderboard/top        | Yes  | Top N users                                          |
| `getModuleLeaderboard`      | GET /api/progress/leaderboard/module/:id | Yes  | Per-module XP ranking                                |
| `startLesson`               | POST /api/progress/lessons/:id/start     | Yes  | Record lesson view                                   |
| `completeLesson`            | POST /api/progress/lessons/:id/complete  | Yes  | Award XP, update streak, check badges                |
| `completeModule`            | POST /api/progress/modules/:id/complete  | Yes  | Record quiz, award XP, check badges                  |
| `checkStreak`               | GET /api/progress/streak                 | Yes  | Current streak status                                |

---

## supportController.js — 1 endpoint

**Depends on:** `nodemailer`, `envConfig.js`, `responseHelpers.js`

| Function             | Route             | Auth | Description                 |
| -------------------- | ----------------- | ---- | --------------------------- |
| `sendSupportMessage` | POST /api/support | Yes  | Send contact form via email |
