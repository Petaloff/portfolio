import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "Petaloff";

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "hero" });
  return renderOg({ kicker: t("kicker"), title: t("title"), subtitle: t("lead") });
}
