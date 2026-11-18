import { describe, expect, it } from "vitest";
import { assertAdministrator, assertRoleChange } from "@/lib/account-permissions";

describe("Account administration", () => {
  it("only administrators may manage users", () => {
    expect(() => assertAdministrator(false)).toThrow();
    expect(() => assertAdministrator(null)).toThrow();
    expect(() => assertAdministrator(true, new Error("lookup failed"))).toThrow();
    expect(() => assertAdministrator(true)).not.toThrow();
  });
  it("an administrator may appoint another administrator", () => {
    expect(() => assertRoleChange("owner", "colleague")).not.toThrow();
  });
  it("administrators cannot remove their own access", () => {
    expect(() => assertRoleChange("owner", "owner")).toThrow();
  });
});