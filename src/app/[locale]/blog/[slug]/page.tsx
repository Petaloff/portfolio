import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Comments } from "@/components/Comments";
import { Reveal } from "@/components/Reveal";
import { Link } from "@/i18n/navigation";
import { getPost, getPostSlugs } from "@/lib/content";

type Params = PageProps<"/[locale]/blog/[slug]">["params"];

export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/blog/[slug]">): Promise<Metadata> {
  const post = await getPost((await params).slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    openGraph: { type: "article", publishedTime: post.date, tags: post.tags },
  };
}

export default async function PostPage({ params }: PageProps<"/[locale]/blog/[slug]">) {
  const t = await getTranslations("blog");
  return (
    <article className="mx-auto max-w-2xl px-4 pb-24 pt-36 md:px-8">
      <Link href="/blog" className="font-mono text-xs text-muted hover:text-fg">
        ← {t("back")}
      </Link>
      <Suspense fallback={<div className="mt-8 h-64 animate-pulse bg-surface" />}>
        <Post params={params} />
      </Suspense>
    </article>
  );
}

async function Post({ params }: { params: Params }) {
  const post = await getPost((await params).slug);
  if (!post) notFound();
  const t = await getTranslations("blog");
  const locale = await getLocale();
  const { Content } = post;

  return (
    <>
      <Reveal>
        <header className="mb-12 mt-8 border-b border-line pb-8">
          <div className="flex gap-4 font-mono text-xs text-muted">
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" })}
            </time>
            <span>{post.tags.map((tag) => `#${tag}`).join(" ")}</span>
            <span className="uppercase" title={t("lang")}>
              {post.lang}
            </span>
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tighter text-balance md:text-6xl">{post.title}</h1>
          <p className="mt-4 text-lg text-muted">{post.description}</p>
        </header>
      </Reveal>
      <div className="prose-mdx" lang={post.lang}>
        <Content />
      </div>
      <Comments locale={locale} />
    </>
  );
}
