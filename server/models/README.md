# Models

Mongoose schema definitions. All models use `timestamps: true` (createdAt/updatedAt)
unless otherwise noted.

## Design Principle

User progress data that grows unbounded (lesson completions, quiz attempts,
XP transactions) is stored in **separate collections** rather than embedded
arrays. This prevents any single document from approaching MongoDB's 16MB
limit and enables efficient pagination and TTL indexes.

---

## User.js

The core user document — auth, counters, gamification, privacy, and status.
All unbounded arrays have been extracted to dedicated collections.

| Category             | Fields                                                                                                              |
| -------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Auth**             | `username`, `email`, `password` (select:false), `resetPasswordToken`, `resetPasswordExpires`, `refreshTokenVersion` |
| **Age verification** | `ageVerified`, `ageVerifiedAt`, `ageBracket` (select:false), `parentalConsentConfirmed`                             |
| **Progress**         | `level`, `xp`, `completedLessonsCount`, `completedModulesCount` (denormalised counters)                             |
| **Streak**           | `streak`, `streakStatus`, `lastActiveDate`, `lastCompletionDate`, `weeklyProgress`                                  |
| **Gamification**     | `badges[]`, `stats` (20+ tracked stats)                                                                             |
| **Activity**         | `lastActive`, `totalLearningTime`, `totalSessionTime`, `loginCount`                                                 |
| **Admin/Status**     | `isAdmin`, `isBlocked`, `suspensionEnd`, `suspensionReason`                                                         |
| **Privacy**          | `privacySettings` (showOnLeaderboards, showUsernameOnLeaderboards, showAsAnonymous)                                 |

**Indexes:** `email` (unique), `username` (unique), `{ level:-1, xp:-1 }` (leaderboards),
`{ isAdmin:1, lastActive:-1 }`, `{ isBlocked:1, createdAt:-1 }`,
`lastActiveDate`, `weeklyProgress.weekStartDate`

**Related collections** (query these instead of embedded arrays):

- `LessonCompletion` — full lesson completion history
- `ModuleCompletion` — module completion records
- `QuizAttempt` — module quiz attempts with answers
- `XpTransaction` — detailed XP award history (TTL: 365 days)
- `LessonQuizProgress` — per-lesson quiz state

---

## LessonCompletion.js

One document per lesson completed by a user. Replaces the embedded
`lessonCompletionHistory[]` and `completedLessons[]` arrays.

| Field            | Type              | Notes                             |
| ---------------- | ----------------- | --------------------------------- |
| `userId`         | ObjectId → User   | Required                          |
| `lessonId`       | ObjectId → Lesson | Required                          |
| `completedAt`    | Date              | Default: now                      |
| `tags`           | [String]          | Lesson tags at time of completion |
| `contentType`    | String            | THEORY, EXERCISE, QUIZ, etc.      |
| `difficulty`     | String            | BEGINNER, INTERMEDIATE, ADVANCED  |
| `challengeGroup` | String            | Challenge category                |
| `elapsedSeconds` | Number            | Time spent on lesson              |
| `attemptNumber`  | Number            | Which attempt this was            |
| `usedHints`      | Boolean           | Whether hints were used           |
| `linesOfCode`    | Number            | Code submitted (exercise lessons) |
| `wasOptimal`     | Boolean           | Solution matched optimal criteria |

**Indexes:** `{ userId:1, lessonId:1 }` (unique), `{ userId:1, completedAt:-1 }`,
`{ lessonId:1, completedAt:-1 }`

---

## ModuleCompletion.js

One document per module completed. Replaces `completedModules[]` and
`moduleCompletionHistory[]`.

| Field         | Type              | Notes        |
| ------------- | ----------------- | ------------ |
| `userId`      | ObjectId → User   | Required     |
| `moduleId`    | ObjectId → Module | Required     |
| `completedAt` | Date              | Default: now |

**Indexes:** `{ userId:1, moduleId:1 }` (unique), `{ userId:1, completedAt:-1 }`,
`{ userId:1 }`

---

