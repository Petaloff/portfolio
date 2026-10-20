import type { ReactNode } from "react";
import { Reveal } from "@/components/Reveal";

export function SectionTitle({ index, children }: { index: string; children: ReactNode }) {
  return (
    <Reveal className="mb-12 flex items-baseline gap-4 border-b border-line pb-4">
      <span className="font-mono text-xs text-accent">{index}</span>
      <h2 className="text-sm font-medium uppercase tracking-[0.2em] text-muted">{children}</h2>
    </Reveal>
  );
}
