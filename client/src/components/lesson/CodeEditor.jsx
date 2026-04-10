// CodeEditor.jsx
import { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { lintGutter } from "@codemirror/lint";
import { indentUnit } from "@codemirror/language";
import { gutter, GutterMarker } from "@codemirror/view";
import { usePython, useTheme } from "../../context";
import { Spinner } from "../ui";
import { Play, AlertCircle } from "lucide-react";

// ---------------------------------------------------------------------------
// Run-to-here gutter marker
// ---------------------------------------------------------------------------

/**
 * Creates a CodeMirror gutter extension that shows a ▶ button
 * on the hovered line. Clicking it calls onRunToLine(lineNumber).
 */
const createRunToHereGutter = (onRunToLine) => {
  class RunMarker extends GutterMarker {
    constructor(lineNumber) {
      super();
      this.lineNumber = lineNumber;
    }

    toDOM() {
      const btn = document.createElement("button");
      btn.textContent = "▶";
      btn.title = "Run to here";
      btn.style.cssText = `
        background: none;
        border: none;
        color: #22c55e;
        cursor: pointer;
        font-size: 10px;
        padding: 0 2px;
        opacity: 0.85;
        line-height: 1;
      `;
      btn.addEventListener("mouseenter", () => (btn.style.opacity = "1"));
      btn.addEventListener("mouseleave", () => (btn.style.opacity = "0.85"));
      btn.addEventListener("mousedown", (e) => {
        e.preventDefault();
        e.stopPropagation();
        onRunToLine(this.lineNumber);
      });
      return btn;
    }
  }

  return gutter({
    lineMarker(view, line) {
      const lineNumber = view.state.doc.lineAt(line.from).number;
      const hoveredLine = view.state.field(hoveredLineField, false);
      if (hoveredLine === lineNumber) {
        return new RunMarker(lineNumber);
      }
      return null;
    },
    initialSpacer: () => {
      const span = document.createElement("span");
      span.style.width = "16px";
      span.style.display = "inline-block";
      return span;
    },
  });
};

import { StateField, StateEffect } from "@codemirror/state";
import { EditorView } from "@codemirror/view";

const setHoveredLine = StateEffect.define();

const hoveredLineField = StateField.define({
  create: () => null,
  update(value, tr) {
    for (const effect of tr.effects) {
      if (effect.is(setHoveredLine)) return effect.value;
    }
    return value;
  },
});

const hoverPlugin = EditorView.domEventHandlers({
  mousemove(event, view) {
    const pos = view.posAtCoords({ x: event.clientX, y: event.clientY });
    if (pos == null) return;
    const line = view.state.doc.lineAt(pos).number;
    view.dispatch({ effects: setHoveredLine.of(line) });
  },
  mouseleave(_event, view) {
    view.dispatch({ effects: setHoveredLine.of(null) });
  },
});

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const CodeEditor = ({
  value,
  onChange,
  readOnly = false,
  height = "200px",
  className = "",
  showRunButton = false,
  onRun = null,
  onRunToLine = null,
}) => {
  const { isCodeDark } = useTheme();
  const { runCode, isReady, checkSyntax } = usePython();

  const [isRunning, setIsRunning] = useState(false);
  const [quickResult, setQuickResult] = useState(null);

  const extensions = [
    python(),
    lintGutter(),
    indentUnit.of("    "),
    ...(onRunToLine
      ? [hoveredLineField, hoverPlugin, createRunToHereGutter(onRunToLine)]
      : []),
  ];

  const handleQuickRun = async () => {
    if (!isReady || isRunning) return;

    setIsRunning(true);
    setQuickResult(null);

    try {
      const syntaxCheck = await checkSyntax(value);
      if (!syntaxCheck.valid) {
        setQuickResult({ success: false, error: syntaxCheck.error });
        setIsRunning(false);
        return;
      }

      const result = await runCode(value, 5000);

      if (result.success) {
        const output = result.stdout || result.output || "(no output)";
        setQuickResult({ success: true, output });

        if (onRun) {
          onRun({ success: true, output });
        }
      } else {
        setQuickResult({ success: false, error: result.error });

        if (onRun) {
          onRun({ success: false, error: result.error });
        }
      }
    } catch (err) {
      setQuickResult({ success: false, error: err.message });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-2">
      <div
        className={`rounded-lg overflow-hidden border ${
          isCodeDark ? "border-gray-600" : "border-gray-300"
        } ${className}`}
      >
        <CodeMirror
          value={value}
          onChange={onChange}
          extensions={extensions}
          theme={isCodeDark ? "dark" : "light"}
          height={height}
          editable={!readOnly}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLine: true,
            indentOnInput: true,
            bracketMatching: true,
            closeBrackets: true,
            foldGutter: true,
            autocompletion: true,
          }}
        />
      </div>

      {/* Quick Run Button */}
      {showRunButton && !readOnly && (
        <div className="flex items-center space-x-2">
          <button
            onClick={handleQuickRun}
            disabled={isRunning || !isReady || !value.trim()}
            className={`px-4 py-2 rounded flex items-center space-x-2 transition text-sm ${
              isRunning || !isReady || !value.trim()
                ? "bg-gray-400 cursor-not-allowed text-gray-200"
                : "bg-green-600 hover:bg-green-700 text-white"
            }`}
          >
            {isRunning ? (
              <>
                <Spinner size={14} />
                <span>Running...</span>
              </>
            ) : (
              <>
                <Play size={14} />
                <span>Quick Run</span>
              </>
            )}
          </button>

          {!isReady && (
            <span className="text-xs text-yellow-600">
              Python engine loading...
            </span>
          )}
        </div>
      )}

      {/* Quick Result Display */}
      {quickResult && (
        <div
          className={`p-3 rounded-lg text-sm ${
            quickResult.success
              ? isCodeDark
                ? "bg-green-900 border border-green-600"
                : "bg-green-50 border border-green-300"
              : isCodeDark
                ? "bg-red-900 border border-red-600"
                : "bg-red-50 border border-red-300"
          }`}
        >
          {quickResult.success ? (
            <div>
              <p
                className={`font-semibold mb-1 ${
                  isCodeDark ? "text-green-300" : "text-green-800"
                }`}
              >
                ✓ Output:
              </p>
              <pre
                className={`whitespace-pre-wrap font-mono text-xs ${
                  isCodeDark ? "text-green-200" : "text-green-700"
                }`}
              >
                {quickResult.output}
              </pre>
            </div>
          ) : (
            <div className="flex items-start space-x-2">
              <AlertCircle
                size={16}
                className={isCodeDark ? "text-red-400" : "text-red-600"}
              />
              <div>
                <p
                  className={`font-semibold ${
                    isCodeDark ? "text-red-300" : "text-red-800"
                  }`}
                >
                  Error:
                </p>
                <pre
                  className={`whitespace-pre-wrap font-mono text-xs mt-1 ${
                    isCodeDark ? "text-red-200" : "text-red-700"
                  }`}
                >
                  {quickResult.error}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CodeEditor;
