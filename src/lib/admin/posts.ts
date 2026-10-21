import type { Locale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import { SLUG } from "./projects";

// A blog post written in the admin panel. The body is Markdown; a post with
// the slug of an MDX file in content/blog replaces that file on the site
export type StoredPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  lang: Locale;
  tags: string[];
  body: string;
  draft?: true;
};

export type PostError = "slug" | "title" | "description" | "date" | "lang" | "body" | "duplicate";

type Fields = { get(name: string): FormDataEntryValue | null };

const text = (form: Fields, name: string) => String(form.get(name) ?? "").trim();

// Builds a post from the admin form, or says which field is wrong
export function parsePost(form: Fields): { post: StoredPost } | { error: PostError } {
  const slug = text(form, "slug").toLowerCase();
  if (!SLUG.test(slug) || slug.length > 64) return { error: "slug" };
  const title = text(form, "title");
  if (!title || title.length > 120) return { error: "title" };
  const description = text(form, "description");
  if (!description || description.length > 300) return { error: "description" };
  const date = text(form, "date");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) return { error: "date" };
  const lang = text(form, "lang") as Locale;
  if (!routing.locales.includes(lang)) return { error: "lang" };
  const body = String(form.get("body") ?? "")
    .replace(/\r\n/g, "\n")
    .trim();
  if (!body || body.length > 100_000) return { error: "body" };

  const tags = [
    ...new Set(
      text(form, "tags")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    ),
  ];

  return {
    post: { slug, title, description, date, lang, tags, body, ...(form.get("draft") === "on" && { draft: true }) },
  };
}

// Inserts or replaces by the original slug; a renamed post must not take another's slug.
// fileSlugs are the MDX posts: saving over one of them is how a file post gets edited
export function upsertPost(
  list: StoredPost[],
  post: StoredPost,
  original: string | null,
  fileSlugs: string[],
): { list: StoredPost[] } | { error: "duplicate" } {
  const taken = (slug: string) => list.some((p) => p.slug === slug) || fileSlugs.includes(slug);
  if (post.slug !== original && taken(post.slug)) return { error: "duplicate" };
  const index = original ? list.findIndex((p) => p.slug === original) : -1;
  if (index === -1) return { list: [...list, post] };
  return { list: list.map((p, i) => (i === index ? post : p)) };
}

// The Markdown body of an MDX post file, without its `export const meta` block
export function stripMeta(source: string): string {
  return source.replace(/^export const meta = \{[\s\S]*?\n\};?\s*/, "").trim();
}
