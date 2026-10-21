// The admin panel belongs to one GitHub account. The numeric id is checked,
// not the login, because a login can be renamed and then claimed by someone else.
// ADMIN_GITHUB_IDS (comma separated) overrides the default
const DEFAULT_OWNER_IDS = ["106511545"];

export function ownerIds(env: string | undefined = process.env.ADMIN_GITHUB_IDS): string[] {
  const ids = (env ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter((id) => /^\d+$/.test(id));
  return ids.length > 0 ? ids : DEFAULT_OWNER_IDS;
}

export function isOwner(provider: string | undefined, uid: string | undefined, ids = ownerIds()): boolean {
  return provider === "github" && !!uid && ids.includes(uid);
}
