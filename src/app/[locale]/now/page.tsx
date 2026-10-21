import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import type { ComponentType } from "react";
import { DiscordStatus } from "@/components/DiscordStatus";
import { NowPlaying } from "@/components/NowPlaying";
import { Reveal } from "@/components/Reveal";
import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("now");
  const locale = (await getLocale()) as Locale;
  return pageMetadata({ locale, path: "/now", title: t("title"), description: t("lead") });
}

export default async function NowPage() {
  const t = await getTranslations("now");
  const locale = await getLocale();
  const mod: { default: ComponentType; meta: { updated: string } } = await import(
    `../../../../content/now/${locale}.mdx`
  );
  const { default: Content, meta } = mod;

  return (
    <div className="mx-auto max-w-2xl px-4 pt-36 pb-24 md:px-8">
      <Reveal>
        <h1 className="text-5xl font-semibold tracking-tighter md:text-7xl">{t("title")}</h1>
        <p className="mt-6 text-muted">{t("lead")}</p>
        <p className="mt-2 font-mono text-xs text-muted">
          {t("updated")}{" "}
          <time dateTime={meta.updated}>
            {new Date(meta.updated).toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" })}
          </time>
        </p>
      </Reveal>
      <Reveal delay={0.1} className="mt-10 space-y-4">
        <NowPlaying />
        <DiscordStatus />
      </Reveal>
      <div className="prose-mdx mt-12">
        <Content />
      </div>
    </div>
  );
}
