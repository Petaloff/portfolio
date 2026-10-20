import { getTranslations } from "next-intl/server";
import { FormationSection } from "@/components/FormationSection";
import { Reveal } from "@/components/Reveal";
import { stack } from "@/lib/site";
import { SectionTitle } from "./SectionTitle";

export async function Stack() {
  const t = await getTranslations("stack");
  return (
    <FormationSection id="stack" formation="stack" className="mx-auto max-w-6xl px-4 py-32 md:px-8">
      <SectionTitle index="03">{t("title")}</SectionTitle>
      <Reveal>
        <p className="mb-12 max-w-md text-muted">{t("lead")}</p>
      </Reveal>
      <div className="grid max-w-2xl gap-10 sm:grid-cols-2">
        {stack.map((group, i) => (
          <Reveal key={group.group} delay={i * 0.08}>
            <h3 className="mb-4 font-mono text-xs uppercase tracking-wider text-accent">{group.group}</h3>
            <ul className="space-y-2 text-lg">
              {group.items.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="h-2 w-2 bg-fg" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>
    </FormationSection>
  );
}
