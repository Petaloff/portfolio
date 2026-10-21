"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { usePhone } from "@/lib/media";
import { claimOverlay } from "@/lib/scene";
import { useRenderMode } from "@/lib/store";
import type { ProjectCategory } from "../../content/projects";
import { IsoCubes, isoViewBox } from "./three/IsoCubes";
import { models, type ModelName } from "./three/voxelArt";

const CoverView = dynamic(() => import("./three/CoverView"), { ssr: false });

const byCategory: Record<ProjectCategory, ModelName> = {
  minecraft: "grass",
  discord: "bubble",
  web: "code",
};

// A small voxel emblem per project, picked by its first category. In 3D it
// assembles from scattered cubes and turns after the cursor while the card is
// hovered; elsewhere (and while the 3D chunk loads) it is a flat isometric drawing
export function ProjectCover({ category }: { category: ProjectCategory }) {
  const mode = useRenderMode();
  const phone = usePhone();
  const [ready, setReady] = useState(false);
  const name = byCategory[category];
  const { voxels, accent } = models[name];
  const live = mode === "full" && !phone;
  useEffect(() => (live ? claimOverlay() : undefined), [live]);

  return (
    <div className="relative size-14 shrink-0 md:size-16" aria-hidden>
      {!(live && ready) && (
        <svg viewBox={isoViewBox(voxels, 10)} className="h-full w-full">
          <IsoCubes cubes={voxels} size={10} accent={(v) => accent[voxels.indexOf(v)]} />
        </svg>
      )}
      {live && <CoverView model={name} onReady={() => setReady(true)} />}
    </div>
  );
}
