// components/lesson/TerminalComponent.jsx
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
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

// ---------------------------------------------------------------------------
// Library strategy configuration
// ---------------------------------------------------------------------------

/**
 * Libraries that Pyodide can install via micropip at runtime.
 * These are prepended as an async install block before the student's code.
 */
const MICROPIP_LIBRARIES = ["pandas", "numpy", "beautifulsoup4"];

/**
 * Mapping from the import name a student writes to the micropip package name.
 * e.g. `import bs4` or `from bs4 import ...` → installs "beautifulsoup4"
 */
const IMPORT_TO_PACKAGE = {
  pandas: "pandas",
  numpy: "numpy",
  bs4: "beautifulsoup4",
  beautifulsoup4: "beautifulsoup4",
};

/**
 * Libraries that are built into Pyodide's Python runtime.
 * No installation needed — they just work.
 */
const BUILTIN_LIBRARIES = new Set([
  "sqlite3",
  "re",
  "json",
  "ast",
  "sys",
  "io",
]);

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
 * Build the Python preamble that:
 *  1. Installs required micropip packages (async, so needs runPythonAsync)
 *  2. Injects mocks for any mocked libraries found in the code
 *
 * Returns { preamble: string, warnings: string[] }
 */
const buildPreamble = (code) => {
  const imported = extractImportedModules(code);
  const warnings = [];

  // Determine which mocks to inject
  const toMock = imported.filter((mod) => mod in MOCKED_LIBRARIES);

  if (toMock.length > 0) {
    warnings.push(
      `Note: ${toMock.join(", ")} ${toMock.length === 1 ? "is" : "are"} simulated in the browser. Network calls will return mock data.`,
    );
  }

  const preamble = toMock.map((mod) => MOCKED_LIBRARIES[mod]).join("\n");

  return { preamble, warnings };
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const TerminalComponent = ({
  initialCode = "print('Hello, Python Terminal!')",
  height = "300px",
  onCodeExecute = null,
  readOnly = false,
}) => {
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
      // If the code hasn't been modified from the initial starter code,
      // show a hint rather than running potentially broken/incomplete code.
      // forceRun bypasses this (used when student explicitly clicks Run on
      // unmodified starter code and confirms they want to proceed).
      if (code === initialCode && !forceRun) {
        setOutput((prev) => [
          ...prev,
          {
            type: "warning",
            content:
              "This looks like unmodified starter code. Edit the code above before running, or click Run again to execute it anyway.",
          },
        ]);
        // Flag so the next Run click on the same unmodified code goes through
        lastInitialCode.current = null;
        return;
      }

      setIsExecuting(true);
      const newHistory = [...history, code];
      setHistory(newHistory);
      setHistoryIndex(newHistory.length);
      setInput("");

      try {
        // ----- Build preamble (installs + mocks) -----
        const { preamble, warnings } = buildPreamble(code);
        const wrappedCode = preamble ? `${preamble}\n${code}` : code;

        // Show mock warnings inline in the terminal output
        const warningItems = warnings.map((w) => ({
          type: "warning",
          content: w,
        }));

        const result = await runCode(wrappedCode, 15000); // longer timeout for installs

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
    [input, isExecuting, history, onCodeExecute, isReady, runCode, initialCode],
  );

  const clearTerminal = () => {
    setOutput([]);
    // Reset the starter-code guard so it re-arms after a clear
    lastInitialCode.current = initialCode;
    focusInput();
  };

  const copyTerminalContent = () => {
    navigator.clipboard.writeText(terminalContent);
  };

  const downloadTerminalSession = () => {
    downloadTextFile(terminalContent, "python_terminal_session");
  };

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
              Loading Python engine and libraries...
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
            Type Python code below and press Enter to execute. Use ↑/↓ arrows to
            navigate command history.
            <br />
            <span className="text-xs">
              Tip: Ctrl+L to clear, Ctrl+D to download, 15s timeout for library
              installs
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
        {/* Input row — stacks vertically on mobile, side-by-side on sm+ */}
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

          {/* Run button — full width on mobile */}
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
};

export default TerminalComponent;
