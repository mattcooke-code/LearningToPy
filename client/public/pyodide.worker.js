// public/pyodide.worker.js
importScripts("https://cdn.jsdelivr.net/pyodide/v0.26.1/full/pyodide.js");

let pyodide;
let currentId = null;

async function initPyodide() {
  pyodide = await loadPyodide({
    indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.1/full/",
    stdout: (text) => postMessage({ type: "stdout", text, id: currentId }),
    stderr: (text) => postMessage({ type: "stderr", text, id: currentId }),
  });

  // Pre-install all libraries used across the course modules.
  // micropip is a Python package, not a JS global — it must be loaded via
  // loadPackage and then bridged into JS scope with pyimport before it can
  // be called as micropip.install(...) from here.
  await pyodide.loadPackage("micropip");
  const micropip = pyodide.pyimport("micropip");

  for (const pkg of ["pandas", "numpy", "tzdata", "beautifulsoup4", "sqlite3"]) {
    try {
      await micropip.install(pkg);
    } catch (err) {
      console.error(`Failed to preload ${pkg}:`, err);
    }
  }

  postMessage({ type: "ready" });
}

const pyodidePromise = initPyodide();

// In pyodide.worker.js, update the onmessage handler:

onmessage = async (event) => {
  await pyodidePromise;
  const { code, id } = event.data;
  currentId = id;

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
    currentId = null;
  }
};
