// Upstash Redis shared by the guestbook and the content edited in the admin panel
import { Redis } from "@upstash/redis";

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
