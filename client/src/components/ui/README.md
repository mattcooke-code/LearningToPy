# UI Components

Shared presentational components used across the application. No business logic — receive props, render UI. Some consume context (ThemeContext) for styling consistency.

## Component Index

| Component                   | Props / Features                                                                                                                                                                        | Used In                              |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| `BackToTopButton`           | Appears after scrolling 600px. Theme-coloured via `shouldUseThemeColor`. Default: Python blue.                                                                                          | Multiple pages                       |
| `BaseModal`                 | Standardised modal shell: focus trapping, open/close, overlay, footer, size classes. Uses `createPortal()`.                                                                             | All modals in `/modals`              |
| `CodeThemeToggle`           | Toggles code snippet theme (light/dark) independently of site theme. Uses `useTheme`.                                                                                                   | Lesson pages                         |
| `ErrorState`                | Standardised error display with message and optional action. Default: "Back to Modules" link.                                                                                           | Pages, data-loading components       |
| `LeaderboardRow`            | Formats a single leaderboard entry: ranking (medal emojis), username (privacy-aware), XP/level.                                                                                         | `LeaderboardModal`                   |
| `LoadingState`              | Standardised loading display using `Spinner` + message text.                                                                                                                            | Pages, data-loading components       |
| `MarkdownRenderer`          | Renders lesson content from Markdown: code blocks, tables, containers, syntax highlighting.                                                                                             | `LessonContent`, lesson pages        |
| `Pagination`                | Previous / Next page navigation buttons.                                                                                                                                                | Content lists, admin tables          |
| `ProgressGauge`             | SVG pressure-gauge visualisation. Needle moves red → yellow → green as course completion increases. Percentage shown in centre. Theme colours are derived from this component's design. | `Dashboard`                          |
| `PythonSyntaxHighlighter`   | Syntax-highlights inline Python code snippets and terminal output.                                                                                                                      | `LessonContent`, `TerminalComponent` |
| `RefreshButton`             | Reusable refresh icon button. Extracted to DRY up repeated `RefreshCw` + onClick patterns.                                                                                              | Admin pages, data panels             |
| `SearchableSelect`          | Dropdown with built-in search/filter. Addresses long option lists. Responsive.                                                                                                          | Admin forms, settings                |
| `SegmentedLevelProgressBar` | Multi-segment progress bar for in-module progress. Each segment fills with a theme colour as lessons are completed. Shows module info alongside.                                        | `Dashboard`, `Profile`               |
| `Spinner`                   | Loading spinner with configurable size classes.                                                                                                                                         | `LoadingState`, multiple components  |
| `ThemeToggle`               | Light/dark mode toggle button (Sun/Moon icons). Uses `useTheme`.                                                                                                                        | `Navbar`, settings                   |

## Non-exported components

| File                  | Reason                                                                                    |
| --------------------- | ----------------------------------------------------------------------------------------- |
| `DarkModeWrapper.jsx` | Not exported from barrel, not imported anywhere. Appears unused — candidate for deletion. |

## Design Patterns

- **Standardised states:** `ErrorState` and `LoadingState` prevent every page from duplicating conditional rendering logic. Every data-loading component should use these instead of inline spinners and error messages.
- **Modal foundation:** `BaseModal` is the single source of truth for modal behaviour (focus, overlay, portal, sizing). All modals in `/modals` build on it.
- **Theme awareness:** Several components (`ThemeToggle`, `CodeThemeToggle`, `BackToTopButton`, `SegmentedLevelProgressBar`) read from ThemeContext for consistent colour application.
- **DRY extractions:** `RefreshButton` and `SearchableSelect` were created when the same UI patterns appeared in multiple places.

## Dependencies

BaseModal ──────────── react-dom (createPortal)
CodeThemeToggle ─────► context (useTheme)
ThemeToggle ─────────► context (useTheme), lucide-react
BackToTopButton ─────► utils (shouldUseThemeColor)
LoadingState ────────► Spinner
LeaderboardRow ────── (no external deps)
MarkdownRenderer ──── react-markdown, remark-gfm
ProgressGauge ─────── (no external deps — pure SVG)
PythonSyntaxHighlighter ► CodeMirror / custom
Spinner ───────────── (no external deps — pure CSS/Tailwind)
Pagination ────────── lucide-react
RefreshButton ─────── lucide-react
SearchableSelect ──── lucide-react
ErrorState ────────── react-router-dom (Link)
SegmentedLevelProgressBar ─► context (useTheme)
