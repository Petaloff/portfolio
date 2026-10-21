"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useCalm } from "@/lib/media";
import { sceneState } from "@/lib/scene";
import { fromModel, SIZE } from "./formations";
import { CLOUD, headPhase, thoughtPose } from "./pose";
import { extrude } from "./voxelArt";

const model = extrude(CLOUD, 2);
const N = model.voxels.length;
// Bubbles rising from the head to the cloud
const TRAIL = 3;
// The cloud sits this far behind the figure in it; it is scaled up to make
// up for the perspective so it still lines up on screen
const DEPTH = 1.5;
const CAMERA = 30;
const BACK = (CAMERA + DEPTH) / CAMERA;

// Overshoots a little before settling, for a soft pop
const backOut = (t: number) => 1 + 2.70158 * (t - 1) ** 3 + 1.70158 * (t - 1) ** 2;
const pop = (p: number, start: number) => backOut(Math.min(1, Math.max(0, (p - start) / 0.4)));

// The thought cloud above the head once the page is past "about me": the
// bubbles pop up one by one, then the cloud. The section figure inside it is
// the main voxel cluster (see VoxelScene)
export function Thought() {
  const cloud = useRef<THREE.Group>(null);
  const trail = useRef<THREE.InstancedMesh>(null);
  const { viewport, size, invalidate } = useThree();
  const calm = useCalm();
  const timer = useMemo(() => new THREE.Timer(), []);
  const layout = useMemo(() => fromModel(model, N), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => {
    const style = getComputedStyle(document.documentElement);
    const get = (name: string) => new THREE.Color(style.getPropertyValue(name).trim());
    // A shade lighter than the windows, so the figure inside stands out against it
    return get("--surface").lerp(get("--fg"), 0.14);
  }, []);
  const materials = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  // 0 hidden, 1 fully shown: the bubbles and the cloud each take a slice of it
  const progress = useRef(0);

  useEffect(() => {
    const m = cloud.current?.children[0] as THREE.InstancedMesh | undefined;
    if (!m) return;
    for (let i = 0; i < N; i++) {
      dummy.position.set(layout.positions[i * 3], layout.positions[i * 3 + 1], layout.positions[i * 3 + 2]);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
    invalidate();
  }, [layout, dummy, invalidate]);

  useFrame(() => {
    const c = cloud.current;
    const t = trail.current;
    if (!c || !t) return;
    timer.update();
    const dt = Math.min(timer.getDelta(), 1 / 30);

    const target = headPhase(sceneState.section) === "thinking" ? 1 : 0;
    const p = (progress.current = calm
      ? target
      : progress.current +
        Math.sign(target - progress.current) * Math.min(Math.abs(target - progress.current), dt * 1.6));

    const pose = thoughtPose(viewport, size);
    const { cloud: box, head } = pose;
    // Dimmed behind the windows when there is no margin to stand in, like the figures
    for (const m of materials.current) if (m) m.opacity = pose.roomy ? 0.95 : 0.35;
    c.position.set(box.x * BACK, box.y * BACK, -DEPTH);
    c.scale.setScalar((box.width / layout.width) * BACK * pop(p, 0.6) || 1e-5);

    // From the top of the head towards the bottom of the cloud, growing as they go
    const from = { x: head.x - head.width * 0.2, y: head.y + head.width * 0.45 };
    const to = { x: box.x - box.width * 0.12, y: box.y - box.height * 0.5 };
    for (let i = 0; i < TRAIL; i++) {
      const k = (i + 1) / (TRAIL + 1);
      dummy.position.set(THREE.MathUtils.lerp(from.x, to.x, k), THREE.MathUtils.lerp(from.y, to.y, k), 0);
      dummy.scale.setScalar(box.width * (0.045 + 0.025 * i) * pop(p, i * 0.2) || 1e-5);
      dummy.updateMatrix();
      t.setMatrixAt(i, dummy.matrix);
    }
    t.instanceMatrix.needsUpdate = true;
    c.visible = t.visible = p > 0;

    if (p !== target) invalidate();
  });

  return (
    <>
      <group ref={cloud} visible={false}>
        <instancedMesh args={[undefined, undefined, N]} frustumCulled={false}>
          <boxGeometry args={[SIZE, SIZE, SIZE]} />
          <meshStandardMaterial
            ref={(m) => void (materials.current[0] = m)}
            color={color}
            roughness={0.8}
            transparent
          />
        </instancedMesh>
      </group>
      <instancedMesh ref={trail} args={[undefined, undefined, TRAIL]} frustumCulled={false} visible={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial ref={(m) => void (materials.current[1] = m)} color={color} roughness={0.8} transparent />
      </instancedMesh>
    </>
  );
}
