import React from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  CheckCircle,
  ArrowRight,
  Code,
  Terminal,
  Layers,
  Cpu,
  Globe,
  Star,
  ShieldCheck,
  Database,
  Server,
  Brain,
  Rocket,
  Award,
  ChevronRight,
} from "lucide-react";
import { BackToTopButton } from "../components/ui";
import { useTheme } from "../context";

// Complete curriculum data with all 20 modules
const CURRICULUM_DATA = {
  phase1: {
    title: "Phase 1: Python Fundamentals",
    description:
      "Build a solid foundation in Python programming from the ground up.",
    modules: [
      {
        id: "m1",
        title: "Python Essentials",
        description:
          "Master the syntax that makes Python the world's most popular language.",
        icon: <Terminal className="w-6 h-6" />,
        highlights: [
          "Variables & Constants",
          "Dynamic Typing",
          "Input/Output Basics",
        ],
        duration: "2-3 hours",
      },
      {
        id: "m2",
        title: "Data Structures I",
        description: "Organize your data with Lists and Tuples.",
        icon: <Layers className="w-6 h-6" />,
        highlights: [
          "List Operations",
          "Indexing & Slicing",
          "Tuple Immutability",
        ],
        duration: "2-3 hours",
      },
      {
        id: "m3",
        title: "Control Flow",
        description: "Teach your programs how to think and make decisions.",
        icon: <Code className="w-6 h-6" />,
        highlights: ["If-Else Logic", "While & For Loops", "Break & Continue"],
        duration: "2-3 hours",
      },
      {
        id: "m4",
        title: "Iteration & Loops",
        description: "Automate repetitive tasks with powerful loop structures.",
        icon: <Code className="w-6 h-6" />,
        highlights: ["Range Functions", "Nested Loops", "Loop Optimization"],
        duration: "2-3 hours",
      },
      {
        id: "m5",
        title: "Data Structures II",
        description:
          "Master Dictionaries and Sets for efficient data management.",
        icon: <Database className="w-6 h-6" />,
        highlights: [
          "Key-Value Mapping",
          "Set Operations",
          "Dictionary Methods",
        ],
        duration: "2-3 hours",
      },
      {
        id: "m6",
        title: "Functions & Modular Code",
        description: "Write reusable, clean, and professional code.",
        icon: <Cpu className="w-6 h-6" />,
        highlights: [
          "Scope & Lifetime",
          "Lambda Expressions",
          "Importing Libraries",
        ],
        duration: "2-3 hours",
      },
      {
        id: "m7",
        title: "File I/O",
        description: "Read from and write to files like a pro.",
        icon: <Server className="w-6 h-6" />,
        highlights: [
          "Reading/Writing Files",
          "Context Managers",
          "CSV Processing",
        ],
        duration: "2-3 hours",
      },
      {
        id: "m8",
        title: "Error Handling",
        description: "Build robust applications that handle errors gracefully.",
        icon: <ShieldCheck className="w-6 h-6" />,
        highlights: [
          "Try/Except Blocks",
          "Custom Exceptions",
          "Debugging Techniques",
        ],
        duration: "2-3 hours",
      },
      {
        id: "m9",
        title: "Comprehensions",
        description:
          "Write elegant one-liners with list and dict comprehensions.",
        icon: <Brain className="w-6 h-6" />,
        highlights: [
          "List Comprehensions",
          "Dict Comprehensions",
          "Conditional Logic",
        ],
        duration: "2-3 hours",
      },
    ],
  },
  phase2: {
    title: "Phase 2: Intermediate Python",
    description: "Level up your skills with advanced concepts and OOP.",
    modules: [
      {
        id: "m10",
        title: "Advanced Functions",
        description:
          "Master decorators, *args, **kwargs, and functional programming.",
        icon: <Code className="w-6 h-6" />,
        highlights: ["Decorators", "Closures", "Functional Tools"],
        duration: "3-4 hours",
      },
      {
        id: "m11",
        title: "Object-Oriented Programming I",
        description: "Model real-world objects using classes and objects.",
        icon: <Globe className="w-6 h-6" />,
        highlights: ["Classes & Objects", "Instance Methods", "Encapsulation"],
        duration: "3-4 hours",
      },
      {
        id: "m12",
        title: "Object-Oriented Programming II",
        description: "Advanced OOP with inheritance and polymorphism.",
        icon: <Globe className="w-6 h-6" />,
        highlights: ["Inheritance", "Polymorphism", "Abstract Base Classes"],
        duration: "3-4 hours",
      },
      {
        id: "m13",
        title: "Working with Dates & Time",
        description: "Handle datetime operations like a pro.",
        icon: <Server className="w-6 h-6" />,
        highlights: ["datetime Module", "Timezone Handling", "Date Arithmetic"],
        duration: "2-3 hours",
      },
      {
        id: "m14",
        title: "Regular Expressions",
        description: "Master pattern matching and text processing.",
        icon: <Code className="w-6 h-6" />,
        highlights: ["Pattern Matching", "Capturing Groups", "Regex Functions"],
        duration: "3-4 hours",
      },
      {
        id: "m15",
        title: "Professional Python Tools",
        description: "Learn industry-standard tools for Python development.",
        icon: <Rocket className="w-6 h-6" />,
        highlights: ["Virtual Environments", "Package Management", "Debugging"],
        duration: "3-4 hours",
      },
    ],
  },
  phase3: {
    title: "Phase 3: Advanced Applications",
    description: "Build real-world applications with Python.",
    modules: [
      {
        id: "m16",
        title: "HTTP & APIs",
        description: "Connect your Python apps to the web.",
        icon: <Globe className="w-6 h-6" />,
        highlights: ["Requests Library", "JSON Handling", "API Integration"],
        duration: "3-4 hours",
      },
      {
        id: "m17",
        title: "Data Science Fundamentals",
        description: "Introduction to NumPy and Pandas.",
        icon: <Database className="w-6 h-6" />,
        highlights: ["NumPy Arrays", "Pandas DataFrames", "Data Analysis"],
        duration: "4-5 hours",
      },
      {
        id: "m18",
        title: "Web Scraping",
        description: "Extract data from websites using BeautifulSoup.",
        icon: <Globe className="w-6 h-6" />,
        highlights: ["HTML Parsing", "CSS Selectors", "Data Extraction"],
        duration: "3-4 hours",
      },
      {
        id: "m19",
        title: "Database Integration",
        description: "Work with SQLite and other databases.",
        icon: <Database className="w-6 h-6" />,
        highlights: ["SQL Queries", "CRUD Operations", "Connection Management"],
        duration: "3-4 hours",
      },
      {
        id: "m20",
        title: "Capstone Project",
        description: "Build your own Python project from scratch!",
        icon: <Star className="w-6 h-6" />,
        highlights: ["Project Planning", "Implementation", "Portfolio Piece"],
        duration: "6-8 hours",
      },
    ],
  },
};

