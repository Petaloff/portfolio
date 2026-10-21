"use client";

import dynamic from "next/dynamic";
import { usePhone } from "@/lib/media";
import { useOverlayViews } from "@/lib/scene";
import { useRenderMode } from "@/lib/store";

const OverlayCanvas = dynamic(() => import("./OverlayCanvas"), { ssr: false });

// One shared WebGL canvas above the page for every small 3D piece inside the
// content (the contribution city, project covers). They draw into it through
// drei Views, so the page holds a single context however many of them there
// are, and pages without any get no canvas at all
export function Overlay() {
  const mode = useRenderMode();
  const phone = usePhone();
  const views = useOverlayViews();
  if (mode !== "full" || phone || views === 0) return null;
  return <OverlayCanvas />;
}
