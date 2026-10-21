"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import type { Day } from "@/lib/contributions";
import { usePhone } from "@/lib/media";
import { claimOverlay } from "@/lib/scene";
import { site } from "@/lib/site";
import { cityViewStore, useCityView, useRenderMode, type CityView } from "@/lib/store";
import type { Hover } from "./City";

const City = dynamic(() => import("./City"), { ssr: false });

// GitHub's profile page filtered to a single day of activity
const dayUrl = (date: string) => `https://github.com/${site.github}?tab=overview&from=${date}&to=${date}`;

const toggle =
  "border border-line px-2 py-0.5 font-mono text-[11px] uppercase transition-colors hover:border-fg hover:text-fg aria-pressed:border-fg aria-pressed:bg-fg aria-pressed:text-bg";

// Flat or 3D, for this section only; the rest of the site stays in 3D
function ViewSwitch({ view }: { view: CityView }) {
  const t = useTranslations("activity");
  return (
    <div className="flex gap-1" role="group" aria-label={t("view")}>
      {(["2d", "3d"] as const).map((v) => (
        <button key={v} type="button" aria-pressed={view === v} onClick={() => cityViewStore.set(v)} className={toggle}>
          {v}
        </button>
      ))}
    </div>
  );
}

// 3D city on desktop in full mode, unless switched to flat here; phones and
// lite mode keep the flat calendar
export function ContributionCity({
  weeks,
  max,
  children,
}: {
  weeks: (Day | null)[][];
  max: number;
  children: ReactNode;
}) {
  const t = useTranslations("activity");
  const mode = useRenderMode();
  const phone = usePhone();
  const [hovered, setHovered] = useState<Hover | null>(null);
  const view = useCityView();
  const available = !phone && mode === "full";
  const live = available && view === "3d";
  useEffect(() => (live ? claimOverlay() : undefined), [live]);

  if (!available) return children;
  if (!live)
    return (
      <div>
        {children}
        <div className="mt-3 flex items-center justify-end">
          <ViewSwitch view={view} />
        </div>
      </div>
    );
  return (
    <div>
      <City
        weeks={weeks}
        max={max}
        onHover={setHovered}
        onPick={(day) => open(dayUrl(day.date), "_blank", "noopener")}
      />
      {/* Tooltip next to the cursor. It goes to the body so it sits above the
          shared 3D layer whatever stacking contexts the section creates */}
      {hovered &&
        createPortal(
          <p
            className="pointer-events-none fixed z-40 -translate-x-1/2 -translate-y-[calc(100%+12px)] border border-line bg-bg/90 px-2.5 py-1.5 font-mono text-xs whitespace-nowrap text-muted backdrop-blur"
            style={{ left: hovered.x, top: hovered.y }}
          >
            <span className="text-fg">{hovered.day.date}</span> · {t("day", { count: hovered.day.count })}
          </p>,
          document.body,
        )}
      <div className="mt-3 flex items-center justify-between gap-4">
        <p className="font-mono text-xs text-muted">↻ {t("hint")}</p>
        <ViewSwitch view={view} />
      </div>
    </div>
  );
}
