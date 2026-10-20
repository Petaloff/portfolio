// Draft entries: replace with your real projects. `caseStudy: true` means
// there are content/projects/<slug>.<locale>.mdx files with the full story.
export type ProjectKind = "bot" | "mod" | "other";

export type Project = {
  slug: string;
  kind: ProjectKind;
  title: string;
  summary: { ru: string; en: string };
  tags: string[];
  year: number;
  repo?: string; // "owner/name" on GitHub, used for live stars
  modrinth?: string; // Modrinth project slug, used for live downloads
  url?: string;
  caseStudy?: boolean;
};

export const projects: Project[] = [
  {
    slug: "example-bot",
    kind: "bot",
    title: "Example Bot",
    summary: {
      ru: "Черновик: Discord-бот для модерации и музыки. Замените на реальный проект.",
      en: "Draft: a Discord bot for moderation and music. Replace with a real project.",
    },
    tags: ["discord.js", "TypeScript", "PostgreSQL"],
    year: 2026,
    caseStudy: true,
  },
  {
    slug: "example-mod",
    kind: "mod",
    title: "Example Mod",
    summary: {
      ru: "Черновик: мод на Fabric, добавляющий новые механики. Замените на реальный проект.",
      en: "Draft: a Fabric mod that adds new mechanics. Replace with a real project.",
    },
    tags: ["Fabric", "Java", "Mixin"],
    year: 2025,
    caseStudy: true,
  },
  {
    slug: "example-plugin",
    kind: "mod",
    title: "Example Plugin",
    summary: {
      ru: "Черновик: плагин для Paper-сервера.",
      en: "Draft: a plugin for Paper servers.",
    },
    tags: ["Paper", "Kotlin"],
    year: 2025,
  },
  {
    slug: "portfolio",
    kind: "other",
    title: "Portfolio",
    summary: {
      ru: "Этот сайт: Next.js 16, React Three Fiber, GSAP и воксели.",
      en: "This site: Next.js 16, React Three Fiber, GSAP and voxels.",
    },
    tags: ["Next.js", "Three.js", "GSAP"],
    year: 2026,
    repo: "Petaloff/portfolio",
  },
];