## QuizAttempt.js

One document per module quiz submission. Replaces `quizAttempts[]`.

| Field         | Type              | Notes                                                                   |
| ------------- | ----------------- | ----------------------------------------------------------------------- |
| `userId`      | ObjectId → User   | Required                                                                |
| `moduleId`    | ObjectId → Module | Required                                                                |
| `attemptedAt` | Date              | Default: now                                                            |
| `score`       | Number            | 0–100                                                                   |
| `passed`      | Boolean           | Whether passing threshold was met                                       |
| `answers`     | [Object]          | questionId, question, userAnswer, correctAnswer, isCorrect, explanation |

**Indexes:** `{ userId:1, moduleId:1, attemptedAt:-1 }`,
`{ moduleId:1, attemptedAt:-1 }`, `{ userId:1, moduleId:1, passed:1 }`

---

## XpTransaction.js

Immutable XP award log. Replaces `xpHistory[]`.
Auto-deleted after 365 days via TTL index (XP total is preserved on User.xp).

| Field       | Type            | Notes                                                 |
| ----------- | --------------- | ----------------------------------------------------- |
| `userId`    | ObjectId → User | Required                                              |
| `amount`    | Number          | XP awarded                                            |
| `source`    | String (enum)   | LESSON_COMPLETION, EXERCISE, MODULE_QUIZ, BONUS, etc. |
| `meta`      | Mixed           | { lessonId, moduleId, attempts, etc. }                |
| `awardedAt` | Date            | Default: now                                          |

**Indexes:** `{ userId:1, awardedAt:-1 }`, `{ userId:1, source:1 }`,
`{ awardedAt:1 }` (TTL: 365 days)

---

## LessonQuizProgress.js

Per-lesson quiz state tracking. Replaces `lessonQuizProgress[]`.

| Field              | Type              | Notes                                   |
| ------------------ | ----------------- | --------------------------------------- |
| `userId`           | ObjectId → User   | Required                                |
| `lessonId`         | ObjectId → Lesson | Required                                |
| `questionAttempts` | [Object]          | questionIndex, attempts, correct        |
| `correctAnswers`   | [Number]          | Indices of correctly answered questions |
| `completed`        | Boolean           | All questions answered correctly        |
| `lastAttempt`      | Date              | Default: now                            |

**Indexes:** `{ userId:1, lessonId:1 }` (unique), `{ userId:1, completed:1 }`

---

## ActivityLog.js

Tracks user activity for analytics and session monitoring.

| Field        | Type            | Notes                                                                                        |
| ------------ | --------------- | -------------------------------------------------------------------------------------------- |
| `userId`     | ObjectId → User | Optional (anonymous activity supported)                                                      |
| `sessionId`  | String          | Required, indexed                                                                            |
| `actionType` | String (enum)   | PAGE_VIEW, LESSON_START, LESSON_COMPLETE, QUIZ_ATTEMPT, CODE_RUN, SESSION_START, SESSION_END |
| `metadata`   | Mixed           | lessonId, moduleId, duration, xpEarned, deviceInfo, path                                     |
| `ipAddress`  | String          | Anonymised before storage                                                                    |
| `timestamp`  | Date            | Default: now                                                                                 |

---

## AdminLog.js

Audit trail for all admin actions. Every admin controller function writes here.

| Field        | Type            | Notes                                                       |
| ------------ | --------------- | ----------------------------------------------------------- |
| `adminId`    | ObjectId → User | Required                                                    |
| `action`     | String (enum)   | 25+ action types (user mgmt, content CRUD, flags, settings) |
| `targetType` | String (enum)   | USER, LESSON, MODULE, BADGE, FLAG, SETTINGS                 |
| `targetId`   | ObjectId        | Optional (null for SETTINGS actions)                        |
| `changes`    | Mixed           | `{ old, new }` diff                                         |
| `reason`     | String          | Max 1000 chars, XSS-sanitised                               |
| `ipAddress`  | String          | Anonymised                                                  |
| `userAgent`  | String          | Browser user-agent                                          |

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
