# Seeders

Database seeding scripts. Run via `npm run seed`.

| Script                                            | Purpose                                          |
| ------------------------------------------------- | ------------------------------------------------ |
| `seedDatabase.js`                                 | Orchestrator — calls per-module seeders in order |
| `seedModule0.js`                                  | Tutorial module                                  |
| `seedModules1-5.js` through `seedModules16-20.js` | Curriculum modules                               |
| `seedAllModules.js`                               | Seeds all modules at once                        |
| `updateCurriculum.js`                             | Updates existing modules without dropping data   |
| `fileHelpers.js`                                  | Shared file-reading utilities for seeders        |
