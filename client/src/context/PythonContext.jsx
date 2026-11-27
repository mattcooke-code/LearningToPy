// PythonContext.jsx
/**
 * @fileoverview Python execution context using a Pyodide Web Worker.
 *
 * Worker protocol (see public/pyodide.worker.js):
 * - worker -> main: `ready`, `error`, `stdout`, `stderr`, `result`
 * - main -> worker: `{ code, id }`
 *
 * Design notes:
 * - Runs are serialised on the main thread. A run's timeout starts when it
 *   actually starts executing, never while it waits for boot or for an
 *   earlier run.
 * - Calls made while Pyodide is booting simply wait for it (no timeout is
 *   spent on boot; boot has its own, much longer, limit).
 * - On timeout the worker is terminated and restarted (the only way to stop
 *   an infinite loop in a worker). Python state is reset by the restart.
 * - Boot failures and worker crashes are reported through `pythonError`,
 *   and `restart()` lets the UI offer a retry.
 *
 * @module PythonContext
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";

const WORKER_URL = "/pyodide.worker.js";
const DEFAULT_TIMEOUT_MS = 5000;
const BOOT_TIMEOUT_MS = 120_000; // pandas/numpy over a slow connection
const MAX_OUTPUT_CHARS = 1_000_000; // guards against `while True: print()`

/**
 * @typedef {Object} RunResult
 * @property {boolean} success - Whether execution completed without error or timeout.
 * @property {*} [output] - Final expression value or result returned by the worker.
 * @property {string} [error] - Error or timeout message when execution fails.
 * @property {string} [stdout] - Captured standard output joined by newlines.
 * @property {string} [stderr] - Captured standard error output joined by newlines.
 */

/**
 * @typedef {Object} PythonContextValue
 * @property {boolean} isReady - True once Pyodide has loaded and is ready for code.
 * @property {boolean} isLoading - True while the worker is starting or loading Pyodide.
 * @property {string|null} pythonError - Fatal boot, worker, or deserialization error message.
 * @property {(code: string, timeout?: number) => Promise<RunResult>} runCode - Queue and run Python code.
 * @property {() => void} restart - Terminate and re-initialise the Python worker.
 */

/** @type {React.Context<PythonContextValue|null>} */
const PythonContext = createContext(null);

/**
 * Generate a unique identifier for correlating worker requests and responses.
 *
 * @returns {string}
 */
function createRequestId() {
  if (
    typeof globalThis.crypto !== "undefined" &&
    typeof globalThis.crypto.randomUUID === "function"
  ) {
    return globalThis.crypto.randomUUID();
  }
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Create a promise with externally-callable `resolve` and `reject` methods.
 *
 * @returns {{ promise: Promise<*>, resolve: (value?: *) => void, reject: (reason?: *) => void }}
 */
function createDeferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  // Mark as handled so an unobserved rejection never logs a console error.
  promise.catch(() => {});
  return { promise, resolve, reject };
}

/**
 * Provider component that manages the Pyodide Web Worker lifecycle, serialised
 * execution queue, and context value for child components.
 *
 * @param {{ children: * }} props
 * @returns {*}
 */
