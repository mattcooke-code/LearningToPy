// /shared/badgeDefinitions.js

export const BADGE_DEFINITIONS_CORE = [
  // --- CURRICULUM BADGES (Organized by Alignment) ---
  {
    id: "python-starter",
    name: "Python Starter",
    description: "Completed the very first introductory lesson.",
    category: "curriculum",
    curriculum_alignment: "Phase 1, Module 1",
  },
  {
    id: "fundamentalist",
    name: "Fundamentalist",
    description:
      "Mastered the basics of variables, data types, and operators (first 5 core modules).",
    category: "curriculum",
    curriculum_alignment: "Phase 1",
  },
  {
    id: "logic-leaper",
    name: "Logic Leaper",
    description:
      "Demonstrated proficiency with conditional statements (80%+ on first quiz attempt).",
    category: "curriculum",
    curriculum_alignment: "Phase 1, Module 3",
  },
  {
    id: "loop-commander",
    name: "Loop Commander",
    description:
      "Conquered all lessons and challenges on loops (100% on End-of-Module Quiz).",
    category: "curriculum",
    curriculum_alignment: "Phase 1, Module 4",
  },
  {
    id: "function-flinger",
    name: "Function Flinger",
    description:
      "Successfully defined and used functions with parameters (Functions module + 10 challenges).",
    category: "curriculum",
    curriculum_alignment: "Phase 1, Module 6",
  },
  {
    id: "data-alchemist",
    name: "Data Alchemist",
    description:
      "Mastered Python's fundamental data structures (90%+ on Phase 1 Quiz).",
    category: "curriculum",
    curriculum_alignment: "Phase 1, Module 2 & 5",
  },
  {
    id: "full-stack-pythonista",
    name: "Full Stack Pythonista",
    description:
      "Completed the entire foundational and intermediate curriculum (Modules 1-15 + 75% on Phase 2 Quiz).",
    category: "curriculum",
    curriculum_alignment: "Phase 1 & 2",
  },
  {
    id: "python-master",
    name: "Python Master",
    description:
      "Completed the entire comprehensive Python curriculum, including all Advanced and Project modules.",
    category: "curriculum",
    curriculum_alignment: "All Phases & Final Project",
  },

  // --- INTERMEDIATE & ADVANCED BADGES ---
  {
    id: "file-handler",
    name: "File Handler",
    description:
      "Solved five challenges involving reading and writing files (CSV, TXT, etc.).",
    category: "intermediate",
    curriculum_alignment: "Phase 1, Module 7",
  },
  {
    id: "code-blacksmith",
    name: "Code Blacksmith",
    description:
      "Demonstrated advanced functional programming skills (used 5 different decorators).",
    category: "intermediate",
    curriculum_alignment: "Phase 2, Module 10",
  },
  {
    id: "architect",
    name: "Architect",
    description:
      "Successfully grasped the core concepts of OOP I (80%+ on first quiz attempt).",
    category: "intermediate",
    curriculum_alignment: "Phase 2, Module 11",
  },
  {
    id: "master-builder",
    name: "Master Builder",
    description: "Mastered advanced OOP concepts (85%+ on first quiz attempt).",
    category: "advanced",
    curriculum_alignment: "Phase 2, Module 12",
  },
  {
    id: "time-traveler",
    name: "Time Traveler",
    description:
      "Proficiently manipulated date and time data (completed 5 datetime challenges).",
    category: "intermediate",
    curriculum_alignment: "Phase 2, Module 13",
  },
  {
    id: "regex-ruler",
    name: "Regex Ruler",
    description:
      "Used regular expressions effectively (completed module and 100% on quiz).",
    category: "advanced",
    curriculum_alignment: "Phase 2, Module 14",
  },
  {
    id: "web-slinger",
    name: "Web Slinger",
    description:
      "Successfully retrieved and handled data from external APIs (from 2 unique APIs).",
    category: "advanced",
    curriculum_alignment: "Phase 3, Module 16",
  },
  {
    id: "data-dynamo",
    name: "Data Dynamo",
    description:
      "Took the first steps into the world of Data Science (ran a Pandas operation).",
    category: "advanced",
    curriculum_alignment: "Phase 3, Module 17",
  },

  // --- PERFORMANCE BADGES ---
  {
    id: "lightning-coder",
    name: "Lightning Coder",
    description: "Solved a challenge in under 30 seconds.",
    category: "performance",
    curriculum_alignment: "General",
  },
  {
    id: "one-shot-wonder",
    name: "One-Shot Wonder",
    description: "Solved five medium/hard challenges on the first attempt.",
    category: "performance",
    curriculum_alignment: "General",
  },
  {
    id: "turbo-learner",
    name: "Turbo Learner",
    description: "Completed three learning modules in a single day.",
    category: "performance",
    curriculum_alignment: "General",
  },
  {
    id: "optimal-prime",
    name: "Optimal Prime",
    description:
      "Submitted 20 solutions that beat the community average for code efficiency/time complexity.",
    category: "performance",
    curriculum_alignment: "General",
  },
  {
    id: "infinity-war",
    name: "Infinite Looper",
    description:
      "Skillfully implemented a controlled infinite loop for a continuous process.",
    category: "performance",
    curriculum_alignment: "General",
  },

  // --- HABIT BADGES ---
  {
    id: "first-day",
    name: "First Day",
    description: "Completed a challenge on the day of signup.",
    category: "habit",
    curriculum_alignment: "General",
  },
  {
    id: "daily-dozen",
    name: "Daily Dozen",
    description: "Maintained a learning streak for 12 consecutive days.",
    category: "habit",
    curriculum_alignment: "General",
  },
  {
    id: "week-warrior",
    name: "Week Warrior",
    description: "Maintained a learning streak for 7 consecutive days.",
    category: "habit",
    curriculum_alignment: "General",
  },
  {
    id: "monthly-momentum",
    name: "Monthly Momentum",
    description: "Maintained a learning streak for 30 consecutive days.",
    category: "habit",
    curriculum_alignment: "General",
  },
  {
    id: "dedicated-debugger",
    name: "Dedicated Debugger",
    description: "Maintained a learning streak for 100 consecutive days.",
    category: "habit",
    curriculum_alignment: "General",
  },

  // --- COMMUNITY BADGES ---
  {
    id: "bug-hunter",
    name: "Bug Hunter",
    description: "Reported three verified bugs or typos in the platform.",
    category: "community",
    curriculum_alignment: "General",
  },
  {
    id: "helpful-hero",
    name: "Helpful Hero",
    description: "Provided explanations that earned 10 helpful upvotes.",
    category: "community",
    curriculum_alignment: "General",
  },
  {
    id: "inviter",
    name: "Inviter",
    description:
      "Successfully referred a friend who completed their first module.",
    category: "community",
    curriculum_alignment: "General",
  },
  {
    id: "beta-tester",
    name: "Beta Tester",
    description:
      "Participated in testing a new feature or module before release.",
    category: "community",
    curriculum_alignment: "General",
  },
];
