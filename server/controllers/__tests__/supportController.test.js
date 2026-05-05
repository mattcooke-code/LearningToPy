import { describe, it, expect } from "vitest";
import { escapeHtml } from "../../controllers/supportController";

describe("escapeHtml", () => {
  it("returns empty string for falsy input", () => {
    expect(escapeHtml("")).toBe("");
    expect(escapeHtml(null)).toBe("");
    expect(escapeHtml(undefined)).toBe("");
  });

  it("escapes ampersands", () => {
    expect(escapeHtml("a & b")).toBe("a &amp; b");
  });

  it("escapes less-than and greater-than", () => {
    expect(escapeHtml("<script>")).toBe("&lt;script&gt;");
  });

  it("escapes double quotes", () => {
    expect(escapeHtml('say "hello"')).toBe("say &quot;hello&quot;");
  });

  it("escapes single quotes", () => {
    expect(escapeHtml("it's")).toBe("it&#39;s");
  });

  it("handles strings with no special characters", () => {
    expect(escapeHtml("Hello, World!")).toBe("Hello, World!");
  });

  it("escapes multiple types in one string", () => {
    const input = '<a href="page">Tom & Jerry\'s</a>';
    const expected =
      "&lt;a href=&quot;page&quot;&gt;Tom &amp; Jerry&#39;s&lt;/a&gt;";
    expect(escapeHtml(input)).toBe(expected);
  });
});