export const PythonProvider = ({ children }) => {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pythonError, setPythonError] = useState(null);

  /** Bumped on every (re)start/unmount so stale worker callbacks are ignored. */
  const generationRef = useRef(0);
  const workerRef = useRef(null);
  /** Deferred for the current worker: resolves with the worker when ready. */
  const bootRef = useRef(null);
  const bootTimeoutRef = useRef(null);
  /** In-flight requests: id -> { settle, timeoutId, stdout[], stderr[], size } */
  const pendingRequests = useRef(new Map());
  /** Tail of the main-thread run queue. */
  const queueRef = useRef(Promise.resolve());

  /**
   * Settle every in-flight request (with any partial output) and clear the map.
   *
   * @param {string} message - Failure reason attached to each pending result.
   */
  const failAllPending = useCallback((message) => {
    for (const entry of pendingRequests.current.values()) {
      clearTimeout(entry.timeoutId);
      entry.settle({
        success: false,
        error: message,
        stdout: entry.stdout.join("\n"),
        stderr: entry.stderr.join("\n"),
      });
    }
    pendingRequests.current.clear();
  }, []);

  /**
   * (Re)start the worker. Safe to call at any time; also exposed as `restart`.
   */
  const initWorker = useCallback(() => {
    const generation = ++generationRef.current;
    const isStale = () => generation !== generationRef.current;

    clearTimeout(bootTimeoutRef.current);
    // Anything still waiting on the previous boot gets a clean failure.
    bootRef.current?.reject(new Error("Python engine was restarted"));
    workerRef.current?.terminate();
    workerRef.current = null;

    const boot = createDeferred();
    bootRef.current = boot;

    setIsReady(false);
    setIsLoading(true);
    setPythonError(null);

    const worker = new Worker(WORKER_URL);
    workerRef.current = worker;

    const fail = (message) => {
      if (isStale()) return;
      clearTimeout(bootTimeoutRef.current);
      worker.terminate(); // don't leave a zombie worker running
      if (workerRef.current === worker) workerRef.current = null;
      setIsReady(false);
      setIsLoading(false);
      setPythonError(message);
      boot.reject(new Error(message)); // no-op if already resolved
      failAllPending(message);
    };

    bootTimeoutRef.current = setTimeout(
      () => fail("Python engine took too long to load"),
      BOOT_TIMEOUT_MS,
    );

    worker.onmessage = (event) => {
      if (isStale()) return;
      const data = event.data;
      if (!data || typeof data !== "object") return;
      const { type, text, success, output, error, id } = data;

      switch (type) {
        case "ready":
          clearTimeout(bootTimeoutRef.current);
          setIsReady(true);
          setIsLoading(false);
          setPythonError(null);
          boot.resolve(worker);
          break;

        case "error":
          fail(String(error || "Pyodide worker failed to initialize"));
          break;

        case "stdout":
        case "stderr": {
          const entry = pendingRequests.current.get(id);
          if (entry && entry.size < MAX_OUTPUT_CHARS) {
            entry.size += String(text).length;
            entry[type].push(text);
          }
          break;
        }

        case "result": {
          const entry = pendingRequests.current.get(id);
          if (!entry) break;
          pendingRequests.current.delete(id);
          entry.settle({
            success,
            output,
            error,
            stdout: entry.stdout.join("\n"),
            stderr: entry.stderr.join("\n"),
          });
          break;
        }

        default:
          break;
      }
    };

    worker.onerror = (event) => {
      event?.preventDefault?.();
      fail(event?.message || "Failed to load or execute Python worker script");
    };

    worker.onmessageerror = () => {
      fail("Failed to deserialize message from Python worker");
    };
  }, [failAllPending]);

  useEffect(() => {
    initWorker();
    return () => {
      generationRef.current += 1; // invalidate all callbacks
      clearTimeout(bootTimeoutRef.current);
      bootRef.current?.reject(new Error("Python provider unmounted"));
      failAllPending("Python provider unmounted");
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, [initWorker, failAllPending]);

  /**
   * Execute Python code on the worker queue.
   *
   * Resolves (never rejects) with `{ success, output?, error?, stdout?, stderr? }`.
   * If Pyodide is still booting, the call waits for it. `timeout` applies to
   * execution only (starting once the run begins). On timeout, in-flight
   * requests settle with partial `stdout` and `stderr`, and the worker is restarted.
   *
   * @param {string} code - Python source code to execute.
   * @param {number} [timeout=DEFAULT_TIMEOUT_MS] - Execution timeout in milliseconds.
   * @returns {Promise<RunResult>}
   */
  const runCode = useCallback(
    (code, timeout = DEFAULT_TIMEOUT_MS, options = {}) => {
      if (code === null || code === undefined) {
        return Promise.resolve({ success: false, error: "No code provided" });
      }

      let safeCode;
      try {
        safeCode = typeof code === "string" ? code : String(code);
      } catch {
        return Promise.resolve({
          success: false,
          error: "Invalid code format",
        });
      }

      const ms =
        Number.isFinite(timeout) && timeout > 0 ? timeout : DEFAULT_TIMEOUT_MS;

      const run = async () => {
        // Wait for whichever worker generation is current.
        let worker;
        try {
          worker = await bootRef.current.promise;
        } catch (err) {
          return { success: false, error: err.message };
        }
        if (workerRef.current !== worker) {
          return { success: false, error: "Python worker is unavailable" };
        }

        return new Promise((resolve) => {
          const id = createRequestId();

          const timeoutId = setTimeout(() => {
            console.warn("Python execution timed out. Restarting worker...");
            // Settles this request (with partial output), then replaces the worker.
            failAllPending(`Execution timed out after ${ms}ms`);
            initWorker();
          }, ms);

          pendingRequests.current.set(id, {
            settle: (result) => {
              clearTimeout(timeoutId);
              resolve(result);
            },
            timeoutId,
            stdout: [],
            stderr: [],
            size: 0,
          });

          worker.postMessage({ code: safeCode, id, ...options });
        });
      };

      const result = queueRef.current.then(run);
      queueRef.current = result.catch(() => {});
      return result;
    },
    [initWorker, failAllPending],
  );

  const value = useMemo(
    () => ({ isReady, isLoading, pythonError, runCode, restart: initWorker }),
    [isReady, isLoading, pythonError, runCode, initWorker],
  );

  return (
    <PythonContext.Provider value={value}>{children}</PythonContext.Provider>
  );
};

/**
 * Access the Python execution context (`isReady`, `isLoading`, `pythonError`,
 * `runCode`, and `restart`).
 *
 * @throws {Error} If called outside of a `<PythonProvider>`.
 * @returns {PythonContextValue}
 */
export const usePython = () => {
  const context = useContext(PythonContext);
  if (!context) {
    throw new Error("usePython must be used within a PythonProvider");
  }
  return context;
};
