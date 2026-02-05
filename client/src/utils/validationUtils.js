// utils/validationUtils.js

/**
 * Run exercise validation using Pyodide
 */
export const validateWithPyodide = async (userCode, exercise, runCode) => {
  console.log("🎯 validateWithPyodide called");
  console.log("userCode length:", userCode?.length);
  console.log("exercise:", exercise?.title);
  console.log("runCode type:", typeof runCode);

  if (!runCode) {
    console.log("❌ ERROR: runCode is falsy!");
    return {
      success: false,
      feedback: "Python engine is not available. Please try again.",
      error: "runCode function not provided",
    };
  }

  try {
    console.log("🔍 Starting validation...");

    if (exercise.validation === "tests" && exercise.tests) {
      console.log("🔍 Running tests mode");
      return await runTestsWithPyodide(userCode, exercise, runCode);
    } else if (exercise.validation === "output") {
      console.log("🔍 Running output validation mode");
      return await validateOutputWithPyodide(
        userCode,
        exercise.expectedOutput,
        runCode,
      );
    }

    console.log("🔍 Default validation (theory lesson)");
    return {
      success: true,
      feedback: "Completed successfully!",
    };
  } catch (error) {
    console.log("❌ Validation error:", error);
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
    return {
      success: false,
      feedback: "No test cases found for this exercise.",
    };
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

  console.log("🎉 All tests passed!");
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
    // Escape the user code properly for inclusion in a Python string
    const escapedUserCode = userCode
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/\n/g, "\\n");

    // FIXED: Create test code with 'code' variable defined FIRST
    // Then execute the user's code, then run the test
    const fullCode = `
code = "${escapedUserCode}"
${userCode}
${test.code}
`.trim();

    // Execute with longer timeout for complex tests
    const result = await runCode(fullCode, 30000);
    console.log("🔍 Execution result:", {
      success: result.success,
      error: result.error?.substring(0, 100),
      output: result.stdout?.substring(0, 100),
    });

    if (!result.success) {
      // Provide friendly error messages
      let feedback = result.error || "Unknown error";

      // Clean up error messages
      if (feedback.includes("AssertionError:")) {
        const parts = feedback.split("AssertionError:");
        feedback = parts[1]?.trim() || feedback;
      }

      if (feedback.includes("NameError:")) {
        const parts = feedback.split("NameError:");
        feedback = parts[1]?.trim() || feedback;
        feedback = `Missing variable or function: ${feedback}`;
      }

      if (feedback.includes("IndentationError:")) {
        feedback = "Indentation error! Check your spacing carefully.";
      }

      return {
        passed: false,
        feedback: feedback,
        error: result.error,
        output: result.stdout || "",
      };
    }

    // Check for TEST_PASSED in output
    const output = result.stdout || result.output || "";
    if (output.includes("TEST_PASSED")) {
      return {
        passed: true,
        output: output,
        feedback: "Test passed! ✓",
      };
    }

    // If no TEST_PASSED but no error either
    return {
      passed: false,
      feedback: `Test "${test.name}" didn't produce expected output. Check your implementation.`,
      output: output,
      expected: test.expected,
    };
  } catch (error) {
    return {
      passed: false,
      feedback: `Test execution error: ${error.message}`,
      error: error.message,
    };
  }
};

/**
 * Validate output matches expected
 */
export const validateOutputWithPyodide = async (
  userCode,
  expectedOutput,
  runCode,
) => {
  console.log("🔍 validateOutputWithPyodide called");
  try {
    const result = await runCode(userCode, 10000);
    console.log("🔍 Output validation result:", result);

    if (!result.success) {
      return {
        success: false,
        feedback: `Runtime error: ${result.error}`,
        output: result.stdout || "",
      };
    }

    const actualOutput = (result.output || "").trim();
    const normalizedExpected = expectedOutput.trim();

    console.log("🔍 Comparing output:");
    console.log("  Expected:", normalizedExpected);
    console.log("  Actual:", actualOutput);

    if (actualOutput === normalizedExpected) {
      return {
        success: true,
        feedback: "Output matched exactly. Perfect! 🎉",
        output: actualOutput,
      };
    } else if (actualOutput.includes(normalizedExpected)) {
      return {
        success: true,
        feedback: "Output contains expected result. Good job!",
        output: actualOutput,
      };
    } else {
      return {
        success: false,
        feedback: `Output does not match expected. \nExpected: "${normalizedExpected}"\nGot: "${actualOutput}"`,
        output: actualOutput,
      };
    }
  } catch (error) {
    return {
      success: false,
      feedback: `Validation error: ${error.message}`,
      error: error.message,
    };
  }
};

/**
 * Check if solution is optimal (simplified version)
 */
export const checkIfOptimalSolution = (userCode, exercise) => {
  const lines = userCode.split("\n").filter((line) => line.trim().length > 0);

  // 1. Check for specific complexity constraints defined in the exercise JSON
  if (exercise.maxLines && lines.length > exercise.maxLines) {
    return false;
  }

  // 2. Look for "Hardcoded" solutions
  // If they just print the answer instead of calculating it
  if (exercise.forbiddenPatterns) {
    for (const pattern of exercise.forbiddenPatterns) {
      if (new RegExp(pattern).test(userCode)) return false;
    }
  }

  // 3. Basic "Clean Code" Heuristics
  const hasMultiplePrints = (userCode.match(/print\(/g) || []).length > 3;
  const isExcessivelyLong = userCode.length > 500;

  return !hasMultiplePrints && !isExcessivelyLong;
};
