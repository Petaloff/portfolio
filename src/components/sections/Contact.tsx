import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/Reveal";
import { contacts } from "@/lib/site";
import { SectionTitle } from "./SectionTitle";

export async function Contact() {
  const t = await getTranslations("contact");
  return (
    <section
      id="contact"
      className="mx-auto flex min-h-[70dvh] max-w-6xl flex-col px-4 pt-32 md:px-8"
    >
      <SectionTitle index="05">{t("title")}</SectionTitle>
      <Reveal>
        <p className="max-w-md text-muted">{t("lead")}</p>
      </Reveal>
      <ul className="mt-12 divide-y divide-line border-y border-line">
        {contacts.map((c, i) => (
          <Reveal key={c.label} delay={i * 0.05}>
            <li>
              <a
                href={c.href}
                target="_blank"
                rel="noreferrer"
                className="group flex items-baseline justify-between py-5 text-3xl font-semibold tracking-tight md:text-5xl"
              >
                <span className="transition-transform duration-500 group-hover:translate-x-3">{c.label}</span>
                <span className="text-muted transition-colors group-hover:text-accent">↗</span>
              </a>
            </li>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
