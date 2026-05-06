# Data

Static and derived data structures used across the client. These are pure data modules — no side effects, no API calls, no React dependencies.

## File Index

| File               | Exports                         | Responsibility                                                           |
| ------------------ | ------------------------------- | ------------------------------------------------------------------------ |
| `badges.js`        | `BADGE_LIBRARY`, `BADGES_BY_ID` | Badge definitions and ID-keyed lookup map, sourced from shared constants |
| `fileExercises.js` | `getFileCreationCode`           | Exercise-to-file-creation mapping for Pyodide validation setup           |
| `index.js`         | Barrel                          | Re-exports all public exports from the above modules                     |

## Dependency Graph

badges.js ────────────► @shared/constants/badgeDefinitions.cjs
fileExercises.js ───── (no external dependencies)

## Adding New Data

- **New badge?** Edit `@shared/constants/badgeDefinitions.cjs` — the client picks it up automatically via `BADGE_DEFINITIONS_CORE`.
- **New file-based exercise?** Add an entry to the `FILE_CREATION_MAP` array in `fileExercises.js`. No other files need changes.
