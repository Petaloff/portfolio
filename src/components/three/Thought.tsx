"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useCalm } from "@/lib/media";
import { sceneState } from "@/lib/scene";
import { fromModel, SIZE } from "./formations";
import { CLOUD, cloudBob, headPhase, headSide, headState, thoughtPose } from "./pose";
import { extrude } from "./voxelArt";

const model = extrude(CLOUD, 2);
const N = model.voxels.length;
// Bubbles rising from the head to the cloud
const TRAIL = 3;
const WISPS = 4;
// Voxels on the cloud's outline, which puff in and out
const filled = (x: number, y: number) => CLOUD[CLOUD.length - 1 - y]?.[x] === "#";
const rim = model.voxels.map(([x, y]) =>
  [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ].some(([dx, dy]) => !filled(x + dx, y + dy)),
);
// The cloud sits this far behind the figure in it; it is scaled up to make
// up for the perspective so it still lines up on screen
const DEPTH = 1.5;
const CAMERA = 30;
const BACK = (CAMERA + DEPTH) / CAMERA;

// Overshoots a little before settling, for a soft pop
const backOut = (t: number) => 1 + 2.70158 * (t - 1) ** 3 + 1.70158 * (t - 1) ** 2;
const pop = (p: number, start: number) => backOut(Math.min(1, Math.max(0, (p - start) / 0.4)));

// The thought cloud above the head once the page is past "about me": the
// bubbles pop up one by one, then the cloud. It floats, its rim puffs, wisps
// drift off the top and it wobbles when the section changes. The section
// figure inside it is the main voxel cluster (see VoxelScene)
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

  const side = useRef({ value: 1, holdUntil: 0 });
  // The section window the cloud is about, marked so it can light up (see EditorWindow)
  const marked = useRef<Element | null>(null);
  useEffect(() => () => marked.current?.removeAttribute("data-thought"), []);
  const change = useRef({ section: "", at: -10 });

  useFrame(() => {
    const c = cloud.current;
    const m = c?.children[0] as THREE.InstancedMesh | undefined;
    const t = trail.current;
    if (!c || !m || !t) return;
    timer.update();
    const dt = Math.min(timer.getDelta(), 1 / 30);
    const now = performance.now() / 1000;
    const { section } = sceneState;
    const thinking = headPhase(section) === "thinking";

    // Swapping margins, the cloud bursts and only comes back once the head has landed
    const facing = headSide(section);
    if (facing !== side.current.value) side.current = { value: facing, holdUntil: calm ? 0 : now + 0.3 };
    // A new section makes the cloud wobble like jelly as the new figure forms
    if (section !== change.current.section) change.current = { section, at: now };

    const target = thinking && now >= side.current.holdUntil && !headState.flying ? 1 : 0;
    const gap = target - progress.current;
    const p = (progress.current = calm
      ? target
      : progress.current + Math.sign(gap) * Math.min(Math.abs(gap), dt * (gap > 0 ? 1.6 : 3.5)));

    const pose = thoughtPose(viewport, size, facing);
    const { cloud: box, head } = pose;
    // Dimmed behind the windows when there is no margin to stand in, like the figures
    for (const mat of materials.current) if (mat) mat.opacity = pose.roomy ? 0.95 : 0.35;
    const live = !calm;
    const bob = live ? cloudBob(now, box.height) : 0;
    const age = now - change.current.at;
    const jelly = live ? 0.1 * Math.sin(age * 12) * Math.exp(-age * 4) : 0;
    const base = (box.width / layout.width) * BACK * pop(p, 0.6) || 1e-5;
    c.position.set(box.x * BACK, (box.y + bob) * BACK, -DEPTH);
    // Mirrored on the left so the cloud leans towards the content either way
    c.scale.set(base * (1 + jelly) * facing, base * (1 - jelly), base);
    c.rotation.z = live ? Math.sin(now * 0.7) * 0.04 : 0;

    // The rim puffs in and out, a wave running round the cloud
    for (let i = 0; i < N; i++) {
      const [x, y] = model.voxels[i];
      const puff = live && rim[i] ? Math.max(0, Math.sin(now * 2.2 + x * 0.5 + y * 0.9)) * 0.35 : 0;
      dummy.position.set(
        layout.positions[i * 3],
        layout.positions[i * 3 + 1],
        layout.positions[i * 3 + 2] + puff * SIZE,
      );
      dummy.scale.setScalar(1 + puff);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;

    // Bubbles from the top of the head towards the bottom of the cloud, growing
    // as they go and bobbing out of step
    const from = { x: head.x - head.width * 0.2 * facing, y: head.y + head.width * 0.45 };
    const to = { x: box.x - box.width * 0.12 * facing, y: box.y + bob - box.height * 0.5 };
    for (let i = 0; i < TRAIL; i++) {
      const k = (i + 1) / (TRAIL + 1);
      const sway = live ? Math.sin(now * 2 + i * 1.7) * box.width * 0.015 : 0;
      dummy.position.set(THREE.MathUtils.lerp(from.x, to.x, k) + sway, THREE.MathUtils.lerp(from.y, to.y, k), 0);
      dummy.scale.setScalar(box.width * (0.045 + 0.025 * i) * pop(p, i * 0.2) || 1e-5);
      dummy.updateMatrix();
      t.setMatrixAt(i, dummy.matrix);
    }
    // Little wisps keep drifting off the top of the cloud and melting away
    for (let i = 0; i < WISPS; i++) {
      const u = (now * 0.22 + i / WISPS) % 1;
      const spot = Math.sin(i * 7.3) * 0.35;
      dummy.position.set(
        box.x + box.width * spot * facing + Math.sin(now + i) * box.width * 0.03,
        box.y + bob + box.height * (0.45 + u * 0.55),
        -DEPTH * 0.5,
      );
      dummy.scale.setScalar(live ? box.width * 0.035 * Math.sin(Math.PI * u) * pop(p, 0.8) || 1e-5 : 1e-5);
      dummy.updateMatrix();
      t.setMatrixAt(TRAIL + i, dummy.matrix);
    }
    t.instanceMatrix.needsUpdate = true;
    c.visible = t.visible = p > 0;

    const el = target && p > 0.6 ? document.getElementById(section) : null;
    if (el !== marked.current) {
      marked.current?.removeAttribute("data-thought");
      el?.setAttribute("data-thought", facing > 0 ? "right" : "left");
      marked.current = el;
    }

    // Always on the move while it is up, unless motion is reduced
    if (p !== target || (live && p > 0) || now < side.current.holdUntil || headState.flying) invalidate();
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
      <instancedMesh ref={trail} args={[undefined, undefined, TRAIL + WISPS]} frustumCulled={false} visible={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial ref={(m) => void (materials.current[1] = m)} color={color} roughness={0.8} transparent />
      </instancedMesh>
    </>
  );
}
