"use client";

import { useEffect, useRef, useState } from "react";
import { useCalm, usePhone } from "@/lib/media";
import { onSceneWake, sceneState } from "@/lib/scene";
import { useRenderMode } from "@/lib/store";

// Rotating 3D skin on desktop in 3D mode, standing on a little grass block. It
// only renders while on screen, walks while hovered, waves when clicked and
// jumps with the easter egg. Phones get a flat head and the light version a
// flat body render, so neither spends a WebGL context on it
export function SkinViewer({ username, hint }: { username: string; hint: string }) {
  const phone = usePhone();
  const mode = useRenderMode();
  const calm = useCalm();
  const canvas = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);
  const live = !phone && mode === "full";

  useEffect(() => {
    const el = canvas.current;
    if (!live || !el) return;
    let disposed = false;
    let dispose = () => {};
    Promise.all([import("skinview3d"), import("three")]).then(([skinview, THREE]) => {
      if (disposed) return;
      const { SkinViewer, IdleAnimation, WalkingAnimation, WaveAnimation } = skinview;
      const viewer = new SkinViewer({
        canvas: el,
        width: 260,
        height: 340,
        zoom: 0.78,
        fov: 40,
        renderPaused: true,
      });
      viewer.autoRotate = !calm;
      viewer.autoRotateSpeed = 0.6;
      const idle = () => (calm ? null : new IdleAnimation());
      viewer.animation = idle();
      viewer.controls.enableZoom = false;
      viewer.loadSkin(`https://mc-heads.net/skin/${username}`).catch(() => setFailed(true));

      // Grass block under the feet (the model's soles sit at y = -16)
      const style = getComputedStyle(document.documentElement);
      const top = new THREE.MeshLambertMaterial({ color: style.getPropertyValue("--accent").trim() });
      const dirt = new THREE.MeshLambertMaterial({ color: "#5b4532" });
      const block = new THREE.Mesh(new THREE.BoxGeometry(14, 4, 14), [dirt, dirt, top, dirt, dirt, dirt]);
      block.position.y = -18;
      // skinview3d ships its own copy of the three typings; at runtime it is the same three
      (viewer.scene as unknown as InstanceType<typeof THREE.Scene>).add(block);

      // Only render while the section is on screen
      const io = new IntersectionObserver(([entry]) => {
        viewer.renderPaused = !entry.isIntersecting;
      });
      io.observe(el);

      let waving: ReturnType<typeof setTimeout> | undefined;
      const enter = () => {
        if (!calm && !waving) viewer.animation = new WalkingAnimation();
      };
      const leave = () => {
        if (!waving) viewer.animation = idle();
      };
      const click = () => {
        if (calm) return;
        clearTimeout(waving);
        viewer.animation = new WaveAnimation();
        waving = setTimeout(() => {
          waving = undefined;
          viewer.animation = el.matches(":hover") ? new WalkingAnimation() : idle();
        }, 1800);
      };
      el.addEventListener("pointerenter", enter);
      el.addEventListener("pointerleave", leave);
      el.addEventListener("click", click);

      // Easter egg: a hop in time with the voxel blast
      let hop = 0;
      const offWake = onSceneWake(() => {
        if (calm || performance.now() - sceneState.burstAt > 100) return;
        cancelAnimationFrame(hop);
        const start = performance.now();
        const step = () => {
          const p = (performance.now() - start) / 700;
          viewer.playerWrapper.position.y = p < 1 ? Math.sin(Math.PI * p) * 6 : 0;
          if (p < 1) hop = requestAnimationFrame(step);
        };
        step();
      });

      dispose = () => {
        io.disconnect();
        offWake();
        cancelAnimationFrame(hop);
        clearTimeout(waving);
        el.removeEventListener("pointerenter", enter);
        el.removeEventListener("pointerleave", leave);
        el.removeEventListener("click", click);
        block.geometry.dispose();
        top.dispose();
        dirt.dispose();
        // skinview3d's dispose() still reaches for fxaaPass.fsQuad, which our newer
        // three renamed to _fsQuad; alias it so cleanup on navigation doesn't throw
        const pass = viewer.fxaaPass as unknown as { fsQuad?: unknown; _fsQuad?: unknown };
        pass.fsQuad ??= pass._fsQuad;
        if (!viewer.disposed) viewer.dispose();
      };
    });
    return () => {
      disposed = true;
      dispose();
    };
  }, [live, calm, username]);

  if (failed) return null;
  if (!live) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={phone ? `https://mc-heads.net/avatar/${username}/96` : `https://mc-heads.net/body/${username}/150`}
        alt={username}
        width={phone ? 96 : 150}
        height={phone ? 96 : 300}
        className="h-auto [image-rendering:pixelated]"
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <>
      <canvas ref={canvas} className="cursor-grab active:cursor-grabbing" aria-label={username} />
      <figcaption className="font-mono text-[11px] text-muted">↻ {hint}</figcaption>
    </>
  );
}
