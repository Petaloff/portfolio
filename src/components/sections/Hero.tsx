import { getTranslations } from "next-intl/server";
import { DiscordStatus } from "@/components/DiscordStatus";
import { FormationSection } from "@/components/FormationSection";
import { Reveal } from "@/components/Reveal";
import { LiteHint } from "@/components/ui/Controls";
import { Link } from "@/i18n/navigation";

export async function Hero() {
  const t = await getTranslations("hero");
  return (
    <FormationSection
      formation="name"
      className="mx-auto flex min-h-dvh max-w-6xl flex-col justify-end px-4 pb-16 pt-32 md:px-8 md:pb-24"
    >
      <Reveal>
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">{t("kicker")}</p>
      </Reveal>
      <Reveal delay={0.1}>
        <h1 className="mt-4 max-w-4xl text-5xl font-semibold leading-[0.95] tracking-tighter text-balance md:text-7xl lg:text-8xl">
          {t("title")}
        </h1>
      </Reveal>
      <Reveal delay={0.2}>
        <p className="mt-6 max-w-xl text-lg text-muted text-pretty">{t("lead")}</p>
      </Reveal>
      <Reveal delay={0.3} className="mt-10 flex flex-wrap items-center gap-6">
        <Link
          href="/#projects"
          className="border border-fg bg-fg px-6 py-3 text-sm font-medium text-bg transition-opacity hover:opacity-85"
        >
          {t("cta")}
        </Link>
        <DiscordStatus />
      </Reveal>
      <LiteHint />
    </FormationSection>
  );
}
