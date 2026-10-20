"use client";

import { useTranslations } from "next-intl";
import { usePresence, type DiscordStatus as Status } from "@/lib/lanyard";

const colors: Record<Status, string> = {
  online: "bg-emerald-400",
  idle: "bg-amber-400",
  dnd: "bg-rose-500",
  offline: "bg-muted",
};

// Live presence via Lanyard (requires joining discord.gg/lanyard once)
export function DiscordStatus() {
  const t = useTranslations("discord");
  const presence = usePresence();

  // Hidden until Lanyard answers, so a missing status never looks broken
  if (!presence) return null;
  const { status } = presence;
  return (
    <span className="inline-flex items-center gap-2 font-mono text-xs text-muted">
      <span className={`h-2 w-2 ${colors[status]}`} />
      Discord: {t(status)}
      {presence.activity && <span className="text-fg">· {presence.activity}</span>}
    </span>
  );
}
