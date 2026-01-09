// hooks/useFileDownload.js
import { useCallback } from "react";

/**
 * Custom hook for handling file downloads
 * @returns {Object} Download utilities
 */
export const useFileDownload = () => {
  /**
   * Downloads content as a file
   * @param {string|Blob} content - Content to download
   * @param {string} filename - Name of the file
   * @param {string} mimeType - MIME type of the file
   */
  const downloadFile = useCallback(
    (content, filename, mimeType = "text/plain") => {
      // Ensure filename has proper extension
      const getExtension = (mime) => {
        const extensions = {
          "text/python": ".py",
          "text/plain": ".txt",
          "text/csv": ".csv",
          "application/json": ".json",
          "text/html": ".html",
          "application/pdf": ".pdf",
        };
        return extensions[mime] || "";
      };

      let blob;
      if (content instanceof Blob) {
        blob = content;
      } else {
        blob = new Blob([content], { type: mimeType });
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename.endsWith(getExtension(mimeType))
        ? filename
        : `${filename}${getExtension(mimeType)}`;

      // Use requestAnimationFrame for better timing
      requestAnimationFrame(() => {
        document.body.appendChild(a);
        a.click();

        // Cleanup after click
        requestAnimationFrame(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        });
      });
    },
    []
  );

  /**
   * Downloads text content with auto-timestamp
   * @param {string} content - Text content
   * @param {string} baseFilename - Base filename (without extension)
   * @param {string} mimeType - MIME type
   * @param {boolean} includeTimestamp - Whether to include timestamp
   */
  const downloadTextFile = useCallback(
    (
      content,
      baseFilename,
      mimeType = "text/plain",
      includeTimestamp = true
    ) => {
      const timestamp = includeTimestamp
        ? `-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}`
        : "";

      downloadFile(content, `${baseFilename}${timestamp}`, mimeType);
    },
    [downloadFile]
  );

  /**
   * Downloads Python code as a .py file
   * @param {string} code - Python code
   * @param {string} filename - Filename (without .py)
   */
  const downloadPythonFile = useCallback(
    (code, filename = "exercise") => {
      downloadFile(code, filename, "text/python");
    },
    [downloadFile]
  );

  /**
   * Downloads data as CSV
   * @param {Array|Object} data - Data to convert to CSV
   * @param {string} filename - Base filename
   * @param {Function} converter - Custom converter function
   */
  const downloadCSV = useCallback(
    (data, filename = "data", converter = null) => {
      const convertToCSV = (objArray) => {
        if (converter) return converter(objArray);

        if (!Array.isArray(objArray) || objArray.length === 0) {
          return "";
        }

        const array =
          typeof objArray !== "object" ? JSON.parse(objArray) : objArray;
        let str = "";

        // Headers
        const headers = Object.keys(array[0]);
        str += headers.join(",") + "\r\n";

        // Data rows
        array.forEach((row) => {
          let line = "";
          headers.forEach((header) => {
            if (line !== "") line += ",";
            const cell =
              row[header] !== null && row[header] !== undefined
                ? row[header].toString().replace(/"/g, '""')
                : "";
            line += `"${cell}"`;
          });
          str += line + "\r\n";
        });

        return str;
      };

      const csvContent = convertToCSV(data);
      downloadTextFile(csvContent, filename, "text/csv");
    },
    [downloadTextFile]
  );

  return {
    downloadFile,
    downloadTextFile,
    downloadPythonFile,
    downloadCSV,
  };
};
