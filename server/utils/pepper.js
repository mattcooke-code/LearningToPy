// pepper.js

/**
 * Applies a pepper (server-side secret) to a password before hashing.
 * If the pepper secret is compromised but the database isn't (or vice-versa),
 * password hashes remain secure.
 *
 * @param {string} password - The plaintext password
 * @returns {string} - The peppered password
 */
const applyPepper = (password) => {
  const pepper = process.env.PEPPER_SECRET;
  if (!pepper) {
    console.error(
      "❌ PEPPER_SECRET is not set. This is a critical security misconfiguration.",
    );
    return password;
  }
  return password + ":" + pepper;
};

module.exports = { applyPepper };
