// pythonSandbox.js
const { VM } = require("vm2");

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
