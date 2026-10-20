import { cacheLife } from "next/cache";

// Set MC_SERVER_ADDRESS (e.g. play.example.net) once the server exists
export const serverAddress = process.env.MC_SERVER_ADDRESS || null;
// Set NEXT_PUBLIC_MC_USERNAME to show your own skin; Steve until then
export const mcUsername = process.env.NEXT_PUBLIC_MC_USERNAME || "MHF_Steve";

export type ServerStatus =
  | { state: "planned" }
  | { state: "offline"; address: string }
  | {
      state: "online";
      address: string;
      version: string | null;
      motd: string | null;
      players: { online: number; max: number } | null;
    };

type McSrvStat = {
  online: boolean;
  version?: string;
  motd?: { clean?: string[] };
  players?: { online: number; max: number };
};

// mcsrvstat.us caches for a few minutes on its side as well
export async function getServerStatus(): Promise<ServerStatus> {
  "use cache";
  cacheLife("minutes");

  if (!serverAddress) return { state: "planned" };
  try {
    const res = await fetch(`https://api.mcsrvstat.us/3/${encodeURIComponent(serverAddress)}`, {
      headers: { "User-Agent": "Petaloff/portfolio" },
      signal: AbortSignal.timeout(5000),
    });
    const data = (await res.json()) as McSrvStat;
    if (!data.online) return { state: "offline", address: serverAddress };
    return {
      state: "online",
      address: serverAddress,
      version: data.version ?? null,
      motd: data.motd?.clean?.join(" ").trim() || null,
      players: data.players ?? null,
    };
  } catch {
    return { state: "offline", address: serverAddress };
  }
}
