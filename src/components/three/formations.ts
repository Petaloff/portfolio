import type { Formation } from "@/lib/scene";

export const COUNT = 900;
export const SIZE = 0.22;

// Each formation is COUNT xyz positions plus a per-cube scale (0 hides it)
export type Layout = { positions: Float32Array; scales: Float32Array };

function empty(): Layout {
  return { positions: new Float32Array(COUNT * 3), scales: new Float32Array(COUNT) };
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
  const unit = SIZE * 1.05;
  return pts.map(([x, y]) => [((x - cx) / step) * unit, (-(y - cy) / step) * unit, 0]);
}

function hollowCube(n: number): [number, number, number][] {
  const pts: [number, number, number][] = [];
  const unit = SIZE * 1.6;
  const half = (n - 1) / 2;
  for (let x = 0; x < n; x++)
    for (let y = 0; y < n; y++)
      for (let z = 0; z < n; z++) {
        const edge = [x, y, z].filter((v) => v === 0 || v === n - 1).length;
        if (edge >= 1) pts.push([(x - half) * unit, (y - half) * unit, (z - half) * unit]);
      }
  return pts;
}

function cardStack(): [number, number, number][] {
  const pts: [number, number, number][] = [];
  const unit = SIZE * 1.1;
  for (let c = 0; c < 5; c++)
    for (let x = 0; x < 11; x++)
      for (let y = 0; y < 7; y++)
        pts.push([(x - 5 + c * 1.6) * unit, (y - 3 - c * 1.2) * unit, -c * 6 * unit]);
  return pts;
}

function towers(): [number, number, number][] {
  const pts: [number, number, number][] = [];
  const unit = SIZE * 1.15;
  const rand = rng(7);
  for (let gx = 0; gx < 4; gx++)
    for (let gz = 0; gz < 4; gz++) {
      const height = 2 + Math.floor(rand() * 9);
      for (let h = 0; h < height; h++)
        for (let dx = 0; dx < 2; dx++)
          for (let dz = 0; dz < 2; dz++)
            pts.push([(gx * 3 + dx - 5) * unit, (h - 4) * unit, (gz * 3 + dz - 5) * unit]);
    }
  return pts;
}

function ring(): [number, number, number][] {
  const pts: [number, number, number][] = [];
  const unit = SIZE * 1.1;
  for (let i = 0; i < 360; i++) {
    const a = (i / 360) * Math.PI * 2;
    const r = 9 + (i % 3);
    pts.push([Math.cos(a) * r * unit, Math.sin(a) * r * unit * 0.55, ((i % 5) - 2) * unit]);
  }
  return pts;
}

function scatter(): [number, number, number][] {
  const rand = rng(42);
  return Array.from({ length: COUNT }, () => {
    const r = 3 + rand() * 6;
    const a = rand() * Math.PI * 2;
    const b = Math.acos(rand() * 2 - 1);
    return [r * Math.sin(b) * Math.cos(a), r * Math.sin(b) * Math.sin(a) * 0.7, r * Math.cos(b) - 2];
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
