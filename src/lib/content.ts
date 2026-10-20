import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { ComponentType } from "react";
import { projects, type Project } from "../../content/projects";
import type { Locale } from "@/i18n/routing";

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

export function getProjects(): Project[] {
  return [...projects].sort((a, b) => b.year - a.year);
}

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug) ?? null;
}

export async function getProjectCase(slug: string, locale: Locale) {
  const project = getProject(slug);
  if (!project?.caseStudy) return null;
  const mod: MdxModule = await import(`../../content/projects/${slug}.${locale}.mdx`);
  return mod.default;
}
