import { upsample, type Model } from "./voxelArt";

export const COUNT = 900;
export const SIZE = 0.22;
// Text formations light every n-th cube in the accent colour
const ACCENT_EVERY = 11;

// Voxel pitch: a hair over the cube size so the letters read as solid blocks
const UNIT = SIZE * 1.06;

type Point = [number, number, number];

// Target layout for the instanced cubes: unused slots get scale 0
export type Formation = {
  positions: Float32Array;
  scales: Float32Array;
  accent: Uint8Array;
  width: number;
  height: number;
  depth: number;
};

// Rasterise text on a 2D canvas and turn filled pixels into voxels centred on
// the origin. A smaller budget gives a coarser grid of relatively bigger cubes.
export function buildName(text: string, budget = COUNT): Formation {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const font = "800 64px system-ui, sans-serif";
  ctx.font = font;
  canvas.width = Math.ceil(ctx.measureText(text).width) + 8;
  canvas.height = 90;
  ctx.font = font;
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff";
  ctx.fillText(text, 4, canvas.height / 2);

  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  // Pick the finest sampling step that still fits within the cube budget
  let step = 1;
  let pixels: [number, number][] = [];
  for (; step < 12; step++) {
    pixels = [];
    for (let y = 0; y < canvas.height; y += step)
      for (let x = 0; x < canvas.width; x += step)
        if (data[(y * canvas.width + x) * 4 + 3] > 128) pixels.push([x / step, y / step]);
    if (pixels.length <= budget) break;
  }

  const xs = pixels.map((p) => p[0]);
  const ys = pixels.map((p) => p[1]);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const points = pixels.map(([x, y]): Point => [(x - cx) * UNIT, -(y - cy) * UNIT, 0]);

  const positions = new Float32Array(COUNT * 3);
  const scales = new Float32Array(COUNT);
  const accent = Uint8Array.from({ length: COUNT }, (_, i) => (i % ACCENT_EVERY === 0 ? 1 : 0));
  points.forEach((p, i) => {
    positions.set(p, i * 3);
    scales[i] = 1;
  });
  return {
    positions,
    scales,
    accent,
    width: (Math.max(...xs) - Math.min(...xs)) * UNIT + SIZE,
    height: (Math.max(...ys) - Math.min(...ys)) * UNIT + SIZE,
    depth: SIZE,
  };
}

// A pixel-art model, blown up to the biggest block size that fits the budget
// (or thinned out evenly when even the plain model is too big), centred on the origin
export function fromModel(model: Model, budget = COUNT): Formation {
  let k = 1;
  while (model.voxels.length * (k + 1) ** 3 <= budget) k++;
  let { voxels, accent } = upsample(model, k);
  if (voxels.length > budget) {
    const stride = voxels.length / budget;
    const keep = Array.from({ length: budget }, (_, i) => Math.floor(i * stride));
    voxels = keep.map((i) => voxels[i]);
    accent = keep.map((i) => accent[i]);
  }
  const min = [0, 1, 2].map((a) => Math.min(...voxels.map((v) => v[a])));
  const max = [0, 1, 2].map((a) => Math.max(...voxels.map((v) => v[a])));
  const centre = min.map((m, a) => (m + max[a]) / 2);

  const positions = new Float32Array(COUNT * 3);
  const scales = new Float32Array(COUNT);
  const flags = new Uint8Array(COUNT);
  voxels.forEach((v, i) => {
    positions.set(
      v.map((c, a) => (c - centre[a]) * UNIT),
      i * 3,
    );
    scales[i] = 1;
    flags[i] = accent[i] ? 1 : 0;
  });
  return {
    positions,
    scales,
    accent: flags,
    width: (max[0] - min[0]) * UNIT + SIZE,
    height: (max[1] - min[1]) * UNIT + SIZE,
    depth: (max[2] - min[2]) * UNIT + SIZE,
  };
}
