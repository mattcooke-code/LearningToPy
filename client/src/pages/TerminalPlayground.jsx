// pages/TerminalPlayground.jsx
import { useState } from "react";
import { Terminal as TerminalIcon, BookOpen, Code } from "lucide-react";
import TerminalComponent from "../components/lesson/TerminalComponent";
import { useTheme } from "../context";

const TerminalPlayground = () => {
  const { isCodeDark } = useTheme();
  const [activeTab, setActiveTab] = useState("terminal");

  const lessons = [
    {
      title: "Basic Output",
      description: "Learn how to print to the terminal",
      examples: [
        'print("Hello World")',
        "print(42)",
        'print("The answer is", 42)',
      ],
    },
    {
      title: "Variables",
      description: "Store and use data",
      examples: [
        'name = "Alice"',
        "age = 30",
        'print(f"My name is {name} and I am {age} years old")',
      ],
    },
    {
      title: "Math Operations",
      description: "Basic arithmetic in Python",
      examples: [
        "5 + 3",
        "10 * 2",
        "15 / 3",
        "2 ** 3", // Exponentiation
      ],
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center space-x-3 mb-6">
        <TerminalIcon size={32} className="text-green-500" />
        <h1 className="text-3xl font-bold">Python Playground</h1>
      </div>

      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Experiment with Python code in a safe, interactive environment. Try the
        examples below or write your own code!
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Lessons */}
        <div className="lg:col-span-1">
          <div
            className={`rounded-lg border p-4 ${
              isCodeDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-300"
            }`}
          >
            <div className="flex items-center space-x-2 mb-4">
              <BookOpen size={20} />
              <h2 className="text-xl font-semibold">Learning Examples</h2>
            </div>

            <div className="space-y-4">
              {lessons.map((lesson, index) => (
                <div
                  key={index}
                  className={`p-4 rounded cursor-pointer transition ${
                    activeTab === `lesson-${index}`
                      ? isCodeDark
                        ? "bg-gray-700"
                        : "bg-blue-50"
                      : isCodeDark
                      ? "hover:bg-gray-700"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => setActiveTab(`lesson-${index}`)}
                >
                  <h3 className="font-semibold mb-1">{lesson.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {lesson.description}
                  </p>
                  <div className="space-y-1">
                    {lesson.examples.map((example, exIndex) => (
                      <code
                        key={exIndex}
                        className={`block text-xs p-2 rounded font-mono ${
                          isCodeDark ? "bg-gray-900" : "bg-gray-100"
                        }`}
                      >
                        {example}
                      </code>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Terminal */}
        <div className="lg:col-span-2">
          <div
            className={`rounded-lg border overflow-hidden ${
              isCodeDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-300"
            }`}
          >
            <TerminalComponent
              height="500px"
              initialCode={
                activeTab.startsWith("lesson-")
                  ? lessons[parseInt(activeTab.split("-")[1])].examples[0]
                  : 'print("Welcome to the Python Playground!")'
              }
            />
          </div>

          {/* Tips Section */}
          <div
            className={`mt-6 p-4 rounded-lg border ${
              isCodeDark
                ? "bg-gray-800 border-gray-700"
                : "bg-yellow-50 border-yellow-200"
            }`}
          >
            <h3 className="font-semibold mb-2 flex items-center space-x-2">
              <Code size={18} />
              <span>Terminal Tips</span>
            </h3>
            <ul className="space-y-1 text-sm">
              <li>
                • Press <kbd>Enter</kbd> to execute code
              </li>
              <li>
                • Use <kbd>↑</kbd> and <kbd>↓</kbd> to navigate command history
              </li>
              <li>• Multiple lines are allowed for loops and functions</li>
              <li>
                • Type{" "}
                <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">
                  exit()
                </code>{" "}
                to restart the session
              </li>
              <li>• Variables persist between commands</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TerminalPlayground;
