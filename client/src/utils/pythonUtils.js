// utils/pythonUtils.js - All Python/Pyodide related utilities
import { usePython } from "../context/PythonContext";

// Simple validation helper
export const validatePythonOutput = (actual, expected) => {
  const normalize = (str) => str.trim().replace(/\s+/g, " ");
  return normalize(actual) === normalize(expected);
};

// Code complexity analysis (static analysis)
export const analyzePythonCode = (code) => {
  if (!code) return null;

  const lines = code.split("\n").length;
  const hasFunction = /def\s+\w+/.test(code);
  const hasClass = /class\s+\w+/.test(code);
  const hasLoop = /(for|while)\s+/.test(code);
  const hasConditional = /(if|elif|else)\s*:/.test(code);
  const hasImport = /import\s+\w+/.test(code);

  return {
    lines,
    hasFunction,
    hasClass,
    hasLoop,
    hasConditional,
    hasImport,
    complexity: lines > 50 ? "high" : lines > 20 ? "medium" : "low",
  };
};

// Test case runner (requires React hook - use carefully)
export const createTestRunner = () => {
  // This would need to be used inside a component where usePython is available
  // Better to keep test running in the component itself
};

// Common error messages
export const PYTHON_ERRORS = {
  SYNTAX_ERROR: "Syntax Error: Check your Python syntax",
  NAME_ERROR: "Name Error: Variable or function not defined",
  TYPE_ERROR: "Type Error: Wrong data type used",
  INDENTATION_ERROR: "Indentation Error: Check your indentation",
  TIMEOUT: "Execution took too long (timeout)",
};
