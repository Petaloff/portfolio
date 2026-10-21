"use client";

import { PerspectiveCamera, View } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useCalm } from "@/lib/media";
import { onSceneWake, sceneState } from "@/lib/scene";
import { MoodLights } from "./MoodLights";
import { models, type ModelName } from "./voxelArt";
import { useFollow, VIEW_INDEX } from "./views";

const GAP = 0.92;
// Resting pose: isometric for solid models, a gentler turn for flat pixel art
// so it still reads from the front
const SOLID = { x: 0.6, y: -Math.PI / 4 };
const FLAT = { x: 0.25, y: -0.45 };

function readColors() {
  const style = getComputedStyle(document.documentElement);
  return {
    fg: new THREE.Color(style.getPropertyValue("--fg").trim()),
    accent: new THREE.Color(style.getPropertyValue("--accent").trim()),
  };
}

function Emblem({ model, host, onReady }: { model: ModelName; host: HTMLElement | null; onReady: () => void }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const group = useRef<THREE.Group>(null);
  const invalidate = useThree((s) => s.invalidate);
  const calm = useCalm();
  const { voxels, accent } = models[model];
  const dummy = useMemo(() => new THREE.Object3D(), []);
  // Centre and radius, so the camera frames the model whatever its size
  const { centre, radius, rest } = useMemo(() => {
    const min = [0, 1, 2].map((a) => Math.min(...voxels.map((v) => v[a])));
    const max = [0, 1, 2].map((a) => Math.max(...voxels.map((v) => v[a])));
    const centre = min.map((m, a) => (m + max[a]) / 2);
    const radius = Math.hypot(...max.map((m, a) => m - min[a] + 1)) / 2;
    return { centre, radius, rest: max[2] - min[2] < 2 ? FLAT : SOLID };
  }, [voxels]);
  // Hover state lives in a ref: the card is outside the canvas
  const state = useRef({ hovered: false, since: -Infinity, px: 0, py: 0 });
  const ready = useRef(false);
  useFollow(host);

  useEffect(() => {
    const m = mesh.current;
    if (!m) return;
    const { fg, accent: lit } = readColors();
    accent.forEach((a, i) => m.setColorAt(i, a ? lit : fg));
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    invalidate();
  }, [accent, invalidate]);

  // The whole card is the hover target, not just the emblem
  useEffect(() => {
    if (!host || calm) return;
    const s = state.current;
    const enter = () => {
      s.hovered = true;
      s.since = performance.now();
      invalidate();
    };
    const move = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      s.px = (e.clientX - r.left) / r.width - 0.5;
      s.py = (e.clientY - r.top) / r.height - 0.5;
      invalidate();
    };
    const leave = () => {
      s.hovered = false;
      s.px = 0;
      s.py = 0;
      invalidate();
    };
    host.addEventListener("pointerenter", enter);
    host.addEventListener("pointermove", move);
    host.addEventListener("pointerleave", leave);
    // The easter egg scatters the emblems too
    const off = onSceneWake(() => {
      if (performance.now() - sceneState.burstAt < 100) s.since = performance.now();
    });
    return () => {
      host.removeEventListener("pointerenter", enter);
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", leave);
      off();
    };
  }, [host, calm, invalidate]);

  useFrame((_, delta) => {
    const m = mesh.current;
    const g = group.current;
    if (!m || !g) return;
    const s = state.current;
    const dt = Math.min(delta, 1 / 30);
    // Hovering scatters the cubes and lets them snap back into place
    const age = (performance.now() - s.since) / 1000;
    const blast = age < 1.6 ? 2.4 * Math.exp(-age * 4) * (1 - Math.exp(-age * 18)) : 0;
    voxels.forEach(([x, y, z], i) => {
      dummy.position.set(
        x - centre[0] + Math.sin(i * 12.9898) * blast,
        y - centre[1] + Math.sin(i * 78.233) * blast,
        z - centre[2] + Math.sin(i * 37.719) * blast,
      );
      dummy.scale.setScalar(GAP);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;

    const ty = rest.y + s.px * 1.2;
    const tx = rest.x + s.py * 0.6;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, ty, 8, dt);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, tx, 8, dt);

    if (!ready.current) {
      ready.current = true;
      queueMicrotask(onReady);
    }
    if (blast > 1e-3 || age < 1.6 || Math.abs(g.rotation.y - ty) + Math.abs(g.rotation.x - tx) > 1e-3) invalidate();
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, radius * 3.6]} fov={30} />
      <MoodLights environment={false} />
      <group ref={group} rotation={[rest.x, rest.y, 0]}>
        <instancedMesh ref={mesh} args={[undefined, undefined, voxels.length]} frustumCulled={false}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial roughness={0.55} metalness={0.05} />
        </instancedMesh>
      </group>
    </>
  );
}

export default function CoverView({ model, onReady }: { model: ModelName; onReady: () => void }) {
  const [host, setHost] = useState<HTMLElement | null>(null);
  const attach = useCallback((el: HTMLDivElement | null) => setHost(el?.closest("li") ?? null), []);
  return (
    <View ref={attach} index={VIEW_INDEX} className="absolute inset-0">
      <Emblem model={model} host={host} onReady={onReady} />
    </View>
  );
}
