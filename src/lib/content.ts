import "server-only";
import fs from "node:fs";
import path from "node:path";
import { evaluate } from "@mdx-js/mdx";
import type { ComponentType } from "react";
import * as runtime from "react/jsx-runtime";
import type { Project } from "../../content/projects";
import type { Locale } from "@/i18n/routing";
import { useMDXComponents } from "@/mdx-components";
import { stripMeta, type StoredPost } from "./admin/posts";
import { getProjectList, getStoredPosts } from "./cms";

export type PostMeta = {
  title: string;
  description: string;
  date: string;
  lang: Locale;
  tags: string[];
};

export type Post = PostMeta & { slug: string };

type MdxModule<T = unknown> = { default: ComponentType; meta?: T };

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

// Posts kept as MDX files in the repo
export function getPostFileSlugs(): string[] {
  return fs
    .readdirSync(BLOG_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""));
}

async function importPostFile(slug: string) {
  const mod: MdxModule<PostMeta> = await import(`../../content/blog/${slug}.mdx`);
  return { slug, ...(mod.meta as PostMeta), Content: mod.default };
}

const metaOf = ({ slug, title, description, date, lang, tags }: Post): Post => ({
  slug,
  title,
  description,
  date,
  lang,
  tags,
});

// Posts from the admin panel replace files with the same slug, and drafts stay off the site
export async function getPostSlugs(): Promise<string[]> {
  return (await getPosts()).map((p) => p.slug);
}

export async function getPost(slug: string) {
  const stored = (await getStoredPosts()).find((p) => p.slug === slug);
  if (stored) {
    if (stored.draft) return null;
    // Plain Markdown: no JSX or imports, so the text can't run code on the server
    const mod = await evaluate(stored.body, { ...runtime, format: "md", useMDXComponents });
    return { ...metaOf(stored), Content: mod.default };
  }
  return getPostFileSlugs().includes(slug) ? importPostFile(slug) : null;
}

export async function getPosts(): Promise<Post[]> {
  const stored = await getStoredPosts();
  const files = getPostFileSlugs().filter((slug) => !stored.some((p) => p.slug === slug));
  const fromFiles = await Promise.all(files.map(importPostFile));
  return [...stored.filter((p) => !p.draft), ...fromFiles].map(metaOf).sort((a, b) => b.date.localeCompare(a.date));
}

// Every post as the admin panel edits it: saved ones as they are, files as Markdown
export async function getEditablePosts(): Promise<(StoredPost & { file: boolean })[]> {
  const stored = await getStoredPosts();
  const fileSlugs = getPostFileSlugs();
  const fromFiles = await Promise.all(
    fileSlugs
      .filter((slug) => !stored.some((p) => p.slug === slug))
      .map(async (slug) => ({
        ...metaOf(await importPostFile(slug)),
        body: stripMeta(fs.readFileSync(path.join(BLOG_DIR, `${slug}.mdx`), "utf8")),
      })),
  );
  return [...stored, ...fromFiles]
    .map((p) => ({ ...p, file: fileSlugs.includes(p.slug) }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function getProjects(): Promise<Project[]> {
  return [...(await getProjectList())].sort((a, b) => b.year - a.year);
}

export async function getProject(slug: string) {
  return (await getProjectList()).find((p) => p.slug === slug) ?? null;
}

const PROJECTS_DIR = path.join(process.cwd(), "content", "projects");

// The MDX case study when there is one, otherwise the plain text story from the admin
export async function getProjectCase(slug: string, locale: Locale) {
  const project = await getProject(slug);
  if (!project?.caseStudy) return null;
  if (fs.existsSync(path.join(PROJECTS_DIR, `${slug}.${locale}.mdx`))) {
    const mod: MdxModule = await import(`../../content/projects/${slug}.${locale}.mdx`);
    return { Content: mod.default };
  }
  const story = project.story?.[locale];
  return story ? { story } : null;
}
