import { describe, it, expect } from "vitest";
import { getSuccessMessage } from "../getSuccessMessage";

describe("getSuccessMessage", () => {
  it("returns a create message with capitalised resource", () => {
    expect(getSuccessMessage("create", "module")).toBe(
      "Module created successfully",
    );
  });

  it("returns an update message", () => {
    expect(getSuccessMessage("update", "lesson")).toBe(
      "Lesson updated successfully",
    );
  });

  it("returns a delete message", () => {
    expect(getSuccessMessage("delete", "user")).toBe(
      "User deleted successfully",
    );
  });

  it('returns "Changes saved successfully" for save action', () => {
    expect(getSuccessMessage("save")).toBe("Changes saved successfully");
  });

  it("returns publish message", () => {
    expect(getSuccessMessage("publish")).toBe("Content published successfully");
  });

  it("returns archive message", () => {
    expect(getSuccessMessage("archive")).toBe("Content archived successfully");
  });

  it("returns restore message", () => {
    expect(getSuccessMessage("restore")).toBe("Content restored successfully");
  });

  it('defaults resource to "item" when not provided', () => {
    expect(getSuccessMessage("create")).toBe("Item created successfully");
  });

  it("capitalises single-letter resource", () => {
    expect(getSuccessMessage("create", "x")).toBe("X created successfully");
  });

  it("returns default message for unknown action", () => {
    expect(getSuccessMessage("unknown_action")).toBe(
      "Operation completed successfully",
    );
  });

  it("returns default message for empty action string", () => {
    expect(getSuccessMessage("")).toBe("Operation completed successfully");
  });
});
