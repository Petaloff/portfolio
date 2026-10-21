import type { CSSProperties } from "react";
import { IsoCubes, type Voxel } from "./IsoCubes";

// A quiet layer of voxel clusters behind every page. Pure SVG and CSS: each
// cluster drifts on its own slow loop, and where the browser supports
// scroll-driven animations it also drifts at its own speed while scrolling.

const shapes: Record<string, Voxel[]> = {
  stair: [
    [0, 0, 0],
    [1, 0, 0],
    [2, 0, 0],
    [0, 1, 0],
    [1, 1, 0],
    [0, 2, 0],
    [0, 0, 1],
    [1, 0, 1],
  ],
  tower: [
    [0, 0, 0],
    [1, 0, 0],
    [0, 0, 1],
    [0, 1, 0],
    [0, 2, 0],
    [0, 3, 0],
    [1, 1, 0],
  ],
  plateau: [
    [0, 0, 0],
    [1, 0, 0],
    [2, 0, 0],
    [0, 0, 1],
    [1, 0, 1],
    [2, 0, 1],
    [0, 0, 2],
    [1, 0, 2],
    [1, 1, 1],
    [0, 1, 0],
  ],
  corner: [
    [0, 0, 0],
    [1, 0, 0],
    [2, 0, 0],
    [0, 0, 1],
    [0, 0, 2],
    [0, 1, 0],
  ],
  trio: [
    [0, 0, 0],
    [1, 0, 0],
    [0, 1, 0],
  ],
};

type Cluster = {
  shape: keyof typeof shapes;
  // Position in viewport percent, width in px
  left: string;
  top: string;
  width: number;
  opacity: number;
  // Seconds per drift loop and how far the scroll parallax carries it
  dur: number;
  shift: number;
  accent?: Voxel;
  // Phones keep only a few so the layer stays light
  desktopOnly?: boolean;
};

// The top right is left clear for the hero cluster on the home page
const clusters: Cluster[] = [
  { shape: "stair", left: "3%", top: "12%", width: 190, opacity: 0.11, dur: 26, shift: -90 },
  { shape: "tower", left: "-3%", top: "52%", width: 130, opacity: 0.09, dur: 31, shift: -150 },
  {
    shape: "plateau",
    left: "20%",
    top: "70%",
    width: 250,
    opacity: 0.08,
    dur: 34,
    shift: -60,
    accent: [1, 1, 1],
    desktopOnly: true,
  },
  { shape: "trio", left: "38%", top: "6%", width: 90, opacity: 0.06, dur: 22, shift: -40, desktopOnly: true },
  { shape: "corner", left: "44%", top: "38%", width: 120, opacity: 0.05, dur: 29, shift: -120, desktopOnly: true },
  {
    shape: "plateau",
    left: "76%",
    top: "72%",
    width: 210,
    opacity: 0.1,
    dur: 28,
    shift: -110,
    accent: [2, 0, 1],
  },
  { shape: "trio", left: "64%", top: "90%", width: 110, opacity: 0.07, dur: 24, shift: -70, desktopOnly: true },
  { shape: "corner", left: "88%", top: "48%", width: 100, opacity: 0.06, dur: 33, shift: -50, desktopOnly: true },
];

const SIZE = 28;

function viewBox(cubes: Voxel[]) {
  const h = SIZE * 0.87;
  const xs = cubes.map(([x, , z]) => (x - z) * h);
  const ys = cubes.map(([x, y, z]) => (x + z) * SIZE * 0.5 - y * SIZE);
  const minX = Math.min(...xs) - h;
  const minY = Math.min(...ys) - SIZE;
  return `${minX} ${minY} ${Math.max(...xs) + h - minX} ${Math.max(...ys) + SIZE - minY}`;
}

export function AmbientVoxels() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-20 overflow-hidden" aria-hidden>
      {clusters.map((c, i) => {
        const cubes = shapes[c.shape];
        const accent = c.accent;
        return (
          <div
            key={i}
            className={`voxel-parallax absolute ${c.desktopOnly ? "hidden md:block" : ""}`}
            style={{ left: c.left, top: c.top, width: c.width, "--shift": `${c.shift}px` } as CSSProperties}
          >
            <svg
              viewBox={viewBox(cubes)}
              className="voxel-drift block w-full"
              style={
                {
                  opacity: c.opacity,
                  "--dur": `${c.dur}s`,
                  "--delay": `${-i * 3.1}s`,
                  "--dx": `${i % 2 ? 14 : -14}px`,
                  "--rot": `${i % 3 ? 2 : -2}deg`,
                } as CSSProperties
              }
            >
              <IsoCubes cubes={cubes} size={SIZE} accent={accent ? (v) => v.join() === accent.join() : undefined} />
            </svg>
          </div>
        );
      })}
    </div>
  );
}
