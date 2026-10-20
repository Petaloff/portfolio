export const COUNT = 900;
export const SIZE = 0.22;

// Voxel pitch: a hair over the cube size so the letters read as solid blocks
const UNIT = SIZE * 1.06;

type Point = [number, number, number];

// Rasterise text on a 2D canvas and turn filled pixels into voxels centred on the origin
export function buildName(text: string) {
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
  // Pick the finest sampling step that still fits within COUNT
  let step = 1;
  let pixels: [number, number][] = [];
  for (; step < 12; step++) {
    pixels = [];
    for (let y = 0; y < canvas.height; y += step)
      for (let x = 0; x < canvas.width; x += step)
        if (data[(y * canvas.width + x) * 4 + 3] > 128) pixels.push([x / step, y / step]);
    if (pixels.length <= COUNT) break;
  }

  const xs = pixels.map((p) => p[0]);
  const ys = pixels.map((p) => p[1]);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const points = pixels.map(([x, y]): Point => [(x - cx) * UNIT, -(y - cy) * UNIT, 0]);

  const positions = new Float32Array(COUNT * 3);
  const scales = new Float32Array(COUNT);
  points.forEach((p, i) => {
    positions.set(p, i * 3);
    scales[i] = 1;
  });
  return { positions, scales, width: (Math.max(...xs) - Math.min(...xs)) * UNIT + SIZE };
}
