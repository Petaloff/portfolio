// Small voxel models drawn as pixel art. Rows go top to bottom: "#" is a plain
// cube, "+" an accent cube, anything else empty. Coordinates are [x, y, z] with
// y pointing up, the same convention IsoCubes draws in.

export type Voxel = [number, number, number];
export type Rgb = [number, number, number];
// colors, when present, give every voxel its own sRGB colour (0–1) instead of fg/accent
export type Model = { voxels: Voxel[]; accent: boolean[]; colors?: Rgb[] };

export function extrude(rows: string[], depth = 1): Model {
  const voxels: Voxel[] = [];
  const accent: boolean[] = [];
  rows.forEach((row, r) =>
    [...row].forEach((ch, x) => {
      if (ch !== "#" && ch !== "+") return;
      for (let z = 0; z < depth; z++) {
        voxels.push([x, rows.length - 1 - r, z]);
        accent.push(ch === "+");
      }
    }),
  );
  return { voxels, accent };
}

// Every voxel becomes a k×k×k block, so a tiny drawing can fill a big cube budget
export function upsample({ voxels, accent, colors }: Model, k: number): Model {
  const out: Model = { voxels: [], accent: [], colors: colors && [] };
  voxels.forEach(([x, y, z], i) => {
    for (let a = 0; a < k; a++)
      for (let b = 0; b < k; b++)
        for (let c = 0; c < k; c++) {
          out.voxels.push([x * k + a, y * k + b, z * k + c]);
          out.accent.push(accent[i]);
          if (colors) out.colors!.push(colors[i]);
        }
  });
  return out;
}

const pickaxe = extrude(
  ["..+++++..", ".++###++.", "++..#..++", "+...#...+", "....#....", "....#....", "....#....", "....#....", "....#...."],
  1,
);

const bubble = extrude([".#####.", "#######", "#+#+#+#", "#######", ".#####.", "..#....", ".#....."], 2);

const code = extrude(
  [
    "...#....+#...",
    "..#....+..#..",
    ".#.....+...#.",
    "#.....+.....#",
    ".#...+.....#.",
    "..#..+....#..",
    "...#+....#...",
  ],
  2,
);

function grassBlock(): Model {
  const out: Model = { voxels: [], accent: [] };
  for (let x = 0; x < 3; x++)
    for (let y = 0; y < 3; y++)
      for (let z = 0; z < 3; z++) {
        out.voxels.push([x, y, z]);
        out.accent.push(y === 2);
      }
  return out;
}

// A blocky head for the "about me" section: only the shell of an 8×8×8 cube,
// with lit eyes and a dark mouth on the front face
function head(): Model {
  const face = ["########", "########", "########", "#++##++#", "########", "##....##", "########", "########"];
  const out: Model = { voxels: [], accent: [] };
  for (let x = 0; x < 8; x++)
    for (let y = 0; y < 8; y++)
      for (let z = 0; z < 8; z++) {
        if (x > 0 && x < 7 && y > 0 && y < 7 && z > 0 && z < 7) continue;
        const ch = z === 7 ? face[7 - y][x] : "#";
        if (ch === ".") continue;
        out.voxels.push([x, y, z]);
        out.accent.push(ch === "+");
      }
  return out;
}

// The head from a 64×64 Minecraft skin as the same 8×8×8 shell. Each surface
// voxel takes the pixel of the face it sits on (front wins at edges, then top,
// sides, back, bottom), with the hat layer drawn over it where it is opaque.
// x runs left to right seen from the front, y up and z from back to front
export function headFromSkin(pixels: ArrayLike<number>, width = 64): Model {
  const read = (u: number, v: number): [number, number, number, number] => {
    const i = (v * width + u) * 4;
    return [pixels[i], pixels[i + 1], pixels[i + 2], pixels[i + 3]];
  };
  // Texture coordinates of the base layer for a voxel; the hat sits 32px to the right
  const uv = (x: number, y: number, z: number): [number, number] => {
    if (z === 7) return [8 + x, 8 + (7 - y)];
    if (y === 7) return [8 + x, z];
    if (x === 0) return [z, 8 + (7 - y)];
    if (x === 7) return [16 + (7 - z), 8 + (7 - y)];
    if (z === 0) return [24 + (7 - x), 8 + (7 - y)];
    return [16 + x, 7 - z];
  };
  const out: Model = { voxels: [], accent: [], colors: [] };
  for (let x = 0; x < 8; x++)
    for (let y = 0; y < 8; y++)
      for (let z = 0; z < 8; z++) {
        if (x > 0 && x < 7 && y > 0 && y < 7 && z > 0 && z < 7) continue;
        const [u, v] = uv(x, y, z);
        const base = read(u, v);
        const hat = read(u + 32, v);
        const [r, g, b] = hat[3] > 128 ? hat : base;
        out.voxels.push([x, y, z]);
        out.accent.push(false);
        out.colors!.push([r / 255, g / 255, b / 255]);
      }
  return out;
}

// A little block of towers, stand-in for the contribution city
function skyline(): Model {
  const out: Model = { voxels: [], accent: [] };
  for (let x = 0; x < 18; x++)
    for (let z = 0; z < 6; z++) {
      const h = 1 + Math.round(Math.abs(Math.sin(x * 1.7 + z * 0.9)) * 5 + ((x + z) % 3));
      for (let y = 0; y < h; y++) {
        out.voxels.push([x, y, z]);
        out.accent.push(y === h - 1 && (x * 7 + z) % 4 === 0);
      }
    }
  return out;
}

export const models = {
  pickaxe,
  bubble,
  code,
  grass: grassBlock(),
  head: head(),
  skyline: skyline(),
};

export type ModelName = keyof typeof models;
