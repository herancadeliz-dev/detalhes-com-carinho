import { describe, expect, it } from "vitest";
import { loginEmail, normalizeLogin } from "@/lib/account-login";

describe("Private username access", () => {
  it("supports the requested login regardless of capitalization", () => {
    expect(normalizeLogin(" Luciano ")).toBe("luciano");
    expect(loginEmail("Luciano")).toBe("luciano@usuarios.venize.invalid");
  });
  it("rejects invalid usernames", () => {
    expect(() => normalizeLogin("a")).toThrow();
    expect(() => normalizeLogin("user name")).toThrow();
  });
});