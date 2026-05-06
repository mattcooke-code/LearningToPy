// /client/src/utils/analyticsUtils.js
/**
 * @fileoverview Analytics data export utilities.
 *
 * Provides CSV export functionality for analytics dashboards. Converts
 * structured data arrays to CSV format and triggers a browser download.
 *
 * @module utils/analyticsUtils
 * @requires ./fileDownloadUtils
 */
import { downloadContent, convertToCSV } from "./fileDownloadUtils";

/**
 * Export an array of data objects as a CSV file download.
 *
 * Generates a timestamped filename (`<filename>-<ISO-date>.csv`), converts
 * the data to CSV via `convertToCSV`, and triggers a browser download using
 * `downloadContent`.
 *
 * @param {object[]} data - Array of flat objects to export.
 * @param {string} filename - Base filename (without extension or timestamp).
 *
 * @example
 * const userData = [{ name: "Alice", xp: 1200 }, { name: "Bob", xp: 900 }];
 * exportToCSV(userData, "user-report");
 * // downloads "user-report-2026-05-06T12:00:00.000Z.csv"
 */
export const exportToCSV = (data, filename) => {
  const csv = convertToCSV(data);

  downloadContent(
    csv,
    `${filename}-${new Date().toISOString()}.csv`,
    "text/csv",
  );
};
