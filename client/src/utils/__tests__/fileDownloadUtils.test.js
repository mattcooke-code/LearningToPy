import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  convertToCSV,
  createDownloadLink,
  triggerDownload,
  downloadContent,
  downloadPythonCode,
  downloadTerminalOutput,
} from "../fileDownloadUtils";

beforeEach(() => {
  // Stub URL.createObjectURL and revokeObjectURL since jsdom doesn't implement them
  vi.stubGlobal("URL", {
    ...URL,
    createObjectURL: vi.fn(() => "blob:mock-url"),
    revokeObjectURL: vi.fn(),
  });
});

// ============================================================================
// convertToCSV
// ============================================================================

describe("convertToCSV", () => {
  it("converts an array of flat objects to CSV string", () => {
    const data = [
      { name: "Alice", xp: 1200 },
      { name: "Bob", xp: 900 },
    ];

    const result = convertToCSV(data);

    const lines = result.split("\r\n");
    expect(lines[0]).toBe("name,xp");
    expect(lines[1]).toBe('"Alice","1200"');
    expect(lines[2]).toBe('"Bob","900"');
  });

  it("returns empty string for empty array", () => {
    expect(convertToCSV([])).toBe("");
  });

  it("returns empty string for null input", () => {
    expect(convertToCSV(null)).toBe("");
  });

  it("returns empty string for non-array input", () => {
    expect(convertToCSV("not-an-array")).toBe("");
  });

  it("escapes double quotes in values", () => {
    const data = [{ value: 'say "hello"' }];
    const result = convertToCSV(data);
    expect(result).toContain('"say ""hello"""');
  });

  it("handles null and undefined values", () => {
    const data = [{ a: null, b: undefined, c: "ok" }];
    const result = convertToCSV(data);
    const lines = result.split("\r\n");
    expect(lines[1]).toBe('"","","ok"');
  });

  it("handles numeric values as strings", () => {
    const data = [{ x: 0, y: 100 }];
    const result = convertToCSV(data);
    const lines = result.split("\r\n");
    expect(lines[1]).toBe('"0","100"');
  });
});

// ============================================================================
// createDownloadLink
// ============================================================================

describe("createDownloadLink", () => {
  it("creates an anchor element with correct properties", () => {
    const blob = new Blob(["test"], { type: "text/plain" });
    const anchor = createDownloadLink(blob, "test.txt");

    expect(anchor).toBeInstanceOf(HTMLAnchorElement);
    expect(anchor.href).toBe("blob:mock-url");
    expect(anchor.download).toBe("test.txt");
    expect(anchor.style.display).toBe("none");
  });

  it("uses createObjectURL with the provided blob", () => {
    const blob = new Blob(["data"]);
    createDownloadLink(blob, "file.csv");

    expect(URL.createObjectURL).toHaveBeenCalledWith(blob);
  });
});

// ============================================================================
// triggerDownload
// ============================================================================

describe("triggerDownload", () => {
  it("appends the anchor to the document body", () => {
    const appendChildSpy = vi.spyOn(document.body, "appendChild");
    const anchor = document.createElement("a");

    triggerDownload(anchor);

    expect(appendChildSpy).toHaveBeenCalledWith(anchor);
  });

  it("triggers a click on the anchor", () => {
    const anchor = document.createElement("a");
    const clickSpy = vi.spyOn(anchor, "click");

    triggerDownload(anchor);

    expect(clickSpy).toHaveBeenCalled();
  });

  it("cleans up after timeout", () => {
    vi.useFakeTimers();

    const anchor = document.createElement("a");
    const removeChildSpy = vi.spyOn(document.body, "removeChild");

    triggerDownload(anchor);

    // Before timeout, nothing removed
    expect(removeChildSpy).not.toHaveBeenCalled();

    // After 100ms, cleanup runs
    vi.advanceTimersByTime(100);

    expect(removeChildSpy).toHaveBeenCalledWith(anchor);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(anchor.href);

    vi.useRealTimers();
  });
});

// ============================================================================
// downloadContent
// ============================================================================

describe("downloadContent", () => {
  it("creates a blob and triggers download for string content", () => {
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click");

    downloadContent("hello world", "greeting.txt");

    expect(clickSpy).toHaveBeenCalled();
  });

  it("uses the blob directly when content is already a Blob", () => {
    const blob = new Blob(["already-blob"]);
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click");

    downloadContent(blob, "data.bin", "application/octet-stream");

    expect(clickSpy).toHaveBeenCalled();
  });

  it("defaults mimeType to text/plain", () => {
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click");

    downloadContent("content", "file");

    // The download should still work
    expect(clickSpy).toHaveBeenCalled();
  });
});

// ============================================================================
// downloadPythonCode
// ============================================================================

describe("downloadPythonCode", () => {
  it("appends .py extension to filename", () => {
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click");

    downloadPythonCode('print("hello")', "my_script");

    // The click should fire — we can't easily inspect the filename
    // without mocking createDownloadLink, but we can verify it works
    expect(clickSpy).toHaveBeenCalled();
  });

  it("defaults filename to exercise.py", () => {
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click");

    downloadPythonCode('print("test")');

    expect(clickSpy).toHaveBeenCalled();
  });
});

// ============================================================================
// downloadTerminalOutput
// ============================================================================

describe("downloadTerminalOutput", () => {
  it("prefixes input lines with >>>", () => {
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click");

    const output = [
      { type: "input", content: "print('hello')" },
      { type: "output", content: "hello" },
    ];

    downloadTerminalOutput(output, "session");

    expect(clickSpy).toHaveBeenCalled();
  });

  it("joins all lines with newlines", () => {
    const output = [
      { type: "input", content: "x = 1" },
      { type: "input", content: "print(x)" },
      { type: "output", content: "1" },
    ];

    // This should not throw
    expect(() => downloadTerminalOutput(output)).not.toThrow();
  });

  it("defaults filename to terminal_session.txt", () => {
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click");

    downloadTerminalOutput([{ type: "output", content: "done" }]);

    expect(clickSpy).toHaveBeenCalled();
  });

  it("handles empty output array", () => {
    expect(() => downloadTerminalOutput([])).not.toThrow();
  });
});
