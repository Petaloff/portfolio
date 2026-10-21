import { describe, expect, it } from "vitest";
import { applyOverrides, diffOverrides, flatten, invalidMessages } from "./messages";

const defaults = { hero: { title: "Hi", cta: "Go" }, footer: { made: "By me" } };

describe("flatten", () => {
  it("turns nested sections into dotted keys", () => {
    expect(flatten(defaults)).toEqual({ "hero.title": "Hi", "hero.cta": "Go", "footer.made": "By me" });
  });
});

describe("applyOverrides", () => {
  it("replaces known keys and keeps the rest", () => {
    expect(applyOverrides(defaults, { "hero.title": "Hey" })).toEqual({
      hero: { title: "Hey", cta: "Go" },
      footer: { made: "By me" },
    });
  });

  it("ignores unknown and blank overrides", () => {
    expect(applyOverrides(defaults, { "hero.gone": "x", "hero.cta": "  " })).toEqual(defaults);
  });
});

describe("diffOverrides", () => {
  it("keeps only changed, known, non-empty values", () => {
    const flat = flatten(defaults);
    expect(diffOverrides(flat, { "hero.title": "Hi", "hero.cta": "Run", "nope.key": "x", "footer.made": "" })).toEqual({
      "hero.cta": "Run",
    });
  });
});

describe("invalidMessages", () => {
  it("flags broken ICU syntax", () => {
    expect(
      invalidMessages({
        ok: "{count, plural, one {# day} other {# days}}",
        broken: "{count, plural, one {# day}",
      }),
    ).toEqual(["broken"]);
  });
});
