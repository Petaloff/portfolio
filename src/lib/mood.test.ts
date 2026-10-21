import { describe, expect, it } from "vitest";
import { moodAt, statusTint } from "./mood";

describe("moodAt", () => {
  it("covers every hour of the day", () => {
    const names = Array.from({ length: 24 }, (_, h) => moodAt(h).name);
    expect(names.slice(0, 5)).toEqual(Array(5).fill("night"));
    expect(names.slice(5, 10)).toEqual(Array(5).fill("morning"));
    expect(names.slice(10, 17)).toEqual(Array(7).fill("day"));
    expect(names.slice(17, 22)).toEqual(Array(5).fill("evening"));
    expect(names.slice(22)).toEqual(["night", "night"]);
  });

  it("keeps the night dimmer than the day", () => {
    expect(moodAt(2).keyIntensity).toBeLessThan(moodAt(12).keyIntensity);
  });
});

describe("statusTint", () => {
  it("adds no tint when offline or unknown", () => {
    expect(statusTint("offline")).toBeNull();
    expect(statusTint(undefined)).toBeNull();
    expect(statusTint("online")).toMatch(/^#/);
  });
});
