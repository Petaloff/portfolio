export const COUNT = 900;
export const SIZE = 0.22;

// Voxel pitch: a hair over the cube size so shapes read as solid blocks
const UNIT = SIZE * 1.06;

// Each layout is COUNT xyz positions plus a per-cube scale (0 hides it)
// and the radius of its visible part, used to fit it on screen
export type Layout = { positions: Float32Array; scales: Float32Array; radius: number };

type Point = [number, number, number];

// Deterministic PRNG so layouts are stable between renders
function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

function fill(points: Point[], seed: number): Layout {
  const out: Layout = { positions: new Float32Array(COUNT * 3), scales: new Float32Array(COUNT), radius: 1 };
  const rand = rng(seed);
  // Shuffle so cubes travel to unrelated spots between layouts
  const order = points.map((_, i) => [rand(), i] as const).sort((a, b) => a[0] - b[0]);
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

// Rasterise text on a 2D canvas and turn filled pixels into voxels,
// extruded `depth` layers deep and centred on the origin
function textPoints(text: string, fontSize: number, depth: number): Point[] {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const font = `800 ${fontSize}px system-ui, sans-serif`;
  ctx.font = font;
  canvas.width = Math.ceil(ctx.measureText(text).width) + 8;
  canvas.height = Math.ceil(fontSize * 1.4);
  ctx.font = font;
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff";
  ctx.fillText(text, 4, canvas.height / 2);

  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  // Pick the finest sampling step that still fits within COUNT
  let step = 1;
  let pixels: [number, number][] = [];
  for (; step < 12; step++) {
    pixels = [];
    for (let y = 0; y < canvas.height; y += step)
      for (let x = 0; x < canvas.width; x += step)
        if (data[(y * canvas.width + x) * 4 + 3] > 128) pixels.push([x / step, y / step]);
    if (pixels.length * depth <= COUNT) break;
  }

  const xs = pixels.map((p) => p[0]);
  const ys = pixels.map((p) => p[1]);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  return pixels.flatMap(([x, y]) =>
    Array.from({ length: depth }, (_, z): Point => [(x - cx) * UNIT, -(y - cy) * UNIT, (z - (depth - 1) / 2) * UNIT]),
  );
}

export function buildLayouts(name: string) {
  const text = textPoints(name, 64, 1);
  const xs = text.map((p) => p[0]);
  // Each letter of the name as a chunky extruded block letter
  const letters = [...new Set(name)].map((char, i) => [char, fill(textPoints(char, 24, 3), i + 2)] as const);
  return {
    name: fill(text, 1),
    nameWidth: Math.max(...xs) - Math.min(...xs) + SIZE,
    letters: Object.fromEntries(letters) as Record<string, Layout>,
    // Shared so every letter renders at the same size
    letterRadius: Math.max(...letters.map(([, l]) => l.radius)),
  };
}
