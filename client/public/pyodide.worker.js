// public/pyodide.worker.js
//
// Protocol (worker -> main):
//   { type: "ready" }                           Pyodide is loaded
//   { type: "error", error }                    Boot failed (fatal)
//   { type: "stdout" | "stderr", text, id }     Output while running request `id`
//   { type: "result", id, success, output?, error? }
//
// Protocol (main -> worker):
//   { code, id }

const PYODIDE_BASE = "https://cdn.jsdelivr.net/pyodide/v0.26.1/full/";

// Libraries pre-installed for the course modules.
const PRELOAD_PACKAGES = ["pandas", "numpy", "tzdata", "beautifulsoup4"];

// If true, every run gets a fresh global namespace (variables from one lesson
// can't leak into the next). Imported modules are still cached either way.
const FRESH_NAMESPACE_PER_RUN = false;

let pyodide = null;
let initError = null;

async function initPyodide() {
  // importScripts throws on CDN failure / ad-blocker / offline; the caller
  // turns that into a clean { type: "error" } message.
  importScripts(PYODIDE_BASE + "pyodide.js");
  pyodide = await loadPyodide({ indexURL: PYODIDE_BASE });

  // Fast path: bundled packages load in parallel straight from the Pyodide
  // distribution. Fall back to micropip per-package only if that fails
  // (e.g. a package that isn't in the bundled lockfile).
  try {
    await pyodide.loadPackage(PRELOAD_PACKAGES);
  } catch (bulkErr) {
    console.warn("Bulk preload failed, falling back to per-package:", bulkErr);
    let micropip = null;
    try {
      for (const pkg of PRELOAD_PACKAGES) {
        try {
          await pyodide.loadPackage(pkg);
        } catch {
          try {
            if (!micropip) {
              await pyodide.loadPackage("micropip");
              micropip = pyodide.pyimport("micropip");
            }
            await micropip.install(pkg);
          } catch (err) {
            console.error(`Failed to preload ${pkg}:`, err);
          }
        }
      }
    } finally {
      micropip?.destroy();
    }
  }
}

const pyodidePromise = initPyodide().then(
  () => postMessage({ type: "ready" }),
  (err) => {
    initError = String(err?.message ?? err);
    postMessage({ type: "error", error: initError });
  },
);

async function handleRun({ code, id }) {
  // Everything lives inside try/catch so one bad message can never reject the
  // queue chain and silently kill every later run.
  let globals = null;
  try {
    await pyodidePromise;
    if (initError || !pyodide) {
      throw new Error(initError || "Pyodide is not available");
    }

    // Scope output handlers to this execution's id.
    pyodide.setStdout({
      batched: (text) => postMessage({ type: "stdout", text, id }),
    });
    pyodide.setStderr({
      batched: (text) => postMessage({ type: "stderr", text, id }),
    });

    const options = {};
    if (FRESH_NAMESPACE_PER_RUN) {
      globals = pyodide.globals.get("dict")();
      options.globals = globals;
    }

    const result = await pyodide.runPythonAsync(String(code), options);

    // Emit any trailing partial line (e.g. print("x", end="")).
    try {
      pyodide.runPython("import sys; sys.stdout.flush(); sys.stderr.flush()");
    } catch {
      /* non-fatal */
    }

    // Python None -> undefined. Python objects come back as PyProxy, which
    // must be destroyed or they leak for the life of the worker.
    let output = "";
    if (result !== undefined && result !== null) {
      output = String(result);
      if (typeof result.destroy === "function") result.destroy();
    }

    postMessage({ type: "result", id, success: true, output });
  } catch (err) {
    postMessage({
      type: "result",
      id,
      success: false,
      error: String(err?.message ?? err),
    });
  } finally {
    try {
      globals?.destroy();
      pyodide?.setStdout({ batched: () => {} });
      pyodide?.setStderr({ batched: () => {} });
    } catch {
      /* ignore cleanup errors */
    }
  }
}

// Serialise runs so they can't interleave stdout handlers.
let executionQueue = Promise.resolve();

onmessage = (event) => {
  executionQueue = executionQueue.then(() => handleRun(event.data || {}));
};
