"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useCalm, useCoarse } from "@/lib/media";
import { onSceneWake, sceneState } from "@/lib/scene";
import "./quiet";
import { AdaptiveDpr } from "./AdaptiveDpr";
import { buildName, COUNT, fromModel, SIZE, type Formation } from "./formations";
import { MoodLights } from "./MoodLights";
import { Head } from "./Head";
import { Thought } from "./Thought";
import { cloudBob, headPhase, headSide, headState, introPose, smoothstep, spring, thoughtPose } from "./pose";
import { models } from "./voxelArt";

// Narrow windows get a coarser grid: fewer, bigger cubes stay crisp at small
// sizes. Tablets get a lighter one so slower GPUs keep up
const NARROW_BUDGET = 360;
const TABLET_BUDGET = 520;

// While a home page section is in the middle of the screen, the cubes take its shape
const sections: Record<string, Shape> = {
  about: "head",
  projects: "code",
  activity: "city",
  stack: "braces",
  minecraft: "pickaxe",
  blog: "hash",
  contact: "at",
};
type Shape = "name" | "scatter" | "head" | "code" | "city" | "braces" | "pickaxe" | "hash" | "at";

function buildShape(shape: Shape, name: string, budget: number): Formation {
  switch (shape) {
    case "name":
      return buildName(name, budget);
    case "scatter": {
      // The name blown apart once the intro is over: every cube flies outwards and shrinks away
      const f = buildName(name, budget);
      const positions = f.positions.map((v, i) => v * 2.5 + Math.sin(i * 78.233) * 6);
      return { ...f, positions, scales: new Float32Array(COUNT) };
    }
    case "head":
      // The cubes fold into the head's outline and shrink away: the Head takes over there
      return { ...fromModel(models.head, budget), scales: new Float32Array(COUNT) };
    case "code":
      return fromModel(models.code, budget);
    case "city":
      return fromModel(models.skyline, budget);
    case "pickaxe":
      return fromModel(models.pickaxe, budget);
    case "braces":
      return buildName("{ }", budget);
    case "hash":
      return buildName("#", budget);
    case "at":
      return buildName("@", budget);
  }
}

function readColors() {
  const style = getComputedStyle(document.documentElement);
  return {
    fg: new THREE.Color(style.getPropertyValue("--fg").trim()),
    accent: new THREE.Color(style.getPropertyValue("--accent").trim()),
  };
}

