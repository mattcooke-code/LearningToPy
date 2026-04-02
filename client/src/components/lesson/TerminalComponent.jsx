// components/lesson/TerminalComponent.jsx
import { useState, useRef, useEffect, useCallback } from "react";
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
  const { runCode, isReady } = usePython();

  const [input, setInput] = useState(initialCode || "");
  const [output, setOutput] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isExecuting, setIsExecuting] = useState(false);

  const terminalRef = useRef(null);
  const inputRef = useRef(null);
  const { downloadTextFile } = useFileDownload();

  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus({ preventScroll: true });
    }
  };

  const handleRun = useCallback(
    async (codeToRun = input) => {
      if (!codeToRun.trim() || !isReady || isExecuting) return;

      setIsExecuting(true);

      // Manage History
      const newHistory = [codeToRun, ...history.slice(0, 49)];
      setHistory(newHistory);
      setHistoryIndex(-1);

      try {
        const result = await runCode(codeToRun, 5000);

        let finalContent = "";
        if (result.success) {
          finalContent = result.stdout || result.output || "(no output)";
        } else {
          finalContent = result.error;
        }

        const newEntry = [
          { type: "input", content: codeToRun },
          { type: result.success ? "output" : "error", content: finalContent },
        ];

        setOutput((prev) => [...prev, ...newEntry]);
        setInput("");

        if (onCodeExecute) onCodeExecute(result);
      } catch (err) {
        setOutput((prev) => [
          ...prev,
          { type: "error", content: "Execution failed." },
        ]);
      } finally {
        setIsExecuting(false);
      }
    },
    [input, isReady, isExecuting, runCode, onCodeExecute, history],
  );

  // Keyboard Shortcuts (Arrow Up/Down for history)
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleRun();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const nextIndex = historyIndex + 1;
      if (nextIndex < history.length) {
        setHistoryIndex(nextIndex);
        setInput(history[nextIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const nextIndex = historyIndex - 1;
      if (nextIndex >= 0) {
        setHistoryIndex(nextIndex);
        setInput(history[nextIndex]);
      } else {
        setHistoryIndex(-1);
        setInput("");
      }
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setOutput([]);
    }
  };

  const clearOutput = () => setOutput([]);

  const copyOutput = () => {
    const text = output
      .map((line) =>
        line.type === "input" ? `>>> ${line.content}` : line.content,
      )
      .join("\n");
    navigator.clipboard.writeText(text);
  };

  const loadSnippet = (code) => {
    setInput(code);
    focusInput();
  };

  const snippets = [
    { name: "Hello World", code: "print('Hello, World!')" },
    { name: "Math", code: "print(2 + 2 * 10)" },
    { name: "Loops", code: "for i in range(5):\n    print(f'Count: {i}')" },
  ];

  // Auto-scroll effect
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  return (
    <div
      className={`flex flex-col rounded-xl overflow-hidden border shadow-sm transition-colors ${
        isCodeDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
      }`}
    >
      {/* HEADER: Responsive Stacking */}
      <div
        className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 gap-3 border-b ${
          isCodeDark
            ? "bg-gray-800 border-gray-700"
            : "bg-gray-50 border-gray-200"
        }`}
      >
        <div className="flex items-center space-x-2">
          <TerminalIcon
            size={18}
            className={isCodeDark ? "text-blue-400" : "text-blue-600"}
          />
          <span
            className={`font-semibold text-sm ${isCodeDark ? "text-gray-200" : "text-gray-700"}`}
          >
            Interactive Terminal
          </span>
        </div>

        <div className="flex items-center justify-between w-full sm:w-auto gap-4">
          <div className="flex items-center gap-1">
            <button
              onClick={clearOutput}
              className="p-2 hover:bg-gray-500/10 rounded-md text-gray-500"
              title="Clear (Ctrl+L)"
            >
              <Trash2 size={16} />
            </button>
            <button
              onClick={copyOutput}
              className="p-2 hover:bg-gray-500/10 rounded-md text-gray-500"
              title="Copy Session"
            >
              <Copy size={16} />
            </button>
            <button
              onClick={() =>
                downloadTextFile(
                  output.map((o) => o.content).join("\n"),
                  "terminal_session.txt",
                )
              }
              className="p-2 hover:bg-gray-500/10 rounded-md text-gray-500"
              title="Download Session"
            >
              <Download size={16} />
            </button>
          </div>

          <button
            onClick={() => handleRun()}
            disabled={!isReady || isExecuting || !input.trim()}
            className={`flex items-center space-x-2 px-5 py-2 rounded-lg font-bold text-sm transition-all ${
              isExecuting
                ? "bg-gray-400"
                : "bg-green-600 hover:bg-green-700 text-white active:scale-95"
            }`}
          >
            {isExecuting ? <Spinner size="sm" /> : <Play size={16} />}
            <span>Run</span>
          </button>
        </div>
      </div>

      {/* TERMINAL BODY */}
      <div
        ref={terminalRef}
        className="overflow-y-auto p-4 font-mono text-sm space-y-2 custom-scrollbar"
        style={{ height }}
      >
        {output.length === 0 && (
          <div className="text-gray-500 italic">
            Terminal ready. Type code below and press Enter.
          </div>
        )}

        {output.map((line, i) => (
          <div
            key={i}
            className={`whitespace-pre-wrap leading-relaxed ${
              line.type === "input"
                ? "text-blue-400 font-bold"
                : line.type === "error"
                  ? "text-red-500"
                  : isCodeDark
                    ? "text-gray-300"
                    : "text-gray-700"
            }`}
          >
            {line.type === "input" ? (
              <div className="flex gap-2">
                <span className="opacity-50 shrink-0">&gt;&gt;&gt;</span>
                <span>{line.content}</span>
              </div>
            ) : (
              <div className="pl-6">{line.content}</div>
            )}
          </div>
        ))}

        {/* INPUT PROMPT: shrink-0 prevents the symbol from squishing */}
        {!readOnly && (
          <div className="flex items-start gap-2 pt-2 border-t border-gray-500/10 mt-2">
            <span className="text-green-600 dark:text-green-500 font-bold shrink-0 select-none">
              &gt;&gt;&gt;
            </span>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isExecuting}
              className="flex-1 bg-transparent border-none outline-none resize-none p-0 focus:ring-0 min-w-0 text-green-600 dark:text-green-500"
              rows={Math.min(5, input.split("\n").length)}
              placeholder="Type code here..."
              spellCheck="false"
            />
          </div>
        )}
      </div>

      {/* FOOTER: Wrapping Snippets */}
      <div
        className={`p-3 border-t text-xs space-y-3 ${
          isCodeDark
            ? "bg-gray-800/50 border-gray-700 text-gray-400"
            : "bg-gray-50 border-gray-200 text-gray-500"
        }`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium mr-1 uppercase tracking-tighter opacity-70">
            Quick Snippets:
          </span>
          {snippets.map((s, i) => (
            <button
              key={i}
              onClick={() => loadSnippet(s.code)}
              className={`px-2 py-1 rounded border transition-colors ${
                isCodeDark
                  ? "bg-gray-700 border-gray-600 hover:bg-gray-600"
                  : "bg-white border-gray-300 hover:bg-gray-100"
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>

        <div className="flex justify-between items-center opacity-70">
          <div className="flex space-x-4">
            <span>History: {history.length}</span>
            <span>Lines: {output.length}</span>
          </div>
          {isExecuting && (
            <span className="text-yellow-500 animate-pulse font-bold uppercase">
              Executing...
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TerminalComponent;
