import { getTranslations } from "next-intl/server";
import { BlogList } from "@/components/BlogList";
import { FormationSection } from "@/components/FormationSection";
import { Reveal } from "@/components/Reveal";
import { Link } from "@/i18n/navigation";
import { getPosts } from "@/lib/content";
import { SectionTitle } from "./SectionTitle";

export async function LatestPosts() {
  const t = await getTranslations("blog");
  const posts = (await getPosts()).slice(0, 3);
  return (
    <FormationSection id="blog" formation="blog" className="mx-auto max-w-6xl px-4 py-32 md:px-8">
      <SectionTitle index="04">{t("title")}</SectionTitle>
      <Reveal className="max-w-3xl">
        <BlogList posts={posts} />
        <Link href="/blog" className="mt-8 inline-block text-sm hover:text-accent">
          {t("all")} →
        </Link>
      </Reveal>
    </FormationSection>
  );
}