function Voxels({ name, onReady }: { name: string; onReady?: () => void }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const material = useRef<THREE.MeshStandardMaterial>(null);
  const group = useRef<THREE.Group>(null);
  const { viewport, size, invalidate } = useThree();
  const narrow = viewport.aspect < 1;
  // Touch screens have no hover: the lens and ripples stay off, tilt comes from the gyroscope
  const coarse = useCoarse();
  const calm = useCalm();
  const timer = useMemo(() => new THREE.Timer(), []);
  const budget = narrow ? NARROW_BUDGET : coarse ? TABLET_BUDGET : COUNT;

  // Shapes are rasterised the first time they are needed
  const shapes = useRef({ key: "", cache: new Map<Shape, Formation>() });
  const getShape = (shape: Shape) => {
    const key = `${name}|${budget}`;
    if (shapes.current.key !== key) shapes.current = { key, cache: new Map() };
    const { cache } = shapes.current;
    let f = cache.get(shape);
    if (!f) {
      f = buildShape(shape, name, budget);
      cache.set(shape, f);
    }
    return f;
  };

  const colors = useMemo(() => readColors(), []);
  const tint = useMemo(() => new THREE.Color(), []);
  const shown = useRef<{ shape: Shape | null; formation: Formation | null }>({ shape: null, formation: null });
  const ready = useRef(false);

  // Animated per-frame buffers; start scattered so the name assembles on load
  const current = useRef<{ positions: Float32Array; scales: Float32Array } | null>(null);
  // Smoothed pointer and how strongly the name reacts to it (fades out on scroll)
  const follow = useRef({ x: 0, y: 0, tilt: 0, lens: 0 });
  const motion = useRef({ x: { x: 0, v: 0 }, y: { x: 0, v: 0 } });
  // Ripples spawned as the cursor moves across the name, in its local space
  const ripples = useRef<{ x: number; y: number; t0: number }[]>([]);
  const lastRipple = useRef({ x: 0, y: 0, t: 0 });
  // Per-cube easing speed gives the assembly a rolling, wave-like feel
  const speeds = useMemo(() => Float32Array.from({ length: COUNT }, (_, i) => 1.6 + ((i * 37) % 100) / 45), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Frames are drawn on demand: scrolling, the cursor over the intro, a section
  // change or the easter egg wake the scene, and it keeps drawing until it settles
  useEffect(() => {
    const onScroll = () => invalidate();
    const onMove = () => {
      if (sceneState.intro) invalidate();
    };
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("pointermove", onMove, { passive: true });
    const off = onSceneWake(invalidate);

    const ids = Object.keys(sections);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) sceneState.section = e.target.id;
        invalidate();
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("pointermove", onMove);
      off();
      io.disconnect();
    };
  }, [invalidate]);

  useFrame(() => {
    const m = mesh.current;
    const g = group.current;
    const mat = material.current;
    if (!m || !g || !mat) return;
    timer.update();
    const dt = Math.min(timer.getDelta(), 1 / 30);
    const t = timer.getElapsed();

    // The name in the middle of the intro; past it the name bursts, and further
    // down the cubes make a figure beside the content
    const scrolled = scrollY / innerHeight;
    const { intro } = sceneState;
    // While the head thinks, the figure waits (shrunk away) until its cloud is up
    const waiting = headPhase(sceneState.section) === "thinking" && headState.cloud < 0.95;
    const shape: Shape = intro
      ? "name"
      : scrolled < 0.6
        ? "scatter"
        : waiting
          ? "head"
          : (sections[sceneState.section] ?? "scatter");
    const layout = getShape(shape);
    if (shown.current.formation !== layout) {
      const rgb = layout.colors;
      for (let i = 0; i < COUNT; i++) {
        if (rgb) tint.setRGB(rgb[i * 3], rgb[i * 3 + 1], rgb[i * 3 + 2], THREE.SRGBColorSpace);
        m.setColorAt(i, rgb ? tint : layout.accent[i] ? colors.accent : colors.fg);
      }
      if (m.instanceColor) m.instanceColor.needsUpdate = true;
      shown.current = { shape, formation: layout };
    }

    current.current ??= calm
      ? { positions: layout.positions.slice(), scales: layout.scales.slice() }
      : {
          positions: Float32Array.from({ length: COUNT * 3 }, (_, i) => Math.sin(i * 12.9898) * 12),
          scales: new Float32Array(COUNT),
        };
    const pos = current.current.positions;
    const scl = current.current.scales;

    const atTop = intro;
    const f = follow.current;
    const ease = 1 - Math.exp(-dt * 6);
    const fade = 1 - Math.exp(-dt * 4);
    f.x += (sceneState.pointer.x - f.x) * ease;
    f.y += (sceneState.pointer.y - f.y) * ease;
    f.tilt += ((atTop && !calm ? 1 : 0) - f.tilt) * fade;
    f.lens += ((atTop && !calm && !coarse ? 1 : 0) - f.lens) * fade;

    // 0 is the name in the middle, 1 the side figure
    const side = smoothstep(0.35, 1, scrolled);
    // Off the hero the figure is what the head is thinking about, inside its cloud
    // The figure stays in its cloud while the cloud bursts, then follows the head
    const facing = headPhase(sceneState.section) === "thinking" ? headState.side : headSide(sceneState.section);
    const { roomy, cloud, inner } = thoughtPose(viewport, size, facing);
    const bob =
      !calm && headPhase(sceneState.section) === "thinking" ? cloudBob(performance.now() / 1000, cloud.height) : 0;
    const centre = introPose(viewport).name;
    const fitHero = Math.min(1, centre.width / layout.width, centre.height / layout.height);
    // The figure turns, so solid shapes need room for their diagonal
    const fitSide = Math.min(inner.width / Math.hypot(layout.width, layout.depth), inner.height / layout.height);
    const lambda = calm ? 60 : 6;
    const scale = THREE.MathUtils.damp(g.scale.x, THREE.MathUtils.lerp(fitHero, fitSide, side), lambda, dt);
    g.scale.setScalar(scale);
    // On springs, so the figure glides after the head when it swaps margins
    const mo = motion.current;
    const tx = cloud.x * side;
    const ty = THREE.MathUtils.lerp(centre.y, cloud.y + bob, side);
    // The first frame starts in place rather than flying in from the centre
    if (calm || !ready.current) {
      Object.assign(mo.x, { x: tx, v: 0 });
      Object.assign(mo.y, { x: ty, v: 0 });
    }
    g.position.x = spring(mo.x, tx, 3.6, dt);
    g.position.y = spring(mo.y, ty, 5, dt);
    // Turns with the scroll so the figure shows its depth, facing the content
    g.rotation.y = f.x * 0.12 * f.tilt - facing * side * (0.35 + Math.sin(scrollY * 0.0015) * 0.25);
    g.rotation.x = f.y * 0.08 * f.tilt + side * 0.12;
    mat.opacity = THREE.MathUtils.damp(mat.opacity, THREE.MathUtils.lerp(1, roomy ? 1 : 0.3, side), lambda, dt);

    // Cursor in the name's local space
    const cx = ((f.x * viewport.width) / 2 - g.position.x) / scale;
    const cy = ((-f.y * viewport.height) / 2 - g.position.y) / scale;

    // Moving the cursor drops ripples that roll outwards through the letters
    const last = lastRipple.current;
    if (f.lens > 0.5 && Math.hypot(cx - last.x, cy - last.y) > 1.1 && t - last.t > 0.1) {
      ripples.current.push({ x: cx, y: cy, t0: t });
      if (ripples.current.length > 8) ripples.current.shift();
      Object.assign(last, { x: cx, y: cy, t });
    }
    const live = (ripples.current = ripples.current.filter((r) => t - r.t0 < 2.5));

    // Easter egg: blast every cube outwards, then let it drift back home
    const age = (performance.now() - sceneState.burstAt) / 1000;
    const blast = !calm && age < 4 ? 7 * Math.exp(-age * 1.4) * (1 - Math.exp(-age * 10)) : 0;

    let moving = 0;
    for (let i = 0; i < COUNT; i++) {
      // Base position eases into the current shape (assembly on load, morphs on scroll)
      // Waiting for its cloud, the figure shrinks away quickly rather than drifting,
      // and the name bursts rather than drifts apart
      const k = calm ? 1 : 1 - Math.exp(-dt * speeds[i] * (waiting ? 4 : shape === "scatter" ? 2 : 1));
      const j = i * 3;
      const tx = layout.positions[j];
      const ty = layout.positions[j + 1];
      const tz = layout.positions[j + 2];
      const dpx = tx - pos[j];
      const dpy = ty - pos[j + 1];
      const dpz = tz - pos[j + 2];
      const dps = layout.scales[i] - scl[i];
      moving = Math.max(moving, Math.abs(dpx), Math.abs(dpy), Math.abs(dpz), Math.abs(dps));
      pos[j] += dpx * k;
      pos[j + 1] += dpy * k;
      pos[j + 2] += dpz * k;
      scl[i] += dps * k;

      // Lens under the cursor: voxels swell and part slightly around it
      const dx = tx - cx;
      const dy = ty - cy;
      const d = Math.hypot(dx, dy) || 1;
      const lens = Math.exp(-(d * d) / 2.2) * f.lens;

      // Ripples: a ring that expands and fades, lifting the voxels it passes
      let wave = 0;
      for (const r of live) {
        const age = t - r.t0;
        const dist = Math.hypot(tx - r.x, ty - r.y);
        wave += Math.exp(-((dist - age * 5) ** 2) / 0.35) * Math.exp(-age * 1.6);
      }
      wave = Math.min(wave, 1.2) * f.lens;

      // A slow breath running along the name keeps it alive when idle
      const breath = calm ? 0 : (Math.sin(t * 1.8 - tx * 0.45) * 0.5 + 0.5) * 0.08 * f.tilt;

      const spread = lens * 0.4 + wave * 0.22;
      // Stable pseudo-random direction per cube for the blast
      const bx = Math.sin(i * 12.9898) * blast;
      const by = Math.sin(i * 78.233) * blast;
      const bz = Math.sin(i * 37.719) * blast;
      dummy.position.set(
        pos[j] + (dx / d) * spread + bx,
        pos[j + 1] + (dy / d) * spread + by,
        pos[j + 2] + lens * 1.1 + wave * 0.8 + bz,
      );
      dummy.scale.setScalar(scl[i] * (1 + lens * 0.45 + wave * 0.45 + breath));
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;

    if (!ready.current) {
      ready.current = true;
      queueMicrotask(() => onReady?.());
    }
    // Keep drawing while anything is still in motion
    const posing =
      Math.abs(g.scale.x - THREE.MathUtils.lerp(fitHero, fitSide, side)) > 1e-3 ||
      Math.abs(mo.x.v) + Math.abs(mo.y.v) > 1e-3 ||
      Math.abs(mo.y.x - ty) > 1e-3;
    if (moving > 2e-3 || posing || f.tilt > 0.01 || live.length > 0 || blast > 0.01 || age < 4) invalidate();
  });

  return (
    <group ref={group}>
      <instancedMesh ref={mesh} args={[undefined, undefined, COUNT]} frustumCulled={false}>
        <boxGeometry args={[SIZE, SIZE, SIZE]} />
        <meshStandardMaterial ref={material} roughness={0.55} metalness={0.05} transparent />
      </instancedMesh>
    </group>
  );
}

