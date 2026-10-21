"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { Component, useEffect, useState, type ReactNode } from "react";
import { usePathname } from "@/i18n/navigation";
import { usePhone } from "@/lib/media";
import { modeStore, useRenderMode } from "@/lib/store";
import { IsoCubes, isoViewBox } from "./IsoCubes";
import { models } from "./voxelArt";

const VoxelScene = dynamic(() => import("./VoxelScene"), { ssr: false });

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

// While the WebGL chunk loads, a flat voxel block bobs where the name will
// appear; it fades out once the scene has drawn its first frame
function Placeholder() {
  const { voxels, accent } = models.grass;
  return (
    <svg viewBox={isoViewBox(voxels)} className="absolute top-[14%] left-1/2 w-40 -translate-x-1/2 opacity-40">
      <IsoCubes cubes={voxels} accent={(v) => accent[voxels.indexOf(v)]} float />
    </svg>
  );
}

function FullScene({ name, skin, onFail }: { name: string; skin?: string; onFail: () => void }) {
  const [ready, setReady] = useState(false);
  const [gone, setGone] = useState(false);
  return (
    <>
      <div className={`absolute inset-0 transition-opacity duration-700 ${ready ? "" : "opacity-0"}`}>
        <SceneBoundary onFail={onFail}>
          <VoxelScene name={name} skin={skin} onReady={() => setReady(true)} onFail={onFail} />
        </SceneBoundary>
      </div>
      {!gone && (
        <div
          className={`absolute inset-0 transition-opacity duration-700 ${ready ? "opacity-0" : ""}`}
          onTransitionEnd={(e) => ready && e.target === e.currentTarget && setGone(true)}
        >
          <Placeholder />
        </div>
      )}
    </>
  );
}

// The voxel name lives on the home page only, in 3D. It stays for the whole
// page and changes shape with the sections. The light version's cluster is
// part of the hero itself (LiteVoxels), so it scrolls away with it
// skin is the Minecraft username whose head the "about" figure wears
export function Background({ name, skin }: { name: string; skin?: string }) {
  const t = useTranslations("mode");
  const mode = useRenderMode();
  const pathname = usePathname();
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

  if (pathname !== "/" || phone || mode !== "full") return notice || null;

  return (
    <>
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
        <FullScene name={name} skin={skin} onFail={fail} />
      </div>
      {notice}
    </>
  );
}
