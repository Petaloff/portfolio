import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { auth, authEnabled, authProviders, authSecret } from "@/auth";
import { GuestbookForm } from "@/components/guestbook/GuestbookForm";
import { DeleteEntry } from "@/components/guestbook/DeleteEntry";
import { Reveal } from "@/components/Reveal";
import { getEntries, MAX_LENGTH, storageEnabled } from "@/lib/guestbook";
import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";
import { login, logout } from "./actions";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("guestbook");
  const locale = (await getLocale()) as Locale;
  return pageMetadata({ locale, path: "/guestbook", title: t("title"), description: t("lead") });
}

const providerLabel = { github: "GitHub", discord: "Discord" } as const;

// Sign-in state reads cookies, so it streams in separately from the cached list
async function Composer() {
  const t = await getTranslations("guestbook");
  const locale = await getLocale();
  const session = await auth();
  const back = `/${locale}/guestbook`;

  if (!session) {
    return (
      <div className="flex flex-wrap items-center gap-3 font-mono text-sm">
        <span className="text-muted">{t("signIn")}</span>
        {authProviders.map((p) => (
          <form key={p} action={login.bind(null, p, back)}>
            <button className="border border-line px-4 py-2 transition-colors hover:border-fg hover:text-fg">
              {providerLabel[p]}
            </button>
          </form>
        ))}
      </div>
    );
  }
  return (
    <div>
      <GuestbookForm max={MAX_LENGTH} name={session.user.name} image={session.user.image ?? null} />
      <form action={logout.bind(null, back)} className="mt-3">
        <button className="font-mono text-xs text-muted hover:text-fg">{t("signOut")}</button>
      </form>
    </div>
  );
}

async function AdminTools({ id }: { id: string }) {
  const session = authEnabled ? await auth() : null;
  return session?.user.admin ? <DeleteEntry id={id} /> : null;
}

export default async function GuestbookPage() {
  const t = await getTranslations("guestbook");
  const locale = await getLocale();
  const entries = await getEntries();
  const enabled = authEnabled && storageEnabled;
  // Names only, never values: tells the owner which setting is still missing
  const missing = [
    !authSecret && "AUTH_SECRET",
    authProviders.length === 0 && "AUTH_GITHUB_ID / AUTH_DISCORD_ID",
    !storageEnabled && "KV_REST_API_URL + KV_REST_API_TOKEN",
  ].filter(Boolean);

  return (
    <div className="mx-auto max-w-2xl px-4 pt-36 pb-24 md:px-8">
      <Reveal>
        <h1 className="text-5xl font-semibold tracking-tighter md:text-7xl">{t("title")}</h1>
        <p className="mt-6 text-muted">{t("lead")}</p>
      </Reveal>

      <div className="mt-10 border border-line bg-surface/60 p-5">
        {enabled ? (
          <Suspense fallback={<div className="h-10" />}>
            <Composer />
          </Suspense>
        ) : (
          <p className="font-mono text-sm text-muted">
            # {t("disabled")}
            <span className="mt-2 block text-xs opacity-70">missing: {missing.join(", ")}</span>
          </p>
        )}
      </div>

      <ol className="mt-10 divide-y divide-line/60 border-y border-line/60">
        {entries.length === 0 && <li className="py-8 font-mono text-sm text-muted">{t("empty")}</li>}
        {entries.map((e) => (
          <li key={e.id} className="flex gap-4 py-5">
            {e.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={e.image} alt="" width={40} height={40} className="h-10 w-10 shrink-0 bg-line" />
            ) : (
              <span className="h-10 w-10 shrink-0 bg-line" />
            )}
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-baseline gap-x-2 font-mono text-xs text-muted">
                <span className="text-sm text-fg">{e.name}</span>
                <span>{providerLabel[e.provider]}</span>
                <time dateTime={new Date(e.at).toISOString()}>
                  {new Date(e.at).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" })}
                </time>
                {enabled && (
                  <Suspense>
                    <AdminTools id={e.id} />
                  </Suspense>
                )}
              </p>
              <p className="mt-1 break-words">{e.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
