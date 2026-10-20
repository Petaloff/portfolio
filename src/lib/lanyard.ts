"use client";

import { useSyncExternalStore } from "react";
import { site } from "./site";

export type DiscordStatus = "online" | "idle" | "dnd" | "offline";

export type Presence = {
  status: DiscordStatus;
  activity: string | null;
  spotify: {
    song: string;
    artist: string;
    album: string;
    albumArt: string;
    trackId: string;
    start: number;
    end: number;
  } | null;
};

type LanyardResponse = {
  success: boolean;
  data: {
    discord_status: DiscordStatus;
    activities?: { type: number; name: string }[];
    listening_to_spotify: boolean;
    spotify: {
      song: string;
      artist: string;
      album: string;
      album_art_url: string;
      track_id: string;
      timestamps: { start: number; end: number };
    } | null;
  };
};

// One shared poller for every component that shows Lanyard data
let presence: Presence | null = null;
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;

async function load() {
  try {
    const res = await fetch(`https://api.lanyard.rest/v1/users/${site.discordId}`);
    const json = (await res.json()) as LanyardResponse;
    if (!json.success) return;
    const { data } = json;
    // Type 2 is Spotify and 4 a custom status; neither counts as "playing"
    const activity = data.activities?.find((a) => a.type !== 4 && a.type !== 2);
    presence = {
      status: data.discord_status,
      activity: activity?.name ?? null,
      spotify:
        data.listening_to_spotify && data.spotify
          ? {
              song: data.spotify.song,
              artist: data.spotify.artist,
              album: data.spotify.album,
              albumArt: data.spotify.album_art_url,
              trackId: data.spotify.track_id,
              start: data.spotify.timestamps.start,
              end: data.spotify.timestamps.end,
            }
          : null,
    };
    listeners.forEach((l) => l());
  } catch {}
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!timer) {
    load();
    timer = setInterval(load, 20_000);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

export function usePresence() {
  return useSyncExternalStore(
    subscribe,
    () => presence,
    () => null,
  );
}
