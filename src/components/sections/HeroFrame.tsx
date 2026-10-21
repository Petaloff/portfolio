"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { useRenderMode } from "@/lib/store";

const noop = () => () => {};

// The full-height hero leaves room for the 3D scene; without it the content
// sits right under the header on desktop. Phones keep the tall layout, where
// the nickname fills the space instead
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
      className={`relative mx-auto flex min-h-dvh max-w-6xl flex-col justify-end px-4 pt-32 pb-16 md:px-8 md:pb-24 ${compact ? "md:min-h-0 md:pt-40" : ""}`}
    >
      {children}
    </section>
  );
}
