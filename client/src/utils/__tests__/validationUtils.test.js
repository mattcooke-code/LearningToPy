import { describe, it, expect, vi } from "vitest";
import {
  validateWithPyodide,
  validateOutputWithPyodide,
  checkIfOptimalSolution,
} from "../validationUtils";

// ============================================================================
// validateWithPyodide
// ============================================================================

describe("validateWithPyodide", () => {
  it("returns error when runCode is not provided", async () => {
    const result = await validateWithPyodide(
      "print('hello')",
      { validation: "OUTPUT" },
      undefined,
    );

    expect(result.success).toBe(false);
    expect(result.feedback).toContain("Python engine is not available");
    expect(result.error).toContain("runCode function not provided");
  });

  it("returns success immediately for THEORY type (no validation)", async () => {
    const result = await validateWithPyodide(
      "some code",
      { validation: "THEORY" },
      vi.fn(),
    );

    expect(result.success).toBe(true);
    expect(result.feedback).toBe("Completed successfully!");
  });

  it("returns success for any non-TESTS, non-OUTPUT validation type", async () => {
    const result = await validateWithPyodide(
      "code",
      { validation: "UNKNOWN_TYPE" },
      vi.fn(),
    );

    expect(result.success).toBe(true);
  });

  it("calls runTestsWithPyodide when validation is TESTS and tests exist", async () => {
    const runCode = vi.fn().mockResolvedValue({
      success: true,
      stdout: "TEST_PASSED",
    });

    const exercise = {
      validation: "TESTS",
      tests: [
        {
          name: "Test 1",
          code: "assert True",
        },
      ],
    };

    const result = await validateWithPyodide("user code", exercise, runCode);

    expect(result.success).toBe(true);
    expect(runCode).toHaveBeenCalled();
  });

  it("falls through to theory when validation is TESTS but tests is null", async () => {
    const exercise = {
      validation: "TESTS",
      tests: null,
    };

    const result = await validateWithPyodide("code", exercise, vi.fn());

    // No tests to run — treats as THEORY, always passes
    expect(result.success).toBe(true);
    expect(result.feedback).toBe("Completed successfully!");
  });

  it("calls validateOutputWithPyodide when validation is OUTPUT", async () => {
    const runCode = vi.fn().mockResolvedValue({
      success: true,
      stdout: "expected output",
    });

    const exercise = {
      validation: "OUTPUT",
      expectedOutput: "expected output",
    };

    const result = await validateWithPyodide(
      "print('expected output')",
      exercise,
      runCode,
    );

    expect(result.success).toBe(true);
    expect(runCode).toHaveBeenCalledWith("print('expected output')", 10000);
  });

  it("returns controlled failure when runCode throws inside OUTPUT validation", async () => {
    const runCode = vi.fn().mockImplementation(() => {
      throw new Error("Unexpected crash");
    });

    const result = await validateWithPyodide(
      "code",
      { validation: "OUTPUT" },
      runCode,
    );

    // The inner validateOutputWithPyodide catches the error and returns a
    // controlled failure object (no 'error' key)
    expect(result.success).toBe(false);
    expect(result.feedback).toContain("Validation error");
  });
});

// ============================================================================
// validateOutputWithPyodide
// ============================================================================

