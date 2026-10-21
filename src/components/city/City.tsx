"use client";

import { ContactShadows, OrbitControls, OrthographicCamera, View } from "@react-three/drei";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import type { Day } from "@/lib/contributions";
import { useCalm, useCoarse } from "@/lib/media";
import { MoodLights } from "../three/MoodLights";
import { useFollow, VIEW_INDEX } from "../three/views";

const PITCH = 1.15;
// How long the columns take to rise, week by week, and the camera to swing in
const RISE_STAGGER = 0.025;
const RISE = 0.8;
const WHITE = new THREE.Color("#ffffff");

export type Hover = { day: Day; x: number; y: number };

function readColors() {
  const style = getComputedStyle(document.documentElement);
  const get = (name: string) => new THREE.Color(style.getPropertyValue(name).trim());
  return { empty: get("--line"), base: get("--surface"), accent: get("--accent") };
}

// Keeps the whole year in frame whatever the box width
function FitZoom({ weeks }: { weeks: number }) {
  const get = useThree((s) => s.get);
  const width = useThree((s) => s.size.width);
  useEffect(() => {
    const { camera, invalidate } = get();
    camera.zoom = width / (weeks * PITCH * 1.08);
    camera.updateProjectionMatrix();
    invalidate();
  }, [get, width, weeks]);
  return null;
}

function Buildings({
  weeks,
  max,
  visible,
  onHover,
  onPick,
  onSettled,
  children,
}: {
  weeks: (Day | null)[][];
  max: number;
  visible: boolean;
  children?: ReactNode;
  onHover: (hover: Hover | null) => void;
  onPick: (day: Day) => void;
  onSettled: () => void;
}) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const group = useRef<THREE.Group>(null);
  const invalidate = useThree((s) => s.invalidate);
  const calm = useCalm();
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
  const palette = useMemo(() => readColors(), []);
  const colors = useMemo(() => {
    const color = new THREE.Color();
    return cells.map(({ day }) =>
      day.count === 0
        ? palette.empty.clone()
        : color
            .copy(palette.base)
            .lerp(palette.accent, 0.35 + 0.65 * Math.sqrt(day.count / max))
            .clone(),
    );
  }, [cells, max, palette]);
  const started = useRef<number | null>(null);
  const settled = useRef(false);
  const pulse = useMemo(() => new THREE.Color(), []);
  const today = cells.length - 1;

  useEffect(() => {
    const m = mesh.current;
    if (!m) return;
    colors.forEach((c, i) => m.setColorAt(i, c));
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [colors]);

  // Wake up when scrolled into view: the rise starts on first sight
  useEffect(() => {
    if (visible) invalidate();
  }, [visible, invalidate]);

  useFrame(({ clock }) => {
    const m = mesh.current;
    const g = group.current;
    if (!m || !g || !visible) return;
    const now = clock.elapsedTime;

    if (!settled.current) {
      // Columns rise week by week, sweeping across the year, while the camera swings in
      started.current ??= now;
      const t = calm ? Infinity : now - started.current;
      let done = true;
      cells.forEach(({ day, x, z, w }, i) => {
        const p = Math.min(1, Math.max(0, (t - w * RISE_STAGGER) / RISE));
        if (p < 1) done = false;
        const eased = 1 - (1 - p) ** 3;
        const height = day.count === 0 ? 0.08 : 0.25 + Math.sqrt(day.count / max) * 6;
        dummy.position.set(x, 0, z);
        dummy.scale.set(0.86, Math.max(0.001, height * eased), 0.86);
        dummy.updateMatrix();
        m.setMatrixAt(i, dummy.matrix);
      });
      m.instanceMatrix.needsUpdate = true;
      // Pointer events reach the city from anywhere on the page, so the first
      // raycast can come mid-rise; keep the cached bounds in step with the columns
      m.computeBoundingSphere();
      const swing = Math.min(1, t / (weeks.length * RISE_STAGGER + RISE));
      g.rotation.y = -0.5 * (1 - swing) ** 3;
      if (done) {
        settled.current = true;
        onSettled();
      }
    }

    // Today's column breathes in a lighter shade
    if (today >= 0 && !calm) {
      const k = (Math.sin(now * 3) * 0.5 + 0.5) * 0.55;
      m.setColorAt(
        today,
        pulse
          .copy(colors[today])
          .lerp(palette.accent, 0.4)
          .lerp(WHITE, k * 0.5),
      );
      if (m.instanceColor) m.instanceColor.needsUpdate = true;
    }
    if (!settled.current || (today >= 0 && !calm)) invalidate();
  });

  const hover = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onHover(e.instanceId === undefined ? null : { day: cells[e.instanceId].day, x: e.clientX, y: e.clientY });
  };
  // A click that is not the end of a drag opens that day on GitHub
  const click = (e: ThreeEvent<MouseEvent>) => {
    if (e.instanceId === undefined || e.delta > 6) return;
    e.stopPropagation();
    onPick(cells[e.instanceId].day);
  };

  return (
    <group ref={group}>
      <instancedMesh
        ref={mesh}
        args={[geometry, undefined, cells.length]}
        onPointerMove={hover}
        onPointerOut={() => onHover(null)}
        onClick={click}
      >
        <meshStandardMaterial roughness={0.6} metalness={0.05} />
      </instancedMesh>
      {children}
    </group>
  );
}

