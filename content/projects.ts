// Default entries, used until projects are edited in the admin panel (then they
// live in Redis). `caseStudy: true` means the project has its own page: either
// content/projects/<slug>.<locale>.mdx files or a `story` written in the admin.
// A project can belong to several categories, e.g. a Discord bot with a web dashboard
export type ProjectCategory = "discord" | "minecraft" | "web";

export type Project = {
  slug: string;
  categories: ProjectCategory[];
  title: string;
  summary: { ru: string; en: string };
  tags: string[];
  year: number;
  repo?: string; // "owner/name" on GitHub, used for live stars
  modrinth?: string; // Modrinth project slug, used for live downloads
  url?: string;
  caseStudy?: boolean;
  story?: { ru: string; en: string }; // plain text case study, paragraphs split by blank lines
};

export const projects: Project[] = [
  {
    slug: "example-bot",
    categories: ["discord"],
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
    categories: ["minecraft"],
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
    categories: ["minecraft"],
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
    categories: ["web"],
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
