import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getPostSlugs, getProjects } from "@/lib/content";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "",
    "/blog",
    "/privacy",
    ...getPostSlugs().map((s) => `/blog/${s}`),
    ...getProjects()
      .filter((p) => p.caseStudy)
      .map((p) => `/projects/${p.slug}`),
  ];
  return paths.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: `${site.url}/${locale}${path}`,
      alternates: { languages: Object.fromEntries(routing.locales.map((l) => [l, `${site.url}/${l}${path}`])) },
    })),
  );
}
