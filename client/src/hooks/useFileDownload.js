// useFileDownload.js
import { useCallback } from "react";
import { downloadContent, convertToCSV } from "../utils/fileDownloadUtils";

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
