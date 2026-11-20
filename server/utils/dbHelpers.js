// utils/dbHelpers.js
const mongoose = require("mongoose");

/**
 * Run `fn(session)` inside a transaction and always end the session.
 * Uses `session.withTransaction` (driver-managed, auto-retries on
 * TransientTransactionError) rather than the manual
 * start/commit/abort dance.
 *
 * @template T
 * @param {(session: Object) => Promise<T>} fn
 * @returns {Promise<T>}
 */
const runInTransaction = async (fn) => {
  const session = await mongoose.startSession();
  try {
    return await session.withTransaction(() => fn(session));
  } finally {
    await session.endSession();
  }
};

module.exports = { runInTransaction };
