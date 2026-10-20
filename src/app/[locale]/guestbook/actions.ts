"use server";

import { updateTag } from "next/cache";
import { auth, signIn, signOut } from "@/auth";
import { addEntry, allowPost, MAX_LENGTH, removeEntry } from "@/lib/guestbook";

export type PostState = { error?: "empty" | "long" | "rate" | "auth" } | null;

export async function post(_: PostState, form: FormData): Promise<PostState> {
  const session = await auth();
  if (!session) return { error: "auth" };
  const text = String(form.get("text") ?? "")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return { error: "empty" };
  if (text.length > MAX_LENGTH) return { error: "long" };
  if (!(await allowPost(session.user.id))) return { error: "rate" };

  const { name, image, provider } = session.user;
  await addEntry({ id: crypto.randomUUID(), name, image: image ?? null, provider, text, at: Date.now() });
  updateTag("guestbook");
  return null;
}

export async function remove(id: string) {
  const session = await auth();
  if (!session?.user.admin) return;
  await removeEntry(id);
  updateTag("guestbook");
}

export async function login(provider: "github" | "discord", redirectTo: string) {
  await signIn(provider, { redirectTo });
}

export async function logout(redirectTo: string) {
  await signOut({ redirectTo });
}
