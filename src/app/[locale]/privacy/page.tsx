import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { ConsentSettings } from "@/components/Analytics";
import type { Locale } from "@/i18n/routing";
import { paragraphs } from "@/lib/paragraphs";
import { getLegal } from "@/lib/cms";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("privacy");
  const locale = (await getLocale()) as Locale;
  return pageMetadata({ locale, path: "/privacy", title: t("title"), description: t("description") });
}

export default async function PrivacyPage() {
  const t = await getTranslations();
  const locale = (await getLocale()) as Locale;
  const text = await getLegal("privacy", locale);
  return (
    <div className="mx-auto max-w-2xl px-4 pt-36 pb-24 md:px-8">
      <h1 className="text-5xl font-semibold tracking-tighter">{t("privacy.title")}</h1>
      <div className="prose-mdx mt-10 text-muted">
        {paragraphs(text).map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      <h2 className="mt-12 mb-4 font-mono text-xs tracking-wider text-accent uppercase">{t("consent.manage")}</h2>
      <ConsentSettings />
    </div>
  );
}
