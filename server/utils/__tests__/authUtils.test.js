import { describe, it, expect } from "vitest";
import { getRefreshTokenSettings } from "../../utils/authUtils";

describe("getRefreshTokenSettings", () => {
  it("returns session lifespan (1h) when rememberMe is false", () => {
    const result = getRefreshTokenSettings(false);
    expect(result.tokenLifespan).toBe("1h");
    expect(result.cookieMaxAge).toBe(60 * 60 * 1000);
  });

  it("returns remember-me lifespan (30d) when rememberMe is true", () => {
    const result = getRefreshTokenSettings(true);
    expect(result.tokenLifespan).toBe("30d");
    expect(result.cookieMaxAge).toBe(30 * 24 * 60 * 60 * 1000);
  });
});
