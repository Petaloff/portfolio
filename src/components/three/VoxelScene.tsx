"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { sceneState } from "@/lib/scene";
import { useTheme } from "@/lib/store";
import { buildLayouts, COUNT, SIZE } from "./formations";

const ACCENT_EVERY = 11;

function readColors() {
  const style = getComputedStyle(document.documentElement);
  return {
    fg: new THREE.Color(style.getPropertyValue("--fg").trim()),
    accent: new THREE.Color(style.getPropertyValue("--accent").trim()),
  };
}

function Voxels({ name }: { name: string }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const group = useRef<THREE.Group>(null);
  const theme = useTheme();
  const { viewport } = useThree();

  const { layouts, nameWidth } = useMemo(() => buildLayouts(name), [name]);
  // Animated per-frame buffers; start scattered so the name assembles on load
  const current = useRef<{ positions: Float32Array; scales: Float32Array } | null>(null);
  // Per-cube easing speed gives the morph a rolling, wave-like feel
  const speeds = useMemo(() => Float32Array.from({ length: COUNT }, (_, i) => 1.6 + ((i * 37) % 100) / 45), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    const m = mesh.current;
    if (!m) return;
    const { fg, accent } = readColors();
    for (let i = 0; i < COUNT; i++) m.setColorAt(i, i % ACCENT_EVERY === 0 ? accent : fg);
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [theme]);

  useFrame((state, delta) => {
    const m = mesh.current;
    const g = group.current;
    if (!m || !g) return;
    const target = layouts[sceneState.formation];
    const dt = Math.min(delta, 1 / 30);
    const t = state.clock.elapsedTime;
    current.current ??= {
      positions: Float32Array.from(layouts.contact.positions, (v) => v * 2.5),
      scales: new Float32Array(COUNT),
    };
    const pos = current.current.positions;
    const scl = current.current.scales;

    for (let i = 0; i < COUNT; i++) {
      const k = 1 - Math.exp(-dt * speeds[i]);
      const j = i * 3;
      pos[j] += (target.positions[j] - pos[j]) * k;
      pos[j + 1] += (target.positions[j + 1] - pos[j + 1]) * k;
      pos[j + 2] += (target.positions[j + 2] - pos[j + 2]) * k;
      scl[i] += (target.scales[i] - scl[i]) * k;

      // Gentle idle bob so the shape never looks frozen
      const bob = Math.sin(t * 1.3 + i * 0.37) * 0.012;
      dummy.position.set(pos[j], pos[j + 1] + bob, pos[j + 2]);
      dummy.scale.setScalar(scl[i]);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;

    // Fit the name to the viewport and follow the pointer a little
    const fit = Math.min(1, (viewport.width * 0.8) / nameWidth);
    g.scale.setScalar(THREE.MathUtils.damp(g.scale.x, fit, 4, dt));
    // Outside the hero the shape moves aside to leave room for text
    const wide = viewport.aspect > 1.2;
    const side = sceneState.formation !== "name" && wide ? viewport.width * 0.24 : 0;
    const lift = sceneState.formation === "name" ? viewport.height * 0.26 : 0;
    g.position.x = THREE.MathUtils.damp(g.position.x, side, 2.5, dt);
    g.position.y = THREE.MathUtils.damp(g.position.y, lift, 2.5, dt);
    const { x, y } = sceneState.pointer;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, x * 0.25 + Math.sin(t * 0.15) * 0.1, 3, dt);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -y * 0.2, 3, dt);
  });

  return (
    <group ref={group}>
      <instancedMesh ref={mesh} args={[undefined, undefined, COUNT]} frustumCulled={false}>
        <boxGeometry args={[SIZE, SIZE, SIZE]} />
        <meshStandardMaterial roughness={0.55} metalness={0.05} />
      </instancedMesh>
    </group>
  );
}

export default function VoxelScene({ name }: { name: string }) {
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      sceneState.pointer.x = (e.clientX / innerWidth) * 2 - 1;
      sceneState.pointer.y = (e.clientY / innerHeight) * 2 - 1;
    };
    addEventListener("pointermove", onMove, { passive: true });
    return () => removeEventListener("pointermove", onMove);
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 0, 14], fov: 35 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      aria-hidden
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[6, 8, 10]} intensity={1.6} />
      <directionalLight position={[-8, -4, -6]} intensity={0.35} />
      <Voxels name={name} />
    </Canvas>
  );
}