const PhaseCard = ({ phase, modules, index }) => {
  return (
    <div className="mb-16 last:mb-0 px-2 md:px-0">
      {" "}
      {/* Added mobile side padding */}
      <div className="text-center mb-8 px-4">
        <div className="inline-block px-4 py-1 rounded-full bg-python-blue/10 text-python-blue dark:bg-python-yellow/10 dark:text-python-yellow text-xs font-bold uppercase tracking-widest mb-4">
          Phase {index + 1}
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          {phase.title}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-2">
          {phase.description}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module, idx) => (
          <div
            key={module.id}
            className="group relative bg-white dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700/50 rounded-2xl p-6 hover:border-python-blue dark:hover:border-python-yellow transition-all duration-300 shadow-sm hover:shadow-lg"
          >
            <div className="absolute top-4 right-4 text-4xl font-black text-gray-300 dark:text-gray-500 group-hover:text-python-blue dark:group-hover:text-python-yellow transition-colors">
              {String(idx + 1).padStart(2, "0")}
            </div>

            <div className="inline-flex items-center justify-center p-3 bg-python-blue/10 dark:bg-python-yellow/10 rounded-xl text-python-blue dark:text-python-yellow mb-4">
              {module.icon}
            </div>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-python-blue dark:group-hover:text-python-yellow transition-colors">
              {module.title}
            </h3>

            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 leading-relaxed">
              {module.description}
            </p>

            <div className="mb-4">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-500 mb-2">
                What you'll learn:
              </p>
              <ul className="space-y-1.5">
                {module.highlights.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center text-xs text-gray-600 dark:text-gray-400"
                  >
                    <CheckCircle
                      size={12}
                      className="mr-2 text-python-blue dark:text-python-yellow flex-shrink-0"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
              <span className="text-xs text-gray-500 dark:text-gray-500">
                ⏱️ {module.duration}
              </span>
              <Link
                to="/register"
                className="inline-flex items-center text-sm font-medium text-python-blue dark:text-python-yellow hover:translate-x-1 transition-transform"
              >
                Enroll <ChevronRight size={16} className="ml-1" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Curriculum = () => {
  const { isDarkMode } = useTheme();

  return (
    <div className="min-h-screen bg-gray-200 dark:bg-gray-900 pt-24 pb-12">
      <div className="container mx-auto px-8 md:px-10">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="inline-block px-4 py-1 rounded-full bg-python-blue/10 text-python-blue dark:text-python-yellow text-sm font-semibold mb-6">
            20 Comprehensive Modules
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight text-gray-900 dark:text-white">
            Master Python{" "}
            <span className="text-python-blue dark:text-python-yellow">
              Step-by-Step
            </span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed max-w-2xl mx-auto">
            From your first{" "}
            <code className="bg-gray-100 dark:bg-gray-800 text-python-blue dark:text-python-yellow px-2 py-0.5 rounded font-extrabold text-sm">
              print()
            </code>{" "}
            statement to building production-ready applications. Our structured
            path keeps you motivated and coding every day.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-16">
          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-3xl font-bold text-python-blue dark:text-python-yellow mb-1">
              20
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Interactive Modules
            </div>
          </div>
          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-3xl font-bold text-python-blue dark:text-python-yellow mb-1">
              100+
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Coding Exercises
            </div>
          </div>
          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-3xl font-bold text-python-blue dark:text-python-yellow mb-1">
              15+
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Hours of Content
            </div>
          </div>
          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-3xl font-bold text-python-blue dark:text-python-yellow mb-1">
              1
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Capstone Project
            </div>
          </div>
        </div>

        {/* Curriculum Content */}
        <div className="max-w-6xl mx-auto">
          <PhaseCard
            phase={CURRICULUM_DATA.phase1}
            modules={CURRICULUM_DATA.phase1.modules}
            index={0}
          />
          <PhaseCard
            phase={CURRICULUM_DATA.phase2}
            modules={CURRICULUM_DATA.phase2.modules}
            index={1}
          />
          <PhaseCard
            phase={CURRICULUM_DATA.phase3}
            modules={CURRICULUM_DATA.phase3.modules}
            index={2}
          />
        </div>

        {/* Capstone Section - Enhanced for better visibility */}
        <section className="mt-20 mb-16">
          <div
            className={`relative rounded-3xl p-6 md:p-12 lg:p-16 overflow-hidden border border-gray-200 dark:border-gray-700 shadow-xl ${
              isDarkMode
                ? "bg-gradient-to-r from-python-blue/20 to-python-yellow/20"
                : "bg-gradient-to-r from-python-blue to-python-yellow"
            }`}
          >
            {/* Light mode specific background */}
            {!isDarkMode && (
              <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px]" />
            )}

            <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div
                  className={`inline-block px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-6 ${
                    isDarkMode
                      ? "bg-python-yellow/20 text-python-yellow"
                      : "bg-python-light text-python-dark"
                  }`}
                >
                  Final Milestone
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
                  The Capstone Project
                </h2>
                <p className="text-gray-900 dark:text-gray-400 mb-8 leading-relaxed">
                  Put everything you've learned into practice by building a
                  project of your own choosing. This portfolio-ready piece will
                  showcase your Python mastery to future employers.
                </p>

                <ul className="space-y-4 mb-8">
                  {[
                    "Design and build a multi-module Python application",
                    "Integrate with external APIs or databases",
                    "Apply OOP principles to a real-world problem",
                    "Create documentation and tests for your code",
                    "Get your project reviewed by the community",
                  ].map((feat, i) => (
                    <li
                      key={i}
                      className="flex items-start text-gray-900 dark:text-gray-300"
                    >
                      <Award className="w-5 h-5 text-python-yellow mr-3 flex-shrink-0 mt-0.5" />
                      {feat}
                    </li>
                  ))}
                </ul>

                <Link
                  to="/register"
                  className="inline-flex items-center px-6 py-3 bg-python-blue hover:bg-python-dark dark:bg-python-yellow dark:hover:bg-python-light text-white dark:text-gray-900 font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>

              {/* Code Preview */}
              <div className="relative">
                <div className="bg-gray-900 dark:bg-black/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 font-mono text-sm shadow-2xl overflow-x-auto">
                  <div className="flex space-x-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-500/60" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                    <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  </div>
                  <p className="text-python-blue dark:text-python-yellow mb-2">
                    # Capstone Project
                  </p>
                  <p className="text-purple-400">class</p>{" "}
                  <p className="text-python-yellow inline">
                    MyCapstoneProject:
                  </p>
                  <br />
                  <p className="text-gray-500 ml-4">
                    """Your unique solution to a real problem"""
                  </p>
                  <p className="text-blue-400 ml-4">def</p>{" "}
                  <p className="text-white inline">__init__(self):</p>
                  <br />
                  <p className="text-white ml-8">
                    self.status ={" "}
                    <span className="text-green-400">"Mastered"</span>
                  </p>
                  <p className="text-blue-400 ml-4">def</p>{" "}
                  <p className="text-white inline">run(self):</p>
                  <br />
                  <p className="text-white ml-8">
                    <span className="text-python-yellow">print</span>(
                    <span className="text-green-400">"Project complete!"</span>)
                  </p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-python-blue/30 to-python-yellow/30 blur-2xl -z-10" />
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <div className="rounded-3xl bg-gradient-to-r from-python-blue to-python-dark dark:from-python-blue dark:to-python-dark p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Ready to start your Python journey?
          </h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            Join thousands of students who have already mastered Python with our
            interactive platform.
          </p>
          <Link
            to="/register"
            className="inline-block px-8 py-4 bg-python-light text-python-blue font-bold rounded-xl hover:shadow-xl transition-all transform hover:-translate-y-1"
          >
            Start Learning for Free
          </Link>
        </div>
      </div>
      <BackToTopButton />
    </div>
  );
};

export default Curriculum;
