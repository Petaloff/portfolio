"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { site } from "@/lib/site";

type Status = "online" | "idle" | "dnd" | "offline";
type Presence = { status: Status; activity: string | null };

const colors: Record<Status, string> = {
  online: "bg-emerald-400",
  idle: "bg-amber-400",
  dnd: "bg-rose-500",
  offline: "bg-muted",
};

// Live presence via Lanyard (requires joining discord.gg/lanyard once)
export function DiscordStatus() {
  const t = useTranslations("discord");
  const [presence, setPresence] = useState<Presence | null>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch(`https://api.lanyard.rest/v1/users/${site.discordId}`);
        const json = await res.json();
        if (!alive || !json.success) return;
        const activity = json.data.activities?.find((a: { type: number }) => a.type !== 4);
        setPresence({ status: json.data.discord_status, activity: activity?.name ?? null });
      } catch {}
    };
    load();
    const id = setInterval(load, 30_000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  const status = presence?.status;
  return (
    <span className="inline-flex items-center gap-2 font-mono text-xs text-muted">
      <span className={`h-2 w-2 ${status ? colors[status] : "bg-line"}`} />
      {status ? t(status) : t("unknown")}
      {presence?.activity && <span className="text-fg">· {presence.activity}</span>}
    </span>
  );
}
