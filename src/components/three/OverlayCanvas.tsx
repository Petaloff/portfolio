"use client";

import { View } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { onSceneWake } from "@/lib/scene";
import "./quiet";
import { AdaptiveDpr } from "./AdaptiveDpr";
import { VIEW_INDEX } from "./views";

// Frames are drawn on demand. Views follow their DOM boxes, so scrolling and
// anything that moves the page around has to ask for a frame
function Wake() {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    const onScroll = () => invalidate();
    addEventListener("scroll", onScroll, { passive: true });
    const off = onSceneWake(invalidate);
    return () => {
      removeEventListener("scroll", onScroll);
      off();
    };
  }, [invalidate]);
  return null;
}

// Views only redraw their own boxes, so the spots they left while scrolling
// would keep stale pixels without a full clear first
function Clear() {
  useFrame(({ gl }) => {
    gl.setScissorTest(false);
    gl.clear();
  }, VIEW_INDEX - 1);
  return null;
}

export default function OverlayCanvas() {
  return (
    <Canvas
      style={{ position: "fixed", inset: 0, zIndex: 30, pointerEvents: "none" }}
      eventSource={document.body}
      eventPrefix="client"
      frameloop="demand"
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      aria-hidden
    >
      <Wake />
      <AdaptiveDpr />
      <Clear />
      <View.Port />
    </Canvas>
  );
}
