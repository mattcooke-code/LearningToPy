// /client/src/utils/analyticsUtils.js
import { getUserLocalDate } from "./dateUtils";
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
 * Generates a timestamped filename, converts
 * the data to CSV via `convertToCSV`, and triggers a browser download using
 * `downloadContent`.
 *
 * @param {object[]} data - Array of flat objects to export.
 * @param {string} filename - Base filename (without extension or timestamp).
 *
 */
export const exportToCSV = (data, filename) => {
  const csv = convertToCSV(data);

  downloadContent(csv, `${filename}-${getUserLocalDate()}.csv`, "text/csv");
};
