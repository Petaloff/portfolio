import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/Reveal";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getProject, getProjectCase, getProjects } from "@/lib/content";

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
  const { slug } = await params;
  const locale = (await getLocale()) as Locale;
  const project = getProject(slug);
  const Content = await getProjectCase(slug, locale);
  if (!project || !Content) notFound();
  const t = await getTranslations("projects");

  return (
    <article className="mx-auto max-w-3xl px-4 pb-24 pt-36 md:px-8">
      <Link href="/#projects" className="font-mono text-xs text-muted hover:text-fg">
        ← {t("back")}
      </Link>
      <Reveal>
        <header className="mb-12 mt-8 border-b border-line pb-8">
          <p className="font-mono text-xs uppercase tracking-wider text-accent">
            {t(project.kind)} · {project.year}
          </p>
          <h1 className="mt-4 text-5xl font-semibold tracking-tighter md:text-7xl">{project.title}</h1>
          <p className="mt-6 text-lg text-muted">{project.summary[locale]}</p>
          <ul className="mt-6 flex flex-wrap gap-2 font-mono text-xs">
            {project.tags.map((tag) => (
              <li key={tag} className="bg-surface px-2 py-1">
                {tag}
              </li>
            ))}
          </ul>
        </header>
      </Reveal>
      <div className="prose-mdx">
        <Content />
      </div>
    </article>
  );
}
