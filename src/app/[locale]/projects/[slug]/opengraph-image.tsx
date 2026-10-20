import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getProject } from "@/lib/content";
import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "Petaloff project";

export default async function Image({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "projects" });
  const project = getProject(slug);
  return renderOg({
    kicker: project ? `${project.categories.map((c) => t(c)).join(" · ")} · ${project.year}` : t("title"),
    title: project?.title ?? "Petaloff",
    subtitle: project?.summary[locale as Locale],
  });
}
