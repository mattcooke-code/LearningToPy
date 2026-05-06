import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock the fileDownloadUtils functions that analyticsUtils depends on
vi.mock("../fileDownloadUtils", () => ({
  convertToCSV: vi.fn(() => "mocked,csv,content"),
  downloadContent: vi.fn(),
}));

import { exportToCSV } from "../analyticsUtils";
import { convertToCSV, downloadContent } from "../fileDownloadUtils";

beforeEach(() => {
  vi.clearAllMocks();
  // Freeze time so the timestamp in the filename is predictable
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-05-06T12:00:00Z"));
});

afterEach(() => {
  vi.useRealTimers();
});

// ============================================================================
// exportToCSV
// ============================================================================

describe("exportToCSV", () => {
  it("calls convertToCSV with the provided data", () => {
    const data = [{ name: "Alice" }, { name: "Bob" }];

    exportToCSV(data, "report");

    expect(convertToCSV).toHaveBeenCalledWith(data);
  });

  it("calls downloadContent with CSV content, timestamped filename, and correct MIME type", () => {
    const data = [{ x: 1 }];

    exportToCSV(data, "analytics");

    expect(downloadContent).toHaveBeenCalledWith(
      "mocked,csv,content",
      "analytics-2026-05-06T12:00:00.000Z.csv",
      "text/csv",
    );
  });

  it("handles empty data array", () => {
    exportToCSV([], "empty");

    expect(convertToCSV).toHaveBeenCalledWith([]);
    expect(downloadContent).toHaveBeenCalled();
  });

  it("includes ISO timestamp in the filename", () => {
    exportToCSV([], "stats");

    const [, filename] = downloadContent.mock.calls[0];
    expect(filename).toMatch(/^stats-.*\.csv$/);
    expect(filename).toContain("2026-05-06T12:00:00.000Z");
  });
});
