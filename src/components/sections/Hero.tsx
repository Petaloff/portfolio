import { getTranslations } from "next-intl/server";
import { DiscordStatus } from "@/components/DiscordStatus";
import { Magnetic } from "@/components/motion/Magnetic";
import { Words } from "@/components/motion/Words";
import { Reveal } from "@/components/Reveal";
import { LiteVoxels } from "@/components/three/LiteVoxels";
import { LiteHint } from "@/components/ui/Controls";
import { Link } from "@/i18n/navigation";
import { HeroFrame } from "@/components/sections/HeroFrame";

export async function Hero() {
  const t = await getTranslations("hero");
  return (
    <HeroFrame>
      <LiteVoxels />
      {/* Phones have no 3D scene, so the nickname is plain type there */}
      <p aria-hidden className="mb-14 font-mono text-[15vw] leading-none font-bold tracking-tighter md:hidden">
        PETALOFF<span className="text-accent">_</span>
      </p>
      <Reveal>
        <p className="font-mono text-xs tracking-[0.25em] text-accent uppercase">{t("kicker")}</p>
      </Reveal>
      <h1 className="mt-4 max-w-4xl text-5xl leading-[0.95] font-semibold tracking-tighter text-balance md:text-7xl lg:text-8xl">
        <Words text={t("title")} delay={0.1} />
      </h1>
      <Reveal delay={0.2}>
        <p className="mt-6 max-w-xl text-lg text-pretty text-muted">{t("lead")}</p>
      </Reveal>
      <Reveal delay={0.3} className="mt-10 flex flex-wrap items-center gap-6">
        <Magnetic>
          <Link
            href="/#projects"
            className="shine group inline-flex items-center gap-2 border border-fg bg-fg px-6 py-3 text-sm font-medium text-bg transition-[background-color,border-color,box-shadow] duration-300 hover:border-accent hover:bg-accent hover:shadow-[0_0_40px_-8px_var(--accent)]"
          >
            {t("cta")}
            <span className="inline-block transition-transform duration-300 group-hover:translate-y-0.5">↓</span>
          </Link>
        </Magnetic>
        <DiscordStatus />
      </Reveal>
      <LiteHint />
    </HeroFrame>
  );
}
