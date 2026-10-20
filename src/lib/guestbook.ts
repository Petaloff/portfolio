import { Redis } from "@upstash/redis";
import { cacheLife, cacheTag } from "next/cache";

export type Entry = {
  id: string;
  name: string;
  image: string | null;
  provider: "github" | "discord";
  text: string;
  at: number;
};

export const MAX_LENGTH = 280;
const KEY = "guestbook";
const KEEP = 200;

// First variable whose name ends with the suffix: the Vercel integration may
// add a custom prefix such as STORAGE_KV_REST_API_URL
function envBySuffix(suffix: string) {
  const key = Object.keys(process.env).find((k) => k.endsWith(suffix) && !k.includes("READ_ONLY"));
  return key ? process.env[key] : undefined;
}

// An Upstash REDIS_URL (rediss://default:<token>@<host>:6379) carries
// everything the REST client needs too
function fromRedisUrl() {
  const raw = envBySuffix("REDIS_URL") ?? envBySuffix("KV_URL");
  if (!raw) return null;
  try {
    const u = new URL(raw);
    return u.hostname.endsWith(".upstash.io") && u.password
      ? { url: `https://${u.hostname}`, token: decodeURIComponent(u.password) }
      : null;
  } catch {
    return null;
  }
}

// Works with the Upstash integration on Vercel (KV_*), a plain Upstash
// database (UPSTASH_*) or just an Upstash REDIS_URL
function storageConfig() {
  const url = envBySuffix("KV_REST_API_URL") ?? envBySuffix("UPSTASH_REDIS_REST_URL");
  const token = envBySuffix("KV_REST_API_TOKEN") ?? envBySuffix("UPSTASH_REDIS_REST_TOKEN");
  return url && token ? { url, token } : fromRedisUrl();
}

const config = storageConfig();
export const redis = config ? new Redis(config) : null;
export const storageEnabled = !!redis;

export async function getEntries(): Promise<Entry[]> {
  "use cache";
  cacheTag(KEY);
  cacheLife("minutes");
  if (!redis) return [];
  try {
    return await redis.lrange<Entry>(KEY, 0, KEEP - 1);
  } catch {
    return [];
  }
}

export async function addEntry(entry: Entry) {
  await redis!.lpush(KEY, entry);
  await redis!.ltrim(KEY, 0, KEEP - 1);
}

// One entry per visitor per minute
export async function allowPost(userId: string) {
  return (await redis!.set(`${KEY}:rate:${userId}`, 1, { nx: true, ex: 60 })) === "OK";
}

export async function removeEntry(id: string) {
  const entries = await redis!.lrange<Entry>(KEY, 0, KEEP - 1);
  const entry = entries.find((e) => e.id === id);
  if (entry) await redis!.lrem(KEY, 1, entry);
}
