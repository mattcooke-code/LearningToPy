# Utils

Pure utility functions and constants. Called by components, hooks, contexts, and services. No React dependencies (with the exception of `confirmUtils.js` which is a hook — flagged for relocation).

## File Index

| File                      | Type     | Responsibility                                                                      |
| ------------------------- | -------- | ----------------------------------------------------------------------------------- |
| `analyticsUtils.js`       | Export   | CSV export for analytics data                                                       |
| `colorUtilities.js`       | Exports  | Theme colour resolution from progress %, hover variants, route eligibility          |
| `deviceInfo.js`           | Export   | Browser, platform, screen, language, and timezone detection                         |
| `fileDownloadUtils.js`    | Exports  | Browser file download: blob creation, anchor trigger, Python/CSV/terminal output    |
| `getErrorMessage.js`      | Exports  | User-facing error message extraction from Axios errors, strings, network failures   |
| `getSuccessMessage.js`    | Export   | CRUD success message generation (create/update/delete/publish/archive)              |
| `lessonCalculations.js`   | Exports  | Next-lesson lookup (API fallback), first incomplete lesson, lesson statistics       |
| `lessonFormUtils.js`      | Exports  | Lesson form defaults, API-to-form mapping, form-to-API normalisation                |
| `moduleFormUtils.js`      | Exports  | Module form defaults, API-to-form mapping, form-to-API normalisation                |
| `platformDefaults.js`     | Constant | Platform-wide default settings (general, theme, gamification, features, security)   |
| `progressCalculations.js` | Exports  | Module lesson progress %, modules completion %, XP-to-level calculations            |
| `quizUtils.js`            | Exports  | Quiz state: answer checking, counting, resetting, server result processing, styling |
| `statsManagement.js`      | Exports  | Admin/content/user dashboard statistics aggregation                                 |
| `tokenUtils.js`           | Exports  | JWT storage read (`getStoredAccessToken`) and expiry validation (`isTokenValid`)    |
| `userUtils.js`            | Export   | User data normalisation from multiple API response shapes                           |
| `validationUtils.js`      | Exports  | Pyodide-based Python code validation (TESTS, OUTPUT, THEORY modes)                  |
| `index.js`                | Barrel   | Re-exports all public functions from the above modules                              |

## Dependency Graph

analyticsUtils.js ──► fileDownloadUtils.js
│
colorUtilities.js ──► constants/themeConstants
│
deviceInfo.js ─────── (no dependencies — pure DOM)
|
lessonCalculations.js ──► services (apiClient)
└── progressCalculations.js
│
progressCalculations.js ──► @shared/constants/progress.cjs
│
validationUtils.js ────► data/fileExercises
│
getErrorMessage.js ──── (no dependencies)
getSuccessMessage.js ── (no dependencies)
lessonFormUtils.js ──── (no dependencies)
moduleFormUtils.js ──── (no dependencies)
platformDefaults.js ─── (no dependencies)
quizUtils.js ────────── (no dependencies)
statsManagement.js ──── (no dependencies)
tokenUtils.js ──────── jwt-decode
userUtils.js ───────── (no dependencies)
fileDownloadUtils.js ── (no dependencies — pure DOM)

## Known Issues

| Issue                       | File(s)               | Notes                                                                                   |
| --------------------------- | --------------------- | --------------------------------------------------------------------------------------- |
| Dead `lucide-react` imports | `moduleFormUtils.js`  | 16 icon imports unused — icon mapping happens in the component                          |
| Duplicate setting keys      | `platformDefaults.js` | `previewMode` and `autoPublishNewContent` appear in both Features and Advanced sections |
