import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { projects as defaultProjects, type Project } from "../../content/projects";
import type { Locale } from "@/i18n/routing";
import { applyOverrides, type FlatMessages, type MessageTree } from "./admin/messages";
import { legalDefaults, type LegalDoc } from "./legal";
import { redis } from "./redis";

// Content the owner edits in the admin panel. Each reader falls back to the
// files in the repo when Redis is not set up, empty or unreachable

export const TAGS = { projects: "projects", messages: "messages", legal: "legal" } as const;

const keys = {
  projects: "content:projects",
  messages: (locale: Locale) => `content:messages:${locale}`,
  legal: (doc: LegalDoc, locale: Locale) => `content:legal:${doc}:${locale}`,
};

async function read<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  try {
    return await redis.get<T>(key);
  } catch {
    return null;
  }
}

export async function getProjectList(): Promise<Project[]> {
  "use cache";
  cacheTag(TAGS.projects);
  cacheLife("max");
  const saved = await read<Project[]>(keys.projects);
  return Array.isArray(saved) ? saved : defaultProjects;
}

export async function saveProjectList(list: Project[]) {
  await redis!.set(keys.projects, list);
}

export async function resetProjectList() {
  await redis!.del(keys.projects);
}

export async function defaultMessages(locale: Locale): Promise<MessageTree> {
  return (await import(`../../messages/${locale}.json`)).default;
}

export async function getMessageOverrides(locale: Locale): Promise<FlatMessages> {
  "use cache";
  cacheTag(TAGS.messages);
  cacheLife("max");
  return (await read<FlatMessages>(keys.messages(locale))) ?? {};
}

export async function getMessages(locale: Locale): Promise<MessageTree> {
  return applyOverrides(await defaultMessages(locale), await getMessageOverrides(locale));
}

export async function saveMessageOverrides(locale: Locale, overrides: FlatMessages) {
  if (Object.keys(overrides).length === 0) await redis!.del(keys.messages(locale));
  else await redis!.set(keys.messages(locale), overrides);
}

export async function getLegal(doc: LegalDoc, locale: Locale): Promise<string> {
  "use cache";
  cacheTag(TAGS.legal);
  cacheLife("max");
  const saved = await read<string>(keys.legal(doc, locale));
  return typeof saved === "string" && saved.trim() ? saved : legalDefaults[doc][locale];
}

export async function saveLegal(doc: LegalDoc, locale: Locale, text: string) {
  if (!text.trim() || text === legalDefaults[doc][locale]) await redis!.del(keys.legal(doc, locale));
  else await redis!.set(keys.legal(doc, locale), text);
}
