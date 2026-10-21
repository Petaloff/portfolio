"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { useMemo } from "react";
import { usePresence } from "@/lib/lanyard";
import { moodAt, statusTint } from "@/lib/mood";

// Shared lighting for every scene: key, fill and ambient follow the visitor's
// local time, a faint rim takes the colour of the Discord status, and a tiny
// baked environment of light panels gives the cubes soft reflections
export function MoodLights({ environment = true }: { environment?: boolean }) {
  const mood = useMemo(() => moodAt(new Date().getHours()), []);
  const tint = statusTint(usePresence()?.status);
  return (
    <>
      <ambientLight intensity={mood.ambient} />
      <directionalLight position={[6, 8, 10]} intensity={mood.keyIntensity} color={mood.key} />
      <directionalLight position={[-8, -4, -6]} intensity={0.35} color={mood.fill} />
      {tint && <directionalLight position={[-10, 3, 6]} intensity={0.5} color={tint} />}
      {environment && (
        <Environment resolution={32} frames={1} environmentIntensity={0.2}>
          <Lightformer form="rect" intensity={2} color={mood.key} position={[0, 6, 4]} scale={[10, 4, 1]} />
          <Lightformer form="rect" intensity={1} color={mood.fill} position={[-6, 0, -4]} scale={[6, 6, 1]} />
        </Environment>
      )}
    </>
  );
}
