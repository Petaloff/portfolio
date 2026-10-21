import type { Metadata } from "next";
import { routing, type Locale } from "@/i18n/routing";
import { contacts, site } from "./site";

const ogLocale: Record<Locale, string> = { ru: "ru_RU", en: "en_US" };

// hreflang links for a path that exists in every locale, x-default goes to the default one
function languageAlternates(path: string) {
  return {
    ...Object.fromEntries(routing.locales.map((l) => [l, `/${l}${path}`])),
    "x-default": `/${routing.defaultLocale}${path}`,
  };
}

type PageSeo = {
  locale: Locale;
  // Path after the locale prefix, "" for the home page
  path: string;
  title?: string;
  // Title for link previews when it differs from `${title} · Petaloff`, e.g. on the home page
  socialTitle?: string;
  description: string;
  // Set for pages written in one language only, like blog posts
  onlyIn?: Locale;
  article?: { publishedTime: string; tags: string[] };
};

// Canonical, hreflang, Open Graph and Twitter tags for a page. Child metadata replaces
// these objects whole, so every page builds them here instead of relying on the layout
export function pageMetadata({ locale, path, title, socialTitle, description, onlyIn, article }: PageSeo): Metadata {
  const canonicalLocale = onlyIn ?? locale;
  const url = `/${canonicalLocale}${path}`;
  const shareTitle = socialTitle ?? (title && `${title} · ${site.name}`);
  const social = { ...(shareTitle && { title: shareTitle }), description };
  return {
    ...(title && { title }),
    description,
    alternates: {
      canonical: url,
      languages: onlyIn ? { [onlyIn]: url } : languageAlternates(path),
      types: { "application/rss+xml": `/${locale}/blog/rss.xml` },
    },
    openGraph: {
      ...social,
      siteName: site.name,
      url,
      locale: ogLocale[canonicalLocale],
      alternateLocale: onlyIn ? [] : routing.locales.filter((l) => l !== locale).map((l) => ogLocale[l]),
      ...(article ? { type: "article", ...article, authors: [site.url] } : { type: "website" }),
    },
    twitter: { card: "summary_large_image", ...social },
  };
}

// Structured data needs absolute URLs, metadataBase doesn't apply to it
export const absolute = (path = "") => `${site.url}${path}`;

export const personRef = { "@id": absolute("/#person") };

export function personSchema(jobTitle: string, description: string, knowsAbout: string[]) {
  return {
    "@type": "Person",
    ...personRef,
    name: site.name,
    url: site.url,
    image: absolute("/icon-512.png"),
    jobTitle,
    description,
    knowsAbout,
    sameAs: contacts.map((c) => c.href).filter((href) => href.startsWith("https://")),
  };
}

export function breadcrumbs(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absolute(item.path),
    })),
  };
}
