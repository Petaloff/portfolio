"use client";

import { motion, useReducedMotion, useSpring } from "motion/react";
import { useEffect, useSyncExternalStore } from "react";
import { useRenderMode } from "@/lib/store";
import { IsoCubes, type Voxel } from "./IsoCubes";

// Isometric voxel cluster beside the hero text in the lightweight version: no
// WebGL, just SVG with CSS bobbing and a gentle parallax towards the cursor

const noop = () => () => {};

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
  const mode = useRenderMode();
  const hydrated = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
  const reduce = useReducedMotion();
  const shiftX = useSpring(0, { stiffness: 50, damping: 18 });
  const shiftY = useSpring(0, { stiffness: 50, damping: 18 });
  const rotate = useSpring(0, { stiffness: 50, damping: 18 });

  const shown = hydrated && mode === "lite";

  // The cluster is pointer-events-none, so the pointer is read from the window
  useEffect(() => {
    if (reduce || !shown) return;
    const move = (e: PointerEvent) => {
      const nx = e.clientX / innerWidth - 0.5;
      const ny = e.clientY / innerHeight - 0.5;
      shiftX.set(nx * -40);
      shiftY.set(ny * -30);
      rotate.set(nx * 4);
    };
    addEventListener("pointermove", move, { passive: true });
    return () => removeEventListener("pointermove", move);
  }, [reduce, shown, shiftX, shiftY, rotate]);

  if (!shown) return null;
  return (
    <motion.svg
      viewBox="-140 -110 280 220"
      aria-hidden
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.4 }}
      transition={{ duration: 0.8 }}
      style={{ x: shiftX, y: shiftY, rotate }}
      className="pointer-events-none absolute right-0 bottom-12 -z-10 hidden w-[38%] max-w-[460px] md:block lg:right-4"
    >
      <IsoCubes cubes={cubes} accent={(c) => c[0] === 2 && c[1] === 1} float />
    </motion.svg>
  );
}
