"use client";

import { motion, useReducedMotion, useSpring } from "motion/react";
import { useEffect, type CSSProperties } from "react";

// Isometric voxel cluster used in the lightweight version: no WebGL, just SVG
// with CSS bobbing and a gentle parallax towards the cursor

const cubes: [number, number, number][] = [
  [0, 0, 0],
  [1, 0, 0],
  [2, 0, 0],
  [0, 1, 0],
  [1, 1, 0],
  [0, 0, 1],
  [1, 0, 1],
  [0, 0, 2],
  [0, 1, 1],
  [0, 2, 0],
  [2, 1, 0],
  [1, 0, 2],
];

export function LiteVoxels() {
  const reduce = useReducedMotion();
  const shiftX = useSpring(0, { stiffness: 50, damping: 18 });
  const shiftY = useSpring(0, { stiffness: 50, damping: 18 });
  const rotate = useSpring(0, { stiffness: 50, damping: 18 });

  // The layer is pointer-events-none, so the pointer is read from the window
  useEffect(() => {
    if (reduce) return;
    const move = (e: PointerEvent) => {
      const nx = e.clientX / innerWidth - 0.5;
      const ny = e.clientY / innerHeight - 0.5;
      shiftX.set(nx * -40);
      shiftY.set(ny * -30);
      rotate.set(nx * 4);
    };
    addEventListener("pointermove", move, { passive: true });
    return () => removeEventListener("pointermove", move);
  }, [reduce, shiftX, shiftY, rotate]);

  const s = 28;
  const iso = ([x, y, z]: [number, number, number]) => ({
    x: (x - z) * s * 0.87,
    y: (x + z) * s * 0.5 - y * s,
  });
  const sorted = [...cubes].sort((a, b) => a[0] + a[2] - (b[0] + b[2]) || a[1] - b[1]);
  return (
    <motion.svg
      viewBox="-140 -110 280 220"
      style={{ x: shiftX, y: shiftY, rotate }}
      className="absolute top-[12%] right-[-6%] w-[70vw] max-w-[520px] opacity-25 md:opacity-40"
    >
      {sorted.map((c, i) => {
        const { x, y } = iso(c);
        const h = s * 0.87;
        const accent = c[0] === 2 && c[1] === 1;
        return (
          <g key={c.join()} transform={`translate(${x} ${y})`}>
            <g className="voxel-float" style={{ "--delay": `${-i * 0.37}s` } as CSSProperties}>
              <path
                d={`M0 ${-s} L${h} ${-s / 2} L0 0 L${-h} ${-s / 2}Z`}
                fill={accent ? "var(--accent)" : "var(--fg)"}
                opacity={0.9}
                className={accent ? "voxel-accent" : undefined}
              />
              <path d={`M${-h} ${-s / 2} L0 0 L0 ${s} L${-h} ${s / 2}Z`} fill="var(--fg)" opacity={0.55} />
              <path d={`M${h} ${-s / 2} L0 0 L0 ${s} L${h} ${s / 2}Z`} fill="var(--fg)" opacity={0.3} />
            </g>
          </g>
        );
      })}
    </motion.svg>
  );
}
