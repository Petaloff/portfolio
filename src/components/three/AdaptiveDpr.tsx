"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";

// Drops the pixel ratio a step when frames run slow. The scenes render on
// demand, so only back-to-back frames count; the first one after a pause
// says nothing about speed. Once lowered it stays lowered for the visit
export function AdaptiveDpr() {
  const setDpr = useThree((s) => s.setDpr);
  const stats = useRef({ sum: 0, n: 0, level: 0, last: 0 });

  useFrame(() => {
    const s = stats.current;
    const now = performance.now();
    const gap = now - s.last;
    s.last = now;
    if (gap > 100 || s.level >= 2) return;
    s.sum += gap;
    if (++s.n < 90) return;
    const slow = s.sum / s.n > 22;
    s.sum = 0;
    s.n = 0;
    if (!slow) return;
    s.level++;
    const max = Math.min(2, devicePixelRatio);
    setDpr(s.level === 1 ? Math.min(max, 1.5) : 1);
  });
  return null;
}
