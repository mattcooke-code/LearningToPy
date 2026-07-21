// PythonContext.jsx
/**
 * @fileoverview Python execution context using a Pyodide Web Worker.
 *
 * Wraps a Web Worker (`/pyodide.worker.js`) that loads Pyodide (CPython
 * compiled to WebAssembly) and executes user-submitted Python code in a
 * sandboxed thread. Communication with the worker is message-based:
 *
 * - The worker posts `{ type: "ready" }` when Pyodide has finished loading.
 * - The main thread posts `{ code, id }` to request execution.
 * - The worker posts `{ type: "stdout", text, id }` for each print/output line.
 * - The worker posts `{ type: "result", success, output, error, id }` when
 *   execution completes.
 *
 * A pending-request Map correlates responses to callers, and a timeout
 * mechanism terminates and restarts the worker if execution exceeds
 * `timeout` ms (default 10 seconds).
 *
 * @module PythonContext
 * @requires react
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";

// ---------------------------------------------------------------------------
// Context Definition
// ---------------------------------------------------------------------------

/**
 * React Context holding the Python execution engine state.
 *
 * @type {React.Context<object|null>}
 */
const PythonContext = createContext();

// ---------------------------------------------------------------------------
// PythonProvider Component
// ---------------------------------------------------------------------------

/**
 * Provider that manages a Pyodide Web Worker for client-side Python execution.
 *
 * **State exposed:**
 * - `isReady` — true once Pyodide has loaded and the worker is accepting code.
 * - `isLoading` — true during the initial worker/pyodide bootstrap phase.
 * - `runCode(code, timeout?)` — submit a Python string for execution.
 *
 * **Worker lifetime:** The worker is created on mount and terminated on
 * unmount. If execution times out the worker is forcibly terminated and
 * re-created, resetting Pyodide state (imports, variables, etc.).
 *
 * @param {{ children: React.ReactNode }} props
 * @returns {JSX.Element}
 */
