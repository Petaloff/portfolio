import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { ComponentType } from "react";
import type { Project } from "../../content/projects";
import type { Locale } from "@/i18n/routing";
import { getProjectList } from "./cms";

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

export function getPostSlugs(): string[] {
  return fs
    .readdirSync(BLOG_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""));
}

export async function getPost(slug: string) {
  if (!getPostSlugs().includes(slug)) return null;
  const mod: MdxModule<PostMeta> = await import(`../../content/blog/${slug}.mdx`);
  return { slug, ...(mod.meta as PostMeta), Content: mod.default };
}

export async function getPosts(): Promise<Post[]> {
  const posts = await Promise.all(getPostSlugs().map((slug) => getPost(slug)));
  return posts
    .filter((p) => p !== null)
    .map((post): Post => ({
      slug: post.slug,
      title: post.title,
      description: post.description,
      date: post.date,
      lang: post.lang,
      tags: post.tags,
    }))
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
