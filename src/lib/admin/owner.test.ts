import { describe, expect, it } from "vitest";
import { isOwner, ownerIds } from "./owner";

describe("ownerIds", () => {
  it("falls back to the default owner", () => {
    expect(ownerIds(undefined)).toEqual(["106511545"]);
    expect(ownerIds("not-a-number")).toEqual(["106511545"]);
  });

  it("reads a comma separated list", () => {
    expect(ownerIds(" 1, 2 ,x")).toEqual(["1", "2"]);
  });
});

describe("isOwner", () => {
  it("accepts only the owner's GitHub id", () => {
    expect(isOwner("github", "106511545", ["106511545"])).toBe(true);
    expect(isOwner("discord", "106511545", ["106511545"])).toBe(false);
    expect(isOwner("github", "1", ["106511545"])).toBe(false);
    expect(isOwner("github", undefined, ["106511545"])).toBe(false);
  });
});
