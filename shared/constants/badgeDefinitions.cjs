// /shared/badgeDefinitions.js

/**
 * BADGE SYSTEM OVERVIEW
 * ─────────────────────────────────────────────────────────────
 * MODULE BADGES (21)      One per module: M0–M20
 * PHASE BADGES (3)        Awarded at M9, M15, M20 (alongside module badge)
 * MILESTONE BADGES (2)    50% course completion, full course completion
 * ENGAGEMENT BADGES (2)   First quiz completion, first coding challenge
 * CLEAN SWEEP BADGES (21) All lessons completed in a module: M0–M20
 * LEADERBOARD BADGES (2)  Reach #1, reach top 10
 * ─────────────────────────────────────────────────────────────
 * TOTAL: ~51 badges
 *
 * TIERS
 * null     — M0, engagement, leaderboard, milestone badges
 * bronze   — Phase 1 module badges (M1–M9) + Phase 1 clean sweeps
 * silver   — Phase 2 module badges (M10–M15) + Phase 2 clean sweeps
 * gold     — Phase 3 module badges (M16–M20) + Phase 3 clean sweeps
 * platinum — Phase completion badges + course completion badge
 *
 * PHASES
 * 1 — M1–M9   (Fundamentals)
 * 2 — M10–M15 (Intermediate)
 * 3 — M16–M20 (Advanced)
 * null — M0, cross-module badges
 */

