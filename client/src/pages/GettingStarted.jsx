// pages/GettingStarted.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Play,
  Terminal,
  Code,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Keyboard,
  MousePointer,
} from "lucide-react";
import { useTheme } from "../context";

const GettingStarted = () => {
  const navigate = useNavigate();
  const { isCodeDark } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to Python Learning!",
      icon: <Sparkles className="text-yellow-500" size={32} />,
      content: (
        <>
          <p className="mb-4">
            Welcome to your Python learning journey! This interactive platform
            will teach you Python programming from the ground up.
          </p>
          <p>
            No prior experience needed - we'll guide you through every step!
          </p>
        </>
      ),
    },
    {
      title: "The Code Editor",
      icon: <Code className="text-blue-500" size={32} />,
      content: (
        <>
          <div
            className={`p-4 rounded-lg mb-4 ${
              isCodeDark ? "bg-gray-800" : "bg-blue-50"
            }`}
          >
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <code className="text-sm">
              <span className="text-green-400">print</span>(
              <span className="text-yellow-300">"Hello, World!"</span>)
            </code>
          </div>
          <p>This is where you'll write your Python code. You can:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Type code like a professional developer</li>
            <li>See line numbers and syntax highlighting</li>
            <li>Use auto-complete and error checking</li>
          </ul>
        </>
      ),
    },
    {
      title: "The Python Terminal",
      icon: <Terminal className="text-green-500" size={32} />,
      content: (
        <>
          <div
            className={`p-4 rounded-lg mb-4 font-mono text-sm ${
              isCodeDark ? "bg-black" : "bg-gray-900 text-white"
            }`}
          >
            <div className="text-green-400">{">>>"} print("Hello")</div>
            <div className="text-gray-300">Hello</div>
            <div className="text-green-400">{">>>"} 2 + 2</div>
            <div className="text-gray-300">4</div>
          </div>
          <p>This interactive terminal lets you:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Run Python code instantly</li>
            <li>See results immediately</li>
            <li>Experiment with code snippets</li>
            <li>Test ideas without writing full programs</li>
          </ul>
        </>
      ),
    },
    {
      title: "Running Your Code",
      icon: <Play className="text-purple-500" size={32} />,
      content: (
        <>
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div
              className={`px-6 py-3 rounded-lg ${
                isCodeDark ? "bg-gray-800" : "bg-gray-100"
              }`}
            >
              <span className="font-semibold">Run Code</span>
            </div>
            <ArrowRight className="text-gray-400" />
            <div
              className={`px-6 py-3 rounded-lg ${
                isCodeDark ? "bg-green-900" : "bg-green-100"
              }`}
            >
              <CheckCircle className="inline mr-2" size={18} />
              <span className="font-semibold">See Results</span>
            </div>
          </div>
          <p>
            Click the <strong>Run Code</strong> button to execute your Python
            programs. You'll see:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Instant feedback on whether your code works</li>
            <li>Any error messages to help you debug</li>
            <li>XP points when you complete exercises!</li>
          </ul>
        </>
      ),
    },
    {
      title: "Navigation & Progress",
      icon: <MousePointer className="text-pink-500" size={32} />,
      content: (
        <>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div
              className={`p-3 rounded-lg text-center ${
                isCodeDark ? "bg-gray-800" : "bg-blue-50"
              }`}
            >
              <div className="font-bold text-lg">Modules</div>
              <div className="text-sm text-gray-500">Organized topics</div>
            </div>
            <div
              className={`p-3 rounded-lg text-center ${
                isCodeDark ? "bg-gray-800" : "bg-green-50"
              }`}
            >
              <div className="font-bold text-lg">Lessons</div>
              <div className="text-sm text-gray-500">Step-by-step guides</div>
            </div>
            <div
              className={`p-3 rounded-lg text-center ${
                isCodeDark ? "bg-gray-800" : "bg-purple-50"
              }`}
            >
              <div className="font-bold text-lg">Exercises</div>
              <div className="text-sm text-gray-500">
                Practice what you learn
              </div>
            </div>
          </div>
          <p>Your learning path is organized into:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>
              <strong>Modules</strong>: Major topics like "Variables" or "Loops"
            </li>
            <li>
              <strong>Lessons</strong>: Short, focused teaching segments
            </li>
            <li>
              <strong>Exercises</strong>: Hands-on coding challenges
            </li>
          </ul>
          <p className="mt-3">
            Track your progress with the progress bar and earn badges!
          </p>
        </>
      ),
    },
    {
      title: "Keyboard Shortcuts",
      icon: <Keyboard className="text-orange-500" size={32} />,
      content: (
        <>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div
              className={`p-3 rounded-lg ${
                isCodeDark ? "bg-gray-800" : "bg-gray-100"
              }`}
            >
              <kbd className="font-mono bg-white dark:bg-gray-700 px-2 py-1 rounded text-sm">
                Ctrl + Enter
              </kbd>
              <div className="text-sm mt-1">Run code</div>
            </div>
            <div
              className={`p-3 rounded-lg ${
                isCodeDark ? "bg-gray-800" : "bg-gray-100"
              }`}
            >
              <kbd className="font-mono bg-white dark:bg-gray-700 px-2 py-1 rounded text-sm">
                Tab
              </kbd>
              <div className="text-sm mt-1">Indent code</div>
            </div>
            <div
              className={`p-3 rounded-lg ${
                isCodeDark ? "bg-gray-800" : "bg-gray-100"
              }`}
            >
              <kbd className="font-mono bg-white dark:bg-gray-700 px-2 py-1 rounded text-sm">
                ↑ / ↓
              </kbd>
              <div className="text-sm mt-1">Command history</div>
            </div>
            <div
              className={`p-3 rounded-lg ${
                isCodeDark ? "bg-gray-800" : "bg-gray-100"
              }`}
            >
              <kbd className="font-mono bg-white dark:bg-gray-700 px-2 py-1 rounded text-sm">
                Ctrl + L
              </kbd>
              <div className="text-sm mt-1">Clear terminal</div>
            </div>
          </div>
          <p>Use these shortcuts to code faster:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>
              Press{" "}
              <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">
                Enter
              </kbd>{" "}
              to execute in terminal
            </li>
            <li>
              Use{" "}
              <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">
                Shift + Enter
              </kbd>{" "}
              for new line in editor
            </li>
            <li>Click line numbers to add breakpoints</li>
          </ul>
        </>
      ),
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Mark as completed and navigate to modules
      localStorage.setItem("tutorialCompleted", "true");
      navigate("/modules");
    }
  };

  const handleSkip = () => {
    localStorage.setItem("tutorialCompleted", "true");
    navigate("/modules");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div
        className={`max-w-3xl w-full rounded-2xl p-8 ${
          isCodeDark
            ? "bg-gray-800 border border-gray-700"
            : "bg-white border border-gray-200 shadow-xl"
        }`}
      >
        {/* Progress indicator */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isCodeDark ? "bg-blue-900" : "bg-blue-100"
              }`}
            >
              <span className="font-bold">{currentStep + 1}</span>
            </div>
            <h1 className="text-2xl font-bold">Getting Started</h1>
          </div>
          <div className="flex space-x-1">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentStep
                    ? isCodeDark
                      ? "bg-blue-500"
                      : "bg-blue-600"
                    : isCodeDark
                    ? "bg-gray-600"
                    : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Current step content */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            {steps[currentStep].icon}
            <h2 className="text-xl font-semibold">
              {steps[currentStep].title}
            </h2>
          </div>
          <div
            className={`text-lg ${
              isCodeDark ? "text-gray-300" : "text-gray-700"
            }`}
          >
            {steps[currentStep].content}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={handleSkip}
            className={`px-6 py-2 rounded-lg font-medium ${
              isCodeDark
                ? "text-gray-400 hover:text-gray-300"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Skip Tutorial
          </button>

          <div className="flex space-x-3">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className={`px-6 py-2 rounded-lg font-medium ${
                  isCodeDark
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                Back
              </button>
            )}

            <button
              onClick={handleNext}
              className={`px-6 py-2 rounded-lg font-medium flex items-center space-x-2 ${
                isCodeDark
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              <span>
                {currentStep === steps.length - 1 ? "Start Learning!" : "Next"}
              </span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>

        {/* Quick tip */}
        <div
          className={`mt-8 p-3 rounded-lg text-sm ${
            isCodeDark
              ? "bg-gray-900 text-gray-400"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          💡 <strong>Tip:</strong> You can revisit this tutorial anytime from
          your profile settings.
        </div>
      </div>

      {/* Bottom indicator */}
      <div className="mt-8 text-center text-gray-500 text-sm">
        {currentStep + 1} of {steps.length} steps
      </div>
    </div>
  );
};

export default GettingStarted;
