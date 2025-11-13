export const BADGE_LIBRARY = [
  {
    id: "python-starter",
    name: "Python Starter",
    description: "Completed the very first introductory lesson.",
    category: "Curriculum",
    requirement: 'Finish the "Hello World" module.',
    image: "/Python_Starter.png",
  },
  {
    id: "fundamentalist",
    name: "Fundamentalist",
    description:
      "Mastered the basics of variables, data types, and operators.",
    category: "Curriculum",
    requirement: "Complete the first 5 core modules.",
    image: "/Fundamentalist.png",
  },
  {
    id: "logic-leaper",
    name: "Logic Leaper",
    description: "Demonstrated proficiency with conditional statements.",
    category: "Curriculum",
    requirement: 'Pass the "If/Else Challenge Set."',
    image: "/Logic_Leaper.png",
  },
  {
    id: "loop-commander",
    name: "Loop Commander",
    description: "Conquered all lessons and challenges on loops.",
    category: "Curriculum",
    requirement: 'Complete the dedicated "Iteration" module.',
    image: "/Loop_Commander.png",
  },
  {
    id: "function-flinger",
    name: "Function Flinger",
    description: "Successfully defined and used functions with parameters.",
    category: "Curriculum",
    requirement:
      'Complete the "Functions" module and solve 10 function-based problems.',
    image: "/Function_Flinger.png",
  },
  {
    id: "data-structure-specialist",
    name: "Data Structure Specialist",
    description:
      "Demonstrated mastery of lists, dictionaries, sets, and tuples.",
    category: "Curriculum",
    requirement: "Score 90%+ on the Data Structures final exam.",
  },
  {
    id: "full-stack-pythonista",
    name: "Full Stack Pythonista",
    description: "Completed the entire foundational curriculum.",
    category: "Curriculum",
    requirement: "Finish all core learning paths (Level 1-10).",
  },
  {
    id: "lightning-coder",
    name: "Lightning Coder",
    description: "Solved a challenge in under 30 seconds.",
    category: "Performance",
    requirement: "Complete any challenge in a minimal amount of time.",
  },
  {
    id: "one-shot-wonder",
    name: "One-Shot Wonder",
    description:
      "Solved a medium or hard challenge on the very first submission attempt.",
    category: "Performance",
    requirement: "Complete 5 challenges without hints or retries.",
  },
  {
    id: "turbo-learner",
    name: "Turbo Learner",
    description: "Completed three learning modules in a single day.",
    category: "Performance",
    requirement: "Finish 3 modules within a 24 hour period.",
  },
  {
    id: "efficiency-expert",
    name: "Efficiency Expert",
    description:
      "Submitted a solution that uses the fewest lines of code compared to the community average.",
    category: "Performance",
    requirement: "Solve 10 problems with optimal code length/complexity.",
  },
  {
    id: "first-day",
    name: "First Day",
    description: "Successfully completed a challenge on the day of signup.",
    category: "Habit",
    requirement: "Finish one task on day one.",
  },
  {
    id: "week-warrior",
    name: "Week Warrior",
    description: "Maintained a learning streak for 7 consecutive days.",
    category: "Habit",
    requirement:
      "Log in and complete at least one task for 7 days in a row.",
  },
  {
    id: "monthly-momentum",
    name: "Monthly Momentum",
    description: "Maintained a learning streak for 30 consecutive days.",
    category: "Habit",
    requirement:
      "Log in and complete at least one task for 30 days in a row.",
  },
  {
    id: "dedicated-debugger",
    name: "Dedicated Debugger",
    description: "Consistently learned for 100 days.",
    category: "Habit",
    requirement: "Reach a 100-day learning streak.",
  },
  {
    id: "oop-genius",
    name: "OOP Genius",
    description:
      "Mastered Object-Oriented Programming (Classes, Inheritance).",
    category: "Advanced",
    requirement: "Pass the advanced OOP module exam.",
  },
  {
    id: "api-explorer",
    name: "API Explorer",
    description:
      "Successfully completed challenges involving external API calls.",
    category: "Advanced",
    requirement: 'Complete the "Requests and APIs" learning path.',
  },
  {
    id: "file-handler",
    name: "File Handler",
    description:
      "Demonstrated skill in reading and writing to files (CSV, TXT).",
    category: "Advanced",
    requirement: "Solve 5 challenges related to file I/O.",
  },
  {
    id: "regex-ruler",
    name: "Regex Ruler",
    description:
      "Used Regular Expressions effectively to solve a complex parsing problem.",
    category: "Advanced",
    requirement: 'Complete the dedicated module on "Regular Expressions."',
  },
  {
    id: "bug-hunter",
    name: "Bug Hunter",
    description:
      "Reported a valid bug or typo in a lesson/challenge description.",
    category: "Community",
    requirement: "Submit 3 verified bug reports.",
  },
  {
    id: "helpful-hero",
    name: "Helpful Hero",
    description: "Provided a high-quality explanation or hint to another user.",
    category: "Community",
    requirement: 'Receive 10 "Helpful" upvotes on community comments.',
  },
  {
    id: "inviter",
    name: "Inviter",
    description:
      "Successfully referred a friend who signed up and completed their first module.",
    category: "Community",
    requirement: "Refer one new, active user to the platform.",
  },
  {
    id: "beta-tester",
    name: "Beta Tester",
    description:
      "Participated in testing a new feature or module before release.",
    category: "Community",
    requirement: "Complete a new module during its beta phase.",
  },
];

export const BADGES_BY_ID = BADGE_LIBRARY.reduce((acc, badge) => {
  acc[badge.id] = badge;
  return acc;
}, {});

