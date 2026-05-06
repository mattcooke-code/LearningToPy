# Hooks

Custom React hooks. Encapsulate reusable stateful logic, side effects, and context access for components. Follow the `useX` naming convention.

## File Index

| Hook                        | Type            | Responsibility                                                                               | Tested |
| --------------------------- | --------------- | -------------------------------------------------------------------------------------------- | ------ |
| `useAdminData.js`           | Data fetching   | Generic admin data fetcher with loading/error state, auto-retry, toast notifications         | ❌     |
| `useAdminMutation.js`       | Mutation        | Generic admin mutation with confirmation dialogs, pre-mutation checks, success/error toasts  | ❌     |
| `useConfirmActions.js`      | Context wrapper | Promise-based confirmation dialogs (delete, archive, publish, reset) via NotificationContext | ❌     |
| `useContentFilter.js`       | State           | Content filtering by type/status/difficulty/search and sorting                               | ✅     |
| `useCourseThemeUpdater.js`  | Side effect     | Syncs theme colour to course progress on route change                                        | ❌     |
| `useFileDownload.js`        | Util wrapper    | Memoised callbacks for file, CSV, and Python code downloads                                  | ✅     |
| `useModal.js`               | Store wrapper   | Accessor for the Zustand modal store (`openModal`, `closeModal`)                             | ❌     |
| `usePageViewTracker.js`     | Side effect     | POSTs page view analytics on authenticated route changes                                     | ❌     |
| `useSettingsManager.js`     | State           | Editable settings with dirty-change tracking against server originals                        | ✅     |
| `useStreakNotifications.js` | Side effect     | Toast/confirm notifications for streak WARNING, AT_RISK, RESETTING states                    | ❌     |
| `useThemeStyles.js`         | Context wrapper | Theme colour and hover event handlers for interactive elements                               | ❌     |
| `index.js`                  | Barrel          | Re-exports all public hooks                                                                  | —      |

## Dependency Graph

useConfirmActions ─────► context (useNotification)
useCourseThemeUpdater ─► context (useAuth, useTheme)
├─► react-router-dom
└─► services (apiClient)

useAdminData ──────────► context (useNotification)
└─► utils (getErrorMessage, getAdminErrorMessage)

useAdminMutation ──────► context (useNotification)
└─► utils (getAdminErrorMessage, getSuccessMessage)

useFileDownload ───────► utils/fileDownloadUtils (downloadContent, convertToCSV)

useModal ──────────────► store/useModalStore

usePageViewTracker ────► react-router-dom
└─► context (useAuth)

useSettingsManager ────► utils (PLATFORM_DEFAULTS)

useStreakNotifications ► context (useNotification)

useThemeStyles ────────► context (useTheme)
└─► utils (getHoverColor)

useContentFilter ────── (no external dependencies — pure React state)

## Testing Notes

- **Tested hooks** use `@testing-library/react` with `renderHook` and mock React state.
- **Skipped hooks** are integration-level (multiple contexts, API calls, side effects) and should be exercised through component integration tests or E2E tests.
- **Context-wrapping hooks** (`useConfirmActions`, `useThemeStyles`) return values derived from context but contain no complex logic themselves — their correctness is verified by testing the context providers.
