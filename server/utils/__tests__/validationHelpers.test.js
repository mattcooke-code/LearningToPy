import { describe, it, expect } from "vitest";
import {
  validateEmail,
  validatePassword,
  validateUsername,
  validateIP,
  validateContent,
  validateSessionId,
  validateXP,
  sanitizeString,
  validateEnum,
  validateObjectId,
  validateDate,
} from "../../utils/validationHelpers";

// --- validateEmail ---
describe("validateEmail", () => {
  it("rejects non-string or empty input", () => {
    expect(validateEmail("")).toBe(false);
    expect(validateEmail(null)).toBe(false);
    expect(validateEmail(undefined)).toBe(false);
    expect(validateEmail(123)).toBe(false);
  });

  it("rejects invalid formats", () => {
    expect(validateEmail("notanemail")).toBe(false);
    expect(validateEmail("missing@")).toBe(false);
    expect(validateEmail("@nodomain")).toBe(false);
  });

  it("accepts valid email addresses", () => {
    expect(validateEmail("user@example.com")).toBe(true);
    expect(validateEmail("test.user@domain.co.uk")).toBe(true);
  });

  it("rejects disposable email domains", () => {
    expect(validateEmail("test@mailinator.com")).toBe(false);
    expect(validateEmail("test@10minutemail.com")).toBe(false);
    expect(validateEmail("test@guerrillamail.com")).toBe(false);
  });
});

// --- validatePassword ---
describe("validatePassword", () => {
  it("rejects empty or non-string input", () => {
    expect(validatePassword("").isValid).toBe(false);
    expect(validatePassword(null).isValid).toBe(false);
  });

  it("rejects passwords under 8 characters", () => {
    expect(validatePassword("Ab1!").isValid).toBe(false);
  });

  it("rejects passwords over 128 characters", () => {
    expect(validatePassword("A".repeat(129) + "a1!").isValid).toBe(false);
  });

  it("requires uppercase, lowercase, number, and special char", () => {
    expect(validatePassword("alllowercase1!").isValid).toBe(false);
    expect(validatePassword("ALLUPPERCASE1!").isValid).toBe(false);
    expect(validatePassword("NoSpecialChar1").isValid).toBe(false);
    expect(validatePassword("NoNumber!@#").isValid).toBe(false);
  });

  it("rejects common weak passwords", () => {
    expect(validatePassword("password123").isValid).toBe(false);
    expect(validatePassword("qwerty").isValid).toBe(false);
  });

  it("accepts strong passwords", () => {
    expect(validatePassword("MyStr0ng!Pass").isValid).toBe(true);
    expect(validatePassword("C0mpl3x!Pass#word").isValid).toBe(true);
  });
});

// --- validateUsername ---
describe("validateUsername", () => {
  it("rejects empty or non-string input", () => {
    expect(validateUsername("").isValid).toBe(false);
    expect(validateUsername(null).isValid).toBe(false);
  });

  it("rejects usernames under 3 characters", () => {
    expect(validateUsername("ab").isValid).toBe(false);
  });

  it("rejects usernames over 30 characters", () => {
    expect(validateUsername("a".repeat(31)).isValid).toBe(false);
  });

  it("rejects usernames with special characters", () => {
    expect(validateUsername("hello world").isValid).toBe(false);
    expect(validateUsername("hello@world").isValid).toBe(false);
  });

  it("rejects reserved usernames", () => {
    expect(validateUsername("admin").isValid).toBe(false);
    expect(validateUsername("root").isValid).toBe(false);
    expect(validateUsername("null").isValid).toBe(false);
  });

  it("accepts valid usernames", () => {
    expect(validateUsername("coder123").isValid).toBe(true);
    expect(validateUsername("test_user").isValid).toBe(true);
  });
});

// --- validateIP ---
describe("validateIP", () => {
  it("rejects non-string input", () => {
    expect(validateIP(null)).toBe(false);
    expect(validateIP("")).toBe(false);
  });

  it("accepts valid IPv4 addresses", () => {
    expect(validateIP("192.168.1.1")).toBe(true);
    expect(validateIP("255.255.255.255")).toBe(true);
  });

  it("rejects invalid IPv4 addresses", () => {
    expect(validateIP("256.1.1.1")).toBe(false);
    expect(validateIP("1.2.3")).toBe(false);
  });

  it("accepts valid IPv6 addresses", () => {
    expect(validateIP("2001:0db8:85a3:0000:0000:8a2e:0370:7334")).toBe(true);
  });
});

