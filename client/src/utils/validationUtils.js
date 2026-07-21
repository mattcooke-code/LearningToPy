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
 * Helper function for JS -> Python string consistency
 */
const ensureString = (value, fallback = "") => {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return fallback;
  try {
    return String(value);
  } catch (e) {
    return fallback;
  }
};

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
    // ENSURE all inputs are plain strings
    const cleanUserCode = ensureString(userCode);
    const cleanExerciseTitle = ensureString(exercise?.title, "");
    const cleanChallengeGroup = ensureString(exercise?.challengeGroup, "");

    // Create a clean exercise object with only string values
    const cleanExercise = {
      title: cleanExerciseTitle,
      challengeGroup: cleanChallengeGroup,
      fileSetup: exercise?.fileSetup || {},
    };

    // Get file creation code using clean exercise
    const fileCreationCode = getFileCreationCode(cleanExercise);

    // Properly escape the user code for Python triple-quoted string
    const pythonSafeCode = cleanUserCode
      .replace(/\\/g, "\\\\")
      .replace(/"""/g, '\\"\\"\\"')
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n");

    // Build the full code with explicit string handling
    const fullCode = [
      "import sys, io, os",
      "",
      "# Create exercise files",
      fileCreationCode,
      "",
      "# Verify files exist",
      ...Object.keys(cleanExercise.fileSetup).map(
        (filename) =>
          `if not os.path.exists('${filename}'):\n    raise FileNotFoundError(f"Setup failed: {filename} not created")`,
      ),
      "",
      "# Student code",
      'student_code = """' + pythonSafeCode + '"""',
      "",
      "old_stdout = sys.stdout",
      "captured_output = io.StringIO()",
      "sys.stdout = captured_output",
      "",
      "try:",
      "    exec(student_code)",
      "except ModuleNotFoundError:",
      "    pass",
      "except Exception as e:",
      "    sys.stdout = old_stdout",
      '    raise AssertionError(f"Error in your code: {str(e)}")',
      "",
      "sys.stdout = old_stdout",
      "output = captured_output.getvalue()",
      "",
      test.code,
    ].join("\n");

    // Log for debugging (remove in production)
    console.log("Running Python code:", fullCode.substring(0, 200) + "...");

    const result = await runCode(fullCode, 30000);

    if (!result.success) {
      let feedback = result.error || "Unknown error";

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
