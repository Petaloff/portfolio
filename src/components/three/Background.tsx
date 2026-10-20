"use client";

import dynamic from "next/dynamic";
import { useRenderMode } from "@/lib/store";
import { LiteVoxels } from "./LiteVoxels";

const VoxelScene = dynamic(() => import("./VoxelScene"), { ssr: false });

export function Background({ name }: { name: string }) {
  const mode = useRenderMode();
  return (
    <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
      {mode === "full" ? (
        <div className="h-full w-full opacity-70 md:opacity-100">
          <VoxelScene name={name} />
        </div>
      ) : (
        <LiteVoxels />
      )}
    </div>
  );
}
