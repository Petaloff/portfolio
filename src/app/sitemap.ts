import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getPosts, getProjects } from "@/lib/content";
import { site } from "@/lib/site";

type Entry = MetadataRoute.Sitemap[number];

// Every locale version of a page, each listing the others as hreflang alternates
function localized(path: string, entry: Omit<Entry, "url"> = {}): MetadataRoute.Sitemap {
  const languages = {
    ...Object.fromEntries(routing.locales.map((l) => [l, `${site.url}/${l}${path}`])),
    "x-default": `${site.url}/${routing.defaultLocale}${path}`,
  };
  return routing.locales.map((locale) => ({
    url: `${site.url}/${locale}${path}`,
    alternates: { languages },
    ...entry,
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPosts();
  const latest = posts[0]?.date;
  return [
    ...localized("", { changeFrequency: "weekly", priority: 1 }),
    ...localized("/blog", { changeFrequency: "weekly", priority: 0.8, lastModified: latest }),
    ...(await getProjects())
      .filter((p) => p.caseStudy)
      .flatMap((p) => localized(`/projects/${p.slug}`, { changeFrequency: "monthly", priority: 0.7 })),
    // Posts are written in one language, so only that URL is listed
    ...posts.map((p) => ({
      url: `${site.url}/${p.lang}/blog/${p.slug}`,
      lastModified: p.date,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...localized("/now", { changeFrequency: "monthly", priority: 0.5 }),
    ...localized("/changelog", { changeFrequency: "daily", priority: 0.5 }),
    ...localized("/guestbook", { changeFrequency: "weekly", priority: 0.3 }),
    ...localized("/terms", { changeFrequency: "yearly", priority: 0.1 }),
    ...localized("/privacy", { changeFrequency: "yearly", priority: 0.1 }),
  ];
}
