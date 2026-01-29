// ExerciseComponent.jsx
import { useState } from "react";
import {
  Code2,
  RefreshCw,
  ExternalLink,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { CodeThemeToggle, Spinner } from "../ui";
import { CodeBlock, CodeEditor, TerminalComponent } from "../lesson";
import { useTheme } from "../../context";
import { usePython } from "../../context/PythonContext";
import { MarkdownRenderer } from "../ui";
import { useFileDownload } from "../../hooks";

const ExerciseComponent = ({
  exercise,
  onCodeSubmit,
  isReviewMode,
  solution,
}) => {
  console.log("=== EXERCISE DEBUG ===");
  console.log("Exercise object:", exercise);
  console.log("Steps:", exercise?.steps);
  console.log("Steps exists:", !!exercise?.steps);
  console.log("Is array:", Array.isArray(exercise?.steps));
  console.log("Array length:", exercise?.steps?.length);
  console.log("First step:", exercise?.steps?.[0]);
  console.log("=== END DEBUG ===");

  const [userCode, setUserCode] = useState(
    isReviewMode ? solution || exercise.starterCode : exercise.starterCode,
  );
  const [showHints, setShowHints] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [showTerminal, setShowTerminal] = useState(true);
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showTestDetails, setShowTestDetails] = useState(false);

  const { isCodeDark } = useTheme();
  const { runCode, isReady, checkSyntax } = usePython();
  const { downloadPythonFile } = useFileDownload();

  const runTests = async (tests) => {
    const results = [];
    let allPassed = true;

    for (const test of tests) {
      try {
        // Combine user code with test - wrap in try/except to catch assertion errors
        const testCode = `
${userCode}

# Test: ${test.name}
try:
    ${test.code}
    print("TEST_PASSED: ${test.name}")
except AssertionError as e:
    print(f"TEST_FAILED: ${test.name} - {e}")
except Exception as e:
    print(f"TEST_ERROR: ${test.name} - {type(e).__name__}: {e}")
`;

        const result = await runCode(testCode, 3000);

        if (result.success) {
          // Check if output contains TEST_PASSED
          const passed = result.output.includes(`TEST_PASSED: ${test.name}`);
          results.push({
            name: test.name,
            passed,
            expected: test.expected,
            actual: result.output,
            rawOutput: result.output,
          });
          allPassed = allPassed && passed;
        } else {
          results.push({
            name: test.name,
            passed: false,
            error: result.error,
            rawOutput: result.output,
          });
          allPassed = false;
        }
      } catch (error) {
        results.push({
          name: test.name,
          passed: false,
          error: error.message,
          rawOutput: "",
        });
        allPassed = false;
      }
    }

    return { allPassed, results };
  };

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
      // First, run the user's code to get output
      const result = await runCode(userCode, 5000);

      if (!result.success) {
        setTestResults({
          success: false,
          error: "Runtime Error",
          message: result.error,
          output: result.output || "(no output)",
        });
        return;
      }

      // VALIDATION LOGIC
      if (exercise.validation === "tests" && exercise.tests?.length > 0) {
        const testsPassed = await runTests(exercise.tests);

        setTestResults({
          success: testsPassed.allPassed,
          message: testsPassed.allPassed
            ? "🎉 All tests passed! Great job!"
            : `${testsPassed.results.filter((r) => r.passed).length}/${testsPassed.results.length} tests passed. Keep trying!`,
          details: testsPassed.results,
          output: result.output || "(no output)",
          rawOutput: result.output,
        });

        // Submit to parent if all tests passed
        if (testsPassed.allPassed && onCodeSubmit) {
          onCodeSubmit(userCode);
        }
      } else if (exercise.validation === "output" && exercise.expectedOutput) {
        // Compare with expected output
        const userOutput = (result.output || "").trim();
        const expectedOutput = exercise.expectedOutput.trim();
        const isCorrect = userOutput === expectedOutput;

        setTestResults({
          success: isCorrect,
          message: isCorrect
            ? "🎉 Correct output! Great job!"
            : "Output doesn't match expected result",
          output: userOutput || "(no output)",
          expected: expectedOutput,
        });

        // Submit to parent if correct
        if (isCorrect && onCodeSubmit) {
          onCodeSubmit(userCode);
        }
      } else {
        // No validation - just execute
        setTestResults({
          success: true,
          message: "Code executed successfully!",
          output: result.output || "(no output)",
        });

        // Submit for completion (optional)
        if (onCodeSubmit) {
          onCodeSubmit(userCode);
        }
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

  const resetExercise = () => {
    setUserCode(exercise.starterCode);
    setShowSolution(false);
    setShowHints(false);
    setTestResults(null);
    setShowTestDetails(false);
  };

  const openInExternalIDE = () => {
    downloadPythonFile(userCode, "exercise");
  };

  const handleTerminalExecute = (result) => {
    console.log("Terminal execution:", result);
  };

  // Helper function to extract clean test output
  const getCleanTestOutput = (rawOutput) => {
    if (!rawOutput) return "";

    // Remove TEST_ prefixes for cleaner display
    return rawOutput
      .replace(/TEST_PASSED:.*?\n/g, "")
      .replace(/TEST_FAILED:.*?-\s*/g, "Failed: ")
      .replace(/TEST_ERROR:.*?-\s*/g, "Error: ")
      .trim();
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

        {/* Skills/Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {exercise.tags?.map((tag) => (
            <span
              key={tag}
              className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                isCodeDark
                  ? "bg-blue-900/40 text-blue-300 border border-blue-800"
                  : "bg-yellow-100 text-yellow-700 border border-yellow-200"
              }`}
            >
              {tag.replace("-", " ")}
            </span>
          ))}
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

      <div className={`mb-4 ${isCodeDark ? "text-gray-300" : "text-gray-800"}`}>
        <MarkdownRenderer content={exercise.instructions} isDark={isCodeDark} />
      </div>
      {/* Render Steps if they exist */}
      {exercise.steps && exercise.steps.length > 0 && (
        <div
          className={`mb-6 space-y-3 p-4 rounded-lg ${
            isCodeDark ? "bg-gray-900/50" : "bg-white/50"
          }`}
        >
          <h4
            className={`text-sm font-bold uppercase tracking-wider ${
              isCodeDark ? "text-blue-400" : "text-yellow-700"
            }`}
          >
            Exercise Steps:
          </h4>
          <div className="space-y-2">
            {exercise.steps.map((step, index) => (
              <div key={index} className="flex items-start">
                <span
                  className={`mr-2 mt-1 flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${
                    isCodeDark
                      ? "bg-gray-700 text-blue-300"
                      : "bg-yellow-200 text-yellow-800"
                  }`}
                >
                  {index + 1}
                </span>
                <div className={isCodeDark ? "text-gray-200" : "text-gray-700"}>
                  <MarkdownRenderer content={step} isDark={isCodeDark} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
          className={`font-semibold ${
            isCodeDark ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Code Editor:
        </label>

        <CodeEditor
          value={userCode}
          onChange={setUserCode}
          readOnly={isReviewMode && showSolution}
          height="250px"
        />
      </div>

      {/* Test Results Section */}
      {testResults && (
        <div
          className={`mb-4 p-4 rounded-lg border-2 ${
            testResults.success
              ? isCodeDark
                ? "bg-green-900/40 border-green-600"
                : "bg-green-50 border-green-400"
              : isCodeDark
                ? "bg-red-900/40 border-red-600"
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

              {/* Code Output */}
              {testResults.output && (
                <div className="mt-3">
                  <p
                    className={`text-sm font-semibold mb-1 ${
                      isCodeDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Your Output:
                  </p>
                  <pre
                    className={`mt-1 p-2 rounded text-sm whitespace-pre-wrap ${
                      isCodeDark
                        ? "bg-gray-800 text-gray-300"
                        : "bg-white text-gray-800"
                    }`}
                  >
                    {testResults.output}
                  </pre>
                </div>
              )}

              {/* Expected Output (for output validation) */}
              {testResults.expected && !testResults.success && (
                <div className="mt-3">
                  <p
                    className={`text-sm font-semibold mb-1 ${
                      isCodeDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Expected Output:
                  </p>
                  <pre
                    className={`mt-1 p-2 rounded text-sm whitespace-pre-wrap ${
                      isCodeDark
                        ? "bg-gray-800 text-gray-300"
                        : "bg-white text-gray-800"
                    }`}
                  >
                    {testResults.expected}
                  </pre>
                </div>
              )}

              {/* Test Details */}
              {testResults.details && testResults.details.length > 0 && (
                <div className="mt-4">
                  <button
                    onClick={() => setShowTestDetails(!showTestDetails)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium ${
                      isCodeDark
                        ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                        : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                    }`}
                  >
                    {showTestDetails ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                    <span>View Test Details</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${
                        testResults.success
                          ? isCodeDark
                            ? "bg-green-800 text-green-200"
                            : "bg-green-200 text-green-800"
                          : isCodeDark
                            ? "bg-red-800 text-red-200"
                            : "bg-red-200 text-red-800"
                      }`}
                    >
                      {testResults.details.filter((t) => t.passed).length}/
                      {testResults.details.length}
                    </span>
                  </button>

                  {showTestDetails && (
                    <div className="mt-3 space-y-3">
                      <h5
                        className={`font-semibold ${isCodeDark ? "text-gray-300" : "text-gray-700"}`}
                      >
                        Test Details:
                      </h5>
                      {testResults.details.map((test, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg ${
                            test.passed
                              ? isCodeDark
                                ? "bg-green-900/30 border border-green-700"
                                : "bg-green-50 border border-green-200"
                              : isCodeDark
                                ? "bg-red-900/30 border border-red-700"
                                : "bg-red-50 border border-red-200"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {test.passed ? (
                                <CheckCircle
                                  size={16}
                                  className="text-green-500"
                                />
                              ) : (
                                <XCircle size={16} className="text-red-500" />
                              )}
                              <span className="font-medium">{test.name}</span>
                            </div>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                test.passed
                                  ? isCodeDark
                                    ? "bg-green-800 text-green-200"
                                    : "bg-green-200 text-green-800"
                                  : isCodeDark
                                    ? "bg-red-800 text-red-200"
                                    : "bg-red-200 text-red-800"
                              }`}
                            >
                              {test.passed ? "PASSED" : "FAILED"}
                            </span>
                          </div>

                          {!test.passed && (
                            <div className="mt-3 pt-3 border-t border-gray-700/30">
                              <div className="space-y-2">
                                {test.error ? (
                                  <div>
                                    <p
                                      className={`font-semibold text-sm ${isCodeDark ? "text-red-300" : "text-red-600"}`}
                                    >
                                      Error:
                                    </p>
                                    <p
                                      className={`text-sm ${isCodeDark ? "text-red-200" : "text-red-700"}`}
                                    >
                                      {test.error}
                                    </p>
                                  </div>
                                ) : (
                                  <>
                                    {test.expected && (
                                      <div>
                                        <p
                                          className={`font-semibold text-sm ${isCodeDark ? "text-gray-300" : "text-gray-700"}`}
                                        >
                                          Expected:
                                        </p>
                                        <p
                                          className={`text-sm ${isCodeDark ? "text-gray-200" : "text-gray-600"}`}
                                        >
                                          {test.expected}
                                        </p>
                                      </div>
                                    )}
                                    {test.rawOutput && (
                                      <div>
                                        <p
                                          className={`font-semibold text-sm ${isCodeDark ? "text-gray-300" : "text-gray-700"}`}
                                        >
                                          Test Output:
                                        </p>
                                        <pre
                                          className={`mt-1 p-2 rounded text-xs whitespace-pre-wrap ${
                                            isCodeDark
                                              ? "bg-gray-800 text-gray-300"
                                              : "bg-gray-100 text-gray-700"
                                          }`}
                                        >
                                          {getCleanTestOutput(test.rawOutput)}
                                        </pre>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {exercise.expectedOutput && !testResults?.success && (
        <div
          className={`mb-4 p-3 rounded-lg border-l-4 ${
            isCodeDark
              ? "bg-gray-900 border-blue-500"
              : "bg-blue-50 border-blue-400"
          }`}
        >
          <p
            className={`text-xs font-bold mb-1 ${isCodeDark ? "text-blue-400" : "text-blue-700"}`}
          >
            TARGET OUTPUT:
          </p>
          <pre
            className={`text-xs font-mono whitespace-pre-wrap ${isCodeDark ? "text-gray-400" : "text-gray-600"}`}
          >
            {exercise.expectedOutput}
          </pre>
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
          <div
            className={`space-y-2 text-sm ${isCodeDark ? "text-white" : "text-gray-700"}`}
          >
            {exercise.hints.map((hint, index) => (
              <div key={index} className="flex items-start">
                <span
                  className={`mr-2 mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full ${isCodeDark ? "bg-blue-400" : "bg-gray-400"}`}
                />
                <MarkdownRenderer content={hint} isDark={isCodeDark} />
              </div>
            ))}
          </div>
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
