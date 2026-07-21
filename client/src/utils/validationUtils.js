// /client/src/utils/validationUtils.js
/**
 * @fileoverview Pyodide-based Python code validation engine.
 *
 * Orchestrates the validation of user-submitted Python code against exercise
 * requirements. Supports three validation modes:
 *
 * 1. **TESTS** — Runs a suite of Python test assertions via Pyodide.
 * 2. **OUTPUT** — Compares the user's stdout against an expected string
 *    (case-insensitive, whitespace-normalised).
 * 3. **THEORY** — No validation; always passes.
 *
 * Also provides helper functions for file-based exercise setup, test
 * execution with timeout, output normalisation, and optimal-solution checks.
 *
 * @module utils/validationUtils
 */

import { getFileCreationCode } from "../data/fileExercises";

/**
 * Run exercise validation using Pyodide.
 *
 * Dispatches to the appropriate validation strategy based on
 * `exercise.validation`. Requires a `runCode` function (from PythonContext)
 * to execute Python code.
 *
 * @param {string} userCode - The user's submitted Python code.
 * @param {object} exercise - The exercise definition object.
 * @param {string} exercise.validation - `"TESTS"`, `"OUTPUT"`, or anything
 *   else (treated as theory).
 * @param {object[]} [exercise.tests] - Array of test case definitions (for
 *   TESTS mode).
 * @param {string} [exercise.expectedOutput] - Expected stdout string (for
 *   OUTPUT mode).
 * @param {Function} runCode - The `runCode` function from PythonContext.
 * @returns {Promise<{ success: boolean, feedback: string, [key]: any }>}
 */
export const validateWithPyodide = async (userCode, exercise, runCode) => {
  if (!runCode) {
    return {
      success: false,
      feedback: "Python engine is not available. Please try again.",
      error: "runCode function not provided",
    };
  }

  try {
    // 1. Tests Mode (Logic-based validation)
    if (exercise.validation === "TESTS" && exercise.tests) {
      return await runTestsWithPyodide(userCode, exercise, runCode);
    }

    // 2. Output Mode (Comparison-based validation)
    if (exercise.validation === "OUTPUT") {
      return await validateOutputWithPyodide(
        userCode,
        exercise.expectedOutput,
        runCode,
      );
    }

    // 3. Theory Mode (No validation required)
    return {
      success: true,
      feedback: "Completed successfully!",
    };
  } catch (error) {
    return {
      success: false,
      feedback: `Validation error: ${error.message}`,
      error: error.toString(),
    };
  }
};

/**
 * Run all tests with Pyodide
 */
const runTestsWithPyodide = async (userCode, exercise, runCode) => {
  const tests = exercise.tests;
  if (!tests || !Array.isArray(tests)) {
    return { success: false, feedback: "No test cases found." };
  }

  const validationResults = [];

  for (const test of tests) {
    const testResult = await runSingleTest(userCode, test, runCode, exercise);
    validationResults.push(testResult);

    if (!testResult.passed) {
      return {
        success: false,
        feedback: testResult.feedback || `Test failed: ${test.name}`,
        testsPassed: validationResults.filter((r) => r.passed).length,
        totalTests: tests.length,
        failedTest: test.name,
      };
    }
  }

  return {
    success: true,
    feedback: "All tests passed! Great job! 🎉",
    testsPassed: validationResults.length,
    totalTests: tests.length,
    isOptimal: checkIfOptimalSolution(userCode, exercise),
  };
};

/**
 * Run a single test case
 */
const runSingleTest = async (userCode, test, runCode, exercise) => {
  try {
    const safeUserCode = JSON.stringify(userCode);
    const fileCreationCode = getFileCreationCode(exercise);

    const fullCode = `
import sys, io, os

# Create a namespace for the exercise
exercise_globals = {}

# Create exercise files
${fileCreationCode}

# Verify files exist
${Object.keys(exercise.fileSetup || {})
  .map(
    (filename) =>
      `if not os.path.exists('${filename}'):
    raise FileNotFoundError(f"Setup failed: {filename} not created")`,
  )
  .join("\n")}

student_code = ${safeUserCode}

old_stdout = sys.stdout
captured_output = io.StringIO()
sys.stdout = captured_output

try:
    # Execute student code with access to the global namespace
    exec(student_code, exercise_globals)
    # Copy any created variables back to local scope for test access
    for key, value in exercise_globals.items():
        if not key.startswith('_'):
            locals()[key] = value
except ModuleNotFoundError:
    pass
except Exception as e:
    sys.stdout = old_stdout
    raise AssertionError(f"Error in your code: {str(e)}")

sys.stdout = old_stdout
output = captured_output.getvalue()

${test.code}
`.trim();

    const result = await runCode(fullCode, 30000);

    if (!result.success) {
      let feedback = result.error || "Unknown error";

      // Error cleaning logic
      if (feedback.includes("AssertionError:")) {
        const parts = feedback.split("AssertionError:");
        feedback = parts.length > 1 ? parts[1].trim() : feedback;
      }
      if (feedback.includes("NameError:")) {
        feedback = `Missing variable: ${feedback.split("NameError:")[1]?.trim()}`;
      }
      if (feedback.includes("IndentationError:")) {
        feedback = "Check your indentation (spacing)!";
      }

      return { passed: false, feedback, error: result.error };
    }

    const stdout = result.stdout || "";
    if (stdout.includes("TEST_PASSED")) {
      return { passed: true, feedback: "Test passed! ✓" };
    }

    return {
      passed: false,
      feedback: `Test "${test.name}" failed to confirm logic.`,
      output: stdout,
    };
  } catch (error) {
    return { passed: false, feedback: `Execution error: ${error.message}` };
  }
};

/**
 *   Convert to lowercase, trim whitespace, and unify line endings
 */
const normalizeOutput = (str) =>
  (str || "").toLowerCase().replace(/\r\n/g, "\n").trim();

/**
 * Validate output matches expected with normalization
 */
export const validateOutputWithPyodide = async (
  userCode,
  expectedOutput,
  runCode,
) => {
  try {
    const result = await runCode(userCode, 10000);
    if (!result.success)
      return { success: false, feedback: `Runtime error: ${result.error}` };

    const actual = normalize(result.stdout || "");
    const expected = normalize(expectedOutput || "");

    if (actual === expected) {
      return { success: true, feedback: "Output matched exactly! 🎉" };
    } else if (actual.includes(expected)) {
      return {
        success: true,
        feedback: "Output contains the correct answer. Good job!",
      };
    } else {
      return {
        success: false,
        feedback: "Output doesn't match. Check your print statements!",
        output: actual,
      };
    }
  } catch (error) {
    return { success: false, feedback: `Validation error: ${error.message}` };
  }
};

/**
 * Check if solution is optimal
 */
export const checkIfOptimalSolution = (userCode, exercise) => {
  if (!userCode) return false;
  const lines = userCode.split("\n").filter((l) => l.trim());

  if (exercise.maxLines && lines.length > exercise.maxLines) return false;

  // Check for hardcoded answers if forbidden patterns exist
  if (exercise.forbiddenPatterns) {
    for (const pattern of exercise.forbiddenPatterns) {
      if (new RegExp(pattern).test(userCode)) return false;
    }
  }

  return true;
};
