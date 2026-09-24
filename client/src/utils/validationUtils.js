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
 * Strip line comments from Python source, for the purpose of detecting
 * placeholders that only exist inside comments.
 *
 * We're not building a Python tokenizer here — a `#` inside a string
 * literal will be treated as a comment start, which is a known false
 * positive. In practice, `???` inside a string literal is rare, and
 * if it happens, the check below will still fire on the rest of the
 * code. This is a heuristic, not a parser.
 */
const stripLineComments = (src) =>
  String(src)
    .split("\n")
    .map((line) => line.split("#")[0])
    .join("\n");

/**
 * True if the user's code still contains `???` placeholders outside
 * of comments.
 */
const hasPlaceholder = (src) => stripLineComments(src).includes("???");

/**
 * Escape a Python source string for safe embedding inside a Python
 * triple-quoted string ("""...""").
 *
 * Order matters:
 *   1. Backslashes first, or we'd double-escape the escapes we add later.
 *   2. Triple quotes, so they don't terminate the wrapper.
 *   3. Normalise CRLF/CR to LF so line numbers are consistent.
 */
const escapeForPythonTripleQuote = (raw) =>
  String(raw)
    .replace(/\\/g, "\\\\")
    .replace(/"""/g, '\\"\\"\\"')
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");

/**
 * Indent a multi-line Python snippet by a fixed number of spaces.
 * Empty lines are left empty so the resulting source stays clean.
 */
const indentPython = (snippet, spaces = 4) => {
  const pad = " ".repeat(spaces);
  return String(snippet)
    .split("\n")
    .map((line) => (line.length > 0 ? pad + line : line))
    .join("\n");
};

/**
 * TEST AUTHOR CONTRACT
 *
 * The generated Python script provides the following names in the test scope:
 *
 *   student_code  — the user's submitted source code, as a str.
 *                   This is the PREFERRED name. It is chosen over `code`
 *                   because students frequently name a variable `code`,
 *                   which would shadow the source string and break tests.
 *   code          — deprecated alias of `student_code`. Kept for backward
 *                   compatibility with older exercises. Do NOT use in new
 *                   tests.
 *   output        — captured stdout from executing the user's code.
 *
 * In addition, any names the user defined at the top level of their code
 * (e.g. functions, variables) are visible to the test, because the runner
 * executes the user's code with `exec()` in the module globals.
 *
 * Tests MUST NOT call exec(student_code) or exec(code) themselves. The
 * runner has already executed the user's code exactly once. Re-executing
 * it causes duplicated side effects and, for stateful code, breaks the
 * stdout capture (the second run sees the mutated state and produces no
 * output). See git history for examples of this bug.
 *
 * PLACEHOLDER HANDLING
 *
 * The runner checks for `???` placeholders BEFORE generating the Python
 * script. This is deliberate: it means the check happens on the JS side,
 * so it cannot be defeated by a malformed generated script. Never move
 * this check into the generated Python code — a parse error in our own
 * script would prevent the friendly message from ever appearing.
 */

/**
 * Build the complete Python script that runs one test.
 */
const buildTestScript = (userCode, test, cleanExercise) => {
  const pythonSafeCode = escapeForPythonTripleQuote(userCode);
  const fileCreationCode = getFileCreationCode(cleanExercise);

  const fileExistsChecks = Object.keys(cleanExercise.fileSetup)
    .map(
      (filename) =>
        `if not os.path.exists(${JSON.stringify(filename)}):\n` +
        `    raise FileNotFoundError(${JSON.stringify(
          `Setup failed: ${filename} not created`,
        )})`,
    )
    .join("\n");

  const indentedTest = indentPython(test.code, 4);

  // Build the "Test X crashed: " prefix as a complete Python string
  // literal, using JSON.stringify to handle escaping. We do NOT wrap
  // this in extra quotes — JSON.stringify already produces a valid
  // Python double-quoted string literal.
  const crashPrefix = JSON.stringify(`Test "${test.name}" crashed: `);

  return `
import sys, io, os

# --- Create exercise files ---
${fileCreationCode}

# --- Verify files exist ---
${fileExistsChecks}

# --- Student code ---
student_code = """${pythonSafeCode}"""
code = student_code

# --- Execute student code with friendly error handling ---
old_stdout = sys.stdout
captured_output = io.StringIO()
sys.stdout = captured_output

try:
    exec(student_code)
except ModuleNotFoundError:
    # Some exercises import packages not available in Pyodide's terminal.
    # The test body is responsible for checking syntax / structure instead.
    pass
except SyntaxError as e:
    sys.stdout = old_stdout
    _raw = str(e.msg).rstrip()
    if "Perhaps" in _raw:
        _raw = _raw[: _raw.index("Perhaps")].rstrip()
    if _raw and _raw[-1] not in ".!?":
        _raw += "."
    raise AssertionError(
        f"Your code has a syntax error on line {e.lineno}: {_raw} "
        f"Check for incomplete lines or missing punctuation."
    )
except Exception as e:
    sys.stdout = old_stdout
    raise AssertionError(f"Error in your code: {str(e)}")

sys.stdout = old_stdout
output = captured_output.getvalue()

# --- Test body ---
try:
${indentedTest}
except AssertionError:
    raise
except Exception as _test_exc:
    raise AssertionError(
        ${crashPrefix} +
        f"{type(_test_exc).__name__}: {_test_exc}. " +
        "This usually means your code produced an unexpected value " +
        "or is missing something the exercise asked for."
    )
`.trim();
};

/**
 * Run exercise validation using Pyodide.
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
    if (exercise.validation === "TESTS" && exercise.tests) {
      return await runTestsWithPyodide(userCode, exercise, runCode);
    }

    if (exercise.validation === "OUTPUT") {
      return await validateOutputWithPyodide(
        userCode,
        exercise.expectedOutput,
        runCode,
      );
    }

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
    const cleanUserCode = ensureString(userCode);

    // ----- JS-side placeholder check -----
    // Done BEFORE generating the Python script. This is intentional: the
    // check must not depend on the script being well-formed, or a bug in
    // our own script generation could suppress the friendly message.
    if (hasPlaceholder(cleanUserCode)) {
      return {
        passed: false,
        feedback:
          "Your code still has ??? placeholders. " +
          "Replace each ??? with your answer, then submit again.",
      };
    }

    const cleanExerciseTitle = ensureString(exercise?.title, "");
    const cleanChallengeGroup = ensureString(exercise?.challengeGroup, "");

    const cleanExercise = {
      title: cleanExerciseTitle,
      challengeGroup: cleanChallengeGroup,
      fileSetup: exercise?.fileSetup || {},
    };

    const fullCode = buildTestScript(cleanUserCode, test, cleanExercise);
    const result = await runCode(fullCode, 30000);

    if (!result.success) {
      const errorText = String(result.error || "");

      if (
        errorText.toLowerCase().includes("timeout") ||
        errorText.toLowerCase().includes("timed out")
      ) {
        return {
          passed: false,
          feedback:
            "Execution timed out after 30 seconds. " +
            "If your code contains a loop, check that its condition will " +
            "eventually become False.",
          error: result.error,
        };
      }

      let feedback = errorText || "Unknown error";

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
 * Convert to lowercase, trim whitespace, and unify line endings
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

  if (exercise.forbiddenPatterns) {
    for (const pattern of exercise.forbiddenPatterns) {
      if (new RegExp(pattern).test(userCode)) return false;
    }
  }

  return true;
};
