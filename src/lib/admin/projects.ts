import type { Project, ProjectCategory } from "../../../content/projects";

export const CATEGORIES: ProjectCategory[] = ["discord", "minecraft", "web"];
export const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type ProjectError = "slug" | "title" | "summary" | "category" | "year" | "repo" | "url" | "duplicate";

type Fields = { get(name: string): FormDataEntryValue | null; getAll(name: string): FormDataEntryValue[] };

const text = (form: Fields, name: string) => String(form.get(name) ?? "").trim();

// Builds a project from the admin form, or says which field is wrong
export function parseProject(form: Fields): { project: Project } | { error: ProjectError } {
  const slug = text(form, "slug").toLowerCase();
  if (!SLUG.test(slug) || slug.length > 48) return { error: "slug" };
  const title = text(form, "title");
  if (!title || title.length > 80) return { error: "title" };
  const summary = { ru: text(form, "summary.ru"), en: text(form, "summary.en") };
  if (!summary.ru || !summary.en) return { error: "summary" };
  const categories = form
    .getAll("categories")
    .map(String)
    .filter((c): c is ProjectCategory => CATEGORIES.includes(c as ProjectCategory));
  if (categories.length === 0) return { error: "category" };
  const year = Number(text(form, "year"));
  if (!Number.isInteger(year) || year < 2000 || year > 2100) return { error: "year" };
  const repo = text(form, "repo");
  if (repo && !/^[\w.-]+\/[\w.-]+$/.test(repo)) return { error: "repo" };
  const url = text(form, "url");
  if (url && !/^https?:\/\/[^\s]+$/.test(url)) return { error: "url" };

  const tags = [
    ...new Set(
      text(form, "tags")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    ),
  ];
  const story = { ru: text(form, "story.ru"), en: text(form, "story.en") };
  const hasStory = !!(story.ru || story.en);

  return {
    project: {
      slug,
      categories,
      title,
      summary,
      tags,
      year,
      ...(repo && { repo }),
      ...(text(form, "modrinth") && { modrinth: text(form, "modrinth") }),
      ...(url && { url }),
      ...((form.get("caseStudy") === "on" || hasStory) && { caseStudy: true }),
      ...(hasStory && { story: { ru: story.ru || story.en, en: story.en || story.ru } }),
    },
  };
}

// Inserts or replaces by the original slug; a renamed project must not take another's slug
export function upsertProject(
  list: Project[],
  project: Project,
  original: string | null,
): { list: Project[] } | { error: "duplicate" } {
  const clash = list.some((p) => p.slug === project.slug && p.slug !== original);
  if (clash) return { error: "duplicate" };
  const index = original ? list.findIndex((p) => p.slug === original) : -1;
  if (index === -1) return { list: [...list, project] };
  return { list: list.map((p, i) => (i === index ? project : p)) };
}
