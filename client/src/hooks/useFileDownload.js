// /client/src/hooks/useFileDownload.js
/**
 * @fileoverview File download hook.
 *
 * Convenience wrappers around the pure functions in `utils/fileDownloadUtils`.
 * Provides memoised callbacks for downloading raw files, CSV data, and Python
 * code. All actual download logic lives in the utils layer.
 *
 * @module hooks/useFileDownload
 * @requires react
 * @requires ../utils/fileDownloadUtils
 */
import { useCallback } from "react";
import { downloadContent, convertToCSV } from "../utils/fileDownloadUtils";

/**
 * Returns memoised download helpers for files, CSV, and Python code.
 *
 * @returns {{
 *   downloadFile: (content: string|Blob, filename: string, mimeType?: string) => void,
 *   downloadCSV: (data: object[], filename?: string) => void,
 *   downloadPythonFile: (code: string, filename?: string) => void
 * }}
 */
export const useFileDownload = () => {
  const downloadFile = useCallback((content, filename, mimeType) => {
    downloadContent(content, filename, mimeType);
  }, []);

  const downloadCSV = useCallback((data, filename) => {
    const csv = convertToCSV(data);
    downloadContent(csv, filename, "text/csv");
  }, []);

  const downloadPythonFile = useCallback((code, filename = "exercise") => {
    downloadContent(code, `${filename}.py`, "text/python");
  }, []);

  return { downloadFile, downloadCSV, downloadPythonFile };
};
