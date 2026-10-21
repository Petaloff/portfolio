import { describe, expect, it } from "vitest";
import { extrude, models, upsample } from "./voxelArt";
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
