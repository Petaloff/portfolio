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

// Works with both the Upstash integration on Vercel (KV_*) and a plain
// Upstash database (UPSTASH_*)
const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
export const redis = url && token ? new Redis({ url, token }) : null;
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
