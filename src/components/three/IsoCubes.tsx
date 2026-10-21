import type { CSSProperties } from "react";

export type Voxel = [number, number, number];

// Draws a voxel cluster as flat isometric cubes: a lit top, a mid-tone left
// face and a dark right face. Shared by the lite hero and the ambient layer.
export function IsoCubes({
  cubes,
  accent,
  size = 28,
  float = false,
}: {
  cubes: Voxel[];
  accent?: (c: Voxel) => boolean;
  size?: number;
  float?: boolean;
}) {
  const s = size;
  const h = s * 0.87;
  const sorted = [...cubes].sort((a, b) => a[0] + a[2] - (b[0] + b[2]) || a[1] - b[1]);
  return sorted.map((c, i) => {
    const x = (c[0] - c[2]) * h;
    const y = (c[0] + c[2]) * s * 0.5 - c[1] * s;
    const lit = accent?.(c) ?? false;
    return (
      <g key={c.join()} transform={`translate(${x} ${y})`}>
        <g
          className={float ? "voxel-float" : undefined}
          style={float ? ({ "--delay": `${-i * 0.37}s` } as CSSProperties) : undefined}
        >
          <path
            d={`M0 ${-s} L${h} ${-s / 2} L0 0 L${-h} ${-s / 2}Z`}
            fill={lit ? "var(--accent)" : "var(--fg)"}
            opacity={0.9}
            className={lit && float ? "voxel-accent" : undefined}
          />
          <path d={`M${-h} ${-s / 2} L0 0 L0 ${s} L${-h} ${s / 2}Z`} fill="var(--fg)" opacity={0.55} />
          <path d={`M${h} ${-s / 2} L0 0 L0 ${s} L${h} ${s / 2}Z`} fill="var(--fg)" opacity={0.3} />
        </g>
      </g>
    );
  });
}
