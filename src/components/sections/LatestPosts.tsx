import { getTranslations } from "next-intl/server";
import { BlogList } from "@/components/BlogList";
import { Link } from "@/i18n/navigation";
import { getPosts } from "@/lib/content";
import { EditorWindow } from "./EditorWindow";

export async function LatestPosts() {
  const t = await getTranslations("blog");
  const posts = (await getPosts()).slice(0, 3);
  return (
    <EditorWindow id="blog" title={t("title")}>
      <BlogList posts={posts} />
      <Link href="/blog" className="mt-8 inline-block font-mono text-sm text-muted hover:text-accent">
        $ git log --all →
      </Link>
    </EditorWindow>
  );
}
