"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useCalm } from "@/lib/media";
import { sceneState } from "@/lib/scene";
import { fromModel, SIZE } from "./formations";
import { cloudBob, fitSide, headPhase, headSide, headState, introPose, spring, thoughtPose } from "./pose";
import { headFromSkin, models, type Model } from "./voxelArt";

const N = models.head.voxels.length;
function readColors() {
  const style = getComputedStyle(document.documentElement);
  return {
    fg: new THREE.Color(style.getPropertyValue("--fg").trim()),
    accent: new THREE.Color(style.getPropertyValue("--accent").trim()),
  };
}

// The Minecraft head of the home page. It looks at the cursor, sits under the
// name in the intro, then stands beside the hero text and "about me" and stays
// for the rest of the page, thinking about each section (see Thought)
export function Head({ skin }: { skin?: string }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const material = useRef<THREE.MeshStandardMaterial>(null);
  const group = useRef<THREE.Group>(null);
  const { viewport, size, invalidate } = useThree();
  const calm = useCalm();
  const timer = useMemo(() => new THREE.Timer(), []);
  const [model, setModel] = useState<Model>(models.head);
  const layout = useMemo(() => fromModel(model, N), [model]);
  const colors = useMemo(() => readColors(), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  // Cubes start scattered and fly together the first time the head shows up
  const current = useRef<Float32Array | null>(null);
  // Position and size move on springs so the flights between margins are smooth
  const motion = useRef({ x: { x: 0, v: 0 }, y: { x: 0, v: 0 }, scale: { x: 0, v: 0 } });

  // Paint it with the skin once that has loaded; until then it is the plain head
  useEffect(() => {
    if (!skin) return;
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (cancelled || img.width < 64) return;
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      try {
        setModel(headFromSkin(ctx.getImageData(0, 0, 64, 64).data));
      } catch {
        // a tainted canvas keeps the plain head
      }
    };
    img.src = `https://mc-heads.net/skin/${skin}`;
    return () => {
      cancelled = true;
    };
  }, [skin]);

  useEffect(() => {
    const m = mesh.current;
    if (!m) return;
    const tint = new THREE.Color();
    const rgb = layout.colors;
    for (let i = 0; i < N; i++) {
      if (rgb) tint.setRGB(rgb[i * 3], rgb[i * 3 + 1], rgb[i * 3 + 2], THREE.SRGBColorSpace);
      m.setColorAt(i, rgb ? tint : layout.accent[i] ? colors.accent : colors.fg);
    }
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    invalidate();
  }, [layout, colors, invalidate]);

  // The head follows the cursor wherever it is
  useEffect(() => {
    const onMove = () => invalidate();
    addEventListener("pointermove", onMove, { passive: true });
    return () => removeEventListener("pointermove", onMove);
  }, [invalidate]);

  useFrame(() => {
    const m = mesh.current;
    const g = group.current;
    const mat = material.current;
    if (!m || !g || !mat) return;
    timer.update();
    const dt = Math.min(timer.getDelta(), 1 / 30);

    const phase = headPhase(sceneState.section);
    const pose = thoughtPose(viewport, size, headSide(sceneState.section));
    let x = pose.x;
    let y = 0;
    let scale = fitSide(layout, pose.width, viewport.height, pose.roomy);
    let opacity = pose.roomy ? 0.95 : 0.35;
    // The hero keeps a slot for it beside the text (see HeroFrame)
    const slot = phase === "hero" ? document.getElementById("hero-head")?.getBoundingClientRect() : undefined;
    if (phase === "intro") {
      const intro = introPose(viewport);
      x = 0;
      y = intro.head.y;
      scale = intro.head.height / layout.height;
      opacity = 0.95;
    } else if (slot?.width) {
      const px = viewport.width / size.width;
      x = (slot.left + slot.width / 2 - size.width / 2) * px;
      y = (size.height / 2 - slot.top - slot.height / 2) * px;
      // A little smaller than its slot, so it keeps clear of the text as it turns
      const fit = slot.width * px * 0.8;
      scale = Math.min(fit / Math.hypot(layout.width, layout.depth), fit / layout.height);
      opacity = 0.95;
    } else if (phase === "thinking") {
      // Sinks a little to make room for the thought cloud above
      x = pose.head.x;
      y = pose.head.y;
      scale = pose.head.width / Math.hypot(layout.width, layout.depth);
      // Bobs a beat behind its cloud
      if (!calm) y += cloudBob(performance.now() / 1000 - 0.6, pose.head.width);
    }

    const mo = motion.current;
    if (calm) {
      Object.assign(mo.x, { x, v: 0 });
      Object.assign(mo.y, { x: y, v: 0 });
      Object.assign(mo.scale, { x: scale, v: 0 });
    }
    spring(mo.x, x, 3.2, dt);
    spring(mo.y, y, 4, dt);
    spring(mo.scale, scale, 4.5, dt);
    // Swapping margins it leaps across the page in an arc, leaning into the flight
    const speed = mo.x.v;
    headState.flying = Math.abs(x - mo.x.x) > pose.head.width * 0.3 || Math.abs(speed) > pose.head.width;
    g.position.set(mo.x.x, mo.y.x + Math.abs(speed) * 0.12, 0);
    g.rotation.z = THREE.MathUtils.clamp(-speed * 0.05, -0.35, 0.35);
    g.scale.setScalar(Math.max(0, mo.scale.x));
    const lambda = calm ? 60 : 5;
    mat.opacity = THREE.MathUtils.damp(mat.opacity, opacity, lambda, dt);

    // Turn to the cursor: its offset from the head on screen, in screen-height units
    const p = sceneState.pointer;
    const dx = (p.x - g.position.x / (viewport.width / 2)) * viewport.aspect;
    const dy = p.y + g.position.y / (viewport.height / 2);
    const yaw = calm ? -0.4 : THREE.MathUtils.clamp(Math.atan(dx / 0.9), -0.9, 0.9);
    const pitch = calm ? 0.15 : THREE.MathUtils.clamp(Math.atan(dy / 0.9), -0.55, 0.55);
    const turn = calm ? 60 : 8;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, yaw, turn, dt);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, pitch, turn, dt);

    const pos = (current.current ??= calm
      ? layout.positions.slice(0, N * 3)
      : Float32Array.from({ length: N * 3 }, (_, i) => Math.sin(i * 12.9898) * 6));
    let moving = 0;
    for (let i = 0; i < N; i++) {
      const k = calm ? 1 : 1 - Math.exp(-dt * (2 + ((i * 37) % 100) / 40));
      for (let a = 0; a < 3; a++) {
        const j = i * 3 + a;
        const d = layout.positions[j] - pos[j];
        moving = Math.max(moving, Math.abs(d));
        pos[j] += d * k;
      }
      dummy.position.set(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;

    const settled =
      moving < 2e-3 &&
      Math.abs(g.position.x - x) < 1e-3 &&
      Math.abs(g.position.y - y) < 1e-3 &&
      Math.abs(g.scale.x - scale) < 1e-4 &&
      Math.abs(motion.current.x.v) + Math.abs(motion.current.y.v) + Math.abs(motion.current.scale.v) < 1e-3 &&
      Math.abs(g.rotation.y - yaw) < 1e-3 &&
      Math.abs(g.rotation.x - pitch) < 1e-3 &&
      Math.abs(mat.opacity - opacity) < 1e-3;
    if (!settled) invalidate();
  });

  return (
    <group ref={group} scale={0}>
      <instancedMesh ref={mesh} args={[undefined, undefined, N]} frustumCulled={false}>
        <boxGeometry args={[SIZE, SIZE, SIZE]} />
        <meshStandardMaterial ref={material} roughness={0.55} metalness={0.05} transparent opacity={0} />
      </instancedMesh>
    </group>
  );
}
