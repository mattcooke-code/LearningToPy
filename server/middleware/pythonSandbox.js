// pythonSandbox.js
const { VM } = require("vm2");

/**
 * Pyodide/VM2 sandbox middleware — creates an isolated JavaScript VM for Python execution.
 *
 * Attaches a `vm2` VM instance to `req.pythonVM` with a 5-second timeout,
 * no file system access, no eval, no WebAssembly, and a restricted set of
 * allowed built-in modules (math, datetime, random, json, re).
 *
 * @middleware Applied on terminal/practice routes that execute user code
 */
const pythonSandbox = (req, res, next) => {
  const allowedModules = ["math", "datetime", "random", "json", "re"];

  const vm = new VM({
    timeout: 5000,
    sandbox: {},
    require: { external: false, builtin: allowedModules },
    eval: false,
    wasm: false,
  });

  req.pythonVM = vm;
  next();
};
