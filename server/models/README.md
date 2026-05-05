# Models

Mongoose schema definitions. All models use `timestamps: true` (createdAt/updatedAt).

## ActivityLog.js

Tracks user activity for analytics and session monitoring.

| Field        | Type            | Notes                                                                                              |
| ------------ | --------------- | -------------------------------------------------------------------------------------------------- |
| `userId`     | ObjectId → User | Optional (anonymous activity supported)                                                            |
| `sessionId`  | String          | Required, indexed                                                                                  |
| `actionType` | String (enum)   | PAGE_VIEW, LESSON_START, LESSON_COMPLETE, QUIZ_ATTEMPT, CODE_RUN, SESSION_START, SESSION_END, etc. |
| `metadata`   | Mixed           | lessonId, moduleId, duration, xpEarned, deviceInfo, path                                           |
| `ipAddress`  | String          | Anonymised before storage                                                                          |
| `timestamp`  | Date            | Default: now                                                                                       |

---

## AdminLog.js

Audit trail for all admin actions. Every admin controller function writes here.

| Field        | Type            | Notes                                                                    |
| ------------ | --------------- | ------------------------------------------------------------------------ |
| `adminId`    | ObjectId → User | Required                                                                 |
| `action`     | String (enum)   | 25+ action types covering user management, content CRUD, flags, settings |
| `targetType` | String (enum)   | USER, LESSON, MODULE, BADGE, FLAG, SETTINGS                              |
| `targetId`   | ObjectId        | Optional (null for SETTINGS actions)                                     |
| `changes`    | Mixed           | `{ old, new }` diff                                                      |
| `reason`     | String          | Max 1000 chars, XSS-sanitised                                            |
| `ipAddress`  | String          | Anonymised                                                               |
| `userAgent`  | String          | Browser user-agent                                                       |

---

## FlaggedContent.js

User-submitted content issue reports.

| Field            | Type            | Notes                                                                             |
| ---------------- | --------------- | --------------------------------------------------------------------------------- |
| `targetType`     | String (enum)   | LESSON, EXERCISE, QUIZ                                                            |
| `targetId`       | ObjectId        | The flagged resource                                                              |
| `reporterId`     | ObjectId → User | Required                                                                          |
| `issueType`      | String (enum)   | CONTENT_ERROR, CODE_ERROR, QUIZ_ERROR, BROKEN_FUNCTIONALITY, XP_ADJUSTMENT, OTHER |
| `title`          | String          | 5–200 chars                                                                       |
| `description`    | String          | 10–2000 chars                                                                     |
| `suggestedFix`   | String          | Optional, max 1000 chars                                                          |
| `status`         | String (enum)   | PENDING (default), IN_REVIEW, FIXED, REJECTED, XP_ADJUSTED                        |
| `xpCompensation` | Number          | Awarded to reporter on FIXED resolution                                           |
| `resolvedBy`     | ObjectId → User | Admin who resolved                                                                |
| `resolvedAt`     | Date            | Resolution timestamp                                                              |

---

## Lesson.js

Individual lessons within a module. Supports theory, exercises, quizzes, and projects.

| Field          | Type              | Notes                                                          |
| -------------- | ----------------- | -------------------------------------------------------------- |
| `title`        | String            | 3–100 chars, XSS-sanitised                                     |
| `content`      | String            | 10–50000 chars, required                                       |
| `order`        | Number            | Sort order within module                                       |
| `moduleId`     | ObjectId → Module | Required, indexed                                              |
| `contentType`  | String (enum)     | THEORY, EXERCISE, QUIZ, PROJECT, GUIDED_SETUP                  |
| `difficulty`   | String (enum)     | BEGINNER, INTERMEDIATE, ADVANCED                               |
| `xpReward`     | Number            | Default 25                                                     |
| `exercise`     | Object            | starterCode, solution, hints, testCases, validation rules      |
| `quiz`         | [Object]          | Array of { id, question, options, correctAnswer, explanation } |
| `slug`         | String            | Unique, auto-generated from title                              |
| `isPublished`  | Boolean           | Default false                                                  |
| `nextLessonId` | ObjectId → Lesson | Explicit next-lesson pointer                                   |

---

## Module.js

Curriculum modules containing lessons. M0 is the tutorial (excluded from level calculations).

| Field           | Type                | Notes                                                                             |
| --------------- | ------------------- | --------------------------------------------------------------------------------- |
| `title`         | String              | 3–100 chars                                                                       |
| `description`   | String              | 10–2000 chars                                                                     |
| `order`         | Number              | Curriculum sequence, min 0                                                        |
| `moduleNumber`  | String              | Unique (e.g., "M1")                                                               |
| `difficulty`    | String (enum)       | BEGINNER, INTERMEDIATE, ADVANCED                                                  |
| `prerequisites` | [ObjectId → Module] | Modules required before this one                                                  |
| `xpReward`      | Number              | Default 100                                                                       |
| `moduleQuiz`    | Object              | { title, description, settings, questions[] } — quiz that gates module completion |
| `isPublished`   | Boolean             | Default false                                                                     |
| `slug`          | String              | Unique, indexed                                                                   |

---

## User.js

The core user document. Largest model — handles auth, progress, gamification, and privacy.

**Auth fields:** `email`, `password` (select: false), `resetPasswordToken`, `resetPasswordExpires`, `refreshTokenVersion`

**Progress fields:** `xp`, `level`, `completedLessons[]`, `completedModules[]`, `lessonCompletionHistory[]`, `moduleCompletionHistory[]`, `quizAttempts[]`, `lessonQuizProgress[]`, `xpHistory[]`

**Streak fields:** `streak`, `streakStatus` (ACTIVE/WARNING/AT_RISK/RESETTING), `lastActiveDate`, `lastCompletionDate`, `weeklyProgress`

**Gamification fields:** `badges[]`, `stats` (20+ tracked stats for badge criteria)

**Admin/status fields:** `isAdmin`, `isBlocked`, `suspensionEnd`, `suspensionReason`

**Privacy fields:** `privacySettings` (showOnLeaderboards, showUsernameOnLeaderboards, showAsAnonymous)

**Other:** `loginCount`, `totalLearningTime`, `totalSessionTime`

Indexes: `username` (unique), `email` (unique)
