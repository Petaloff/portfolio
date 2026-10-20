import { cacheLife } from "next/cache";
import { site } from "./site";

export type Release = {
  source: "modrinth" | "github";
  project: string;
  version: string;
  title: string;
  date: string;
  url: string;
  notes: string | null;
  // Minecraft versions and loaders for mods, empty for GitHub releases
  targets: string[];
};

async function getJson<T>(url: string, headers: HeadersInit = {}): Promise<T | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": `${site.github}/portfolio`, ...headers },
      signal: AbortSignal.timeout(6000),
    });
    return res.ok ? ((await res.json()) as T) : null;
  } catch {
    return null;
  }
}

const githubHeaders: HeadersInit = process.env.GITHUB_TOKEN
  ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
  : {};

type ModrinthProject = { id: string; slug: string; title: string; versions: string[] };
type ModrinthVersion = {
  project_id: string;
  name: string;
  version_number: string;
  date_published: string;
  changelog: string | null;
  game_versions: string[];
  loaders: string[];
};
type GithubRepo = { full_name: string; name: string; fork: boolean; pushed_at: string };
type GithubRelease = {
  name: string | null;
  tag_name: string;
  published_at: string;
  html_url: string;
  body: string | null;
  draft: boolean;
};

// Strip markdown down to a short plain-text teaser
function teaser(text: string | null) {
  if (!text) return null;
  const plain = text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/[#>*_`[\]]/g, "")
    .replace(/\(https?:[^)]+\)/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return plain ? (plain.length > 180 ? `${plain.slice(0, 180)}…` : plain) : null;
}

async function modrinthReleases(): Promise<Release[]> {
  const projects = await getJson<ModrinthProject[]>(`https://api.modrinth.com/v2/user/${site.modrinth}/projects`);
  if (!projects?.length) return [];
  const ids = projects.flatMap((p) => p.versions).slice(-100);
  if (!ids.length) return [];
  const versions = await getJson<ModrinthVersion[]>(
    `https://api.modrinth.com/v2/versions?ids=${encodeURIComponent(JSON.stringify(ids))}`,
  );
  const byId = new Map(projects.map((p) => [p.id, p]));
  return (versions ?? []).flatMap((v) => {
    const project = byId.get(v.project_id);
    if (!project) return [];
    return [
      {
        source: "modrinth" as const,
        project: project.title,
        version: v.version_number,
        title: v.name,
        date: v.date_published,
        url: `https://modrinth.com/project/${project.slug}/version/${v.version_number}`,
        notes: teaser(v.changelog),
        targets: [...v.loaders, ...v.game_versions.slice(-3)],
      },
    ];
  });
}

async function githubReleases(): Promise<Release[]> {
  const repos = await getJson<GithubRepo[]>(
    `https://api.github.com/users/${site.github}/repos?per_page=100&sort=pushed`,
    githubHeaders,
  );
  // Only the most recently active repos, to stay well inside the rate limit
  const active = (repos ?? []).filter((r) => !r.fork).slice(0, 8);
  const lists = await Promise.all(
    active.map(async (repo) => {
      const releases = await getJson<GithubRelease[]>(
        `https://api.github.com/repos/${repo.full_name}/releases?per_page=5`,
        githubHeaders,
      );
      return (releases ?? [])
        .filter((r) => !r.draft)
        .map((r) => ({
          source: "github" as const,
          project: repo.name,
          version: r.tag_name,
          title: r.name || r.tag_name,
          date: r.published_at,
          url: r.html_url,
          notes: teaser(r.body),
          targets: [],
        }));
    }),
  );
  return lists.flat();
}

// Modrinth versions and GitHub releases merged into one newest-first feed
export async function getReleases(): Promise<Release[]> {
  "use cache";
  cacheLife("hours");

  const [mods, repos] = await Promise.all([modrinthReleases(), githubReleases()]);
  return [...mods, ...repos].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 50);
}
