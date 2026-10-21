// Small voxel models drawn as pixel art. Rows go top to bottom: "#" is a plain
// cube, "+" an accent cube, anything else empty. Coordinates are [x, y, z] with
// y pointing up, the same convention IsoCubes draws in.

export type Voxel = [number, number, number];
export type Model = { voxels: Voxel[]; accent: boolean[] };

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
export function upsample({ voxels, accent }: Model, k: number): Model {
  const out: Model = { voxels: [], accent: [] };
  voxels.forEach(([x, y, z], i) => {
    for (let a = 0; a < k; a++)
      for (let b = 0; b < k; b++)
        for (let c = 0; c < k; c++) {
          out.voxels.push([x * k + a, y * k + b, z * k + c]);
          out.accent.push(accent[i]);
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
  skyline: skyline(),
};

export type ModelName = keyof typeof models;
