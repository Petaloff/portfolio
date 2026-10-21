import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { BlogList } from "@/components/BlogList";
import { JsonLd } from "@/components/JsonLd";
import { Reveal } from "@/components/Reveal";
import { getPosts } from "@/lib/content";
import type { Locale } from "@/i18n/routing";
import { absolute, pageMetadata, personRef } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("blog");
  const locale = (await getLocale()) as Locale;
  return pageMetadata({ locale, path: "/blog", title: t("title"), description: t("lead") });
}

export default async function BlogPage() {
  const t = await getTranslations("blog");
  const locale = await getLocale();
  const posts = await getPosts();
  return (
    <div className="mx-auto max-w-3xl px-4 pt-36 pb-24 md:px-8">
      <JsonLd
        data={{
          "@type": "Blog",
          name: t("title"),
          description: t("lead"),
          url: absolute(`/${locale}/blog`),
          author: personRef,
          blogPost: posts.map((p) => ({
            "@type": "BlogPosting",
            headline: p.title,
            url: absolute(`/${p.lang}/blog/${p.slug}`),
            datePublished: p.date,
            inLanguage: p.lang,
          })),
        }}
      />
      <Reveal>
        <h1 className="text-5xl font-semibold tracking-tighter md:text-7xl">{t("title")}</h1>
        <p className="mt-6 mb-16 max-w-lg text-muted">{t("lead")}</p>
      </Reveal>
      <Reveal delay={0.1}>
        <BlogList posts={posts} />
      </Reveal>
    </div>
  );
}
