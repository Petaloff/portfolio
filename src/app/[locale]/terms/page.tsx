import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { paragraphs } from "@/lib/paragraphs";
import { getLegal } from "@/lib/cms";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("terms");
  const locale = (await getLocale()) as Locale;
  return pageMetadata({ locale, path: "/terms", title: t("title"), description: t("description") });
}

export default async function TermsPage() {
  const t = await getTranslations("terms");
  const locale = (await getLocale()) as Locale;
  const text = await getLegal("terms", locale);
  return (
    <div className="mx-auto max-w-2xl px-4 pt-36 pb-24 md:px-8">
      <h1 className="text-5xl font-semibold tracking-tighter">{t("title")}</h1>
      <div className="prose-mdx mt-10 text-muted">
        {paragraphs(text).map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </div>
  );
}
