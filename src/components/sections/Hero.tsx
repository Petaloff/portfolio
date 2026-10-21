import { getTranslations } from "next-intl/server";
import { DiscordStatus } from "@/components/DiscordStatus";
import { Reveal } from "@/components/Reveal";
import { LiteHint } from "@/components/ui/Controls";
import { Link } from "@/i18n/navigation";

export async function Hero() {
  const t = await getTranslations("hero");
  return (
    <section className="mx-auto flex min-h-dvh max-w-6xl flex-col justify-end px-4 pt-32 pb-16 md:px-8 md:pb-24">
      {/* Phones have no 3D scene, so the nickname is plain type there */}
      <p aria-hidden className="mb-auto pt-6 font-mono text-[15vw] leading-none font-bold tracking-tighter md:hidden">
        PETALOFF<span className="text-accent">_</span>
      </p>
      <Reveal>
        <p className="font-mono text-xs tracking-[0.25em] text-accent uppercase">{t("kicker")}</p>
      </Reveal>
      <Reveal delay={0.1}>
        <h1 className="mt-4 max-w-4xl text-5xl leading-[0.95] font-semibold tracking-tighter text-balance md:text-7xl lg:text-8xl">
          {t("title")}
        </h1>
      </Reveal>
      <Reveal delay={0.2}>
        <p className="mt-6 max-w-xl text-lg text-pretty text-muted">{t("lead")}</p>
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
    </section>
  );
}
