// utils/markdownUtils.js

/**
 * Convert a heading string to a URL-safe slug.
 */
export const slugifyHeading = (text) => {
  if (typeof text !== "string") return undefined;
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
};

/**
 * Parse markdown content into sections, splitting on :::container::: blocks.
 * Returns an array of { type: "markdown" | "container", content, containerType? }
 */
export const parseContent = (text) => {
  if (!text) return [];
  const lines = text.split("\n");
  const result = [];
  let i = 0;

  while (i < lines.length) {
    if (lines[i].trim().startsWith(":::")) {
      const type = lines[i].trim().replace(":::", "").trim();
      const containerLines = [];
      i++;
      while (i < lines.length && lines[i].trim() !== ":::") {
        containerLines.push(lines[i]);
        i++;
      }
      i++;
      result.push({
        type: "container",
        containerType: type,
        content: containerLines.join("\n"),
      });
    } else {
      const regularLines = [];
      while (i < lines.length && !lines[i].trim().startsWith(":::")) {
        regularLines.push(lines[i]);
        i++;
      }
      result.push({ type: "markdown", content: regularLines.join("\n") });
    }
  }
  return result;
};