function CityScene({
  weeks,
  max,
  visible,
  box,
  onHover,
  onPick,
}: {
  weeks: (Day | null)[][];
  max: number;
  visible: boolean;
  box: HTMLElement | null;
  onHover: (hover: Hover | null) => void;
  onPick: (day: Day) => void;
}) {
  const invalidate = useThree((s) => s.invalidate);
  const coarse = useCoarse();
  const [settled, setSettled] = useState(false);
  useFollow(box);
  // The frozen shadow needs one more frame to draw itself
  useEffect(() => {
    if (settled) invalidate();
  }, [settled, invalidate]);

  return (
    <>
      <OrthographicCamera makeDefault position={[-9, 16, 34]} near={0.1} far={500} />
      <FitZoom weeks={weeks.length} />
      <MoodLights environment={false} />
      <Buildings
        weeks={weeks}
        max={max}
        visible={visible}
        onHover={onHover}
        onPick={onPick}
        onSettled={() => setSettled(true)}
      >
        {/* Soft shadows follow the rising columns, then freeze into a single render */}
        <ContactShadows
          key={settled ? "still" : "rising"}
          frames={settled ? 1 : Infinity}
          position={[0, -0.01, 0]}
          scale={[weeks.length * PITCH * 1.15, 7 * PITCH * 1.6]}
          opacity={0.55}
          blur={2.2}
          far={7}
          resolution={512}
          color="#000000"
        />
      </Buildings>
      {/* On touch screens dragging must keep scrolling the page */}
      {!coarse && (
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minAzimuthAngle={-0.6}
          maxAzimuthAngle={0.6}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.6}
        />
      )}
    </>
  );
}

// The contribution calendar as a small voxel city: one column per day, height
// follows the number of contributions. Drawn into the shared overlay canvas
export default function City({
  weeks,
  max,
  onHover,
  onPick,
}: {
  weeks: (Day | null)[][];
  max: number;
  onHover: (hover: Hover | null) => void;
  onPick: (day: Day) => void;
}) {
  const [el, setEl] = useState<HTMLElement | null>(null);
  // View's ref can also be a three Group when used inside a canvas; here it is always the DOM box
  const attach = useCallback((node: HTMLElement | THREE.Group | null) => {
    setEl(node instanceof HTMLElement ? node : null);
  }, []);
  const [visible, setVisible] = useState(false);

  // Render only while on screen
  useEffect(() => {
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, [el]);

  return (
    <View
      ref={attach}
      index={VIEW_INDEX}
      visible={visible}
      className="h-[270px] w-full cursor-grab active:cursor-grabbing"
    >
      <CityScene weeks={weeks} max={max} visible={visible} box={el} onHover={onHover} onPick={onPick} />
    </View>
  );
}
