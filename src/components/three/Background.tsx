"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { Component, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { usePathname } from "@/i18n/navigation";
import { usePhone } from "@/lib/media";
import { modeStore, useRenderMode } from "@/lib/store";
import { LiteVoxels } from "./LiteVoxels";

const VoxelScene = dynamic(() => import("./VoxelScene"), { ssr: false });

function subscribeScroll(onChange: () => void) {
  addEventListener("scroll", onChange, { passive: true });
  return () => removeEventListener("scroll", onChange);
}
const pastHero = () => scrollY > innerHeight * 0.9;

// Anything thrown while setting up WebGL drops the visitor to the light version
class SceneBoundary extends Component<{ onFail: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFail();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

// While the WebGL chunk loads, the light cluster holds the spot; it fades out
// once the scene has drawn its first frame and the name starts assembling
function FullScene({ name, onFail }: { name: string; onFail: () => void }) {
  const [ready, setReady] = useState(false);
  const [gone, setGone] = useState(false);
  return (
    <>
      <div className={`absolute inset-0 transition-opacity duration-700 ${ready ? "" : "opacity-0"}`}>
        <SceneBoundary onFail={onFail}>
          <VoxelScene name={name} onReady={() => setReady(true)} onFail={onFail} />
        </SceneBoundary>
      </div>
      {!gone && (
        <div
          className={`absolute inset-0 transition-opacity duration-700 ${ready ? "opacity-0" : ""}`}
          onTransitionEnd={(e) => ready && e.target === e.currentTarget && setGone(true)}
        >
          <LiteVoxels />
        </div>
      )}
    </>
  );
}

// The voxel name lives on the home page only. In 3D it stays for the whole
// page and changes shape with the sections; the light cluster fades past the hero
export function Background({ name }: { name: string }) {
  const t = useTranslations("mode");
  const mode = useRenderMode();
  const pathname = usePathname();
  const hidden = useSyncExternalStore(subscribeScroll, pastHero, () => false);
  const phone = usePhone();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!failed) return;
    const id = setTimeout(() => setFailed(false), 6000);
    return () => clearTimeout(id);
  }, [failed]);

  const fail = () => {
    setFailed(true);
    modeStore.set("lite");
  };

  const notice = failed && (
    <p
      role="status"
      className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 border border-line bg-surface px-4 py-2 font-mono text-xs text-muted"
    >
      {t("failed")}
    </p>
  );

  if (pathname !== "/" || phone) return notice || null;

  return (
    <>
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
        {mode === "full" ? (
          <FullScene name={name} onFail={fail} />
        ) : (
          <div className={`absolute inset-0 transition-opacity duration-500 ${hidden ? "opacity-0" : ""}`}>
            <LiteVoxels />
          </div>
        )}
      </div>
      {notice}
    </>
  );
}
