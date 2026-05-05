// catchAsync.js
/**
 * Wraps an async Express route handler to catch rejected promises.
 *
 * Eliminates the need for try/catch blocks in every controller.
 * Errors are forwarded to Express's error-handling middleware via `next()`.
 *
 * @param   {Function} fn - Async route handler (req, res, next) => Promise
 * @returns {Function} Express middleware function
 *
 * @example
 *   const getUser = catchAsync(async (req, res, next) => {
 *     const user = await User.findById(req.params.id);
 *     res.json(user);
 *   });
 */
module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
