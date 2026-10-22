import { describe, expect, it } from "vitest";
import { extrude, HEAD_VOXELS, headFromSkin, models, upsample } from "./voxelArt";
import { COUNT, fromModel } from "./formations";

describe("extrude", () => {
  it("turns pixel rows into voxels with y pointing up", () => {
    const m = extrude(["+.", "##"], 2);
    expect(m.voxels).toContainEqual([0, 1, 0]);
    expect(m.voxels).toContainEqual([1, 0, 1]);
    expect(m.voxels).toHaveLength(6);
    expect(m.accent.filter(Boolean)).toHaveLength(2);
  });
});

describe("upsample", () => {
  it("multiplies the voxel count by k cubed", () => {
    expect(upsample(extrude(["#"]), 3).voxels).toHaveLength(27);
  });
});

describe("fromModel", () => {
  it("fits every model into the cube budget and centres it", () => {
    for (const model of Object.values(models)) {
      const f = fromModel(model);
      const used = f.scales.filter((s) => s > 0).length;
      expect(used).toBeGreaterThan(0);
      expect(used).toBeLessThanOrEqual(COUNT);
      let sum = 0;
      for (let i = 0; i < used; i++) sum += f.positions[i * 3];
      expect(Math.abs(sum / used)).toBeLessThan(0.5);
    }
  });

  it("respects a smaller budget", () => {
    const f = fromModel(models.skyline, 360);
    expect(f.scales.filter((s) => s > 0).length).toBeLessThanOrEqual(360);
  });
});

describe("headFromSkin", () => {
  it("paints the front face from the skin's face texture and lets the hat cover it", () => {
    const pixels = new Uint8ClampedArray(64 * 64 * 4);
    const put = (u: number, v: number, rgba: number[]) => pixels.set(rgba, (v * 64 + u) * 4);
    put(8, 8, [255, 0, 0, 255]); // front, top-left as seen from the front
    put(15, 15, [0, 0, 255, 255]); // front, bottom-right
    put(47, 15, [0, 255, 0, 255]); // hat over the bottom-right
    const head = headFromSkin(pixels);
    const colorAt = (x: number, y: number, z: number) =>
      head.colors![head.voxels.findIndex((v) => v[0] === x && v[1] === y && v[2] === z)];
    expect(head.voxels).toHaveLength(HEAD_VOXELS);
    expect(colorAt(0, 7, 7)).toEqual([1, 0, 0]);
    expect(colorAt(7, 0, 7)).toEqual([0, 1, 0]);
  });
});

describe("head budget", () => {
  it("keeps every voxel of the skin head and the plain one", () => {
    for (const model of [headFromSkin(new Uint8ClampedArray(64 * 64 * 4)), models.head]) {
      const layout = fromModel(model, HEAD_VOXELS);
      expect(Array.from(layout.scales).filter((s) => s > 0)).toHaveLength(model.voxels.length);
    }
  });
});
