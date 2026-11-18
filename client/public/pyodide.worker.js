// public/pyodide.worker.js
importScripts("https://cdn.jsdelivr.net/pyodide/v0.26.1/full/pyodide.js");

let pyodide;

async function initPyodide() {
  try {
    pyodide = await loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.1/full/",
    });

    // Pre-install all libraries used across the course modules.
    // micropip is a Python package, not a JS global — it must be loaded via
    // loadPackage and then bridged into JS scope with pyimport before it can
    // be called as micropip.install(...) from here.
    await pyodide.loadPackage("micropip");
    const micropip = pyodide.pyimport("micropip");

    for (const pkg of [
      "pandas",
      "numpy",
      "tzdata",
      "beautifulsoup4",
      "sqlite3",
    ]) {
      try {
        await micropip.install(pkg);
      } catch (err) {
        console.error(`Failed to preload ${pkg}:`, err);
      }
    }

    postMessage({ type: "ready" });
  } catch (err) {
    // Catch CDN failures, ad-blocker blocks, or network drops
    postMessage({ type: "error", error: String(err.message || err) });
  }
}

const pyodidePromise = initPyodide();

// Serialisation queue to prevent concurrent runs from colliding
let executionQueue = Promise.resolve();

onmessage = (event) => {
  executionQueue = executionQueue.then(async () => {
    await pyodidePromise;
    const { code, id } = event.data;

    // Set up local stdout/stderr handlers scoped specifically to this execution's id
    pyodide.setStdout({
      batched: (text) => postMessage({ type: "stdout", text, id }),
    });
    pyodide.setStderr({
      batched: (text) => postMessage({ type: "stderr", text, id }),
    });

    try {
      const codeString = String(code);
      const result = await pyodide.runPythonAsync(codeString);

      postMessage({
        type: "result",
        id,
        success: true,
        output: result !== undefined ? String(result) : "",
      });
    } catch (err) {
      postMessage({
        type: "result",
        id,
        success: false,
        error: String(err.message),
      });
    } finally {
      pyodide.setStdout({ batched: () => {} });
      pyodide.setStderr({ batched: () => {} });
    }
  });
};
