import type { Formation } from "@/lib/scene";

export const COUNT = 900;
export const SIZE = 0.22;

// Voxel pitch: a hair over the cube size so shapes read as solid blocks
const UNIT = SIZE * 1.06;

// Each formation is COUNT xyz positions plus a per-cube scale (0 hides it)
// and the radius of its visible part, used to fit it on screen
export type Layout = { positions: Float32Array; scales: Float32Array; radius: number };

function empty(): Layout {
  return { positions: new Float32Array(COUNT * 3), scales: new Float32Array(COUNT), radius: 1 };
}

// Deterministic PRNG so layouts are stable between renders
function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

function fill(points: [number, number, number][], scatterSeed: number): Layout {
  const out = empty();
  const rand = rng(scatterSeed);
  // Shuffle so cubes travel to unrelated spots between formations
  const order = points.map((p, i) => [rand(), i] as const).sort((a, b) => a[0] - b[0]);
  for (let i = 0; i < COUNT; i++) {
    const entry = order[i];
    if (entry) {
      const [x, y, z] = points[entry[1]];
      out.positions.set([x, y, z], i * 3);
      out.scales[i] = 1;
      out.radius = Math.max(out.radius, Math.hypot(x, y, z) + SIZE);
    } else {
      // Spare cubes shrink away somewhere near the centre
      out.positions.set([(rand() - 0.5) * 4, (rand() - 0.5) * 4, (rand() - 0.5) * 4], i * 3);
      out.scales[i] = 0;
    }
  }
  return out;
}

function textPoints(text: string): [number, number, number][] {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const fontSize = 64;
  ctx.font = `800 ${fontSize}px system-ui, sans-serif`;
  const width = Math.ceil(ctx.measureText(text).width) + 8;
  canvas.width = width;
  canvas.height = fontSize + 16;
  ctx.font = `800 ${fontSize}px system-ui, sans-serif`;
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff";
  ctx.fillText(text, 4, canvas.height / 2);

  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  // Pick the finest sampling step that still fits within COUNT
  let step = 2;
  let pts: [number, number][] = [];
  for (; step < 12; step++) {
    pts = [];
    for (let y = 0; y < canvas.height; y += step)
      for (let x = 0; x < canvas.width; x += step)
        if (data[(y * canvas.width + x) * 4 + 3] > 128) pts.push([x, y]);
    if (pts.length <= COUNT) break;
  }
  // One cube per sample, spaced on a voxel grid
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const unit = UNIT;
  return pts.map(([x, y]) => [((x - cx) / step) * unit, (-(y - cy) / step) * unit, 0]);
}

function hollowCube(n: number): [number, number, number][] {
  const pts: [number, number, number][] = [];
  const half = (n - 1) / 2;
  for (let x = 0; x < n; x++)
    for (let y = 0; y < n; y++)
      for (let z = 0; z < n; z++)
        if ([x, y, z].some((v) => v === 0 || v === n - 1))
          pts.push([(x - half) * UNIT, (y - half) * UNIT, (z - half) * UNIT]);
  return pts;
}

function cardStack(): [number, number, number][] {
  const pts: [number, number, number][] = [];
  for (let c = 0; c < 4; c++)
    for (let x = 0; x < 10; x++)
      for (let y = 0; y < 6; y++)
        pts.push([(x - 4.5 + (c - 1.5) * 1.5) * UNIT, (y - 2.5 - (c - 1.5) * 1.5) * UNIT, -(c - 1.5) * 4 * UNIT]);
  return pts;
}

function towers(): [number, number, number][] {
  const pts: [number, number, number][] = [];
  const rand = rng(7);
  for (let gx = 0; gx < 4; gx++)
    for (let gz = 0; gz < 4; gz++) {
      const height = 2 + Math.floor(rand() * 8);
      for (let h = 0; h < height; h++)
        for (let dx = 0; dx < 2; dx++)
          for (let dz = 0; dz < 2; dz++)
            pts.push([(gx * 3 + dx - 5) * UNIT, (h - 5) * UNIT, (gz * 3 + dz - 5) * UNIT]);
    }
  return pts;
}

function ring(): [number, number, number][] {
  const pts: [number, number, number][] = [];
  const r = 12;
  for (let x = -r; x <= r; x++)
    for (let y = -r; y <= r; y++) {
      const d = Math.hypot(x, y);
      if (d > r - 2 && d <= r) for (let z = 0; z < 2; z++) pts.push([x * UNIT, y * UNIT, (z - 0.5) * UNIT]);
    }
  return pts;
}

// A loose cloud of cubes, as if the shape just burst apart
function scatter(): [number, number, number][] {
  const rand = rng(42);
  return Array.from({ length: 420 }, () => {
    const r = 1.2 + rand() * 2.4;
    const a = rand() * Math.PI * 2;
    const b = Math.acos(rand() * 2 - 1);
    return [r * Math.sin(b) * Math.cos(a), r * Math.sin(b) * Math.sin(a), r * Math.cos(b)];
  });
}

export function buildLayouts(name: string) {
  const text = textPoints(name);
  const xs = text.map((p) => p[0]);
  const layouts: Record<Formation, Layout> = {
    name: fill(text, 1),
    about: fill(hollowCube(8), 2),
    projects: fill(cardStack(), 3),
    stack: fill(towers(), 4),
    blog: fill(ring(), 5),
    contact: fill(scatter(), 6),
  };
  return { layouts, nameWidth: Math.max(...xs) - Math.min(...xs) + SIZE };
}