// --- validateContent ---
describe("validateContent", () => {
  it("rejects empty input", () => {
    expect(validateContent("").isValid).toBe(false);
    expect(validateContent(null).isValid).toBe(false);
  });

  it("rejects script tags and event handlers", () => {
    expect(validateContent('<script>alert("xss")</script>').isValid).toBe(
      false,
    );
    expect(validateContent('<div onclick="alert(1)">').isValid).toBe(false);
    expect(validateContent("javascript:void(0)").isValid).toBe(false);
    expect(validateContent('<iframe src="evil.com">').isValid).toBe(false);
  });

  it("accepts safe content", () => {
    expect(validateContent("Hello, world!").isValid).toBe(true);
    expect(validateContent("<p>Safe HTML paragraph</p>").isValid).toBe(true);
  });
});

// --- validateSessionId ---
describe("validateSessionId", () => {
  it("rejects bad input", () => {
    expect(validateSessionId("")).toBe(false);
    expect(validateSessionId(null)).toBe(false);
    expect(validateSessionId("short")).toBe(false);
  });

  it("accepts valid session IDs", () => {
    expect(validateSessionId("abc123_def-456")).toBe(true);
  });

  it("rejects IDs with special characters", () => {
    expect(validateSessionId("session@id!")).toBe(false);
  });
});

// --- validateXP ---
describe("validateXP", () => {
  it("rejects non-number input", () => {
    expect(validateXP("abc").isValid).toBe(false);
    expect(validateXP(NaN).isValid).toBe(false);
  });

  it("respects min and max bounds", () => {
    expect(validateXP(-1).isValid).toBe(false);
    expect(validateXP(1001, { max: 1000 }).isValid).toBe(false);
  });

  it("rejects floats when allowFloat is false", () => {
    expect(validateXP(5.5).isValid).toBe(false);
  });

  it("accepts valid XP values", () => {
    expect(validateXP(100).isValid).toBe(true);
    expect(validateXP(5.5, { allowFloat: true }).isValid).toBe(true);
  });
});

// --- sanitizeString ---
describe("sanitizeString", () => {
  it("returns empty string for bad input", () => {
    expect(sanitizeString("")).toBe("");
    expect(sanitizeString(null)).toBe("");
  });

  it("trims whitespace and collapses spaces", () => {
    expect(sanitizeString("  hello   world  ")).toBe("hello world");
  });

  it("replaces line breaks with spaces", () => {
    expect(sanitizeString("line1\nline2\tline3")).toBe("line1 line2 line3");
  });
});

// --- validateEnum ---
describe("validateEnum", () => {
  const allowed = ["A", "B", "C"];

  it("returns false for non-array allowed values", () => {
    expect(validateEnum("A", "not-an-array")).toBe(false);
  });

  it("returns true for allowed values", () => {
    expect(validateEnum("A", allowed)).toBe(true);
  });

  it("returns false for disallowed values", () => {
    expect(validateEnum("D", allowed)).toBe(false);
  });
});

// --- validateObjectId ---
describe("validateObjectId", () => {
  it("rejects non-strings", () => {
    expect(validateObjectId(null)).toBe(false);
    expect(validateObjectId(123)).toBe(false);
  });

  it("rejects invalid lengths", () => {
    expect(validateObjectId("abc123")).toBe(false);
  });

  it("accepts valid 24-char hex strings", () => {
    expect(validateObjectId("507f1f77bcf86cd799439011")).toBe(true);
    expect(validateObjectId("ABCDEFabcdef123456789012")).toBe(true);
  });

  it("rejects non-hex characters", () => {
    expect(validateObjectId("zzzzzzzzzzzzzzzzzzzzzzzz")).toBe(false);
  });
});

// --- validateDate ---
describe("validateDate", () => {
  it("rejects non-Date input", () => {
    expect(validateDate("not-a-date").isValid).toBe(false);
    expect(validateDate(new Date("invalid")).isValid).toBe(false);
  });

  it("accepts valid dates", () => {
    expect(validateDate(new Date()).isValid).toBe(true);
    expect(validateDate(new Date("2026-01-01")).isValid).toBe(true);
  });

  it("rejects future dates when allowFuture is false", () => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    expect(validateDate(future, { allowFuture: false }).isValid).toBe(false);
  });

  it("rejects dates outside min/max range", () => {
    const date = new Date("2026-06-15");
    expect(
      validateDate(date, { minDate: new Date("2026-07-01") }).isValid,
    ).toBe(false);
    expect(
      validateDate(date, { maxDate: new Date("2026-01-01") }).isValid,
    ).toBe(false);
  });
});
