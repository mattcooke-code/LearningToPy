// pyodide.worker.js
importScripts("https://cdn.jsdelivr.net/pyodide/v0.26.1/full/pyodide.js");

let pyodide;

async function initPyodide() {
  pyodide = await loadPyodide({
    indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.1/full/",
    stdout: (text) => postMessage({ type: "stdout", text }),
    stderr: (text) => postMessage({ type: "stderr", text }),
  });

  postMessage({ type: "ready" });
}

const pyodidePromise = initPyodide();

onmessage = async (event) => {
  await pyodidePromise;
  const { code, id } = event.data;

  try {
    const result = await pyodide.runPythonAsync(code);
    postMessage({
      type: "result",
      id,
      success: true,
      output: result !== undefined ? String(result) : "",
    });
  } catch (err) {
    postMessage({ type: "result", id, success: false, error: err.message });
  }
};
