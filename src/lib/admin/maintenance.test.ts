import { describe, expect, it } from "vitest";
import { addUser, mayPass, normalizeMaintenance, parseLogin } from "./maintenance";

describe("normalizeMaintenance", () => {
  it("falls back to off for anything odd", () => {
    expect(normalizeMaintenance(null)).toEqual({ enabled: false, allow: [] });
    expect(normalizeMaintenance({ enabled: "yes", allow: "x" })).toEqual({ enabled: false, allow: [] });
  });

  it("drops broken users", () => {
    const allow = [{ id: "1", login: "a" }, { id: "x", login: "b" }, null];
    expect(normalizeMaintenance({ enabled: true, allow }).allow).toEqual([{ id: "1", login: "a" }]);
  });
});

describe("mayPass", () => {
  const config = { enabled: true, allow: [{ id: "42", login: "friend" }] };

  it("lets the owner and listed GitHub ids in", () => {
    expect(mayPass("github", "106511545", config)).toBe(true);
    expect(mayPass("github", "42", config)).toBe(true);
  });

  it("keeps everyone else out", () => {
    expect(mayPass("github", "7", config)).toBe(false);
    expect(mayPass("discord", "42", config)).toBe(false);
    expect(mayPass(undefined, undefined, config)).toBe(false);
  });
});

describe("parseLogin", () => {
  it("accepts logins, @logins and profile links", () => {
    expect(parseLogin(" Petaloff ")).toBe("Petaloff");
    expect(parseLogin("@some-one")).toBe("some-one");
    expect(parseLogin("https://github.com/some-one/")).toBe("some-one");
  });

  it("rejects what GitHub would not allow", () => {
    expect(parseLogin("")).toBeNull();
    expect(parseLogin("-bad")).toBeNull();
    expect(parseLogin("a--b")).toBeNull();
    expect(parseLogin("a".repeat(40))).toBeNull();
  });
});

describe("addUser", () => {
  it("replaces a user with the same id", () => {
    expect(addUser([{ id: "1", login: "old" }], { id: "1", login: "new" })).toEqual([{ id: "1", login: "new" }]);
  });
});
