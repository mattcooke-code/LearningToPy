# 🏆 Phase 3 Final Project: Command Line Utility

This final project challenges you to integrate key concepts from the entire course, particularly the advanced topics of Phase 3 (Modules 16-19), into a single, cohesive, and functional application.

Your deliverable will be a **Command Line Interface (CLI) Utility** built in Python.

## 1. Project Requirements

Your CLI utility must fulfill the following mandatory requirements:

| Module Integration       | Requirement                                                                                                                                    | Tooling Focus               |
| :----------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------- |
| **I/O & CLI**            | Must use the built-in **`argparse`** module to accept command-line arguments (e.g., `python cli.py --fetch-data` or `python cli.py add-task`). | `argparse`, `sys`           |
| **Module 16/18 (Web)**   | Must interact with an external source, either a **public API** (using `requests`) or a **website** (using `requests` and `BeautifulSoup`).     | `requests`, `BeautifulSoup` |
| **Module 19 (Database)** | Must use **SQLite** (`sqlite3`) to persist structured data. This should involve at least one `CREATE TABLE`, `INSERT`, and `SELECT` operation. | `sqlite3`, SQL              |
| **Module 17 (Data)**     | Must process or format the fetched data using basic **Pandas** structures (Series or DataFrame) before displaying or saving it.                | `pandas`                    |
| **General**              | Code must be modular (split into logical functions/files) and include proper error handling (`try/except`).                                    | Functions, `try/except`     |

## 2. Suggested Project Ideas

You may choose any project idea, but here are three excellent options that naturally integrate the required elements:

### Option 1: The Simple CLI Dashboard

- **Action:** Fetches the current weather for a city (API) and the top news headlines (Scraping).
- **Database:** Saves the **history** of cities or topics queried.
- **Pandas:** Structures the fetched data (e.g., converts a list of weather forecasts into a DataFrame) before printing a summarized report.

### Option 2: The Command Line Task Manager

- **Action:** Allows users to add, view, update, and delete tasks directly from the terminal.
- **Database:** Stores all tasks (name, priority, due date, status) persistently in an SQLite database.
- **Pandas:** When viewing tasks, it loads the data from the DB into a DataFrame to allow quick sorting by priority or due date before outputting to the console.

### Option 3: Basic URL Monitor

- **Action:** Takes a list of URLs as input (from a file or `argparse`).
- **Web:** Uses `requests` to check the **HTTP status code** of each URL.
- **Database:** Stores the URL, last checked time, and the resulting status code.
- **Pandas:** Generates a report (DataFrame) showing which URLs failed (status code $\ne$ 200).

---

**Evaluation Criteria:** Emphasis will be placed on code quality, modularity, correct usage of `argparse`, and successful integration of the Python-to-SQL interface.
