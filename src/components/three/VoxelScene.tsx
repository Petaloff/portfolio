"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { sceneState } from "@/lib/scene";
import { buildName, COUNT, SIZE } from "./formations";

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
  const { viewport } = useThree();

  const layout = useMemo(() => buildName(name), [name]);
  // Animated per-frame buffers; start scattered so the name assembles on load
  const current = useRef<{ positions: Float32Array; scales: Float32Array } | null>(null);
  // Smoothed pointer and how strongly the name reacts to it (fades out on scroll)
  const follow = useRef({ x: 0, y: 0, weight: 0 });
  // Ripples spawned as the cursor moves across the name, in its local space
  const ripples = useRef<{ x: number; y: number; t0: number }[]>([]);
  const lastRipple = useRef({ x: 0, y: 0, t: 0 });
  // Per-cube easing speed gives the assembly a rolling, wave-like feel
  const speeds = useMemo(() => Float32Array.from({ length: COUNT }, (_, i) => 1.6 + ((i * 37) % 100) / 45), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    const m = mesh.current;
    if (!m) return;
    const { fg, accent } = readColors();
    for (let i = 0; i < COUNT; i++) m.setColorAt(i, i % ACCENT_EVERY === 0 ? accent : fg);
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, []);

  useFrame((state, delta) => {
    const m = mesh.current;
    const g = group.current;
    if (!m || !g) return;
    const dt = Math.min(delta, 1 / 30);
    const t = state.clock.elapsedTime;
    current.current ??= {
      positions: Float32Array.from({ length: COUNT * 3 }, (_, i) => Math.sin(i * 12.9898) * 12),
      scales: new Float32Array(COUNT),
    };
    const pos = current.current.positions;
    const scl = current.current.scales;

    // The name only reacts to the cursor while the page is at the top
    const scrolled = Math.min(1, scrollY / innerHeight);
    const atTop = scrolled < 0.05;
    const f = follow.current;
    const ease = 1 - Math.exp(-dt * 6);
    f.x += (sceneState.pointer.x - f.x) * ease;
    f.y += (sceneState.pointer.y - f.y) * ease;
    f.weight += ((atTop ? 1 : 0) - f.weight) * (1 - Math.exp(-dt * 4));

    // Name across the top with a slight tilt towards the cursor, carried up
    // with the page as it scrolls away
    const fit = Math.min(1, (viewport.width * 0.8) / layout.width);
    g.scale.setScalar(fit);
    g.position.y = viewport.height * 0.26 + scrolled * viewport.height;
    g.rotation.y = f.x * 0.12 * f.weight;
    g.rotation.x = f.y * 0.08 * f.weight;

    // Cursor in the name's local space
    const cx = ((f.x * viewport.width) / 2 - g.position.x) / fit;
    const cy = ((-f.y * viewport.height) / 2 - g.position.y) / fit;

    // Moving the cursor drops ripples that roll outwards through the letters
    const last = lastRipple.current;
    if (atTop && Math.hypot(cx - last.x, cy - last.y) > 1.1 && t - last.t > 0.1) {
      ripples.current.push({ x: cx, y: cy, t0: t });
      if (ripples.current.length > 8) ripples.current.shift();
      Object.assign(last, { x: cx, y: cy, t });
    }
    const live = (ripples.current = ripples.current.filter((r) => t - r.t0 < 2.5));

    for (let i = 0; i < COUNT; i++) {
      // Base position eases into the name (assembly on load)
      const k = 1 - Math.exp(-dt * speeds[i]);
      const j = i * 3;
      const tx = layout.positions[j];
      const ty = layout.positions[j + 1];
      pos[j] += (tx - pos[j]) * k;
      pos[j + 1] += (ty - pos[j + 1]) * k;
      pos[j + 2] += (layout.positions[j + 2] - pos[j + 2]) * k;
      scl[i] += (layout.scales[i] - scl[i]) * k;

      // Lens under the cursor: voxels swell and part slightly around it
      const dx = tx - cx;
      const dy = ty - cy;
      const d = Math.hypot(dx, dy) || 1;
      const lens = Math.exp(-(d * d) / 2.2) * f.weight;

      // Ripples: a ring that expands and fades, lifting the voxels it passes
      let wave = 0;
      for (const r of live) {
        const age = t - r.t0;
        const dist = Math.hypot(tx - r.x, ty - r.y);
        wave += Math.exp(-((dist - age * 5) ** 2) / 0.35) * Math.exp(-age * 1.6);
      }
      wave = Math.min(wave, 1.2) * f.weight;

      // A slow breath running along the name keeps it alive when idle
      const breath = (Math.sin(t * 1.8 - tx * 0.45) * 0.5 + 0.5) * 0.08;

      const spread = lens * 0.4 + wave * 0.22;
      dummy.position.set(
        pos[j] + (dx / d) * spread,
        pos[j + 1] + (dy / d) * spread,
        pos[j + 2] + lens * 1.1 + wave * 0.8,
      );
      dummy.scale.setScalar(scl[i] * (1 + lens * 0.45 + wave * 0.45 + breath));
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
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
      camera={{ position: [0, 0, 30], fov: 16 }}
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
