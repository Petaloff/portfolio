"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { useRenderMode } from "@/lib/store";

const noop = () => () => {};

// The full-height hero leaves room for the 3D scene on desktop. Without it,
// and always on phones (they never get 3D), the hero takes its content height
export function HeroFrame({ children }: { children: ReactNode }) {
  const mode = useRenderMode();
  const hydrated = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
  const compact = hydrated && mode === "lite";
  return (
    <section
      className={`relative mx-auto flex max-w-6xl flex-col justify-end px-4 pt-28 pb-16 md:px-8 md:pb-24 ${compact ? "md:pt-40" : "md:min-h-dvh md:pt-32"}`}
    >
      {children}
    </section>
  );
}
