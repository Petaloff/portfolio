"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import type { Day } from "@/lib/contributions";
import { usePhone } from "@/lib/media";
import { claimOverlay } from "@/lib/scene";
import { site } from "@/lib/site";
import { useRenderMode } from "@/lib/store";
import type { Hover } from "./City";

const City = dynamic(() => import("./City"), { ssr: false });

// GitHub's profile page filtered to a single day of activity
const dayUrl = (date: string) => `https://github.com/${site.github}?tab=overview&from=${date}&to=${date}`;

// 3D city on desktop in full mode; phones and lite mode keep the flat calendar
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
  const live = !phone && mode === "full";
  useEffect(() => (live ? claimOverlay() : undefined), [live]);

  if (!live) return children;
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
      <p className="mt-3 h-5 font-mono text-xs text-muted">↻ {t("hint")}</p>
    </div>
  );
}
