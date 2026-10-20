"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useState, useSyncExternalStore, type ReactNode } from "react";
import type { Day } from "@/lib/contributions";
import { useRenderMode } from "@/lib/store";

const City = dynamic(() => import("./City"), { ssr: false });

const phoneQuery = "(max-width: 767px)";
function subscribePhone(onChange: () => void) {
  const mq = matchMedia(phoneQuery);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

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
  const phone = useSyncExternalStore(subscribePhone, () => matchMedia(phoneQuery).matches, () => true);
  const [hovered, setHovered] = useState<Day | null>(null);

  if (phone || mode !== "full") return children;
  return (
    <div>
      <City weeks={weeks} max={max} onHover={setHovered} />
      <p className="mt-3 h-5 font-mono text-xs text-muted" aria-live="polite">
        {hovered ? (
          <>
            <span className="text-fg">{hovered.date}</span> · {t("day", { count: hovered.count })}
          </>
        ) : (
          <>↻ {t("hint")}</>
        )}
      </p>
    </div>
  );
}