export default function VoxelScene({
  name,
  skin,
  onReady,
  onFail,
}: {
  name: string;
  skin?: string;
  onReady?: () => void;
  onFail?: () => void;
}) {
  const coarse = useCoarse();
  const calm = useCalm();

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      sceneState.pointer.x = (e.clientX / innerWidth) * 2 - 1;
      sceneState.pointer.y = (e.clientY / innerHeight) * 2 - 1;
    };
    addEventListener("pointermove", onMove, { passive: true });
    return () => removeEventListener("pointermove", onMove);
  }, []);

  // Tablets tilt the name with the gyroscope instead of the cursor. iOS only
  // hands out orientation after a tap, so the first touch asks for it
  useEffect(() => {
    if (!coarse || calm) return;
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma === null || e.beta === null) return;
      sceneState.pointer.x = Math.max(-1, Math.min(1, e.gamma / 25));
      sceneState.pointer.y = Math.max(-1, Math.min(1, (e.beta - 40) / 25));
    };
    const Orientation = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
    const ask = () => {
      Orientation.requestPermission?.().catch(() => {});
    };
    addEventListener("deviceorientation", onTilt);
    if (Orientation.requestPermission) addEventListener("pointerdown", ask, { once: true });
    return () => {
      removeEventListener("deviceorientation", onTilt);
      removeEventListener("pointerdown", ask);
    };
  }, [coarse, calm]);

  return (
    <Canvas
      camera={{ position: [0, 0, 30], fov: 16 }}
      dpr={[1, 2]}
      frameloop="demand"
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) =>
        gl.domElement.addEventListener("webglcontextlost", (e) => {
          e.preventDefault();
          onFail?.();
        })
      }
      aria-hidden
    >
      <AdaptiveDpr />
      <MoodLights />
      <Voxels name={name} onReady={onReady} />
      <Head skin={skin} />
      <Thought />
    </Canvas>
  );
}
