// CodeEditor.jsx
import { useState, useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { EditorView } from "@codemirror/view";
import { StateField, StateEffect, Prec } from "@codemirror/state";
import { python } from "@codemirror/lang-python";
import { tags as t } from "@lezer/highlight";
import { oneDark } from "@codemirror/theme-one-dark";
import { lintGutter } from "@codemirror/lint";
import {
  indentUnit,
  HighlightStyle,
  syntaxHighlighting,
} from "@codemirror/language";
import { gutter, GutterMarker } from "@codemirror/view";
import { usePython, useTheme } from "../../context";
import { Spinner } from "../ui";
import { Play, AlertCircle } from "lucide-react";

/**
 * @fileoverview
 * Advanced code editor component with Pyodide integration and interactive execution.
 * This component provides a full-featured code editor with syntax highlighting, line numbers,
 * and quick run functionality. Integrates with Pyodide for client-side Python execution
 * and features run-to-line capabilities, syntax checking, and real-time feedback. Handles
 * WASM environment states and provides comprehensive error handling.
 */

/**
 * Advanced code editor component with Pyodide integration and interactive execution features.
 *
 * This component provides a professional code editing experience using CodeMirror with
 * Python language support, integrated syntax checking, and direct Pyodide execution.
 * Features include run-to-line functionality, quick run buttons, real-time syntax validation,
 * and comprehensive error handling. The editor handles the Pyodide WASM environment
 * loading states and provides visual feedback for execution results.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.value - Current code value
 * @param {Function} props.onChange - Code change handler
 * @param {boolean} [props.readOnly=false] - Whether editor is read-only
 * @param {string} [props.height="200px"] - Editor height
 * @param {string} [props.className=""] - Additional CSS classes
 * @param {boolean} [props.showRunButton=false] - Whether to show run button
 * @param {Function} [props.onRun=null] - Callback when code runs
 * @param {Function} [props.onRunToLine=null] - Callback for run-to-line functionality
 * @returns {JSX.Element} Advanced code editor with execution capabilities
 *
 * @pyodideIntegration
 * - Uses usePython hook for Pyodide WASM environment access
 * - Handles isReady state for Python engine availability
 * - Code execution through runCode() method with timeout handling
 * - Syntax checking through checkSyntax() before execution
 * - Loading states during code execution with visual feedback
 *
 * @codeExecutionFlow
 * 1. Syntax validation using Pyodide's checkSyntax() method
 * 2. If syntax valid, execute code through runCode() method
 * 3. Process execution results (stdout, output, error handling)
 * 4. Display results in quick result panel
 * 5. Trigger onRun callback with execution data
 * 6. Handle network/execution errors gracefully
 *
 * @runToLineFeature
 * - Custom CodeMirror gutter extension with hover-activated run buttons
 * - StateField tracking for hovered line detection
 * - Mouse event handling for line hover detection
 * - Code slicing for partial execution up to specific line
 * - Visual feedback with green play buttons on hover
 *
 * @editorFeatures
 * - Full CodeMirror setup with Python language support
 * - Line numbers, bracket matching, and auto-completion
 * - Lint gutter for syntax error indication
 * - 4-space indentation for Python compliance
 * - Theme switching between light and dark modes
 *
 * @stateManagement
 * - isRunning: Loading state during code execution
 * - quickResult: Execution result display data
 * - hoveredLineField: CodeMirror state for line hover tracking
 * - Dynamic extensions based on run-to-line functionality
 *
 * @errorHandling
 * - Syntax error detection and display
 * - Execution error handling with detailed messages
 * - Pyodide loading state management
 * - Network error handling for execution failures
 * - Graceful degradation when Python engine unavailable
 *
 * @responsiveDesign
 * - Adaptive height configuration
 * - Mobile-friendly run buttons and controls
 * - Flexible layout with optional run button
 * - Touch-friendly interface elements
 */

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

  // Custom highlight style for tokens that fail WCAG 2 AA contrast under
  // CodeMirror's default oneDark palette (e.g. #e06c75 on #282c34 = 4.38:1).
  // Wrapped in Prec.highest below so it overrides oneDark's own
  // syntaxHighlighting extension regardless of array order — a plain
  // EditorView.theme() override is not reliably enough, since oneDark's
  // highlight style and a manually-added one have matching specificity and
  // @uiw/react-codemirror's theme="dark" prop can re-insert oneDark's style
  // after user extensions internally.
  const a11yHighlightStyle = useMemo(
    () =>
      HighlightStyle.define([
        // was #e06c75 → 4.38:1, now #e9838b → ~5.3:1 on #282c34
        {
          tag: [t.variableName, t.propertyName, t.definition(t.variableName)],
          color: "#e9838b",
        },
      ]),
    [],
  );

  const extensions = useMemo(
    () => [
      python(),
      lintGutter(),
      indentUnit.of("    "),
      EditorView.contentAttributes.of({ "aria-label": "Python code editor" }),
      ...(isCodeDark
        ? [oneDark, Prec.highest(syntaxHighlighting(a11yHighlightStyle))]
        : []),
      Prec.highest(
        EditorView.theme({
          ".cm-scroller": {
            outline: "none",
          },
          ".cm-scroller:focus-visible": {
            outline: "2px solid #4d9eff",
            outlineOffset: "-2px",
          },
          // oneDark's default gutter line-number color (#7d8799) is 3.86:1
          // on #282c34 — below WCAG 2 AA 4.5:1. Lightened to clear it.
          ".cm-gutterElement": {
            color: "#9aa3b3",
          },
        }),
      ),

      ...(onRunToLine
        ? [hoveredLineField, hoverPlugin, createRunToHereGutter(onRunToLine)]
        : []),
    ],
    [onRunToLine, isCodeDark, a11yHighlightStyle],
  );

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
          theme={isCodeDark ? "none" : "light"}
          height={height}
          editable={!readOnly}
          aria-label="Python code editor"
          onCreateEditor={(view) => {
            // Ensure the scrollable region is keyboard-focusable from first
            // paint (axe: scrollable-region-focusable). Doing this here,
            // rather than in an updateListener, avoids a window where the
            // scroller sits at tabindex="-1" before any doc/viewport change
            // has fired — which Safari in particular will flag.
            view.scrollDOM.setAttribute("tabindex", "0");
          }}
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
