// components/lesson/TerminalComponent.jsx
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  Terminal as TerminalIcon,
  Play,
  Trash2,
  Copy,
  Download,
  AlertCircle,
} from "lucide-react";
import { usePython, useTheme } from "../../context";
import { Spinner } from "../ui";
import { useFileDownload } from "../../hooks/useFileDownload";

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

  // Use the custom hook
  const { downloadTextFile } = useFileDownload();

  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus({ preventScroll: true });
    }
  };

  // Sample pre-populated code snippets for beginners
  const snippets = [
    { name: "Hello World", code: 'print("Hello, World!")' },
    { name: "Calculate", code: "print(5 + 3)\nprint(10 / 2)" },
    {
      name: "Variables",
      code: 'name = "Python Learner"\nprint(f"Hello, {name}!")',
    },
    { name: "Loop", code: "for i in range(3):\n    print(f'Count: {i}')" },
  ];

  // Memoized terminal content with proper formatting
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
          default:
            return item.content;
        }
      })
      .filter((line) => line.trim() !== "") // Remove empty lines
      .join("\n");
  }, [output]);

  // Memoized execute function
  const executeCode = useCallback(
    async (code = input) => {
      if (!code.trim() || isExecuting || !isReady) return;

      setIsExecuting(true);
      const newHistory = [...history, code];
      setHistory(newHistory);
      setHistoryIndex(newHistory.length);
      setInput("");

      try {
        const result = await runCode(code, 5000);

        // 1. Move declaration HERE so it's available everywhere in try/catch
        let outputText = "";

        if (result.success) {
          if (result.stdout) {
            outputText = result.stdout;
          }

          if (
            result.output &&
            result.output !== "None" &&
            result.output !== ""
          ) {
            outputText += (outputText ? "\n" : "") + result.output;
          }

          // 2. Add to output INSIDE the success block
          setOutput((prev) => [
            ...prev,
            { type: "input", content: code },
            { type: "output", content: outputText || "(no output)" },
          ]);

          if (onCodeExecute) {
            onCodeExecute({ code, result: outputText, success: true });
          }
        } else {
          // 3. This was likely where your logic was getting tangled.
          // If result.success is false, handle the error here:
          setOutput((prev) => [
            ...prev,
            { type: "input", content: code },
            { type: "error", content: result.error },
          ]);

          if (onCodeExecute) {
            onCodeExecute({ code, error: result.error, success: false });
          }
        }

        // Scroll to bottom
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
    [input, isExecuting, history, onCodeExecute, isReady, runCode],
  );

  const clearTerminal = async () => {
    setOutput([]);
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

  // Focus input on mount
  useEffect(() => {
    focusInput();
  }, []);

  // Handle initial code
  useEffect(() => {
    if (initialCode !== lastInitialCode.current) {
      setInput(initialCode);
      lastInitialCode.current = initialCode;
    }
  }, [initialCode]);

  // Auto-scroll to bottom when output changes
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

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
          className={`flex-grow flex items-center justify-center ${
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

  // Show error state if Pyodide failed to load
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
          className={`flex-grow flex items-center justify-center ${
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
        className={`flex-grow overflow-y-auto p-4 font-mono text-sm whitespace-pre-wrap ${
          isCodeDark ? "bg-black text-gray-300" : "bg-gray-900 text-gray-100"
        }`}
        style={{ height }}
      >
        {output.map((item, index) => (
          <div key={index} className="mb-1">
            {item.type === "input" && (
              <div className="text-green-400">{`>>> ${item.content}`}</div>
            )}
            {item.type === "output" && (
              <div className="text-gray-300 ml-4">{item.content}</div>
            )}
            {item.type === "error" && (
              <div className="text-red-400 ml-4">{`Error: ${item.content}`}</div>
            )}
          </div>
        ))}

        {output.length === 0 && (
          <div className="text-gray-500 italic">
            Type Python code below and press Enter to execute. Use ↑/↓ arrows to
            navigate command history.
            <br />
            <span className="text-xs">
              Tip: Ctrl+L to clear, Ctrl+D to download, 5s timeout for safety
            </span>
          </div>
        )}

        {/* Input prompt */}
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
        <div className="flex items-start space-x-2">
          <div
            className={`flex-grow flex items-start ${
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
              className={`flex-grow px-2 py-2 font-mono text-sm bg-transparent outline-none resize-none ${
                isCodeDark ? "text-gray-300" : "text-gray-800"
              }`}
              rows={Math.min(10, input.split("\n").length)}
              placeholder={
                readOnly
                  ? "Demo terminal - try: print('Hello')"
                  : "Type Python code here and press Enter..."
              }
              style={{ minHeight: "60px" }}
            />
          </div>

          <button
            onClick={() => executeCode()}
            disabled={!input.trim() || isExecuting || readOnly}
            className={`px-4 py-2 rounded flex items-center space-x-2 transition ${
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
          {/* Quick Snippets */}
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

          {/* Stats */}
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
