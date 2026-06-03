# 🐍 Python Learning Platform

[![Live Site](https://img.shields.io/badge/Live_Demo-Online-brightgreen)](https://learningtopy.com)
[![GitHub Code](https://img.shields.io/badge/Repository-Open_Source-blue)](https://github.com/mattcooke-code/LearningToPy)

An interactive MERN application designed to teach Python through live coding exercises, real-time validation, and a dynamic progress-based theming system.

## ✨ Features

- **Interactive execution:** Real-time Python execution via Pyodide (WASM) directly in the browser.
- **Progressive Theming:** UI colors evolve (Red → Green) as students master modules.
- **Dual Theme Engine:** Site-wide Light/Dark mode with independent "Code Dark" toggles for exercises.
- **Gamification:** XP system, streaks, and module-based level progression (M1-M20).
- **Admin Suite:** Full content management, user moderation, and flagged content resolution.

## 🏗️ Architecture & Logic

### 1. The Dynamic UI Engine & Gamification (Deep-Dive)

The platform goes beyond static dashboards by translating user progress into an immersive visual narrative. Two core systems work in tandem via React State and context:

#### A. The Industrial Pressure Gauge (Custom Course Progress Tracker)

- **The Engineering:** In addition to standard horizontal progress bars and circular components used for tracking granular lesson and module completions, I engineered a custom Graphical User Interface (GUI) element styled like an industrial pressure gauge to display macro course progress.
- **The Implementation:** It uses an inline SVG layout where overall course progress ($0\%$ to $100\%$) is mathematically mapped to rotation degrees. A state-driven needle dynamically swings from right (**Red Zone**: $0\%$ complete) through the middle (**Yellow Zone**: $50\%$) to the left (**Green Zone**: $100\%$).
- **Why it matters:** This demonstrates custom SVG layout management, state-to-transformation math tracking, and a cohesive multi-tiered data visualization strategy without relying on heavy third-party charting libraries.

#### B. State-Driven Progression Theming (`resolveCourseThemeColor`)

- **The Engineering:** The overall platform aesthetic reflects the user's current learning milestone. When a user crosses specific completion thresholds (e.g., mastering 50% of the course), a global context trigger updates the app's visual identity.
- **The Implementation:** The custom utility function `resolveCourseThemeColor(progress)` evaluates user database state and triggers a global CSS variable transition. This updates the navigation bars, custom lesson buttons, and floating "back-to-top" controls seamlessly across a thematic color spectrum.

---

### 2. Thematic Isolation (Dual Theme Engine)

To support long, focused programming sessions, the platform utilizes a "Thematic Island" design layout:

- **Global Theme:** Managed via a global `ThemeContext` tracking standard Light/Dark user preferences.
- **Local Sandboxing:** The `ExerciseComponent` uses an isolated `isCodeDark` state. This guarantees that regardless of whether the user prefers the main site in Light Mode, the IDE/coding workspace enforces a high-contrast dark environment to optimize visual comfort and readability.

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
# Install root dependencies (including backend)
npm install

# Install frontend dependencies
cd client && npm install

# Return to root to run the application
cd ..
```

### 2. Environment Setup

⚠️ Security Note: Never commit `.env` files to version control. Ensure `.env` is added to `.gitignore` before pushing changes.

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

## 🧠 Technical Challenges & Architecture Decisions

### 1. Robust Progress & Prerequisite Validation

- **Context:** The platform relies heavily on linear module progression, dynamic unlocking mechanics, and real-time frontend visualization (e.g., the progressive theme engine and SVG pressure gauge).
- **The Challenge:** Loose data validation or handling raw database ObjectIds incorrectly across asynchronous state updates could lead to breaking UI states, accidental module locking, or bypassed quizzes.
- **The Engineering Solution:** Core business logic functions (`checkPrerequisites`, `hasPassedModuleQuiz`, and `getModuleLessonCompletion`) were isolated into pure, side-effect-free utility services. A robust unit testing suite was built using Vitest to enforce absolute predictability.
