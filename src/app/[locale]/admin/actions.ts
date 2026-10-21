"use server";

import { refresh as refreshRouter, revalidatePath, updateTag } from "next/cache";
import { signIn, signOut } from "@/auth";
import type { Locale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import { requireOwner } from "@/lib/admin/guard";
import { addUser, parseLogin } from "@/lib/admin/maintenance";
import { diffOverrides, flatten, invalidMessages } from "@/lib/admin/messages";
import { parsePost, upsertPost, type PostError } from "@/lib/admin/posts";
import { parseProject, upsertProject, type ProjectError } from "@/lib/admin/projects";
import {
  defaultMessages,
  getProjectList,
  getStoredPosts,
  resetProjectList,
  saveLegal,
  saveMessageOverrides,
  saveProjectList,
  saveStoredPosts,
  TAGS,
} from "@/lib/cms";
import { getPostFileSlugs } from "@/lib/content";
import { clearEntries, removeEntry } from "@/lib/guestbook";
import { LEGAL_DOCS, type LegalDoc } from "@/lib/legal";
import { getMaintenance, saveMaintenance } from "@/lib/maintenance";
import { storageEnabled } from "@/lib/redis";

export type AdminState = {
  ok?: true;
  error?: ProjectError | PostError | "storage" | "icu" | "input" | "login" | "github";
  keys?: string[];
} | null;

const asLocale = (value: FormDataEntryValue | null): Locale | null =>
  routing.locales.includes(value as Locale) ? (value as Locale) : null;

// Expires the data and every prerendered page built from it: texts show up on
// all pages, and admin edits are rare enough that a full refresh is cheap
function refresh(tag: string) {
  updateTag(tag);
  revalidatePath("/", "layout");
}

// No bound arguments: binding encrypts them with a random IV, which Cache
// Components refuses while prerendering the sign-in screen
export async function adminLogin() {
  await signIn("github", { redirectTo: "/admin" });
}

export async function adminLogout() {
  await signOut({ redirectTo: "/" });
}

async function guard(): Promise<AdminState> {
  await requireOwner();
  return storageEnabled ? null : { error: "storage" };
}

export async function saveProject(_: AdminState, form: FormData): Promise<AdminState> {
  const blocked = await guard();
  if (blocked) return blocked;
  const parsed = parseProject(form);
  if ("error" in parsed) return { error: parsed.error };
  const original = String(form.get("original") ?? "") || null;
  const result = upsertProject(await getProjectList(), parsed.project, original);
  if ("error" in result) return { error: result.error };
  await saveProjectList(result.list);
  refresh(TAGS.projects);
  return { ok: true };
}

export async function deleteProject(slug: string): Promise<AdminState> {
  const blocked = await guard();
  if (blocked) return blocked;
  await saveProjectList((await getProjectList()).filter((p) => p.slug !== slug));
  refresh(TAGS.projects);
  return { ok: true };
}

export async function resetProjects(): Promise<AdminState> {
  const blocked = await guard();
  if (blocked) return blocked;
  await resetProjectList();
  refresh(TAGS.projects);
  return { ok: true };
}

export async function savePost(_: AdminState, form: FormData): Promise<AdminState> {
  const blocked = await guard();
  if (blocked) return blocked;
  const parsed = parsePost(form);
  if ("error" in parsed) return { error: parsed.error };
  const original = String(form.get("original") ?? "") || null;
  const result = upsertPost(await getStoredPosts(), parsed.post, original, getPostFileSlugs());
  if ("error" in result) return { error: result.error };
  await saveStoredPosts(result.list);
  refresh(TAGS.posts);
  return { ok: true };
}

// Removes a post written in the admin panel; for an edited file post the file version comes back
export async function deletePost(slug: string): Promise<AdminState> {
  const blocked = await guard();
  if (blocked) return blocked;
  await saveStoredPosts((await getStoredPosts()).filter((p) => p.slug !== slug));
  refresh(TAGS.posts);
  return { ok: true };
}

export async function saveMessages(_: AdminState, form: FormData): Promise<AdminState> {
  const blocked = await guard();
  if (blocked) return blocked;
  const locale = asLocale(form.get("locale"));
  if (!locale) return { error: "input" };
  const defaults = flatten(await defaultMessages(locale));
  const edited = Object.fromEntries(
    [...form.entries()].filter(([key]) => key.startsWith("m:")).map(([key, value]) => [key.slice(2), String(value)]),
  );
  const overrides = diffOverrides(defaults, edited);
  const broken = invalidMessages(overrides);
  if (broken.length > 0) return { error: "icu", keys: broken };
  await saveMessageOverrides(locale, overrides);
  refresh(TAGS.messages);
  return { ok: true };
}

export async function resetMessages(locale: Locale): Promise<AdminState> {
  const blocked = await guard();
  if (blocked) return blocked;
  if (!asLocale(locale)) return { error: "input" };
  await saveMessageOverrides(locale, {});
  refresh(TAGS.messages);
  return { ok: true };
}

export async function saveLegalDoc(_: AdminState, form: FormData): Promise<AdminState> {
  const blocked = await guard();
  if (blocked) return blocked;
  const doc = String(form.get("doc")) as LegalDoc;
  const locale = asLocale(form.get("locale"));
  const text = String(form.get("text") ?? "");
  if (!LEGAL_DOCS.includes(doc) || !locale || text.length > 20_000) return { error: "input" };
  await saveLegal(doc, locale, text.replace(/\r\n/g, "\n"));
  refresh(TAGS.legal);
  return { ok: true };
}

export async function deleteGuestbookEntry(id: string): Promise<AdminState> {
  const blocked = await guard();
  if (blocked) return blocked;
  await removeEntry(id);
  refresh("guestbook");
  return { ok: true };
}

export async function clearGuestbook(): Promise<AdminState> {
  const blocked = await guard();
  if (blocked) return blocked;
  await clearEntries();
  refresh("guestbook");
  return { ok: true };
}

// The proxy reads the switch on every request, nothing prerendered needs to change
export async function setMaintenance(enabled: boolean): Promise<AdminState> {
  const blocked = await guard();
  if (blocked) return blocked;
  await saveMaintenance({ ...(await getMaintenance({ fresh: true })), enabled });
  refreshRouter();
  return { ok: true };
}

// The login is turned into the numeric GitHub id here, which is what the check compares
export async function addMaintenanceUser(_: AdminState, form: FormData): Promise<AdminState> {
  const blocked = await guard();
  if (blocked) return blocked;
  const login = parseLogin(form.get("login"));
  if (!login) return { error: "login" };
  const res = await fetch(`https://api.github.com/users/${login}`, {
    headers: process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {},
    cache: "no-store",
  }).catch(() => null);
  if (!res?.ok) return { error: res?.status === 404 ? "login" : "github" };
  const user = (await res.json()) as { id: number; login: string };
  const config = await getMaintenance({ fresh: true });
  await saveMaintenance({ ...config, allow: addUser(config.allow, { id: String(user.id), login: user.login }) });
  refreshRouter();
  return { ok: true };
}

export async function removeMaintenanceUser(id: string): Promise<AdminState> {
  const blocked = await guard();
  if (blocked) return blocked;
  const config = await getMaintenance({ fresh: true });
  await saveMaintenance({ ...config, allow: config.allow.filter((u) => u.id !== id) });
  refreshRouter();
  return { ok: true };
}
