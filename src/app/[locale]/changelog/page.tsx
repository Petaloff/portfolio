import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Reveal } from "@/components/Reveal";
import { getReleases, type Release } from "@/lib/releases";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("changelog");
  return { title: t("title"), description: t("lead") };
}

const sourceLabel: Record<Release["source"], string> = { modrinth: "Modrinth", github: "GitHub" };

export default async function ChangelogPage() {
  const t = await getTranslations("changelog");
  const locale = await getLocale();
  const releases = await getReleases();

  // Group by month so the timeline reads like a changelog
  const months = new Map<string, Release[]>();
  for (const r of releases) {
    const key = r.date.slice(0, 7);
    months.set(key, [...(months.get(key) ?? []), r]);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-36 md:px-8">
      <Reveal>
        <h1 className="text-5xl font-semibold tracking-tighter md:text-7xl">{t("title")}</h1>
        <p className="mb-16 mt-6 max-w-lg text-muted">{t("lead")}</p>
      </Reveal>

      {releases.length === 0 && <p className="font-mono text-sm text-muted">{t("empty")}</p>}

      {[...months].map(([month, items]) => (
        <section key={month} className="mb-12">
          <h2 className="sticky top-16 z-10 -mx-1 mb-6 bg-bg/90 px-1 py-2 font-mono text-xs uppercase tracking-wider text-accent backdrop-blur">
            {new Date(`${month}-01`).toLocaleDateString(locale, { year: "numeric", month: "long" })}
          </h2>
          <ol className="relative space-y-8 border-l border-line pl-6">
            {items.map((r) => (
              <Reveal key={`${r.source}-${r.project}-${r.version}`}>
                <li className="relative">
                  <span
                    aria-hidden
                    className={`absolute -left-[29px] top-1.5 h-2.5 w-2.5 ${r.source === "modrinth" ? "bg-accent" : "bg-fg"}`}
                  />
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 font-mono text-xs text-muted">
                    <time dateTime={r.date}>
                      {new Date(r.date).toLocaleDateString(locale, { day: "numeric", month: "short" })}
                    </time>
                    <span>{sourceLabel[r.source]}</span>
                    <span className="text-fg">{r.project}</span>
                    <span className="bg-surface px-1.5 py-0.5 text-accent">{r.version}</span>
                  </div>
                  <a href={r.url} target="_blank" rel="noreferrer" className="mt-1 block text-lg font-medium hover:text-accent">
                    {r.title} ↗
                  </a>
                  {r.notes && <p className="mt-1 text-sm text-muted">{r.notes}</p>}
                  {r.targets.length > 0 && (
                    <p className="mt-2 flex flex-wrap gap-1.5 font-mono text-[11px] text-muted">
                      {r.targets.map((x) => (
                        <span key={x} className="border border-line px-1.5">
                          {x}
                        </span>
                      ))}
                    </p>
                  )}
                </li>
              </Reveal>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
