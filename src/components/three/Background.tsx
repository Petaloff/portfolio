"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";
import { usePathname } from "@/i18n/navigation";
import { useRenderMode } from "@/lib/store";
import { LiteVoxels } from "./LiteVoxels";

const VoxelScene = dynamic(() => import("./VoxelScene"), { ssr: false });

function subscribeScroll(onChange: () => void) {
  addEventListener("scroll", onChange, { passive: true });
  return () => removeEventListener("scroll", onChange);
}
const pastHero = () => scrollY > innerHeight * 0.9;

// Phones get no 3D at all; the hero shows a plain wordmark there instead
const phoneQuery = "(max-width: 767px)";
function subscribePhone(onChange: () => void) {
  const mq = matchMedia(phoneQuery);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}
const isPhone = () => matchMedia(phoneQuery).matches;

// The voxel name lives at the top of the home page only
export function Background({ name }: { name: string }) {
  const mode = useRenderMode();
  const pathname = usePathname();
  const hidden = useSyncExternalStore(subscribeScroll, pastHero, () => false);
  const phone = useSyncExternalStore(subscribePhone, isPhone, () => true);
  if (pathname !== "/" || phone) return null;

  return (
    <div
      className={`pointer-events-none fixed inset-0 -z-10 transition-opacity duration-500 ${hidden ? "opacity-0" : ""}`}
      aria-hidden
    >
      {mode === "full" ? <VoxelScene name={name} /> : <LiteVoxels />}
    </div>
  );
}
