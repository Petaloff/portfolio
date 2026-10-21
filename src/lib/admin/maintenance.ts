import { isOwner } from "./owner";

// Maintenance mode: while it is on, every page sends visitors to /maintenance.
// The owner and the GitHub accounts on the list may still enter the site
export type MaintenanceUser = { id: string; login: string };
export type Maintenance = { enabled: boolean; allow: MaintenanceUser[] };

export const MAINTENANCE_OFF: Maintenance = { enabled: false, allow: [] };

// Set by the «enter the site» button; the proxy still checks the session behind it
export const PASS_COOKIE = "maintenance-pass";

// Whatever is stored, the shape that comes out is always valid
export function normalizeMaintenance(saved: unknown): Maintenance {
  if (!saved || typeof saved !== "object") return MAINTENANCE_OFF;
  const { enabled, allow } = saved as Partial<Maintenance>;
  return {
    enabled: enabled === true,
    allow: Array.isArray(allow) ? allow.filter((u) => /^\d+$/.test(String(u?.id)) && typeof u.login === "string") : [],
  };
}

// Ids, not logins, for the same reason as the owner check: a login can be renamed and claimed
export function mayPass(provider: string | undefined, uid: string | undefined, config: Maintenance): boolean {
  return isOwner(provider, uid) || (provider === "github" && !!uid && config.allow.some((u) => u.id === uid));
}

// GitHub logins: letters, digits and single hyphens, up to 39 characters
export function parseLogin(value: unknown): string | null {
  const login = String(value ?? "")
    .trim()
    .replace(/^@/, "")
    .replace(/^https?:\/\/github\.com\//i, "")
    .replace(/\/$/, "");
  return /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i.test(login) ? login : null;
}

export function addUser(list: MaintenanceUser[], user: MaintenanceUser): MaintenanceUser[] {
  return [...list.filter((u) => u.id !== user.id), user];
}
