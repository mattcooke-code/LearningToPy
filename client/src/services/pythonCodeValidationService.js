// /client/src/services/pythonCodeValidationService.js
/**
 * @fileoverview Pyodide-based Python code validation engine.
 *
 * Validation modes:
 *   TESTS  — Runs a suite of Python test assertions via Pyodide.
 *   OUTPUT — Compares stdout against exercise.expectedOutput
 *            (case-insensitive, line-endings unified, outer-trimmed).
 *   THEORY — No validation; always passes.
 *
 * Misconfigured exercises (TESTS with no tests, OUTPUT with no
 * expectedOutput) FAIL CLOSED. Silently passing them would award XP
 * for content bugs.
 *
 * @module services/pythonCodeValidationService
 */
import { getFileCreationCode, getExpectedFiles } from "../data/fileExercises";

const PLACEHOLDER_FEEDBACK =
  "Your code still has ??? placeholders. " +
  "Replace each ??? with your answer, then submit again.";

const CONFIG_ERROR_FEEDBACK =
  "This exercise isn't set up correctly, so it can't be checked. " +
  "Please let us know so we can fix it.";

/**
 * Modules that genuinely cannot work in the browser sandbox. A
 * ModuleNotFoundError for one of these is swallowed during TESTS
 * validation; anything else is reported to the student (so `import requets`
 * no longer disappears silently).
 */
const BROWSER_UNAVAILABLE_MODULES = ["requests"];

/** Coerce a value to string without throwing. */
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
 * Strip line comments from Python source, to detect placeholders that
 * only exist inside comments.
 *
 * Not a tokenizer: a `#` inside a string literal is treated as a comment
 * start. Known heuristic limitation, accepted deliberately.
 */
const stripLineComments = (src) =>
  ensureString(src)
    .split("\n")
    .map((line) => line.split("#")[0])
    .join("\n");

/** True if the code still contains `???` outside of comments. */
const hasPlaceholder = (src) => stripLineComments(src).includes("???");

/** Indent a multi-line Python snippet. Empty lines stay empty. */
const indentPython = (snippet, spaces = 4) => {
  const pad = " ".repeat(spaces);
  return ensureString(snippet)
    .split("\n")
    .map((line) => (line.length > 0 ? pad + line : line))
    .join("\n");
};

