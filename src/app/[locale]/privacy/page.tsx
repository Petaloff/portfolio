import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { ConsentSettings } from "@/components/Analytics";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("privacy");
  return { title: t("title") };
}

const text = {
  ru: [
    "Сайт всегда использует Vercel Analytics: обезличенный подсчёт просмотров страниц без cookie и без сбора персональных данных.",
    "Только после вашего согласия подключается PostHog (серверы в ЕС): анонимные события (клики, прокрутка), тип устройства, браузер, примерная страна и запись сессии с замаскированными полями ввода. Это помогает понять, что на сайте работает, а что нет.",
    "Данные не продаются и не передаются третьим лицам, кроме самих сервисов аналитики. Согласие можно отозвать в любой момент ниже, после этого сбор прекращается.",
    "Статус в Discord загружается из публичного API Lanyard, комментарии в блоге работают через Giscus (GitHub Discussions) и подчиняются правилам GitHub.",
  ],
  en: [
    "The site always uses Vercel Analytics: anonymous page view counting without cookies and without collecting personal data.",
    "Only after you consent, PostHog (EU servers) is loaded: anonymous events (clicks, scrolling), device type, browser, approximate country and a session recording with masked inputs. It helps me understand what works on the site.",
    "Data is never sold or shared with third parties other than the analytics services themselves. You can withdraw consent at any time below, which stops collection.",
    "Discord status comes from the public Lanyard API; blog comments are powered by Giscus (GitHub Discussions) and follow GitHub's terms.",
  ],
};

export default async function PrivacyPage() {
  const t = await getTranslations();
  const locale = (await getLocale()) as keyof typeof text;
  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-36 md:px-8">
      <h1 className="text-5xl font-semibold tracking-tighter">{t("privacy.title")}</h1>
      <div className="prose-mdx mt-10 text-muted">
        {text[locale].map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>
      <h2 className="mb-4 mt-12 font-mono text-xs uppercase tracking-wider text-accent">{t("consent.manage")}</h2>
      <ConsentSettings />
    </div>
  );
}
