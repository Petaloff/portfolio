import { describe, expect, it } from "vitest";
import en from "../messages/en.json";
import ru from "../messages/ru.json";

// Flattened "section.key" paths of a messages tree
function keys(tree: object, prefix = ""): string[] {
  return Object.entries(tree).flatMap(([k, v]) =>
    v && typeof v === "object" ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`],
  );
}

describe("messages", () => {
  it("has the same keys in both locales", () => {
    expect(keys(en).sort()).toEqual(keys(ru).sort());
  });

  it("has no empty strings", () => {
    const empty = (tree: object): boolean =>
      Object.values(tree).some((v) => (typeof v === "string" ? !v.trim() : empty(v)));
    expect(empty(en)).toBe(false);
    expect(empty(ru)).toBe(false);
  });
});
