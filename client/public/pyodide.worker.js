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

  // Pre-install all libraries used across the course modules
  try {
    await pyodide.loadPackage("micropip");
    await pyodide.runPythonAsync(`
      import micropip
      # Pre-download heavy packages to the browser cache
      await micropip.install(['pandas', 'numpy', 'tzdata', 'sqlite3'])
    `);
  } catch (err) {
    console.error("Preload error:", err);
  }

  postMessage({ type: "ready" });
}

const pyodidePromise = initPyodide();

onmessage = async (event) => {
  await pyodidePromise;
  const { code, id } = event.data;
  currentId = id;

  try {
    // runPythonAsync handles top-level awaits if the student uses them
    const result = await pyodide.runPythonAsync(code);
    postMessage({
      type: "result",
      id,
      success: true,
      output: result !== undefined ? String(result) : "",
    });
  } catch (err) {
    postMessage({ type: "result", id, success: false, error: err.message });
  } finally {
    currentId = null;
  }
};
