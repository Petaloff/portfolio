import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { ConsentSettings } from "@/components/Analytics";
import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("privacy");
  const locale = (await getLocale()) as Locale;
  return pageMetadata({ locale, path: "/privacy", title: t("title"), description: t("description") });
}

const text = {
  ru: [
    "Простой счётчик Vercel Analytics работает всегда. Он считает просмотры страниц без cookie и ничего не знает о тебе лично.",
    "PostHog (серверы в ЕС) включается только если ты нажал «Ок, можно». Тогда я вижу анонимные события вроде кликов и прокрутки, тип устройства, браузер, примерную страну и запись сессии, где все поля ввода скрыты. Так я понимаю, что на сайте работает, а что бесит.",
    "Я ничего не продаю и никому не передаю, кроме самих сервисов аналитики. Передумал? Отзови согласие ниже, и сбор сразу прекратится.",
    "Статус в Discord приходит из публичного API Lanyard. Комментарии в блоге работают через Giscus (GitHub Discussions), там действуют правила GitHub.",
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
