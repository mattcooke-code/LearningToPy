# 🐍 Python Learning Platform

An interactive MERN application designed to teach Python through live coding exercises, real-time validation, and a dynamic progress-based theming system.

## ✨ Features

- **Interactive execution:** Real-time Python execution via Pyodide (WASM) directly in the browser.
- **Progressive Theming:** UI colors evolve (Red → Green) as students master modules.
- **Dual Theme Engine:** Site-wide Light/Dark mode with independent "Code Dark" toggles for exercises.
- **Gamification:** XP system, streaks, and module-based level progression (M1-M20).
- **Admin Suite:** Full content management, user moderation, and flagged content resolution.

## 🏗️ Architecture & Logic

### Theming System

The platform uses a "Thematic Island" approach for learning content.

- **Global Theme:** Managed via `ThemeContext` (Dark/Light).
- **Local Theme:** `ExerciseComponent` uses a specific `isCodeDark` state to ensure the coding environment remains high-contrast, regardless of the site-wide setting.

### Standardized Utilities

To ensure a consistent UI/UX, all components must use the core utility patterns:

- `getErrorMessage(err)`: Standardized extraction of backend/network errors.
- `getSuccessMessage(action, resource)`: Consistent feedback (e.g., "Privacy settings updated successfully").
- `resolveCourseThemeColor(progress)`: Centralized logic for the progression spectrum.

## 🛠️ Tech Stack

| Layer         | Technology                      |
| ------------- | ------------------------------- |
| **Frontend**  | React 18, Vite, Tailwind CSS v4 |
| **Execution** | Pyodide (Python WASM)           |
| **Backend**   | Node.js, Express                |
| **Database**  | MongoDB (Mongoose)              |

## 🚀 Getting Started

### 1. Installation

```bash
npm install
cd client && npm install
```

### 2. Environment Setup

Do not commit .env files.

1. Create a `.env` file in the root.
2. Refer to `.env.example` for the required keys (DATABASE_URL, JWT_SECRET, etc.).

### 3. Development

```bash
# Run client and server concurrently
npm run dev
```

## 📁 Project Structure

/client/src
├── components # Reusable UI (Modals, Toggles, etc.)
├── context # Theme, Auth, and Python execution state
├── hooks # Custom logic (useThemeStyles, etc.)
└── utils # JSDoc-documented helper functions

## 📄 License

This project is licensed under the MIT License.
