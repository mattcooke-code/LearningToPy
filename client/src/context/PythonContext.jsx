import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";

const PythonContext = createContext();

export const PythonProvider = ({ children }) => {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const workerRef = useRef(null);
  const pendingRequests = useRef(new Map());
  const stdoutBuffers = useRef(new Map());

  const initWorker = useCallback(() => {
    setIsReady(false);
    setIsLoading(true);

    // Create the worker
    const worker = new Worker("/pyodide.worker.js");

    worker.onmessage = (event) => {
      const { type, text, success, output, error, id } = event.data;

      if (type === "ready") {
        setIsReady(true);
        setIsLoading(false);
        console.log("🐍 Pyodide Worker Ready");
      } else if (type === "stdout" && id) {
        const currentBuffer = stdoutBuffers.current.get(id) || [];
        stdoutBuffers.current.set(id, [...currentBuffer, text]);
        console.log("🐍 Python output:", text);
      } else if (type === "result") {
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

  useEffect(() => {
    initWorker();
    return () => workerRef.current?.terminate();
  }, [initWorker]);

  const runCode = useCallback(
    (code, timeout = 10000) => {
      return new Promise((resolve) => {
        if (!isReady) {
          return resolve({
            success: false,
            error: "Python engine is still loading...",
          });
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

        workerRef.current.postMessage({ code, id });
      });
    },
    [isReady, initWorker]
  );

  return (
    <PythonContext.Provider value={{ isReady, isLoading, runCode }}>
      {children}
    </PythonContext.Provider>
  );
};

export const usePython = () => useContext(PythonContext);
