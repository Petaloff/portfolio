"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { modeStore, useRenderMode } from "@/lib/store";

const button =
  "inline-flex h-9 items-center justify-center border border-line px-3 font-mono text-xs uppercase tracking-wider transition-colors hover:border-fg hover:text-fg";

export function ModeToggle() {
  const t = useTranslations("mode");
  const mode = useRenderMode();
  return (
    <button
      type="button"
      className={button}
      aria-pressed={mode === "full"}
      onClick={() => modeStore.set(mode === "full" ? "lite" : "full")}
    >
      {mode === "full" ? t("disable3d") : t("enable3d")}
    </button>
  );
}

export function LocaleSwitch() {
  const t = useTranslations("locale");
  const locale = useLocale();
  const pathname = usePathname();
  return (
    <Link
      className={button}
      href={pathname}
      locale={locale === "ru" ? "en" : "ru"}
      lang={locale === "ru" ? "en" : "ru"}
    >
      {locale === "ru" ? "EN" : "RU"}
      <span className="sr-only">{t("switch")}</span>
    </Link>
  );
}

// Shown once to visitors in lite mode so the 3D version is easy to find
export function LiteHint() {
  const t = useTranslations("mode");
  const mode = useRenderMode();
  if (mode !== "lite") return null;
  return (
    <div className="mt-10 flex flex-wrap items-center gap-4 text-sm text-muted">
      <span>{t("hint")}</span>
      <ModeToggle />
    </div>
  );
}
