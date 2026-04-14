/**
 * Run exercise validation using Pyodide
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
    if (exercise.validation === "tests" && exercise.tests) {
      return await runTestsWithPyodide(userCode, exercise, runCode);
    }

    // 2. Output Mode (Comparison-based validation)
    if (exercise.validation === "output") {
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
    const testResult = await runSingleTest(userCode, test, runCode);
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
const runSingleTest = async (userCode, test, runCode) => {
  try {
    // Using JSON.stringify ensures the userCode is a perfectly escaped Python string
    const safeUserCode = JSON.stringify(userCode);
    const safeTestName = JSON.stringify(test.name);

    const fullCode = `
import sys, io, ast

# Store the student's code for later inspection
student_code = ${safeUserCode}

# Create string capture for output
old_stdout = sys.stdout
captured_output = io.StringIO()
sys.stdout = captured_output

try:
    # Execute the student's code
    exec(compile(student_code, "<student_code>", "exec"), globals())
except Exception as e:
    sys.stdout = old_stdout
    raise AssertionError(f"Error in your code: {str(e)}")

# Restore stdout and get captured output
sys.stdout = old_stdout
output = captured_output.getvalue()

# Now run the specific test
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

    // NORMALIZATION: Convert to lowercase, trim whitespace, and unify line endings
    const normalize = (str) => str.toLowerCase().replace(/\r\n/g, "\n").trim();

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
