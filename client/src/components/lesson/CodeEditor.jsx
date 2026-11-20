// CodeEditor.jsx
import { useState, useMemo, useRef, useEffect } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { EditorView, ViewPlugin } from "@codemirror/view";
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
 * and quick run functionality. Integrates with Pyodide for client-side Python execution. Handles
 * WASM environment states and provides comprehensive error handling.
 */

/**
 * Advanced code editor component with Pyodide integration and interactive execution features.
 *
 * This component provides a professional code editing experience using CodeMirror with
 * Python language support, and direct Pyodide execution.
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
 * - Loading states during code execution with visual feedback
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

/**
 * Line that shows the ▶ button: the hovered line, otherwise the cursor's line
 * (so keyboard and touch users also get a run-to-here target).
 */
const targetLine = (state) =>
  state.field(hoveredLineField, false) ??
  state.doc.lineAt(state.selection.main.head).number;

const hoverToLine = (view, lineNumber) => {
  if (view.state.field(hoveredLineField, false) === lineNumber) return;
  view.dispatch({ effects: setHoveredLine.of(lineNumber) });
};

/**
 * Creates the gutter once. `onRunToLine` is read through a ref-backed wrapper
 * so the extension identity never changes when the parent re-renders.
 */
const createRunToHereGutter = (runToLine) => {
  class RunMarker extends GutterMarker {
    constructor(lineNumber) {
      super();
      this.lineNumber = lineNumber;
    }

    // Lets CodeMirror reuse the DOM node instead of rebuilding it every update.
    eq(other) {
      return other.lineNumber === this.lineNumber;
    }

    toDOM() {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = "▶";
      btn.title = "Run to here";
      btn.setAttribute("aria-label", `Run to line ${this.lineNumber}`);
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
        runToLine(this.lineNumber);
      });
      // Keyboard activation (mousedown alone is unreachable without a mouse).
      btn.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          runToLine(this.lineNumber);
        }
      });
      return btn;
    }
  }

  return gutter({
    lineMarker(view, line) {
      const lineNumber = view.state.doc.lineAt(line.from).number;
      return targetLine(view.state) === lineNumber
        ? new RunMarker(lineNumber)
        : null;
    },
    // Markers depend on editor state, not just doc/viewport, so CodeMirror
    // must be told when to recompute them.
    lineMarkerChange: (update) =>
      targetLine(update.startState) !== targetLine(update.state),
    initialSpacer: () => {
      const span = document.createElement("span");
      span.style.width = "16px";
      span.style.display = "inline-block";
      return span;
    },
    // Hovering the gutter itself must keep the marker alive (the content
    // handlers below don't fire over the gutter).
    domEventHandlers: {
      mousemove(view, line) {
        hoverToLine(view, view.state.doc.lineAt(line.from).number);
        return false;
      },
    },
  });
};

const hoverContentHandler = EditorView.domEventHandlers({
  mousemove(event, view) {
    const pos = view.posAtCoords({ x: event.clientX, y: event.clientY });
    if (pos == null) return;
    hoverToLine(view, view.state.doc.lineAt(pos).number);
  },
});

/**
 * Clears the hover only when the pointer leaves the WHOLE editor (gutter and
 * content), not when it crosses from the text into the gutter to click ▶.
 */