export const PythonProvider = ({ children }) => {
  /** @type {[boolean, Function]} Whether Pyodide is loaded and accepting code */
  const [isReady, setIsReady] = useState(false);

  /** @type {[boolean, Function]} Whether the worker is still booting */
  const [isLoading, setIsLoading] = useState(true);

  /** @type {React.MutableRefObject<Worker|null>} Reference to the active Web Worker */
  const workerRef = useRef(null);

  /**
   * Map of in-flight execution requests, keyed by unique ID.
   * Each value is a handler function that resolves or rejects the promise
   * returned by `runCode`.
   *
   * @type {React.MutableRefObject<Map<string, Function>>}
   */
  const pendingRequests = useRef(new Map());

  /**
   * Map of stdout buffers, keyed by execution ID.
   * Accumulates `stdout` messages from the worker until the final `result`
   * message arrives, at which point the buffer is joined and returned.
   *
   * @type {React.MutableRefObject<Map<string, string[]>>}
   */
  const stdoutBuffers = useRef(new Map());

  /**
   * Initialise (or re-initialise) the Pyodide Web Worker.
   *
   * 1. Resets ready/loading flags.
   * 2. Creates a new Worker from `/pyodide.worker.js`.
   * 3. Registers the `onmessage` handler to manage the three message types:
   *    `ready`, `stdout`, and `result`.
   *
   * This is called on mount and after a timeout-triggered worker restart.
   */
  const initWorker = useCallback(() => {
    setIsReady(false);
    setIsLoading(true);

    const worker = new Worker("/pyodide.worker.js");

    worker.onmessage = (event) => {
      const { type, text, success, output, error, id } = event.data;

      if (type === "ready") {
        // Pyodide has finished loading
        setIsReady(true);
        setIsLoading(false);
        console.log("🐍 Pyodide Worker Ready");
      } else if (type === "stdout" && id) {
        // Accumulate stdout lines for this execution
        const currentBuffer = stdoutBuffers.current.get(id) || [];
        stdoutBuffers.current.set(id, [...currentBuffer, text]);
        console.log("🐍 Python output:", text);
      } else if (type === "result") {
        // Final result for an execution
        const handler = pendingRequests.current.get(id);
        const buffer = stdoutBuffers.current.get(id) || [];

        if (handler) {
          handler({ success, output, error, stdout: buffer.join("\n") });
          pendingRequests.current.delete(id);
          stdoutBuffers.current.delete(id);
        }
      }
    };

    workerRef.current = worker;
  }, []);

  /**
   * Start the worker on mount; terminate it on unmount.
   */
  useEffect(() => {
    initWorker();
    return () => workerRef.current?.terminate();
  }, [initWorker]);

  /**
   * Execute a string of Python code in the Pyodide worker.
   *
   * Returns a Promise that resolves with an object:
   * ```
   * {
   *   success: boolean,
   *   output?: string,    // the last expression's result or stdout if no return
   *   error?: string,     // Python traceback or error message
   *   stdout?: string     // all print() output, joined with newlines
   * }
   * ```
   *
   * **Timeout behaviour:** If execution exceeds `timeout` ms the worker is
   * terminated and re-created. The promise resolves with
   * `{ success: false, error: "Execution timed out after Xms" }`.
   *
   * **Ready guard:** If `isReady` is false (Pyodide still loading) the
   * promise resolves immediately with an error message.
   *
   * @param {string} code - The Python source code to execute.
   * @param {number} [timeout=10000] - Maximum execution time in ms.
   * @returns {Promise<{ success: boolean, output?: string, error?: string, stdout?: string }>}
   */
  const runCode = useCallback(
    (code, timeout = 10000) => {
      return new Promise((resolve) => {
        if (!isReady) {
          return resolve({
            success: false,
            error: "Python engine is still loading...",
          });
        }

        let safeCode;
        if (typeof code === "string") {
          safeCode = code;
        } else if (code === null || code === undefined) {
          return resolve({
            success: false,
            error: "No code provided",
          });
        } else {
          // Convert JsProxy or other objects to string
          try {
            safeCode = String(code);
          } catch (e) {
            return resolve({
              success: false,
              error: "Invalid code format",
            });
          }
        }

        const id = Math.random().toString(36).substring(7);
        stdoutBuffers.current.set(id, []);

        const timeoutId = setTimeout(() => {
          console.warn("RT: Execution timeout. Terminating worker...");
          workerRef.current.terminate();
          initWorker();
          resolve({
            success: false,
            error: `Execution timed out after ${timeout}ms`,
          });
        }, timeout);

        pendingRequests.current.set(id, (result) => {
          clearTimeout(timeoutId);
          resolve(result);
        });

        // Send the SAFE code string
        workerRef.current.postMessage({ code: safeCode, id });
      });
    },
    [isReady, initWorker],
  );

  /**
   * The context value exposed to consumers. Wrapped in the provider's closure
   * so `isReady`, `isLoading`, and `runCode` are always up-to-date.
   *
   * @type {{ isReady: boolean, isLoading: boolean, runCode: Function }}
   */
  const value = { isReady, isLoading, runCode };

  return (
    <PythonContext.Provider value={value}>{children}</PythonContext.Provider>
  );
};

// ---------------------------------------------------------------------------
// Consumer Hook
// ---------------------------------------------------------------------------

/**
 * Access the Python execution context.
 *
 * Returns `{ isReady, isLoading, runCode }`.
 *
 * Unlike other context hooks this one does **not** throw if used outside a
 * provider — it simply returns `undefined` from `useContext`. This is
 * intentional: not every page needs Python execution (e.g. login, dashboard,
 * settings), so consumers should guard against `undefined`.
 *
 * @returns {{ isReady: boolean, isLoading: boolean, runCode: Function }|undefined}
 */
export const usePython = () => useContext(PythonContext);
