"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";
import { usePathname } from "@/i18n/navigation";
import { backdropFormations, sceneState, subscribeFormation } from "@/lib/scene";
import { useRenderMode } from "@/lib/store";
import { LiteVoxels } from "./LiteVoxels";

const VoxelScene = dynamic(() => import("./VoxelScene"), { ssr: false });

const getFormation = () => sceneState.formation;

// The scene lives on the home page only; inner pages are for reading
export function Background({ name }: { name: string }) {
  const mode = useRenderMode();
  const pathname = usePathname();
  const formation = useSyncExternalStore(subscribeFormation, getFormation, getFormation);
  if (pathname !== "/") return null;

  const hero = formation === "name";
  const backdrop = backdropFormations.includes(formation);
  return (
    <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
      {mode === "full" ? (
        <div
          className={`h-full w-full transition-opacity duration-700 ${
            backdrop ? "opacity-10" : hero ? "opacity-100" : "opacity-25 md:opacity-100"
          }`}
        >
          <VoxelScene name={name} />
        </div>
      ) : (
        <div className={`transition-opacity duration-700 ${hero ? "opacity-100" : "opacity-0"}`}>
          <LiteVoxels />
        </div>
      )}
    </div>
  );
}
