import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { authEnabled, authProviders, getSession } from "@/auth";
import { Logo } from "@/components/Logo";
import { mayPass } from "@/lib/admin/maintenance";
import { getMaintenance } from "@/lib/maintenance";
import { enterSite, maintenanceLogin, maintenanceLogout } from "./actions";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("maintenance");
  return { title: t("title"), robots: { index: false, follow: false } };
}

// Covers the header and footer from the layout: while the site is closed they only lead back here
export default async function MaintenancePage() {
  const t = await getTranslations("maintenance");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-bg/85 px-4 py-16 backdrop-blur-md">
      <div className="w-full max-w-xl">
        <div className="flex items-center gap-3 font-mono text-xs tracking-[0.25em] text-accent uppercase">
          <Logo className="h-5 w-4" />
          <span>maintenance</span>
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full rounded-full bg-accent opacity-60 motion-safe:animate-ping" />
            <span className="relative inline-flex size-2 rounded-full bg-accent" />
          </span>
        </div>
        <h1 className="mt-6 text-5xl font-semibold tracking-tighter text-balance md:text-7xl">{t("title")}</h1>
        <p className="mt-6 max-w-md text-muted">{t("lead")}</p>
        <div className="mt-10 h-px overflow-hidden bg-line">
          <div className="maintenance-bar h-full w-1/3 bg-accent" />
        </div>
        <Suspense fallback={<div className="mt-10 h-12" />}>
          <Access />
        </Suspense>
      </div>
    </div>
  );
}

// Depends on who is looking: a button in for the owner and the people on the list,
// a GitHub sign-in for everyone who has not signed in yet
async function Access() {
  if (!authEnabled || !authProviders.includes("github")) return null;
  const [t, locale, session, config] = await Promise.all([
    getTranslations("maintenance"),
    getLocale(),
    getSession(),
    getMaintenance({ fresh: true }),
  ]);
  const hidden = <input type="hidden" name="locale" value={locale} />;

  if (!session) {
    return (
      <form action={maintenanceLogin} className="mt-10">
        {hidden}
        <button className="font-mono text-xs text-muted transition-colors hover:text-fg">{t("signIn")} →</button>
      </form>
    );
  }
  if (mayPass(session.user.provider, session.user.id.split(":")[1], config)) {
    return (
      <form action={enterSite} className="mt-10">
        {hidden}
        <button className="shine border border-fg bg-fg px-6 py-3 text-sm font-medium text-bg">{t("enter")} →</button>
      </form>
    );
  }
  return (
    <form action={maintenanceLogout} className="mt-10 flex flex-wrap items-center gap-4">
      {hidden}
      <p className="font-mono text-xs text-muted">{t("signedIn", { name: session.user.name })}</p>
      <button className="font-mono text-xs text-muted underline-offset-4 hover:text-fg hover:underline">
        {t("signOut")}
      </button>
    </form>
  );
}