const hoverLeavePlugin = ViewPlugin.define((view) => {
  const onLeave = () => view.dispatch({ effects: setHoveredLine.of(null) });
  view.dom.addEventListener("mouseleave", onLeave);
  return {
    destroy() {
      view.dom.removeEventListener("mouseleave", onLeave);
    },
  };
});

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const CodeEditor = ({
  value = "",
  onChange,
  readOnly = false,
  height = "200px",
  className = "",
  showRunButton = false,
  onRun = null,
  onRunToLine = null,
  timeoutMs = 5000,
}) => {
  const { isCodeDark } = useTheme();
  const { runCode, isReady, isLoading, pythonError, restart } = usePython();

  const [isRunning, setIsRunning] = useState(false);
  const [quickResult, setQuickResult] = useState(null);

  // Keep the latest onRunToLine without rebuilding editor extensions when the
  // parent passes a new function identity on every render.
  const onRunToLineRef = useRef(onRunToLine);
  useEffect(() => {
    onRunToLineRef.current = onRunToLine;
  }, [onRunToLine]);
  const hasRunToLine = Boolean(onRunToLine);

  const runToHereGutter = useMemo(
    () => createRunToHereGutter((n) => onRunToLineRef.current?.(n)),
    [],
  );

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

      ...(hasRunToLine
        ? [
            hoveredLineField,
            hoverContentHandler,
            hoverLeavePlugin,
            runToHereGutter,
          ]
        : []),
    ],
    [hasRunToLine, runToHereGutter, isCodeDark, a11yHighlightStyle],
  );

  const handleQuickRun = async () => {
    if (!isReady || isRunning) return;

    setIsRunning(true);
    setQuickResult(null);

    try {
      const result = await runCode(value, timeoutMs);

      if (result.success) {
        const output = result.stdout || result.output || "(no output)";
        setQuickResult({
          success: true,
          output,
          stderr: result.stderr || null,
        });

        if (onRun) {
          onRun({ success: true, output, stderr: result.stderr });
        }
      } else {
        // Keep anything printed before the failure (including before a timeout).
        const partial = result.stdout || null;
        setQuickResult({
          success: false,
          error: result.error,
          output: partial,
          stderr: result.stderr || null,
        });

        if (onRun) {
          onRun({
            success: false,
            error: result.error,
            stdout: partial,
            stderr: result.stderr,
          });
        }
      }
    } catch (err) {
      setQuickResult({ success: false, error: err.message });
      if (onRun) onRun({ success: false, error: err.message });
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
            disabled={isRunning || !isReady || isLoading || !value.trim()}
            className={`px-4 py-2 rounded flex items-center space-x-2 transition text-sm ${
              isRunning || !isReady || isLoading || !value.trim()
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

          {(!isReady || isLoading) && (
            <span className="text-xs text-yellow-600">
              {isRunning
                ? "Running..."
                : "Python engine loading/re-initializing..."}
            </span>
          )}
        </div>
      )}

      {pythonError && (
        <div
          role="alert"
          className="p-3 rounded bg-red-900/40 border border-red-600 text-red-200 text-xs flex items-center justify-between space-x-2"
        >
          <span>⚠️ Python environment error: {pythonError}</span>
          <button
            type="button"
            onClick={restart}
            className="px-2 py-1 rounded border border-red-400 hover:bg-red-800/60"
          >
            Retry
          </button>
        </div>
      )}

      {/* Quick Result Display */}
      <div className="space-y-2" role="status" aria-live="polite">
        {quickResult && (
          <div className="space-y-2">
            {/* Main Result Box (Success or Fatal Error) */}
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
                    className={`whitespace-pre-wrap font-mono text-xs max-h-48 overflow-auto ${
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
                      className={`whitespace-pre-wrap font-mono text-xs mt-1 max-h-48 overflow-auto ${
                        isCodeDark ? "text-red-200" : "text-red-700"
                      }`}
                    >
                      {quickResult.error}
                    </pre>
                    {quickResult.output && (
                      <>
                        <p
                          className={`font-semibold mt-2 ${
                            isCodeDark ? "text-red-300" : "text-red-800"
                          }`}
                        >
                          Output before the error:
                        </p>
                        <pre
                          className={`whitespace-pre-wrap font-mono text-xs mt-1 max-h-48 overflow-auto ${
                            isCodeDark ? "text-red-200" : "text-red-700"
                          }`}
                        >
                          {quickResult.output}
                        </pre>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Stderr / Warnings Box (Appears on successful runs if warnings exist) */}
            {quickResult.stderr && (
              <div
                className={`p-3 rounded-lg text-sm ${
                  isCodeDark
                    ? "bg-yellow-900/60 border border-yellow-600 text-yellow-200"
                    : "bg-yellow-50 border border-yellow-300 text-yellow-800"
                }`}
              >
                <div className="flex items-start space-x-2">
                  <AlertCircle
                    size={16}
                    className={
                      isCodeDark ? "text-yellow-400" : "text-yellow-600"
                    }
                  />
                  <div>
                    <p className="font-semibold">⚠️ Warnings / Stderr:</p>
                    <pre className="whitespace-pre-wrap font-mono text-xs mt-1 max-h-48 overflow-auto">
                      {quickResult.stderr}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeEditor;
