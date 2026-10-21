import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getSession, authEnabled, authProviders } from "@/auth";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { GuestbookAdmin } from "@/components/admin/GuestbookAdmin";
import { LegalEditor } from "@/components/admin/LegalEditor";
import { MessagesEditor } from "@/components/admin/MessagesEditor";
import { PostsEditor } from "@/components/admin/PostsEditor";
import { ProjectsEditor } from "@/components/admin/ProjectsEditor";
import { routing, type Locale } from "@/i18n/routing";
import { flatten } from "@/lib/admin/messages";
import { defaultMessages, getLegal, getMessageOverrides, getProjectList, getStoredPosts } from "@/lib/cms";
import { getEditablePosts } from "@/lib/content";
import { getEntries } from "@/lib/guestbook";
import { LEGAL_DOCS } from "@/lib/legal";
import { storageEnabled } from "@/lib/redis";
import { adminLogin, adminLogout } from "./actions";

export const metadata: Metadata = {
  title: "Админка",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-32 pb-24 md:px-8">
      <Suspense fallback={<div className="h-96 animate-pulse bg-surface" />}>
        <Admin />
      </Suspense>
    </div>
  );
}

async function Admin() {
  const locale = (await getLocale()) as Locale;
  const session = authEnabled ? await getSession() : null;

  if (!session) {
    // Only GitHub opens the panel, so that is the only button offered here
    if (!authProviders.includes("github")) notFound();
    return (
      <div className="mx-auto max-w-md border border-line bg-surface/60 p-8 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Админка</h1>
        <p className="mt-3 text-sm text-muted">Вход только для владельца сайта.</p>
        <form action={adminLogin} className="mt-6">
          <button className="shine border border-fg bg-fg px-6 py-3 text-sm font-medium text-bg">
            Войти через GitHub
          </button>
        </form>
      </div>
    );
  }
  // Signed in as someone else: the page simply does not exist for them
  if (!session.user.owner) notFound();

  const [projects, posts, stored, entries, messages, legal] = await Promise.all([
    getProjectList(),
    getEditablePosts(),
    getStoredPosts(),
    getEntries(),
    Promise.all(
      routing.locales.map(async (l) => ({
        locale: l,
        defaults: flatten(await defaultMessages(l)),
        overrides: await getMessageOverrides(l),
      })),
    ),
    Promise.all(
      LEGAL_DOCS.flatMap((doc) => routing.locales.map(async (l) => ({ doc, locale: l, text: await getLegal(doc, l) }))),
    ),
  ]);
  const giscus = process.env.NEXT_PUBLIC_GISCUS_REPO;

  return (
    <>
      <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs tracking-[0.25em] text-accent uppercase">admin</p>
          <h1 className="mt-2 text-5xl font-semibold tracking-tighter">Привет, {session.user.name}</h1>
        </div>
        <form action={adminLogout}>
          <button className="font-mono text-xs text-muted hover:text-fg">Выйти</button>
        </form>
      </header>
      {!storageEnabled && (
        <p className="mb-8 border border-rose-400/40 p-4 font-mono text-sm text-rose-300">
          Redis не подключён: смотреть можно, сохранять нельзя. Нужны KV_REST_API_URL и KV_REST_API_TOKEN.
        </p>
      )}
      <AdminPanel
        tabs={[
          {
            id: "projects",
            label: "Проекты",
            count: projects.length,
            content: <ProjectsEditor projects={projects} />,
          },
          {
            id: "blog",
            label: "Блог",
            count: posts.length,
            content: <PostsEditor posts={posts} saved={stored.map((p) => p.slug)} />,
          },
          { id: "messages", label: "Тексты сайта", content: <MessagesEditor locales={messages} /> },
          { id: "legal", label: "Соглашение", content: <LegalEditor texts={legal} /> },
          {
            id: "guestbook",
            label: "Гостевая",
            count: entries.length,
            content: <GuestbookAdmin entries={entries} locale={locale} />,
          },
          {
            id: "comments",
            label: "Комментарии",
            content: (
              <div className="max-w-xl text-muted">
                <p>
                  Комментарии в блоге живут в GitHub Discussions через Giscus, поэтому модерируются там: можно скрыть,
                  удалить или закрыть обсуждение.
                </p>
                {giscus && (
                  <a
                    href={`https://github.com/${giscus}/discussions`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-block font-mono text-sm text-accent hover:underline"
                  >
                    Открыть обсуждения {giscus} ↗
                  </a>
                )}
              </div>
            ),
          },
        ]}
      />
    </>
  );
}
