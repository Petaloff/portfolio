"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { Day } from "@/lib/contributions";
import "../three/quiet";

const PITCH = 1.15;

function readColors() {
  const style = getComputedStyle(document.documentElement);
  const get = (name: string) => new THREE.Color(style.getPropertyValue(name).trim());
  return { empty: get("--line"), base: get("--surface"), accent: get("--accent") };
}

// Keeps the whole year in frame whatever the canvas width
function FitZoom({ weeks }: { weeks: number }) {
  const get = useThree((s) => s.get);
  const width = useThree((s) => s.size.width);
  useEffect(() => {
    const { camera } = get();
    camera.zoom = width / (weeks * PITCH * 1.08);
    camera.updateProjectionMatrix();
  }, [get, width, weeks]);
  return null;
}

function Buildings({
  weeks,
  max,
  onHover,
}: {
  weeks: (Day | null)[][];
  max: number;
  onHover: (day: Day | null) => void;
}) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const cells = useMemo(
    () =>
      weeks.flatMap((week, w) =>
        week.flatMap((day, d) => (day ? [{ day, x: (w - weeks.length / 2) * PITCH, z: (d - 3) * PITCH, w }] : [])),
      ),
    [weeks],
  );
  // Unit box with its base on the ground so scaling y grows it upwards
  const geometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const started = useRef<number | null>(null);
  const settled = useRef(false);

  useEffect(() => {
    const m = mesh.current;
    if (!m) return;
    const { empty, base, accent } = readColors();
    const color = new THREE.Color();
    cells.forEach(({ day }, i) => {
      if (day.count === 0) color.copy(empty);
      else color.copy(base).lerp(accent, 0.35 + 0.65 * Math.sqrt(day.count / max));
      m.setColorAt(i, color);
    });
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [cells, max]);

  // Columns rise week by week, sweeping across the year
  useFrame(({ clock }) => {
    const m = mesh.current;
    if (!m || settled.current) return;
    started.current ??= clock.elapsedTime;
    const t = clock.elapsedTime - started.current;
    let done = true;
    cells.forEach(({ day, x, z, w }, i) => {
      const p = Math.min(1, Math.max(0, (t - w * 0.025) / 0.8));
      if (p < 1) done = false;
      const eased = 1 - (1 - p) ** 3;
      const height = day.count === 0 ? 0.08 : 0.25 + Math.sqrt(day.count / max) * 6;
      dummy.position.set(x, 0, z);
      dummy.scale.set(0.86, Math.max(0.001, height * eased), 0.86);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
    settled.current = done;
  });

  const hover = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onHover(e.instanceId === undefined ? null : cells[e.instanceId].day);
  };

  return (
    <instancedMesh
      ref={mesh}
      args={[geometry, undefined, cells.length]}
      onPointerMove={hover}
      onPointerOut={() => onHover(null)}
    >
      <meshStandardMaterial roughness={0.6} metalness={0.05} />
    </instancedMesh>
  );
}

// The contribution calendar as a small voxel city: one column per day,
// height follows the number of contributions
export default function City({
  weeks,
  max,
  onHover,
}: {
  weeks: (Day | null)[][];
  max: number;
  onHover: (day: Day | null) => void;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  // Render only while on screen; the rise animation starts on first sight
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className="h-[270px] w-full cursor-grab active:cursor-grabbing">
      <Canvas
        orthographic
        camera={{ position: [-9, 16, 34], near: 0.1, far: 500 }}
        dpr={[1, 2]}
        frameloop={visible ? "always" : "never"}
        gl={{ antialias: true, alpha: true }}
        aria-hidden
      >
        <FitZoom weeks={weeks.length} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 20, 8]} intensity={1.5} />
        <directionalLight position={[-12, 6, -10]} intensity={0.3} />
        <Buildings weeks={weeks} max={max} onHover={onHover} />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minAzimuthAngle={-0.6}
          maxAzimuthAngle={0.6}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.6}
        />
      </Canvas>
    </div>
  );
}
