// components/lesson/TerminalComponent.jsx
import {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  Terminal as TerminalIcon,
  Play,
  Trash2,
  Copy,
  Download,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";
import { usePython, useTheme } from "../../context";
import { PythonSyntaxHighlighter, Spinner } from "../ui";
import { useFileDownload } from "../../hooks/useFileDownload";

/**
 * @fileoverview
 * Interactive Python terminal component using Pyodide for client-side code execution.
 * This component provides a full-featured terminal experience with command history,
 * syntax highlighting, and mock library support. Handles Pyodide WASM environment
 * loading states, code execution with preamble injection, and comprehensive error handling.
 * Features keyboard shortcuts, session management, and responsive design.
 */

/**
 * Interactive Python terminal component powered by Pyodide for client-side execution.
 * 
 * This component creates a fully functional Python terminal that runs entirely in the browser
 * using WebAssembly (Pyodide). It handles the complete lifecycle of the Python environment
 * including loading states, code execution with mock library injection, command history,
 * and comprehensive error handling. The terminal provides a REPL-like experience with
 * syntax highlighting, keyboard shortcuts, and session management capabilities.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.initialCode="print('Hello, Python Terminal!')"] - Initial code to display
 * @param {string} [props.height="300px"] - Terminal height
 * @param {Function} [props.onCodeExecute=null] - Callback when code executes
 * @param {boolean} [props.readOnly=false] - Whether terminal is read-only
 * @param {Object} ref - Forwarded ref for imperative methods
 * @returns {JSX.Element} Interactive Python terminal interface
 * 
 * @pyodideIntegration
 * - Uses usePython hook for Pyodide WASM environment access
 * - Handles loading/ready states of the Python engine
 * - Code execution through runCode() method with timeout handling
 * - Mock library injection for browser-incompatible modules (requests, etc.)
 * - Preamble building for seamless library integration
 * 
 * @codeExecutionFlow
 * 1. Code validation (removes comments, checks for incomplete placeholders)
 * 2. Preamble injection for mocked libraries
 * 3. Execution through Pyodide's runCode() method
 * 4. Result processing (stdout, stderr, output handling)
 * 5. Terminal output formatting and display
 * 6. History management and cursor positioning
 * 
 * @mockLibrarySystem
 * - MOCKED_LIBRARIES object defines browser-incompatible modules
 * - extractImportedModules() parses import statements from user code
 * - buildPreamble() creates mock code for detected incompatible imports
 * - Mock libraries provide simulated responses for network operations
 * - Warning system informs users about simulated functionality
 * 
 * @stateManagement
 * - input: Current user input in terminal
 * - output: Array of terminal output items (input, output, error, warning)
 * - history: Command history for navigation with arrow keys
 * - historyIndex: Current position in command history
 * - isExecuting: Loading state during code execution
 * 
 * @userInteraction
 * - Enter key executes code, Shift+Enter for new lines
 * - Arrow keys navigate command history
 * - Ctrl+L clears terminal, Ctrl+D downloads session
 * - Click-to-copy and download functionality
 * - Quick code snippets for common operations
 * 
 * @errorHandling
 * - Pyodide loading failure states with retry options
 * - Code execution errors with detailed error messages
 * - Incomplete placeholder detection (??? patterns)
 * - Network error handling for file operations
 * - Graceful fallbacks for unsupported operations
 * 
 * @responsiveDesign
 * - Mobile-friendly input area with adaptive sizing
 * - Touch-friendly buttons and controls
 * - Flexible layout for different screen sizes
 * - Accessible keyboard navigation and shortcuts
 */

// ---------------------------------------------------------------------------
// Library strategy configuration
// ---------------------------------------------------------------------------

/**
 * Libraries that must be mocked because they rely on OS networking
 * which is unavailable in the browser sandbox.
 *
 * Each entry is a Python code string that installs a fake module into
 * sys.modules. The mock is injected before the student's code runs.
 */
const MOCKED_LIBRARIES = {
  requests: `
import sys, json as _json

class _MockResponse:
    def __init__(self):
        self.status_code = 200
        self.ok = True
        self.text = '{"message": "Mock response — requests is simulated in the browser"}'
        self._data = {"message": "Mock response — requests is simulated in the browser"}
    def json(self):
        return self._data
    def raise_for_status(self):
        pass
    def __repr__(self):
        return f"<MockResponse [200]>"

class _MockRequests:
    def get(self, url, **kwargs):
        return _MockResponse()
    def post(self, url, **kwargs):
        return _MockResponse()
    def put(self, url, **kwargs):
        return _MockResponse()
    def delete(self, url, **kwargs):
        return _MockResponse()
    def head(self, url, **kwargs):
        return _MockResponse()
    def patch(self, url, **kwargs):
        return _MockResponse()

sys.modules['requests'] = _MockRequests()
`.trim(),
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Parse import statements from student code and return a list of top-level
 * module names. Handles:
 *   import pandas
 *   import pandas as pd
 *   from bs4 import BeautifulSoup
 *   from requests import get
 */
const extractImportedModules = (code) => {
  const modules = new Set();
  const importRegex = /^\s*(?:import\s+([\w]+)|from\s+([\w]+)\s+import)/gm;
  let match;
  while ((match = importRegex.exec(code)) !== null) {
    modules.add(match[1] || match[2]);
  }
  return [...modules];
};

/**
 * Build the Python preamble.
 * All course libraries are preloaded in the worker — this only needs to
 * inject mocks for libraries that cannot run in the browser (e.g. requests).
 *
 * Returns { preamble: string, warnings: string[] }
 */
const buildPreamble = (code) => {
  const imported = extractImportedModules(code);
  const warnings = [];

  const toMock = imported.filter((mod) => mod in MOCKED_LIBRARIES);

  if (toMock.length > 0) {
    warnings.push(
      `Note: ${toMock.join(", ")} ${toMock.length === 1 ? "is" : "are"} simulated in the browser. Network calls will return mock data.`,
    );
  }

  const preamble =
    toMock.length > 0
      ? toMock.map((mod) => MOCKED_LIBRARIES[mod]).join("\n") + "\n"
      : "";

  return { preamble, warnings };
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const TerminalComponent = forwardRef(
  (
    {
      initialCode = "print('Hello, Python Terminal!')",
      height = "300px",
      onCodeExecute = null,
      readOnly = false,
    },
    ref,
  ) => {
    const { isCodeDark } = useTheme();
    const { runCode, isReady, isLoading } = usePython();

    const [input, setInput] = useState(initialCode || "");
    const [output, setOutput] = useState([]);
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [isExecuting, setIsExecuting] = useState(false);

    const terminalRef = useRef(null);
    const inputRef = useRef(null);
    const lastInitialCode = useRef(initialCode);

    const { downloadTextFile } = useFileDownload();

    const focusInput = () => {
      if (inputRef.current) {
        inputRef.current.focus({ preventScroll: true });
      }
    };

    const snippets = [
      { name: "Hello World", code: 'print("Hello, World!")' },
      { name: "Calculate", code: "print(5 + 3)\nprint(10 / 2)" },
      {
        name: "Variables",
        code: 'name = "Python Learner"\nprint(f"Hello, {name}!")',
      },
      { name: "Loop", code: "for i in range(3):\n    print(f'Count: {i}')" },
    ];

    const terminalContent = useMemo(() => {
      return output
        .map((item) => {
          switch (item.type) {
            case "input":
              return `>>> ${item.content}`;
            case "output":
              return item.content;
            case "error":
              return `Error: ${item.content}`;
            case "warning":
              return `⚠ ${item.content}`;
            default:
              return item.content;
          }
        })
        .filter((line) => line.trim() !== "")
        .join("\n");
    }, [output]);

    // ---------------------------------------------------------------------------
    // Core execute logic
    // ---------------------------------------------------------------------------

    const executeCode = useCallback(
      async (code = input, { forceRun = false } = {}) => {
        if (!code.trim() || isExecuting || !isReady) return;

        // ----- Starter code guard -----
        const codeWithoutComments = code
          .split("\n")
          .map((line) => line.split("#")[0])
          .join("\n");

        // ----- ??? guard: block on incomplete placeholders -----
        if (codeWithoutComments.includes("???")) {
          setOutput((prev) => [
            ...prev,
            {
              type: "error",
              content:
                "Your code contains incomplete steps (???). Complete or comment out incomplete steps before running. Tip: add # at the start of a line to skip it.",
            },
          ]);
          return;
        }

        setIsExecuting(true);
        const newHistory = [...history, code];
        setHistory(newHistory);
        setHistoryIndex(newHistory.length);
        setInput("");

        try {
          // ----- Build preamble (mocks only — libraries preloaded in worker) -----
          const { preamble, warnings } = buildPreamble(code);
          const wrappedCode = preamble ? `${preamble}\n${code}` : code;

          const warningItems = warnings.map((w) => ({
            type: "warning",
            content: w,
          }));

          const result = await runCode(wrappedCode, 5000);

          if (result.success) {
            let outputText = "";
            if (result.stdout) outputText = result.stdout;
            if (
              result.output &&
              result.output !== "None" &&
              result.output !== ""
            ) {
              outputText += (outputText ? "\n" : "") + result.output;
            }

            setOutput((prev) => [
              ...prev,
              ...warningItems,
              { type: "input", content: code },
              { type: "output", content: outputText || "(no output)" },
            ]);

            if (onCodeExecute) {
              onCodeExecute({ code, result: outputText, success: true });
            }
          } else {
            setOutput((prev) => [
              ...prev,
              ...warningItems,
              { type: "input", content: code },
              { type: "error", content: result.error },
            ]);

            if (onCodeExecute) {
              onCodeExecute({ code, error: result.error, success: false });
            }
          }

          setTimeout(() => {
            if (terminalRef.current) {
              terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
            }
          }, 10);
        } catch (error) {
          setOutput((prev) => [
            ...prev,
            { type: "input", content: code },
            { type: "error", content: error.message },
          ]);
        } finally {
          setIsExecuting(false);
        }
      },
      [
        input,
        isExecuting,
        history,
        onCodeExecute,
        isReady,
        runCode,
        initialCode,
      ],
    );

    const clearTerminal = () => {
      setOutput([]);
      lastInitialCode.current = initialCode;
      focusInput();
    };

    const copyTerminalContent = () => {
      navigator.clipboard.writeText(terminalContent);
    };

    const downloadTerminalSession = () => {
      downloadTextFile(terminalContent, "python_terminal_session");
    };

    useImperativeHandle(ref, () => ({
      executeCode: (code) => executeCode(code, { forceRun: true }),
      clearTerminal,
    }));

    const handleKeyDown = useCallback(
      (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          executeCode();
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            setInput(history[newIndex]);
          }
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            setInput(history[newIndex]);
          } else {
            setHistoryIndex(history.length);
            setInput("");
          }
        } else if (e.key === "l" && e.ctrlKey) {
          e.preventDefault();
          clearTerminal();
        } else if (e.key === "d" && e.ctrlKey) {
          e.preventDefault();
          downloadTerminalSession();
        }
      },
      [executeCode, history, historyIndex],
    );

    const loadSnippet = (code) => {
      setInput(code);
      focusInput();
    };

    useEffect(() => {
      focusInput();
    }, []);

    // Sync input when parent changes initialCode (e.g. student moves to next step)
    useEffect(() => {
      if (initialCode !== lastInitialCode.current) {
        setInput(initialCode);
        lastInitialCode.current = initialCode;
      }
    }, [initialCode]);

    useEffect(() => {
      if (terminalRef.current) {
        terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
      }
    }, [output]);

    // ---------------------------------------------------------------------------
    // Loading / error states
    // ---------------------------------------------------------------------------

    if (isLoading) {
      return (
        <div className="flex flex-col h-full">
          <div
            className={`flex items-center justify-between p-3 border-b ${
              isCodeDark
                ? "border-gray-700 bg-gray-800"
                : "border-gray-300 bg-gray-100"
            }`}
          >
            <div className="flex items-center space-x-2">
              <TerminalIcon
                size={20}
                className={isCodeDark ? "text-green-400" : "text-green-600"}
              />
              <span
                className={`font-mono text-sm ${
                  isCodeDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Python Interactive Terminal
              </span>
            </div>
          </div>
          <div
            className={`grow flex items-center justify-center ${
              isCodeDark ? "bg-black" : "bg-gray-900"
            }`}
          >
            <div className="text-center">
              <Spinner size={32} />
              <p
                className={`mt-4 ${
                  isCodeDark ? "text-gray-400" : "text-gray-300"
                }`}
              >
                Loading Python engine...
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (!isReady) {
      return (
        <div className="flex flex-col h-full">
          <div
            className={`flex items-center justify-between p-3 border-b ${
              isCodeDark
                ? "border-gray-700 bg-gray-800"
                : "border-gray-300 bg-gray-100"
            }`}
          >
            <div className="flex items-center space-x-2">
              <TerminalIcon size={20} className="text-red-400" />
              <span
                className={`font-mono text-sm ${
                  isCodeDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Python Interactive Terminal
              </span>
            </div>
          </div>
          <div
            className={`grow flex items-center justify-center ${
              isCodeDark ? "bg-black" : "bg-gray-900"
            }`}
          >
            <div className="text-center text-red-400">
              <AlertCircle size={48} className="mx-auto mb-4" />
              <p className="text-lg">Failed to load Python engine</p>
              <p className="text-sm text-gray-400 mt-2">
                Please refresh the page to try again
              </p>
            </div>
          </div>
        </div>
      );
    }

    // ---------------------------------------------------------------------------
    // Main render
    // ---------------------------------------------------------------------------

    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div
          className={`flex items-center justify-between p-3 border-b ${
            isCodeDark
              ? "border-gray-700 bg-gray-800"
              : "border-gray-300 bg-gray-100"
          }`}
        >
          <div className="flex items-center space-x-2">
            <TerminalIcon
              size={20}
              className={isCodeDark ? "text-green-400" : "text-green-600"}
            />
            <span
              className={`font-mono text-sm ${
                isCodeDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Python Interactive Terminal
            </span>
            {readOnly && (
              <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                Read-only Demo
              </span>
            )}
          </div>

          <div className="flex space-x-2">
            {!readOnly && (
              <button
                onClick={clearTerminal}
                className={`p-1.5 rounded transition ${
                  isCodeDark
                    ? "hover:bg-gray-700 text-gray-300"
                    : "hover:bg-gray-200 text-gray-700"
                }`}
                title="Clear terminal (Ctrl+L)"
              >
                <Trash2 size={16} />
              </button>
            )}
            <button
              onClick={copyTerminalContent}
              className={`p-1.5 rounded transition ${
                isCodeDark
                  ? "hover:bg-gray-700 text-gray-300"
                  : "hover:bg-gray-200 text-gray-700"
              }`}
              title="Copy terminal content"
            >
              <Copy size={16} />
            </button>
            <button
              onClick={downloadTerminalSession}
              className={`p-1.5 rounded transition ${
                isCodeDark
                  ? "hover:bg-gray-700 text-gray-300"
                  : "hover:bg-gray-200 text-gray-700"
              }`}
              title="Download session (Ctrl+D)"
            >
              <Download size={16} />
            </button>
          </div>
        </div>

        {/* Output Area */}
        <div
          ref={terminalRef}
          className={`grow overflow-y-auto overflow-x-hidden p-4 font-mono text-sm whitespace-pre-wrap break-words ${
            isCodeDark ? "bg-black text-gray-300" : "bg-gray-900 text-gray-100"
          }`}
          style={{ height }}
        >
          {output.map((item, index) => (
            <div key={index} className="mb-2">
              {item.type === "input" && (
                <div className="flex">
                  <span className="text-green-400 mr-2">&gt;&gt;&gt;</span>
                  <div className="grow">
                    <PythonSyntaxHighlighter
                      code={item.content}
                      isDark={isCodeDark}
                    />
                  </div>
                </div>
              )}
              {item.type === "output" && (
                <div className="text-gray-300 ml-4 leading-relaxed whitespace-pre-line">
                  {item.content}
                </div>
              )}
              {item.type === "error" && (
                <div className="text-red-400 ml-4 leading-relaxed">
                  {`Error: ${item.content}`}
                </div>
              )}
              {item.type === "warning" && (
                <div className="flex items-start gap-2 text-yellow-400 ml-4 leading-relaxed">
                  <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                  <span>{item.content}</span>
                </div>
              )}
            </div>
          ))}

          {output.length === 0 && (
            <div className="text-gray-500 italic">
              Type Python code below and press Enter to execute. Use ↑/↓ arrows
              to navigate command history.
              <br />
              <span className="text-xs">
                Ctrl+L to clear, Ctrl+D to download.
              </span>
            </div>
          )}

          {/* Blinking cursor prompt */}
          <div className="flex items-start mt-2">
            <span
              className={`mr-2 ${
                isCodeDark ? "text-green-400" : "text-green-300"
              }`}
            >
              &gt;&gt;&gt;
            </span>
            <span className="text-gray-500 animate-pulse">▋</span>
          </div>
        </div>

        {/* Input Area */}
        <div
          className={`p-3 border-t ${
            isCodeDark
              ? "border-gray-700 bg-gray-800"
              : "border-gray-300 bg-gray-100"
          }`}
        >
          <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-2">
            <div
              className={`grow flex items-start ${
                isCodeDark ? "bg-gray-900" : "bg-white"
              } border rounded`}
            >
              <span
                className={`px-3 py-3 ${
                  isCodeDark ? "text-green-400" : "text-green-600"
                }`}
              >
                &gt;&gt;&gt;
              </span>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={readOnly || isExecuting}
                className={`grow px-2 py-2 font-mono text-sm bg-transparent outline-none resize-none ${
                  isCodeDark ? "text-gray-300" : "text-gray-800"
                }`}
                rows={Math.min(10, input.split("\n").length)}
                placeholder={
                  readOnly
                    ? "Demo terminal — try: print('Hello')"
                    : "Type Python code here and press Enter..."
                }
                style={{ minHeight: "60px" }}
              />
            </div>

            <button
              onClick={() => executeCode(input, { forceRun: true })}
              disabled={!input.trim() || isExecuting || readOnly}
              className={`px-4 py-2 rounded flex items-center justify-center space-x-2 transition w-full sm:w-auto ${
                isExecuting
                  ? "bg-gray-400 cursor-not-allowed"
                  : input.trim() && !readOnly
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-gray-300 cursor-not-allowed text-gray-500"
              }`}
            >
              {isExecuting ? (
                <>
                  <Spinner size={16} />
                  <span>Running...</span>
                </>
              ) : (
                <>
                  <Play size={16} />
                  <span>Run</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Snippets and Stats */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-3 gap-2">
            {!readOnly && (
              <div>
                <div
                  className={`text-xs mb-1 ${
                    isCodeDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Quick examples:
                </div>
                <div className="flex flex-wrap gap-2">
                  {snippets.map((snippet, index) => (
                    <button
                      key={index}
                      onClick={() => loadSnippet(snippet.code)}
                      className={`px-3 py-1 text-xs rounded transition ${
                        isCodeDark
                          ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                          : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                      }`}
                    >
                      {snippet.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div
              className={`text-xs ${
                isCodeDark ? "text-gray-500" : "text-gray-600"
              }`}
            >
              <div className="flex space-x-4">
                <span>Commands: {history.length}</span>
                <span>Lines: {output.length}</span>
                {isExecuting && (
                  <span className="text-yellow-500">Executing...</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

export default TerminalComponent;
