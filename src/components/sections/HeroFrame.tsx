"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { useRenderMode } from "@/lib/store";

const noop = () => () => {};

// The full-height hero leaves room for the 3D scene on desktop: the text sits
// in the middle with a slot beside it for the head. Without 3D, and always on
// phones (they never get it), the hero takes its content height
// data-intro-fade keeps the text hidden while the intro is up (see lib/intro)
export function HeroFrame({ children }: { children: ReactNode }) {
  const mode = useRenderMode();
  const hydrated = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
  const compact = hydrated && mode === "lite";
  const full = hydrated && mode === "full";
  return (
    <section
      className={`relative mx-auto flex max-w-6xl flex-col justify-end px-4 pt-28 pb-16 md:px-8 md:pb-24 ${compact ? "md:pt-40" : "md:min-h-dvh md:justify-center md:pt-32"}`}
    >
      <div data-intro-fade className="flex items-center gap-8">
        <div className="min-w-0 flex-1">{children}</div>
        {full && <div id="hero-head" aria-hidden className="hidden aspect-square w-[28%] shrink-0 md:block" />}
      </div>
    </section>
  );
}
