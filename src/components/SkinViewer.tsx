"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const phoneQuery = "(max-width: 767px)";
function subscribePhone(onChange: () => void) {
  const mq = matchMedia(phoneQuery);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

// Rotating 3D skin on desktop; phones get a flat head render instead of 3D
export function SkinViewer({ username }: { username: string }) {
  const phone = useSyncExternalStore(
    subscribePhone,
    () => matchMedia(phoneQuery).matches,
    () => true,
  );
  const canvas = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (phone || !canvas.current) return;
    let disposed = false;
    let dispose = () => {};
    import("skinview3d").then(({ SkinViewer, IdleAnimation }) => {
      if (disposed || !canvas.current) return;
      const viewer = new SkinViewer({
        canvas: canvas.current,
        width: 260,
        height: 340,
        zoom: 0.85,
        fov: 40,
      });
      viewer.autoRotate = true;
      viewer.autoRotateSpeed = 0.6;
      viewer.animation = new IdleAnimation();
      viewer.controls.enableZoom = false;
      viewer.loadSkin(`https://mc-heads.net/skin/${username}`).catch(() => setFailed(true));
      // skinview3d's dispose() still reaches for fxaaPass.fsQuad, which our newer
      // three renamed to _fsQuad; alias it so cleanup on navigation doesn't throw
      const pass = viewer.fxaaPass as unknown as { fsQuad?: unknown; _fsQuad?: unknown };
      pass.fsQuad ??= pass._fsQuad;
      dispose = () => {
        if (!viewer.disposed) viewer.dispose();
      };
    });
    return () => {
      disposed = true;
      dispose();
    };
  }, [phone, username]);

  if (failed) return null;
  if (phone) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`https://mc-heads.net/avatar/${username}/96`}
        alt={username}
        width={96}
        height={96}
        className="[image-rendering:pixelated]"
        onError={() => setFailed(true)}
      />
    );
  }
  return <canvas ref={canvas} className="cursor-grab active:cursor-grabbing" aria-label={username} />;
}
