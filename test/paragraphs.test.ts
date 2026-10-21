import { describe, expect, it } from "vitest";
import { emphasis, paragraphs } from "../src/lib/paragraphs";

describe("paragraphs", () => {
  it("splits on blank lines", () => {
    expect(paragraphs("one\n\n two \n \nthree")).toEqual(["one", "two", "three"]);
  });

  it("marks **bold** parts at odd indexes", () => {
    expect(emphasis("a **b** c **d**")).toEqual(["a ", "b", " c ", "d", ""]);
    expect(emphasis("plain")).toEqual(["plain"]);
  });
});