describe("validateOutputWithPyodide", () => {
  it("returns failure when runCode fails", async () => {
    const runCode = vi.fn().mockResolvedValue({
      success: false,
      error: "SyntaxError: invalid syntax",
    });

    const result = await validateOutputWithPyodide(
      "bad code",
      "anything",
      runCode,
    );

    expect(result.success).toBe(false);
    expect(result.feedback).toContain("Runtime error");
  });

  it("returns exact match success", async () => {
    const runCode = vi.fn().mockResolvedValue({
      success: true,
      stdout: "Hello World",
    });

    const result = await validateOutputWithPyodide(
      'print("Hello World")',
      "Hello World",
      runCode,
    );

    expect(result.success).toBe(true);
    expect(result.feedback).toContain("Output matched exactly");
  });

  it("matches case-insensitively", async () => {
    const runCode = vi.fn().mockResolvedValue({
      success: true,
      stdout: "HELLO WORLD",
    });

    const result = await validateOutputWithPyodide(
      'print("HELLO WORLD")',
      "hello world",
      runCode,
    );

    expect(result.success).toBe(true);
  });

  it("matches when actual contains expected", async () => {
    const runCode = vi.fn().mockResolvedValue({
      success: true,
      stdout: "The answer is 42. That's all.",
    });

    const result = await validateOutputWithPyodide(
      "code",
      "answer is 42",
      runCode,
    );

    expect(result.success).toBe(true);
    expect(result.feedback).toContain("Output contains the correct answer");
  });

  it("normalises line endings (\\r\\n → \\n)", async () => {
    const runCode = vi.fn().mockResolvedValue({
      success: true,
      stdout: "line1\r\nline2",
    });

    const result = await validateOutputWithPyodide(
      "code",
      "line1\nline2",
      runCode,
    );

    expect(result.success).toBe(true);
  });

  it("trims surrounding whitespace", async () => {
    const runCode = vi.fn().mockResolvedValue({
      success: true,
      stdout: "  hello  ",
    });

    const result = await validateOutputWithPyodide("code", "hello", runCode);

    expect(result.success).toBe(true);
  });

  it("returns failure when output does not match", async () => {
    const runCode = vi.fn().mockResolvedValue({
      success: true,
      stdout: "wrong output",
    });

    const result = await validateOutputWithPyodide(
      "code",
      "expected output",
      runCode,
    );

    expect(result.success).toBe(false);
    expect(result.feedback).toContain("doesn't match");
    expect(result.output).toBe("wrong output");
  });

  it("catches unexpected errors in validation", async () => {
    const runCode = vi.fn().mockRejectedValue(new Error("Boom"));

    const result = await validateOutputWithPyodide("code", "output", runCode);

    expect(result.success).toBe(false);
    expect(result.feedback).toContain("Validation error");
  });
});

// ============================================================================
// checkIfOptimalSolution
// ============================================================================

describe("checkIfOptimalSolution", () => {
  it("returns false for empty code", () => {
    expect(checkIfOptimalSolution("", {})).toBe(false);
    expect(checkIfOptimalSolution(null, {})).toBe(false);
  });

  it("returns false when code exceeds maxLines", () => {
    const code = "line1\nline2\nline3\nline4\nline5\nline6\nline7";
    const exercise = { maxLines: 6 };

    expect(checkIfOptimalSolution(code, exercise)).toBe(false);
  });

  it("returns true when code is within maxLines", () => {
    const code = "line1\nline2\nline3";
    const exercise = { maxLines: 5 };

    expect(checkIfOptimalSolution(code, exercise)).toBe(true);
  });

  it("does not count empty lines against maxLines", () => {
    const code = "line1\n\n\nline2\n\n\nline3";
    // Only 3 non-empty lines
    const exercise = { maxLines: 3 };

    expect(checkIfOptimalSolution(code, exercise)).toBe(true);
  });

  it("returns true by default when no constraints set", () => {
    expect(checkIfOptimalSolution("any code", {})).toBe(true);
  });

  it("returns false when forbidden pattern is found", () => {
    const code = "print(2+2)";
    const exercise = {
      forbiddenPatterns: ["print"],
    };

    expect(checkIfOptimalSolution(code, exercise)).toBe(false);
  });

  it("returns true when no forbidden patterns match", () => {
    const code = "x = 2 + 2";
    const exercise = {
      forbiddenPatterns: ["print", "eval"],
    };

    expect(checkIfOptimalSolution(code, exercise)).toBe(true);
  });

  it("handles regex special characters in forbidden patterns", () => {
    const code = "x = (a + b)";
    const exercise = {
      forbiddenPatterns: ["\\(.*\\+.*\\)"], // matches parentheses with +
    };

    expect(checkIfOptimalSolution(code, exercise)).toBe(false);
  });

  it("returns false when code exceeds maxLines AND has forbidden patterns", () => {
    const code = "a\nb\nc\nd\ne\nf\ng\nh";
    const exercise = {
      maxLines: 5,
      forbiddenPatterns: ["z"],
    };

    // Fails on line count first
    expect(checkIfOptimalSolution(code, exercise)).toBe(false);
  });
});
