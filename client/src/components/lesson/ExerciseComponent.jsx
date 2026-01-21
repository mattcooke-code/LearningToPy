// ExerciseComponent.jsx
import { useState } from "react";
import {
  Code2,
  RefreshCw,
  ExternalLink,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { CodeThemeToggle, Spinner } from "../ui";
import { CodeBlock, CodeEditor, TerminalComponent } from "../lesson";
import { useTheme } from "../../context";
import { usePython } from "../../context/PythonContext";
import { useFileDownload } from "../../hooks";

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
  const [showTerminal, setShowTerminal] = useState(true);
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const { isCodeDark } = useTheme();
  const { runCode, isReady, checkSyntax } = usePython();
  const { downloadPythonFile } = useFileDownload();

  const handleSubmit = async () => {
    if (!isReady) {
      alert("Python engine is not ready yet. Please wait a moment.");
      return;
    }

    if (isReviewMode) {
      setShowSolution(true);
      return;
    }

    setIsRunning(true);
    setTestResults(null);

    try {
      // Run the code - Pyodide handles syntax errors automatically
      const result = await runCode(userCode, 5000);

      if (result.success) {
        // Check if exercise has specific validation method
        if (exercise.validation === "tests" && exercise.tests?.length > 0) {
          const testsPassed = await runTests(exercise.tests);
          setTestResults({
            success: testsPassed.allPassed,
            message: testsPassed.allPassed
              ? "🎉 All tests passed! Great job!"
              : "Some tests failed. Keep trying!",
            details: testsPassed.results,
            output: result.output || "(no output)",
          });

          // Submit to parent if all tests passed
          if (testsPassed.allPassed && onCodeSubmit) {
            onCodeSubmit(userCode);
          }
        } else if (
          exercise.validation === "output" &&
          exercise.expectedOutput
        ) {
          // Compare with expected output
          const isCorrect =
            (result.output || "").trim() === exercise.expectedOutput.trim();

          setTestResults({
            success: isCorrect,
            message: isCorrect
              ? "🎉 Correct output! Great job!"
              : `Expected: ${exercise.expectedOutput}\nGot: ${result.output}`,
            output: result.output || "(no output)",
          });

          // Submit to parent if correct
          if (isCorrect && onCodeSubmit) {
            onCodeSubmit(userCode);
          }
        } else {
          // No specific validation - just execute
          setTestResults({
            success: true,
            message: "Code executed successfully!",
            output: result.output || "(no output)",
          });

          // Submit for completion
          if (onCodeSubmit) {
            onCodeSubmit(userCode);
          }
        }
      } else {
        setTestResults({
          success: false,
          error: "Runtime Error",
          message: result.error,
        });
      }
    } catch (error) {
      setTestResults({
        success: false,
        error: "Execution Error",
        message: error.message,
      });
    } finally {
      setIsRunning(false);
    }
  };

  const runTests = async (tests) => {
    const results = [];
    let allPassed = true;

    for (const test of tests) {
      try {
        // Combine user code with test
        const testCode = `${userCode}\n\n# Test: ${test.name}\n${test.code}`;
        const result = await runCode(testCode, 2000);

        if (result.success) {
          // Test passes if no error
          const passed = !result.error;
          results.push({
            name: test.name,
            passed,
            expected: test.expected,
            actual: result.output,
          });
          allPassed = allPassed && passed;
        } else {
          results.push({
            name: test.name,
            passed: false,
            error: result.error,
          });
          allPassed = false;
        }
      } catch (error) {
        results.push({
          name: test.name,
          passed: false,
          error: error.message,
        });
        allPassed = false;
      }
    }

    return { allPassed, results };
  };

  const resetExercise = () => {
    setUserCode(exercise.starterCode);
    setShowSolution(false);
    setShowHints(false);
    setTestResults(null);
  };

  const openInExternalIDE = () => {
    downloadPythonFile(userCode, "exercise");
  };

  const handleTerminalExecute = (result) => {
    console.log("Terminal execution:", result);
    // You could log this for analytics or show feedback
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
          height="250px"
        />
      </div>

      {/* Test Results */}
      {testResults && (
        <div
          className={`mb-4 p-4 rounded-lg border-2 ${
            testResults.success
              ? isCodeDark
                ? "bg-green-900 border-green-600"
                : "bg-green-50 border-green-400"
              : isCodeDark
              ? "bg-red-900 border-red-600"
              : "bg-red-50 border-red-400"
          }`}
        >
          <div className="flex items-start space-x-3">
            {testResults.success ? (
              <CheckCircle
                className={isCodeDark ? "text-green-400" : "text-green-600"}
                size={24}
              />
            ) : (
              <XCircle
                className={isCodeDark ? "text-red-400" : "text-red-600"}
                size={24}
              />
            )}
            <div className="flex-grow">
              <h4
                className={`font-semibold mb-2 ${
                  testResults.success
                    ? isCodeDark
                      ? "text-green-300"
                      : "text-green-800"
                    : isCodeDark
                    ? "text-red-300"
                    : "text-red-800"
                }`}
              >
                {testResults.error || "Test Results"}
              </h4>
              <p
                className={
                  testResults.success
                    ? isCodeDark
                      ? "text-green-200"
                      : "text-green-700"
                    : isCodeDark
                    ? "text-red-200"
                    : "text-red-700"
                }
              >
                {testResults.message}
              </p>

              {testResults.output && (
                <div className="mt-3">
                  <p
                    className={`text-sm font-semibold ${
                      isCodeDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Output:
                  </p>
                  <pre
                    className={`mt-1 p-2 rounded text-sm ${
                      isCodeDark ? "bg-gray-800" : "bg-white"
                    }`}
                  >
                    {testResults.output}
                  </pre>
                </div>
              )}

              {testResults.details && (
                <div className="mt-3 space-y-2">
                  {testResults.details.map((test, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded ${
                        test.passed
                          ? isCodeDark
                            ? "bg-green-800"
                            : "bg-green-100"
                          : isCodeDark
                          ? "bg-red-800"
                          : "bg-red-100"
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        {test.passed ? (
                          <CheckCircle size={16} className="text-green-600" />
                        ) : (
                          <XCircle size={16} className="text-red-600" />
                        )}
                        <span className="font-medium text-sm">{test.name}</span>
                      </div>
                      {!test.passed && (
                        <div className="mt-1 text-xs ml-6">
                          {test.error ? (
                            <p className="text-red-600">Error: {test.error}</p>
                          ) : (
                            <>
                              <p>Expected: {test.expected}</p>
                              <p>Got: {test.actual}</p>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Terminal Section - Toggleable */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <h4
            className={`font-semibold ${
              isCodeDark ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Python Terminal
          </h4>
          <button
            onClick={() => setShowTerminal(!showTerminal)}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors shadow-sm ${
              isCodeDark
                ? "bg-python-yellow text-python-blue hover:bg-yellow-400"
                : "bg-python-blue text-white hover:bg-blue-700"
            }`}
          >
            {showTerminal ? "Hide Terminal" : "Show Terminal"}
          </button>
        </div>

        {showTerminal && (
          <div className="border rounded-lg overflow-hidden">
            <TerminalComponent
              initialCode={userCode}
              height="300px"
              onCodeExecute={handleTerminalExecute}
            />
          </div>
        )}
      </div>

      {isReviewMode && showSolution && solution && (
        <div
          className={`mt-4 p-4 rounded border-2 ${
            isCodeDark
              ? "bg-green-900 border-green-600"
              : "bg-green-50 border-green-200"
          }`}
        >
          <h4
            className={`font-semibold mb-2 ${
              isCodeDark ? "text-green-300" : "text-green-800"
            }`}
          >
            Solution:
          </h4>
          <CodeBlock code={solution} isUserCode={false} />
        </div>
      )}

      <div className="flex flex-wrap gap-4 mt-4">
        <button
          onClick={handleSubmit}
          disabled={isRunning || !isReady}
          className={`px-6 py-2 rounded-lg font-semibold transition flex items-center space-x-2 ${
            isRunning || !isReady
              ? "bg-gray-400 cursor-not-allowed"
              : isReviewMode
              ? "bg-gray-600 text-white hover:bg-gray-700"
              : "bg-yellow-600 text-white hover:bg-yellow-700"
          }`}
        >
          {isRunning ? (
            <>
              <Spinner size={16} />
              <span>Running...</span>
            </>
          ) : (
            <span>{isReviewMode ? "Check Solution" : "Submit Code"}</span>
          )}
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
        <div
          className={`mt-4 p-4 rounded-lg border ${
            isCodeDark
              ? "bg-gray-700 border-gray-600"
              : "bg-white border-gray-300"
          }`}
        >
          <h4
            className={`font-semibold mb-2 ${
              isCodeDark ? "text-gray-200" : "text-gray-800"
            }`}
          >
            Hints:
          </h4>
          <ul
            className={`list-disc list-inside space-y-1 ${
              isCodeDark ? "text-gray-300" : "text-gray-700"
            }`}
          >
            {exercise.hints.map((hint, index) => (
              <li key={index}>{hint}</li>
            ))}
          </ul>
        </div>
      )}

      {isReviewMode && (
        <div
          className={`mt-4 p-3 rounded ${
            isCodeDark
              ? "bg-yellow-900 border border-yellow-600"
              : "bg-yellow-100 border border-yellow-300"
          }`}
        >
          <p
            className={`text-sm ${
              isCodeDark ? "text-yellow-200" : "text-yellow-800"
            }`}
          >
            💡 <strong>Review Mode:</strong> Practice as many times as you want!
            Your progress won't be affected.
          </p>
        </div>
      )}

      {!isReady && (
        <div
          className={`mt-4 p-3 rounded ${
            isCodeDark
              ? "bg-blue-900 border border-blue-600"
              : "bg-blue-100 border border-blue-300"
          }`}
        >
          <p
            className={`text-sm ${
              isCodeDark ? "text-blue-200" : "text-blue-800"
            }`}
          >
            ⏳ Python engine is loading... Please wait a moment before running
            code.
          </p>
        </div>
      )}
    </div>
  );
};

export default ExerciseComponent;
