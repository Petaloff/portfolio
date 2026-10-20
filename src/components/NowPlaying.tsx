"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { usePresence } from "@/lib/lanyard";

// Current Spotify track from Lanyard, with a live progress bar
export function NowPlaying() {
  const t = useTranslations("now");
  const spotify = usePresence()?.spotify ?? null;
  // Ticks only once a track is known, so prerendering never reads the clock
  const [now, setNow] = useState(0);

  useEffect(() => {
    if (!spotify) return;
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, [spotify]);

  if (!spotify) {
    return <p className="font-mono text-sm text-muted">♪ {t("silence")}</p>;
  }
  const progress = Math.min(1, Math.max(0, (now - spotify.start) / (spotify.end - spotify.start)));
  return (
    <a
      href={`https://open.spotify.com/track/${spotify.trackId}`}
      target="_blank"
      rel="noreferrer"
      className="group flex items-center gap-4 border border-line bg-bg/70 p-3 transition-colors hover:border-accent"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={spotify.albumArt} alt={spotify.album} width={64} height={64} className="h-16 w-16" />
      <span className="min-w-0 flex-1">
        <span className="block font-mono text-[11px] uppercase tracking-wider text-accent">♪ {t("listening")}</span>
        <span className="block truncate font-medium group-hover:text-accent">{spotify.song}</span>
        <span className="block truncate text-sm text-muted">{spotify.artist}</span>
        <span className="mt-2 block h-0.5 bg-line">
          <span className="block h-full bg-accent" style={{ width: `${progress * 100}%` }} />
        </span>
      </span>
    </a>
  );
}
