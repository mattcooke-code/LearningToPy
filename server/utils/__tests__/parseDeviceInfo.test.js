import { describe, it, expect } from "vitest";
import { anonymiseIp } from "../../utils/parseDeviceInfo";

describe("anonymiseIp", () => {
  it("returns null for falsy input", () => {
    expect(anonymiseIp(null)).toBe(null);
    expect(anonymiseIp("")).toBe(null);
    expect(anonymiseIp(undefined)).toBe(null);
  });

  it("replaces last octet of IPv4 with .0", () => {
    expect(anonymiseIp("192.168.1.42")).toBe("192.168.1.0");
    expect(anonymiseIp("10.0.0.255")).toBe("10.0.0.0");
  });

  it("replaces last group of IPv6 with :0000", () => {
    expect(anonymiseIp("2001:0db8:85a3:0000:0000:8a2e:0370:7334")).toBe(
      "2001:0db8:85a3:0000:0000:8a2e:0370:0000",
    );
  });

  it("handles IPv4-mapped IPv6 addresses (::ffff: prefix)", () => {
    expect(anonymiseIp("::ffff:192.168.1.42")).toBe("192.168.1.0");
  });

  it("returns null for unrecognized formats", () => {
    expect(anonymiseIp("not-an-ip")).toBe(null);
  });
});
