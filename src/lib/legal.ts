import type { Locale } from "@/i18n/routing";

export type LegalDoc = "terms" | "privacy";
export const LEGAL_DOCS: LegalDoc[] = ["terms", "privacy"];

// Default texts, shown until they are edited in the admin panel. Paragraphs
// are split by blank lines
export const legalDefaults: Record<LegalDoc, Record<Locale, string>> = {
  terms: {
    ru: `Это мой личный сайт. Заходя сюда, ты соглашаешься с парой простых правил ниже.

Гостевая книга открыта для всех, кто вошёл через Discord или GitHub. Пиши что хочешь, но без оскорблений, спама, рекламы и чужих личных данных. Я могу удалить любую запись без объяснений, если она нарушает эти правила или просто выглядит подозрительно.

Когда ты входишь, я сохраняю только твой ник, аватарку и то, через какой сервис ты вошёл. Пароли и почта ко мне не попадают. Запись в гостевой видят все посетители сайта.

Код моих проектов лежит на GitHub под их собственными лицензиями. Тексты, картинки и дизайн сайта мои, если хочешь что-то использовать, просто напиши.

Сайт работает «как есть». Я стараюсь, чтобы всё было живо и актуально, но не обещаю, что ничего не сломается и что вся информация всегда свежая.

Правила могут меняться, актуальная версия всегда на этой странице. Вопросы пиши мне в Discord или Telegram.`,
    en: `This is my personal site. By using it you agree to a couple of simple rules below.

The guestbook is open to anyone signed in with Discord or GitHub. Write what you like, but no insults, spam, ads or other people's personal data. I can remove any entry without explanation if it breaks these rules or just looks off.

When you sign in I keep only your username, avatar and which service you used. Passwords and email never reach me. Guestbook entries are visible to every visitor.

The code of my projects lives on GitHub under its own licenses. The site's texts, images and design are mine; if you want to reuse something, just ask.

The site is provided as is. I try to keep everything working and up to date, but I can't promise nothing will break or that every detail is always current.

These rules may change; the current version is always on this page. Questions go to me on Discord or Telegram.`,
  },
  privacy: {
    ru: `Простой счётчик Vercel Analytics работает всегда. Он считает просмотры страниц без cookie и ничего не знает о тебе лично.

PostHog (серверы в ЕС) включается только если ты нажал «Ок, можно». Тогда я вижу анонимные события вроде кликов и прокрутки, тип устройства, браузер, примерную страну и запись сессии, где все поля ввода скрыты. Так я понимаю, что на сайте работает, а что бесит.

Я ничего не продаю и никому не передаю, кроме самих сервисов аналитики. Передумал? Отзови согласие ниже, и сбор сразу прекратится.

Статус в Discord приходит из публичного API Lanyard. Комментарии в блоге работают через Giscus (GitHub Discussions), там действуют правила GitHub.`,
    en: `The site always uses Vercel Analytics: anonymous page view counting without cookies and without collecting personal data.

Only after you consent, PostHog (EU servers) is loaded: anonymous events (clicks, scrolling), device type, browser, approximate country and a session recording with masked inputs. It helps me understand what works on the site.

Data is never sold or shared with third parties other than the analytics services themselves. You can withdraw consent at any time below, which stops collection.

Discord status comes from the public Lanyard API; blog comments are powered by Giscus (GitHub Discussions) and follow GitHub's terms.`,
  },
};
