import { cacheLife, cacheTag } from "next/cache";

// Set MC_SERVER_ADDRESS (e.g. play.example.net) once the server exists
export const serverAddress = process.env.MC_SERVER_ADDRESS || null;
// Whose skin the site wears; NEXT_PUBLIC_MC_USERNAME overrides it
export const mcUsername = process.env.NEXT_PUBLIC_MC_USERNAME || "Petaloff";

// Expired by the «обновить скин» button in the admin panel
export const SKIN_TAG = "mc-skin";

// url is the skin texture itself, id is what mc-heads.net renders accept. Both
// change with the skin, so browsers and CDNs never hold on to an old one
export type Skin = { name: string; id: string; url: string; slim: boolean };

// Used when Mojang can't be reached: mc-heads caches by name for a while
export const fallbackSkin = (name: string): Skin => ({
  name,
  id: name,
  url: `https://mc-heads.net/skin/${encodeURIComponent(name)}`,
  slim: false,
});

// Texture hashes are hex; anything else is not passed on to a URL
export const isTextureHash = (hash: string) => /^[0-9a-f]{32,64}$/.test(hash);

// The "textures" property of a Mojang profile is base64 JSON that points at
// textures.minecraft.net/texture/<hash>
export function skinFromTextures(name: string, value: string): Skin | null {
  try {
    const data = JSON.parse(Buffer.from(value, "base64").toString("utf8")) as {
      textures?: { SKIN?: { url?: string; metadata?: { model?: string } } };
    };
    const skin = data.textures?.SKIN;
    const hash = skin?.url?.split("/texture/")[1];
    if (!hash || !isTextureHash(hash)) return null;
    return { name, id: hash, url: `/api/skin/${hash}`, slim: skin?.metadata?.model === "slim" };
  } catch {
    return null;
  }
}

async function lookupSkin(name: string): Promise<Skin> {
  const init = { headers: { "User-Agent": "Petaloff/portfolio" }, signal: AbortSignal.timeout(5000) };
  const user = await fetch(`https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(name)}`, init);
  if (!user.ok) throw new Error(`mojang ${user.status}`);
  const { id } = (await user.json()) as { id: string };
  const profile = await fetch(`https://sessionserver.mojang.com/session/minecraft/profile/${id}`, init);
  if (!profile.ok) throw new Error(`sessionserver ${profile.status}`);
  const { properties } = (await profile.json()) as { properties?: { name: string; value: string }[] };
  const textures = properties?.find((p) => p.name === "textures")?.value;
  const skin = textures && skinFromTextures(name, textures);
  if (!skin) throw new Error("no skin");
  return skin;
}

// Checked against Mojang once an hour, or right away from the admin panel.
// A failed lookup falls back to the name and is only kept for a few minutes
export async function getSkin(): Promise<Skin> {
  "use cache";
  cacheLife("hours");
  cacheTag(SKIN_TAG);
  try {
    return await lookupSkin(mcUsername);
  } catch {
    cacheLife("minutes");
    return fallbackSkin(mcUsername);
  }
}

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
