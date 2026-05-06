import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

vi.mock("../../utils/fileDownloadUtils", () => ({
  downloadContent: vi.fn(),
  convertToCSV: vi.fn(() => "mocked,csv,data"),
}));

import { useFileDownload } from "../useFileDownload";
import { downloadContent, convertToCSV } from "../../utils/fileDownloadUtils";

beforeEach(() => {
  vi.clearAllMocks();
});

// ============================================================================
// useFileDownload
// ============================================================================

describe("useFileDownload", () => {
  // ---- downloadFile ----
  it("downloadFile calls downloadContent with provided arguments", () => {
    const { result } = renderHook(() => useFileDownload());

    act(() => {
      result.current.downloadFile("hello", "greeting.txt", "text/plain");
    });

    expect(downloadContent).toHaveBeenCalledWith(
      "hello",
      "greeting.txt",
      "text/plain",
    );
  });

  it("downloadFile uses default mimeType when not provided", () => {
    const { result } = renderHook(() => useFileDownload());

    act(() => {
      result.current.downloadFile("data", "file.txt");
    });

    // The hook passes mimeType through — downloadContent handles the default
    expect(downloadContent).toHaveBeenCalledWith("data", "file.txt", undefined);
  });

  // ---- downloadCSV ----
  it("downloadCSV calls convertToCSV then downloadContent", () => {
    const { result } = renderHook(() => useFileDownload());

    const testData = [{ name: "Alice" }];

    act(() => {
      result.current.downloadCSV(testData, "report");
    });

    expect(convertToCSV).toHaveBeenCalledWith(testData);
    expect(downloadContent).toHaveBeenCalledWith(
      "mocked,csv,data",
      "report",
      "text/csv",
    );
  });

  it("downloadCSV defaults filename to 'data'", () => {
    const { result } = renderHook(() => useFileDownload());

    act(() => {
      result.current.downloadCSV([{ x: 1 }]);
    });

    expect(convertToCSV).toHaveBeenCalledWith([{ x: 1 }]);
    // The hook sets the default filename to "data" via default parameter
    expect(downloadContent).toHaveBeenCalledWith(
      "mocked,csv,data",
      "data",
      "text/csv",
    );
  });

  // ---- downloadPythonFile ----
  it("downloadPythonFile appends .py extension and uses text/python mimeType", () => {
    const { result } = renderHook(() => useFileDownload());

    act(() => {
      result.current.downloadPythonFile('print("hello")', "my_script");
    });

    expect(downloadContent).toHaveBeenCalledWith(
      'print("hello")',
      "my_script.py",
      "text/python",
    );
  });

  it("downloadPythonFile defaults filename to 'exercise'", () => {
    const { result } = renderHook(() => useFileDownload());

    act(() => {
      result.current.downloadPythonFile("code");
    });

    expect(downloadContent).toHaveBeenCalledWith(
      "code",
      "exercise.py",
      "text/python",
    );
  });

  // ---- Callback stability (memoisation) ----
  it("returns the same function references across re-renders", () => {
    const { result, rerender } = renderHook(() => useFileDownload());

    const firstDownloadFile = result.current.downloadFile;
    const firstDownloadCSV = result.current.downloadCSV;
    const firstDownloadPythonFile = result.current.downloadPythonFile;

    rerender();

    expect(result.current.downloadFile).toBe(firstDownloadFile);
    expect(result.current.downloadCSV).toBe(firstDownloadCSV);
    expect(result.current.downloadPythonFile).toBe(firstDownloadPythonFile);
  });
});
