import { getLocale, getTranslations } from "next-intl/server";
import { FormationSection } from "@/components/FormationSection";
import { Reveal } from "@/components/Reveal";
import { getLiveStats } from "@/lib/live";
import { SectionTitle } from "./SectionTitle";

export async function About() {
  const t = await getTranslations();
  const locale = await getLocale();
  const stats = await getLiveStats();
  const items = [
    { value: stats.downloads, label: t("stats.downloads") },
    { value: stats.stars, label: t("stats.stars") },
    { value: stats.repos, label: t("stats.repos") },
    { value: stats.followers, label: t("stats.followers") },
  ].filter((i) => i.value !== null);

  return (
    <FormationSection id="about" formation="about" className="mx-auto max-w-6xl px-4 py-32 md:px-8">
      <SectionTitle index="01">{t("about.title")}</SectionTitle>
      <Reveal className="max-w-2xl">
        <p className="text-2xl leading-snug tracking-tight text-pretty md:text-3xl">{t("about.body")}</p>
      </Reveal>
      {items.length > 0 && (
        <Reveal delay={0.1}>
          <dl className="mt-16 grid max-w-2xl grid-cols-2 gap-px border border-line bg-line">
            {items.map((i) => (
              <div key={i.label} className="bg-bg p-6">
                <dt className="font-mono text-xs text-muted">{i.label}</dt>
                <dd className="mt-2 text-4xl font-semibold tracking-tight">{i.value!.toLocaleString(locale)}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      )}
    </FormationSection>
  );
}
