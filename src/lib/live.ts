import { cacheLife } from "next/cache";
import { site } from "./site";

async function getJson<T>(url: string, headers: HeadersInit = {}): Promise<T | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": `${site.github}/portfolio`, ...headers },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

type GithubUser = { public_repos: number; followers: number };
type GithubRepo = { full_name: string; stargazers_count: number; fork: boolean };
type ModrinthProject = { slug: string; downloads: number };

const githubHeaders: HeadersInit = process.env.GITHUB_TOKEN
  ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
  : {};

export type LiveStats = {
  repos: number | null;
  followers: number | null;
  stars: number | null;
  downloads: number | null;
  repoStars: Record<string, number>;
  modDownloads: Record<string, number>;
};

// Refreshed at most once an hour; any failed source just shows as missing
export async function getLiveStats(): Promise<LiveStats> {
  "use cache";
  cacheLife("hours");

  const [user, repos, mods] = await Promise.all([
    getJson<GithubUser>(`https://api.github.com/users/${site.github}`, githubHeaders),
    getJson<GithubRepo[]>(`https://api.github.com/users/${site.github}/repos?per_page=100`, githubHeaders),
    getJson<ModrinthProject[]>(`https://api.modrinth.com/v2/user/${site.modrinth}/projects`),
  ]);

  const ownRepos = repos?.filter((r) => !r.fork) ?? null;

  return {
    repos: user?.public_repos ?? null,
    followers: user?.followers ?? null,
    stars: ownRepos ? ownRepos.reduce((sum, r) => sum + r.stargazers_count, 0) : null,
    downloads: mods ? mods.reduce((sum, m) => sum + m.downloads, 0) : null,
    repoStars: Object.fromEntries((ownRepos ?? []).map((r) => [r.full_name.toLowerCase(), r.stargazers_count])),
    modDownloads: Object.fromEntries((mods ?? []).map((m) => [m.slug, m.downloads])),
  };
}
