import { MAINTENANCE_OFF, normalizeMaintenance, type Maintenance } from "./admin/maintenance";
import { redis } from "./redis";

// Read by the proxy on every page request, so it is kept in memory for a few
// seconds; other instances pick up a change within that time
const KEY = "site:maintenance";
const TTL = 10_000;

let cached: { value: Maintenance; at: number } | null = null;

// Without Redis there is nowhere to switch it on, so the site is simply open
export async function getMaintenance({ fresh = false } = {}): Promise<Maintenance> {
  if (!redis) return MAINTENANCE_OFF;
  if (!fresh && cached && Date.now() - cached.at < TTL) return cached.value;
  try {
    const value = normalizeMaintenance(await redis.get(KEY));
    cached = { value, at: Date.now() };
    return value;
  } catch {
    // An outage should not lock everybody out, nor flip a running maintenance off for long
    return cached?.value ?? MAINTENANCE_OFF;
  }
}

export async function saveMaintenance(value: Maintenance) {
  await redis!.set(KEY, value);
  cached = { value, at: Date.now() };
}
