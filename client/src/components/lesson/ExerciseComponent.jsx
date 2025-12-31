// ExerciseComponent
import { useState } from "react";
import { Code2, RefreshCw, ExternalLink } from "lucide-react";
import { CodeThemeToggle } from "../ui";
import { CodeBlock, CodeEditor } from "../lesson";
import { useTheme } from "../../context";

const ExerciseComponent = ({
  exercise,
  onCodeSubmit,
  isReviewMode,
  solution,
}) => {
  const [userCode, setUserCode] = useState(
    isReviewMode ? solution || exercise.starterCode : exercise.starterCode
  );
  const [showHints, setShowHints] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const { isCodeDark } = useTheme();

  const handleSubmit = () => {
    if (!isReviewMode) {
      onCodeSubmit(userCode);
    } else {
      setShowSolution(true);
    }
  };

  const resetExercise = () => {
    setUserCode(exercise.starterCode);
    setShowSolution(false);
    setShowHints(false);
  };

  const openInExternalIDE = () => {
    // Create a downloadable Python file with the starter code
    const blob = new Blob([userCode], { type: "text/python" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "exercise.py";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`border rounded-lg p-6 my-6 ${
        isCodeDark
          ? "bg-gray-800 border-gray-700"
          : "bg-yellow-50 border-yellow-200"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Code2
            className={isCodeDark ? "text-blue-400" : "text-yellow-600"}
            size={24}
          />
          <h3
            className={`text-lg font-semibold ${
              isCodeDark ? "text-white" : "text-yellow-800"
            }`}
          >
            Try It Yourself {isReviewMode && "(Review)"}
          </h3>
        </div>
        <div className="flex items-center space-x-3">
          <CodeThemeToggle />
          {isReviewMode && (
            <span
              className={`px-2 py-1 rounded text-sm ${
                isCodeDark
                  ? "bg-gray-700 text-gray-300"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              Review Mode
            </span>
          )}
        </div>
      </div>

      <p className={`mb-4 ${isCodeDark ? "text-gray-300" : "text-gray-800"}`}>
        {exercise.instructions}
      </p>

      {/* IDE Links for Complex Projects */}
      {exercise.isComplex && (
        <div
          className={`mb-4 p-4 rounded-lg ${
            isCodeDark ? "bg-gray-700" : "bg-blue-50"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className={`font-semibold ${
                  isCodeDark ? "text-white" : "text-blue-800"
                }`}
              >
                🚀 Complex Project Tip
              </p>
              <p
                className={`text-sm ${
                  isCodeDark ? "text-gray-300" : "text-blue-700"
                }`}
              >
                Consider using a full IDE for this exercise:
              </p>
            </div>
            <div className="flex space-x-2">
              <a
                href="https://code.visualstudio.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition"
              >
                <ExternalLink size={14} />
                <span>VS Code</span>
              </a>
              <a
                href="https://www.jetbrains.com/pycharm/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition"
              >
                <ExternalLink size={14} />
                <span>PyCharm</span>
              </a>
              <button
                onClick={openInExternalIDE}
                className="flex items-center space-x-1 px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition"
              >
                <ExternalLink size={14} />
                <span>Download</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-4">
        <label
          className={`block text-sm font-medium mb-2 ${
            isCodeDark ? "text-gray-400" : "text-gray-700"
          }`}
        >
          Your Code:
        </label>

        <CodeEditor
          value={userCode}
          onChange={setUserCode}
          readOnly={isReviewMode && showSolution}
          height="200px"
        />
      </div>

      {isReviewMode && showSolution && solution && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
          <h4 className="font-semibold text-green-800 mb-2">Solution:</h4>
          <CodeBlock code={solution} isUserCode={false} />
        </div>
      )}

      <div className="flex flex-wrap gap-4 mt-4">
        <button
          onClick={handleSubmit}
          className={`px-6 py-2 rounded-lg font-semibold transition ${
            isReviewMode
              ? "bg-gray-600 text-white hover:bg-gray-700"
              : "bg-yellow-600 text-white hover:bg-yellow-700"
          }`}
        >
          {isReviewMode ? "Check Solution" : "Run Code"}
        </button>

        {isReviewMode && solution && (
          <button
            onClick={() => setShowSolution(!showSolution)}
            className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            {showSolution ? "Hide Solution" : "Show Solution"}
          </button>
        )}

        {isReviewMode && (
          <button
            onClick={resetExercise}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center space-x-2"
          >
            <RefreshCw size={16} />
            <span>Reset</span>
          </button>
        )}

        <button
          onClick={() => setShowHints(!showHints)}
          className="bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-700 transition"
        >
          {showHints ? "Hide Hints" : "Show Hints"}
        </button>

        {/* Download button for all exercises */}
        <button
          onClick={openInExternalIDE}
          className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition flex items-center space-x-2"
        >
          <ExternalLink size={16} />
          <span>Download</span>
        </button>
      </div>

      {showHints && exercise.hints && (
        <div className="mt-4 p-4 bg-white rounded-lg border">
          <h4 className="font-semibold text-gray-800 mb-2">Hints:</h4>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            {exercise.hints.map((hint, index) => (
              <li key={index}>{hint}</li>
            ))}
          </ul>
        </div>
      )}

      {isReviewMode && (
        <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded">
          <p className="text-yellow-800 text-sm">
            💡 <strong>Review Mode:</strong> Practice as many times as you want!
            Your progress won't be affected.
          </p>
        </div>
      )}
    </div>
  );
};

export default ExerciseComponent;
