import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getPost } from "@/lib/content";
import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "Petaloff blog";

export default async function Image({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "blog" });
  const post = await getPost(slug);
  return renderOg({
    kicker: `${t("title")} · ${post?.date ?? ""}`,
    title: post?.title ?? "Petaloff",
    subtitle: post?.description,
  });
}