/** UTF-8 safe base64 (replaces deprecated unescape/encodeURIComponent trick). */
const toBase64 = (str) => {
  const bytes = new TextEncoder().encode(ensureString(str));
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

const isTimeoutError = (errorText) =>
  /time ?d?\s?out|timed out/i.test(errorText);

/**
 * TEST AUTHOR CONTRACT
 *
 * Names available in the test scope:
 *   student_code — the user's source, as a str. PREFERRED.
 *   code         — deprecated alias of student_code. Do NOT use in new
 *                  tests; students often name a variable `code`.
 *   output       — captured stdout from executing the user's code.
 *
 * Reserved names the runner owns — do not rely on student-defined
 * versions of these surviving into the test body:
 *   sys, io, os, base64, old_stdout, captured_output, student_code, code, output
 *
 * Any other top-level name the student defined IS visible, because the
 * runner exec()s their code in the module globals.
 *
 * Tests MUST NOT call exec(student_code) / exec(code). The runner has
 * already executed it exactly once. Re-executing duplicates side effects
 * and breaks stdout capture for stateful code.
 *
 * A test signals success by printing TEST_PASSED. Student stdout is
 * captured separately, so a student cannot print it to fake a pass.
 *
 * PLACEHOLDER HANDLING
 * The `???` check runs on the JS side BEFORE the script is generated, so
 * a malformed generated script can never suppress the friendly message.
 * Never move it into the Python source.
 */

/** Build the complete Python script that runs one test. */
const buildTestScript = (userCode, test, cleanExercise) => {
  const b64UserCode = toBase64(userCode);
  const fileCreationCode = getFileCreationCode(cleanExercise);

  // Same lookup as fileCreationCode
  const fileExistsChecks = getExpectedFiles(cleanExercise)
    .map(
      (filename) =>
        `if not os.path.exists(${JSON.stringify(filename)}):\n` +
        `    raise FileNotFoundError(${JSON.stringify(
          `Setup failed: ${filename} not created`,
        )})`,
    )
    .join("\n");

  const indentedTest = indentPython(test?.code, 4);
  const crashPrefix = JSON.stringify(
    `Test "${ensureString(test?.name, "unnamed")}" crashed:`,
  );

  return `
import sys, io, os, base64
# --- Create exercise files ---
${fileCreationCode}
# --- Verify files exist ---
${fileExistsChecks}
# --- Student code ---
student_code = base64.b64decode("${b64UserCode}").decode("utf-8")
code = student_code
_browser_unavailable = ${JSON.stringify(BROWSER_UNAVAILABLE_MODULES)}
# --- Execute student code with friendly error handling ---
old_stdout = sys.stdout
captured_output = io.StringIO()
sys.stdout = captured_output
try:
    exec(student_code)
except ModuleNotFoundError as e:
    _missing = (e.name or "").split(".")[0]
    if _missing not in _browser_unavailable:
        raise AssertionError(
            f"Your code imports '{e.name}', which isn't available here. "
            f"Check the spelling, or stick to the modules this lesson covers."
        )
except SyntaxError as e:
    _raw = str(e.msg).rstrip()
    if "Perhaps" in _raw:
        _raw = _raw[: _raw.index("Perhaps")].rstrip()
    if _raw and _raw[-1] not in ".!?":
        _raw += "."
    raise AssertionError(
        f"Your code has a syntax error on line {e.lineno}: {_raw} "
        f"Check for incomplete lines or missing punctuation."
    )
except SystemExit:
    raise AssertionError(
        "Your code called exit() or quit(), which stops the runner. "
        "Remove it and try again."
    )
except Exception as e:
    raise AssertionError(f"Error in your code: {str(e)}")
finally:
    # finally is essential: SystemExit/KeyboardInterrupt are BaseException
    # and would otherwise leave sys.stdout redirected for every later run
    # in this worker.
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
        "This usually means your code produced an unexpected value "
        "or is missing something the exercise asked for."
    )
`.trim();
};

/** Run exercise validation using Pyodide. */
export const validateWithPyodide = async (userCode, exercise, runCode) => {
  if (!runCode) {
    return {
      success: false,
      feedback: "Python engine is not available. Please try again.",
      error: "runCode function not provided",
    };
  }

  const safeExercise = exercise ?? {};

  try {
    const mode = safeExercise.validation;

    if (mode === "TESTS") {
      // Fail closed: `[]` is truthy, so the old check let empty test
      // suites fall through to "All tests passed!" and award XP.
      if (
        !Array.isArray(safeExercise.tests) ||
        safeExercise.tests.length === 0
      ) {
        console.error(
          "[validation] TESTS exercise has no test cases:",
          safeExercise.title,
        );
        return {
          success: false,
          feedback: CONFIG_ERROR_FEEDBACK,
          error: "TESTS validation with no test cases",
        };
      }
      return await runTestsWithPyodide(userCode, safeExercise, runCode);
    }

    if (mode === "OUTPUT") {
      // Pass the exercise through so file setup actually runs.
      return await validateOutputWithPyodide(
        userCode,
        safeExercise.expectedOutput,
        runCode,
        safeExercise,
      );
    }

    if (mode && mode !== "THEORY" && mode !== "NONE") {
      console.warn(
        `[validation] Unknown validation mode "${mode}" for ` +
          `"${safeExercise.title}" — treated as no validation.`,
      );
    }

    return { success: true, feedback: "Completed successfully!" };
  } catch (error) {
    return {
      success: false,
      feedback: `Validation error: ${error.message}`,
      error: error.toString(),
    };
  }
};

/** Run all tests with Pyodide. Stops at the first failure. */
const runTestsWithPyodide = async (userCode, exercise, runCode) => {
  const tests = exercise.tests;
  const validationResults = [];

  for (const test of tests) {
    const testResult = await runSingleTest(userCode, test, runCode, exercise);
    validationResults.push(testResult);

    if (!testResult.passed) {
      return {
        success: false,
        feedback:
          testResult.feedback ||
          `Test failed: ${ensureString(test?.name, "unnamed")}`,
        testsPassed: validationResults.filter((r) => r.passed).length,
        totalTests: tests.length,
        failedTest: test?.name,
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

/** Run a single test case. */
const runSingleTest = async (userCode, test, runCode, exercise) => {
  try {
    const cleanUserCode = ensureString(userCode);

    // JS-side placeholder check — must not depend on the generated
    // script being well-formed. See PLACEHOLDER HANDLING above.
    if (hasPlaceholder(cleanUserCode)) {
      return { passed: false, feedback: PLACEHOLDER_FEEDBACK };
    }

    const cleanExercise = {
      title: ensureString(exercise?.title, ""),
      challengeGroup: ensureString(exercise?.challengeGroup, ""),
      fileSetup: exercise?.fileSetup || {},
    };

    const fullCode = buildTestScript(cleanUserCode, test, cleanExercise);
    const result = await runCode(fullCode, 30000, { freshGlobals: true });

    if (!result.success) {
      const errorText = ensureString(result.error);

      if (isTimeoutError(errorText)) {
        return {
          passed: false,
          feedback:
            "Execution timed out after 30 seconds. " +
            "If your code contains a loop, check that its condition will " +
            "eventually become False.",
          error: result.error,
        };
      }

      if (errorText.includes("Setup failed:")) {
        console.error("[validation] File setup failed:", errorText);
        return {
          passed: false,
          feedback: CONFIG_ERROR_FEEDBACK,
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
      feedback: `Test "${ensureString(test?.name, "unnamed")}" failed to confirm logic.`,
      output: stdout,
    };
  } catch (error) {
    return { passed: false, feedback: `Execution error: ${error.message}` };
  }
};

/** Lowercase, unify CRLF/CR to LF, trim outer whitespace. */
const normalizeOutput = (str) =>
  ensureString(str)
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .toLowerCase()
    .trim();

/**
 * Validate that stdout matches expectedOutput.
 *
 * `exercise` is optional for backward compatibility, but pass it or
 * file-based exercises will fail with FileNotFoundError.
 */
export const validateOutputWithPyodide = async (
  userCode,
  expectedOutput,
  runCode,
  exercise = {},
) => {
  try {
    const cleanUserCode = ensureString(userCode);

    if (hasPlaceholder(cleanUserCode)) {
      return { success: false, feedback: PLACEHOLDER_FEEDBACK };
    }

    const expected = normalizeOutput(expectedOutput);
    // `actual.includes("")` is always true — fail closed instead of
    // accepting literally any output.
    if (!expected) {
      console.error(
        "[validation] OUTPUT exercise has no expectedOutput:",
        exercise?.title,
      );
      return {
        success: false,
        feedback: CONFIG_ERROR_FEEDBACK,
        error: "OUTPUT validation with no expectedOutput",
      };
    }

    const fileCreationCode = getFileCreationCode(exercise);
    const fullCode = fileCreationCode
      ? `${fileCreationCode}\n${cleanUserCode}`
      : cleanUserCode;

    const result = await runCode(fullCode, 10000, { freshGlobals: true });

    if (!result.success) {
      const errorText = ensureString(result.error);
      if (isTimeoutError(errorText)) {
        return {
          success: false,
          feedback:
            "Execution timed out after 10 seconds. " +
            "If your code contains a loop, check that its condition will " +
            "eventually become False.",
        };
      }
      return { success: false, feedback: `Runtime error: ${errorText}` };
    }

    const actual = normalizeOutput(result.stdout);

    if (actual === expected) {
      return { success: true, feedback: "Output matched exactly! 🎉" };
    }
    if (actual.includes(expected)) {
      return {
        success: true,
        feedback: "Output contains the correct answer. Good job!",
      };
    }
    return {
      success: false,
      feedback: "Output doesn't match. Check your print statements!",
      output: actual,
    };
  } catch (error) {
    return { success: false, feedback: `Validation error: ${error.message}` };
  }
};

/**
 * Check if a solution is optimal (line budget + forbidden patterns).
 * A malformed pattern in exercise config is logged and skipped — it must
 * never turn a passing submission into a validation error.
 */
export const checkIfOptimalSolution = (userCode, exercise) => {
  if (!userCode) return false;

  const lines = ensureString(userCode)
    .split("\n")
    .filter((l) => l.trim());

  if (exercise?.maxLines && lines.length > exercise.maxLines) return false;

  if (Array.isArray(exercise?.forbiddenPatterns)) {
    for (const pattern of exercise.forbiddenPatterns) {
      try {
        if (new RegExp(pattern).test(userCode)) return false;
      } catch (err) {
        console.warn(
          `[validation] Invalid forbiddenPattern ${String(pattern)} in ` +
            `"${exercise?.title}" — skipping.`,
          err,
        );
      }
    }
  }

  return true;
};
