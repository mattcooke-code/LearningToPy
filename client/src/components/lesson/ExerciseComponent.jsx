// ExerciseComponent.jsx
import { useState, useRef, useCallback } from "react";
import {
  Code2,
  RefreshCw,
  ExternalLink,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { CodeThemeToggle, Spinner } from "../ui";
import { CodeBlock, CodeEditor, TerminalComponent } from "../lesson";
import { useTheme, usePython, useNotification } from "../../context";
import { apiClient } from "../../services";
import { MarkdownRenderer } from "../ui";
import { useFileDownload } from "../../hooks";
import { validateWithPyodide, getErrorMessage } from "../../utils";

/**
 * @fileoverview
 * Interactive coding exercise component with Pyodide validation and comprehensive feedback.
 * This component provides a complete exercise environment with code editor, terminal integration,
 * real-time validation, and progress tracking. Features dual validation (client-side Pyodide
 * and server-side), attempt tracking, hint system, and XP rewards. Handles review mode,
 * file setup, and run-to-line functionality for enhanced learning experience.
 */

/**
 * Interactive coding exercise component with Pyodide validation and comprehensive feedback system.
 *
 * This component creates a full-featured coding exercise environment that combines client-side
 * validation using Pyodide with server-side submission for progress tracking. Features include
 * a code editor with run-to-line functionality, integrated terminal for testing, comprehensive
 * validation system, hint management, and XP reward integration. The component handles both
 * practice mode and review mode, with detailed feedback and progress tracking capabilities.
 *
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.exercise - Exercise data with instructions, tests, and metadata
 * @param {Function} props.onCodeSubmit - Callback for successful code submission
 * @param {boolean} props.isReviewMode - Whether in review mode (practice without progress)
 * @param {string} props.solution - Solution code for review mode
 * @param {string} props.lessonId - Lesson ID for API submissions
 * @returns {JSX.Element} Complete exercise environment with validation and feedback
 *
 * @correctnessEvaluation
 * - Dual validation: Client-side Pyodide validation + Server-side submission
 * - validateWithPyodide() runs tests locally for immediate feedback
 * - Server submission validates correctness and awards XP/progress
 * - Test results processed and displayed with detailed feedback
 * - Attempt tracking for analytics and difficulty assessment
 *
 * @pyodideIntegration
 * - Uses usePython hook for Pyodide WASM environment access
 * - Local validation through validateWithPyodide() utility function
 * - Code execution in terminal through runCode() method
 * - File setup support for exercises requiring multiple files
 * - Loading state handling for WASM environment readiness
 *
 * @validationFlow
 * 1. User submits code through handleSubmit()
 * 2. Local Pyodide validation with validateWithPyodide()
 * 3. If validation passes, submit to server for final validation
 * 4. Server processes submission and returns results with XP
 * 5. Local state updated with results and feedback displayed
 * 6. Progress callbacks triggered for lesson/module completion
 *
 * @terminalIntegration
 * - TerminalComponent ref for imperative code execution
 * - handleRunToLine() for partial code execution
 * - File setup code injection for multi-file exercises
 * - Terminal toggle for workspace management
 * - Real-time execution feedback and error handling
 *
 * @stateManagement
 * - userCode: Current code in editor
 * - testResults: Validation results and feedback
 * - isRunning: Loading state during validation/submission
 * - attemptNumber: Tracking submission attempts
 * - showHints/solution: UI state for hints and solution display
 * - hasViewedHints: Tracking for XP calculation
 *
 * @feedbackSystem
 * - Immediate feedback through local validation
 * - Detailed server feedback with explanations
 * - XP rewards with toast notifications
 * - Progressive hint system with tracking
 * - Visual feedback through color-coded result panels
 *
 * @userExperience
 * - Run-to-line functionality for step-by-step debugging
 * - Download code for external IDE practice
 * - Review mode for unlimited practice without progress impact
 * - Responsive design for mobile and desktop
 * - Accessibility considerations for screen readers
 */

const ExerciseComponent = ({
  exercise,
  onCodeSubmit,
  isReviewMode,
  solution,
  lessonId,
}) => {
  const [userCode, setUserCode] = useState(
    isReviewMode ? solution || exercise.starterCode : exercise.starterCode,
  );
  const [showHints, setShowHints] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [showTerminal, setShowTerminal] = useState(true);
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [attemptNumber, setAttemptNumber] = useState(1);
  const [startTime, setStartTime] = useState(Date.now());
  const [hasViewedHints, setHasViewedHints] = useState(false);

  const terminalRef = useRef(null);
  const { isCodeDark } = useTheme();
  const { runCode, isReady } = usePython();
  const { downloadPythonFile } = useFileDownload();
  const { showToast } = useNotification(); // ← Initialize toast

  const handleRunToLine = useCallback(
    (lineNumber) => {
      const lines = userCode.split("\n").slice(0, lineNumber);
      const slicedCode = lines.join("\n");

      if (!showTerminal) setShowTerminal(true);

      // Give terminal time to mount if not open
      setTimeout(
        () => {
          terminalRef.current?.executeCode(slicedCode);
        },
        showTerminal ? 0 : 50,
      );
    },
    [userCode, showTerminal],
  );

  const handleSubmit = async () => {
    if (isReviewMode) {
      setShowSolution(true);
      return;
    }

    if (!isReady) {
      setTestResults({
        success: false,
        error: "Python Engine Loading",
        message: "Python engine is still loading. Please wait...",
      });
      return;
    }

    setIsRunning(true);
    setTestResults(null);

    try {
      // Pyodide Validation
      const validationResult = await validateWithPyodide(
        userCode,
        exercise,
        runCode,
      );

      if (!validationResult.success) {
        // Handle Pyodide validation errors (not network errors)
        setTestResults({
          success: false,
          error: "Validation Failed",
          message: validationResult.feedback || "Tests failed. Try again!",
        });
        setAttemptNumber((prev) => prev + 1);
        setIsRunning(false);
        return;
      }

      // If local validation passes, send to backend
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);

      const result = await apiClient.post(
        `/content/lessons/${lessonId}/submit`,
        {
          code: userCode,
          validationResult: validationResult,
          attemptNumber,
          elapsedSeconds: elapsedSeconds,
          usedHints: hasViewedHints,
          wasOptimalSolution: validationResult.isOptimal || false,
          isCorrect: validationResult.success,
          testsPassed: validationResult.testsPassed,
          submissionHistory: [
            { attemptNumber, code: userCode, timestamp: Date.now() },
          ],
        },
      );

      if (result.isCorrect && result.xpEarned > 0) {
        showToast(`💻 +${result.xpEarned} XP earned!`, "success");
      }

      setTestResults({
        success: true,
        message: result.feedback || "🎉 All tests passed!",
        output: "Tests passed on server",
        xpEarned: result.xpEarned || 0,
      });

      if (onCodeSubmit) {
        onCodeSubmit(userCode, result);
      }

      // Reset attempt tracking on success
      setAttemptNumber(1);
      setStartTime(Date.now());
    } catch (err) {
      // Handle network/HTTP errors
      console.error("Submission error:", err);
      setTestResults({
        success: false,
        error: "Submission Error",
        message: getErrorMessage(
          err,
          "Failed to submit code. Please try again.",
        ),
      });
      setAttemptNumber((prev) => prev + 1);
    } finally {
      setIsRunning(false);
    }
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

  const handleTerminalExecute = useCallback(
    (code) => {
      // Build file setup code if needed
      let fullTerminalCode = code;
      if (exercise.fileSetup) {
        const fileSetupLines = [];
        for (const [filename, content] of Object.entries(exercise.fileSetup)) {
          const escapedContent = content
            .replace(/\\/g, "\\\\")
            .replace(/'/g, "\\'")
            .replace(/\n/g, "\\n");
          fileSetupLines.push(
            `with open('${filename}', 'w') as f:\n    f.write('${escapedContent}')`,
          );
        }
        fullTerminalCode = fileSetupLines.join("\n") + "\n\n" + code;
      }

      // Execute the combined code
      runCode(fullTerminalCode)
        .then((result) => {
          if (!result.success) {
            console.error("Terminal execution error:", result.error);
          }
        })
        .catch((err) => {
          console.error("Terminal execution failed:", err);
        });
    },
    [exercise.fileSetup, runCode],
  );

  return (
    <div
      className={`border rounded-lg p-6 my-6 ${
        isCodeDark
          ? "bg-gray-800 border-gray-700 "
          : "bg-yellow-50 border-yellow-200"
      }`}
    >
      {/* Header Container */}
      <div className="flex items-center justify-between mb-4">
        {/* Left Side: Icon and Title */}
        <div className="flex items-center space-x-1">
          <Code2
            className={isCodeDark ? "text-python-light" : "text-python-blue"}
            size={24}
          />
          <h3
            className={`text-lg font-semibold ${
              isCodeDark ? "text-white" : "text-python-dark"
            }`}
          >
            Try It Yourself {isReviewMode && "(Review)"}
          </h3>
        </div>

        {/* Right Side: Toggle Button */}
        <div className="flex items-center ">
          <CodeThemeToggle />
        </div>
      </div>

      {/* Skills/Tags - Moved below the header for better flow */}
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

      {/* Instructions */}
      <div className={`mb-4 ${isCodeDark ? "text-gray-200" : "text-gray-800"}`}>
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
              isCodeDark ? "text-python-yellow" : "text-python-blue"
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
                      ? "bg-gray-700 text-python-light"
                      : "bg-yellow-200 text-python-dark"
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

      {/* Code Editor */}
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
          height="400px"
          onRunToLine={handleRunToLine}
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
                {testResults.error ||
                  (testResults.isPreview ? "Code Preview" : "Test Results")}
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

              {/* XP Earned */}
              {testResults.xpEarned > 0 && (
                <div className="mt-2">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                      isCodeDark
                        ? "bg-yellow-900 text-yellow-200"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    🎉 +{testResults.xpEarned} XP
                  </span>
                </div>
              )}

              {/* Code Output (for preview runs) */}
              {testResults.output && testResults.isPreview && (
                <div className="mt-3">
                  <p
                    className={`text-sm font-semibold mb-1 ${
                      isCodeDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Output:
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
            </div>
          </div>
        </div>
      )}

      {/* Expected Output Hint */}
      {exercise.expectedOutput && !testResults?.success && (
        <div
          className={`mb-4 p-3 rounded-lg border-l-4 ${
            isCodeDark
              ? "bg-gray-900 border-blue-500"
              : "bg-blue-50 border-blue-400"
          }`}
        >
          <p
            className={`text-xs font-bold mb-1 ${
              isCodeDark ? "text-blue-400" : "text-blue-700"
            }`}
          >
            TARGET OUTPUT:
          </p>
          <pre
            className={`text-xs font-mono whitespace-pre-wrap ${
              isCodeDark ? "text-gray-300" : "text-gray-700"
            }`}
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
              ref={terminalRef}
              initialCode={userCode}
              height="300px"
              onCodeExecute={handleTerminalExecute}
            />
          </div>
        )}
      </div>

      {/* Solution (Review Mode) */}
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

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mt-4">
        <button
          onClick={handleSubmit}
          disabled={isRunning || !isReady || isReviewMode}
          className={`px-6 py-2 rounded-lg font-semibold transition flex items-center space-x-2 ${
            isRunning || !isReady || isReviewMode
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-yellow-600 text-white hover:bg-yellow-700"
          }`}
        >
          {isRunning ? (
            <>
              <Spinner size={16} />
              <span>Submitting...</span>
            </>
          ) : (
            <span>Submit Code</span>
          )}
        </button>
        {isReviewMode && solution && (
          <button
            onClick={() => setShowSolution(!showSolution)}
            className="bg-green-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-800 transition"
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
          onClick={() => {
            setShowHints(!showHints);
            if (!hasViewedHints) setHasViewedHints(true);
          }}
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

      {/* Hints */}
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
            className={`space-y-2 text-sm ${
              isCodeDark ? "text-white" : "text-gray-700"
            }`}
          >
            {exercise.hints.map((hint, index) => (
              <div key={index} className="flex items-start">
                <span
                  className={`mr-2 mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full ${
                    isCodeDark ? "bg-blue-400" : "bg-gray-400"
                  }`}
                />
                <MarkdownRenderer content={hint} isDark={isCodeDark} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review Mode Notice */}
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

      {/* Python Loading Notice */}
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
