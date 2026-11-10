// dateUtils.js
/**
 * Generates a YYYY-MM-DD string representing the user's current LOCAL calendar date.
 *
 * We use native Date methods rather than toISOString() to ensure the date
 * reflects the user's local wall-clock time, not the server's UTC time.
 *
 * @returns {string} Format: "YYYY-MM-DD"
 */
export const getUserLocalDate = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
