import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Suspense, ViewTransition } from "react";
import { Reveal } from "@/components/Reveal";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getProject, getProjectCase, getProjects } from "@/lib/content";

type Params = PageProps<"/[locale]/projects/[slug]">["params"];

export function generateStaticParams() {
  return getProjects()
    .filter((p) => p.caseStudy)
    .map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/projects/[slug]">): Promise<Metadata> {
  const project = getProject((await params).slug);
  const locale = (await getLocale()) as Locale;
  if (!project) return {};
  return { title: project.title, description: project.summary[locale] };
}

export default async function ProjectPage({ params }: PageProps<"/[locale]/projects/[slug]">) {
  const t = await getTranslations("projects");
  return (
    <article className="mx-auto max-w-3xl px-4 pb-24 pt-36 md:px-8">
      <Link href="/#projects" className="font-mono text-xs text-muted hover:text-fg">
        ← {t("back")}
      </Link>
      <Suspense fallback={<div className="mt-8 h-64 animate-pulse bg-surface" />}>
        <ProjectCase params={params} />
      </Suspense>
    </article>
  );
}

async function ProjectCase({ params }: { params: Params }) {
  const { slug } = await params;
  const locale = (await getLocale()) as Locale;
  const project = getProject(slug);
  const Content = await getProjectCase(slug, locale);
  if (!project || !Content) notFound();
  const t = await getTranslations("projects");

  return (
    <>
      {/* No Reveal here: the header is the landing spot for the card morph */}
      <header className="mb-12 mt-8 border-b border-line pb-8">
        <ViewTransition name={`project-meta-${project.slug}`} share="morph" default="none">
          <p className="w-fit font-mono text-xs uppercase tracking-wider text-accent">
            {project.categories.map((c) => t(c)).join(" · ")} · {project.year}
          </p>
        </ViewTransition>
        <ViewTransition name={`project-title-${project.slug}`} share="morph" default="none">
          <h1 className="mt-4 w-fit text-5xl font-semibold tracking-tighter md:text-7xl">{project.title}</h1>
        </ViewTransition>
        <p className="mt-6 text-lg text-muted">{project.summary[locale]}</p>
        <Reveal>
          <ul className="mt-6 flex flex-wrap gap-2 font-mono text-xs">
            {project.tags.map((tag) => (
              <li key={tag} className="bg-surface px-2 py-1">
                {tag}
              </li>
            ))}
          </ul>
        </Reveal>
      </header>
      <div className="prose-mdx">
        <Content />
      </div>
    </>
  );
}
