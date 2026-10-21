"use client";

import { motion, useReducedMotion, useSpring } from "motion/react";
import { useEffect } from "react";
import { IsoCubes, type Voxel } from "./IsoCubes";

// Isometric voxel cluster used in the lightweight version: no WebGL, just SVG
// with CSS bobbing and a gentle parallax towards the cursor

const cubes: Voxel[] = [
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

  return (
    <motion.svg
      viewBox="-140 -110 280 220"
      style={{ x: shiftX, y: shiftY, rotate }}
      className="absolute top-[12%] right-[-6%] w-[70vw] max-w-[520px] opacity-25 md:opacity-40"
    >
      <IsoCubes cubes={cubes} accent={(c) => c[0] === 2 && c[1] === 1} float />
    </motion.svg>
  );
}