const BADGE_DEFINITIONS_CORE = [
  // ─── M0: TUTORIAL ───────────────────────────────────────────
  {
    id: "orientation-complete",
    name: "Orientated",
    description:
      "Completed the interactive tutorial (M0). Optional but recommended — you now know where everything lives.",
    category: "module",
    module: 0,
    phase: null,
    tier: null,
    image: "/badges/other/M0_Orientated.png",
  },
  // ─── PHASE 1: FUNDAMENTALS (M1–M9) ──────────────────────────

  {
    id: "module-1-complete",
    name: "Python Starter",
    description:
      "Completed M1: Python Fundamentals. Variables, data types, and your first working programs.",
    category: "module",
    module: 1,
    phase: 1,
    tier: "bronze",
    image: "/badges/bronze/M1_Python_Starter.png",
  },
  {
    id: "module-2-complete",
    name: "Data Collector",
    description:
      "Completed M2: Data Structures — Lists & Tuples. You can now store, slice, and manage ordered data.",
    category: "module",
    module: 2,
    phase: 1,
    tier: "bronze",
    image: "/badges/bronze/M2_Data_Collector.png",
  },
  {
    id: "module-3-complete",
    name: "Logic Leaper",
    description:
      "Completed M3: Control Flow — Conditionals. Your code can now make decisions.",
    category: "module",
    module: 3,
    phase: 1,
    tier: "bronze",
    image: "/badges/bronze/M3_Logic_Leaper.png",
  },
  {
    id: "module-4-complete",
    name: "Loop Commander",
    description:
      "Completed M4: Iteration. For loops, while loops, and flow control — all conquered.",
    category: "module",
    module: 4,
    phase: 1,
    tier: "bronze",
    image: "/badges/bronze/M4_Loop_Commander.png",
  },
  {
    id: "module-5-complete",
    name: "Key Master",
    description:
      "Completed M5: Data Structures — Dictionaries & Sets. You can now work with unordered, keyed data.",
    category: "module",
    module: 5,
    phase: 1,
    tier: "bronze",
    image: "/badges/bronze/M5_Key_Master.png",
  },
  {
    id: "module-6-complete",
    name: "Function Flinger",
    description:
      "Completed M6: Functions. Reusable, scoped, parameterised — your code just levelled up.",
    category: "module",
    module: 6,
    phase: 1,
    tier: "bronze",
    image: "/badges/bronze/M6_Function_Flinger.png",
  },
  {
    id: "module-7-complete",
    name: "File Handler",
    description:
      "Completed M7: File I/O Basics. Reading, writing, and processing files like a pro.",
    category: "module",
    module: 7,
    phase: 1,
    tier: "bronze",
    image: "/badges/bronze/M7_File_Handler.png",
  },
  {
    id: "module-8-complete",
    name: "Exception Handler",
    description:
      "Completed M8: Error Handling. Your programs no longer crash — they recover.",
    category: "module",
    module: 8,
    phase: 1,
    tier: "bronze",
    image: "/badges/bronze/M8_Exception_Handler.png",
  },
  {
    id: "module-9-complete",
    name: "Comprehension Champion",
    description:
      "Completed M9: List/Dict Comprehensions. Elegant, Pythonic one-liners are now your native tongue.",
    category: "module",
    module: 9,
    phase: 1,
    tier: "bronze",
    image: "/badges/bronze/M9_Comprehension_Champion.png",
  },
  {
    id: "phase-1-complete",
    name: "Fundamentalist",
    description:
      "Completed Phase 1 — all nine foundational Python modules. You have the building blocks. Now let's build something.",
    category: "phase",
    module: 9,
    phase: 1,
    tier: "platinum",
    image: "/badges/other/Phase_1.png",
  },

  // ─── PHASE 2: INTERMEDIATE (M10–M15) ────────────────────────

  {
    id: "module-10-complete",
    name: "Code Blacksmith",
    description:
      "Completed M10: Advanced Functions. Lambdas, decorators, *args, **kwargs — forged and ready.",
    category: "module",
    module: 10,
    phase: 2,
    tier: "silver",
    image: "/badges/silver/M10_Code_Blacksmith.png",
  },
  {
    id: "module-11-complete",
    name: "Architect",
    description:
      "Completed M11: OOP I. Classes, objects, encapsulation — you are now thinking in blueprints.",
    category: "module",
    module: 11,
    phase: 2,
    tier: "silver",
    image: "/badges/silver/M11_Architect.png",
  },
  {
    id: "module-12-complete",
    name: "Master Builder",
    description:
      "Completed M12: OOP II — Inheritance & Polymorphism. Your class hierarchies are solid.",
    category: "module",
    module: 12,
    phase: 2,
    tier: "silver",
    image: "/badges/silver/M12_Master_Builder.png",
  },
  {
    id: "module-13-complete",
    name: "Time Traveler",
    description:
      "Completed M13: Working with Dates & Time. Timezones, timedeltas, and datetime objects — all tamed.",
    category: "module",
    module: 13,
    phase: 2,
    tier: "silver",
    image: "/badges/silver/M13_Time_Traveller.png",
  },
  {
    id: "module-14-complete",
    name: "Regex Ruler",
    description:
      "Completed M14: Regular Expressions. Pattern matching, capturing groups, substitution — mastered.",
    category: "module",
    module: 14,
    phase: 2,
    tier: "silver",
    image: "/badges/silver/M14_Regex_Ruler.png",
  },
  {
    id: "module-15-complete",
    name: "Tool Maker",
    description:
      "Completed M15: Professional Python Development. Virtual environments, pip, debugging, packaging — you work like a real developer now.",
    category: "module",
    module: 15,
    phase: 2,
    tier: "silver",
    image: "/badges/silver/M15_Tool_Maker.png",
  },
  {
    id: "phase-2-complete",
    name: "Pythonista",
    description:
      "Completed Phase 2 — six intermediate modules covering advanced functions, OOP, and professional tooling. You are no longer a beginner.",
    category: "phase",
    module: 15,
    phase: 2,
    tier: "platinum",
    image: "/badges/other/Phase_2.png",
  },

  // ─── PHASE 3: ADVANCED APPLICATIONS (M16–M20) ───────────────

  {
    id: "module-16-complete",
    name: "Web Slinger",
    description:
      "Completed M16: HTTP Requests & APIs. You can now talk to the internet.",
    category: "module",
    module: 16,
    phase: 3,
    tier: "gold",
    image: "/badges/gold/M16_Web_Slinger.png",
  },
  {
    id: "module-17-complete",
    name: "Data Dynamo",
    description:
      "Completed M17: Introduction to Data Science. NumPy arrays, Pandas DataFrames — your data obeys you now.",
    category: "module",
    module: 17,
    phase: 3,
    tier: "gold",
    image: "/badges/gold/M17_Data_Dynamo.png",
  },
  {
    id: "module-18-complete",
    name: "Web Crawler",
    description:
      "Completed M18: Web Scraping Basics. HTML, BeautifulSoup, and ethical extraction — the web is your data source.",
    category: "module",
    module: 18,
    phase: 3,
    tier: "gold",
    image: "/badges/gold/M18_Web_Crawler.png",
  },
  {
    id: "module-19-complete",
    name: "Database Whisperer",
    description:
      "Completed M19: Database Interaction. CRUD operations, parameterised queries, SQLite — your data now persists.",
    category: "module",
    module: 19,
    phase: 3,
    tier: "gold",
    image: "/badges/gold/M19_Database_Whisperer.png",
  },
  {
    id: "module-20-complete",
    name: "Python Master",
    description:
      "Completed M20: Final Capstone Project. You built something real. This is what it was all for.",
    category: "module",
    module: 20,
    phase: 3,
    tier: "platinum",
    image: "/badges/platinum/M20_Python_Master.png",
  },
  {
    id: "phase-3-complete",
    name: "The Graduate",
    description:
      "Completed Phase 3 — five advanced modules covering APIs, data science, web scraping, databases, and a capstone project. You did it.",
    category: "phase",
    module: 20,
    phase: 3,
    tier: "platinum",
    image: "/badges/other/Phase_3.png",
  },

  // ─── MILESTONE BADGES ────────────────────────────────────────

  {
    id: "halfway-there",
    name: "Halfway There",
    description:
      "Reached 50% course completion. The summit is just as far away as where you started — keep going.",
    category: "milestone",
    module: null,
    phase: null,
    tier: null,
    image: "/badges/other/Halfway.png",
  },

  {
    id: "course-complete",
    name: "Full Stack Pythonista",
    description:
      "Completed the entire Python curriculum — all 20 modules, all three phases. You are a Python developer.",
    category: "milestone",
    module: null,
    phase: null,
    tier: "platinum",
    image: "/badges/other/100.png",
  },

  // ─── ENGAGEMENT BADGES ───────────────────────────────────────

  {
    id: "first-quiz",
    name: "Quiz Taker",
    description:
      "Completed your first module quiz. Theory into practice — that's how it works.",
    category: "engagement",
    module: null,
    phase: null,
    tier: null,
    image: "/badges/other/Quiz_Taker.png",
  },

  {
    id: "first-challenge",
    name: "Code Cracker",
    description:
      "Completed your first coding challenge. You didn't just read about Python — you wrote it.",
    category: "engagement",
    module: null,
    phase: null,
    tier: null,
    image: "/badges/other/Code_Cracker.png",
  },

  // ─── LEADERBOARD BADGES ──────────────────────────────────────

  {
    id: "reached-the-summit",
    name: "Reached the Summit",
    description:
      "Topped the leaderboard. At the time of earning this badge, no one had more XP than you.",
    category: "leaderboard",
    module: null,
    phase: null,
    tier: null,
    image: "/badges/other/Summit.png",
  },

  {
    id: "top-ten",
    name: "Top Ten Club",
    description:
      "Reached the top 10 on the leaderboard. An achievement earned, not given — and it stays yours.",
    category: "leaderboard",
    module: null,
    phase: null,
    tier: null,
    image: "/badges/other/Top_Ten.png",
  },
];

module.exports = { BADGE_DEFINITIONS_CORE };
