import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { BlogList } from "@/components/BlogList";
import { Reveal } from "@/components/Reveal";
import { getPosts } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("blog");
  return { title: t("title"), description: t("lead") };
}

export default async function BlogPage() {
  const t = await getTranslations("blog");
  const posts = await getPosts();
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-36 md:px-8">
      <Reveal>
        <h1 className="text-5xl font-semibold tracking-tighter md:text-7xl">{t("title")}</h1>
        <p className="mb-16 mt-6 max-w-lg text-muted">{t("lead")}</p>
      </Reveal>
      <Reveal delay={0.1}>
        <BlogList posts={posts} />
      </Reveal>
    </div>
  );
}
