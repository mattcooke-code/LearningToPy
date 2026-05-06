// /client/src/utils/fileDownloadUtils.js
/**
 * @fileoverview File download utilities.
 *
 * Pure functions for creating and triggering browser file downloads.
 * Handles blob creation, anchor element generation, cleanup, and
 * format-specific downloads (Python, CSV, terminal output).
 *
 * @module utils/fileDownloadUtils
 */

/**
 * Creates a download link for a blob
 * @param {Blob} blob - The blob to download
 * @param {string} filename - The filename
 * @returns {HTMLAnchorElement} The anchor element
 */
export const createDownloadLink = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";
  return a;
};

/**
 * Triggers a download and cleans up
 * @param {HTMLAnchorElement} anchor - The anchor element
 */
export const triggerDownload = (anchor) => {
  document.body.appendChild(anchor);
  anchor.click();

  // Cleanup
  setTimeout(() => {
    document.body.removeChild(anchor);
    URL.revokeObjectURL(anchor.href);
  }, 100);
};

/**
 * Downloads content as a file
 * @param {string|Blob} content - Content to download
 * @param {string} filename - Filename
 * @param {string} mimeType - MIME type
 */
export const downloadContent = (content, filename, mimeType = "text/plain") => {
  const blob =
    content instanceof Blob ? content : new Blob([content], { type: mimeType });

  const anchor = createDownloadLink(blob, filename);
  triggerDownload(anchor);
};

/**
 * Downloads Python code
 * @param {string} code - Python code
 * @param {string} filename - Filename (without extension)
 */
export const downloadPythonCode = (code, filename = "exercise") => {
  downloadContent(code, `${filename}.py`, "text/python");
};

/**
 * Downloads terminal session
 * @param {Array} output - Terminal output array of { type, content } objects
 * @param {string} filename - Base filename
 */
export const downloadTerminalOutput = (
  output,
  filename = "terminal_session",
) => {
  const content = output
    .map((item) => {
      if (item.type === "input") return `>>> ${item.content}`;
      return item.content;
    })
    .join("\n");

  downloadContent(content, `${filename}.txt`, "text/plain");
};

/**
 * Convert an array of flat objects to a CSV string.
 *
 * @param {object[]} data - Array of objects with consistent keys.
 * @returns {string} CSV-formatted string with header row.
 */
export const convertToCSV = (data) => {
  if (!data || !Array.isArray(data) || data.length === 0) return "";

  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers
      .map((header) => {
        const cell =
          row[header] !== null && row[header] !== undefined
            ? String(row[header]).replace(/"/g, '""')
            : "";
        return `"${cell}"`;
      })
      .join(","),
  );

  return [headers.join(","), ...rows].join("\r\n");
};
