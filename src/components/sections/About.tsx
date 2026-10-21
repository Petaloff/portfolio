import { getLocale, getTranslations } from "next-intl/server";
import { CountUp } from "@/components/motion/CountUp";
import { getLiveStats } from "@/lib/live";
import { emphasis, paragraphs } from "@/lib/paragraphs";
import { EditorWindow } from "./EditorWindow";

export async function About() {
  const t = await getTranslations();
  const locale = await getLocale();
  const stats = await getLiveStats();
  const items = [
    { key: "downloads", value: stats.downloads, label: t("stats.downloads") },
    { key: "stars", value: stats.stars, label: t("stats.stars") },
    { key: "repos", value: stats.repos, label: t("stats.repos") },
    { key: "followers", value: stats.followers, label: t("stats.followers") },
  ].filter((i) => i.value !== null);

  return (
    <EditorWindow id="about" title={t("about.title")}>
      <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-start">
        {/* Blank lines split the text into paragraphs, **text** marks the key words */}
        <div className="max-w-prose space-y-5 text-base leading-relaxed text-pretty text-fg/75 md:text-lg">
          {paragraphs(t("about.body")).map((p, i) => (
            <p key={i} className={i === 0 ? "text-xl leading-snug tracking-tight text-fg md:text-2xl" : undefined}>
              {emphasis(p).map((part, j) =>
                j % 2 ? (
                  <strong key={j} className="font-medium text-fg">
                    {part}
                  </strong>
                ) : (
                  part
                ),
              )}
            </p>
          ))}
        </div>
        {items.length > 0 && (
          // Live numbers presented as the JSON they come from
          <div className="border border-line bg-bg/70 p-5 font-mono text-sm leading-7">
            <div className="mb-2 text-xs text-muted">{"// stats.json · live, refreshed hourly"}</div>
            <div className="text-muted">{"{"}</div>
            {items.map((i, n) => (
              <div
                key={i.key}
                className="-mx-2 px-2 pl-7 transition-colors duration-200 hover:bg-line/40"
                title={i.label}
              >
                <span className="text-sky-300">&quot;{i.key}&quot;</span>
                <span className="text-muted">: </span>
                <span className="text-accent">
                  <CountUp value={i.value!} locale={locale} />
                </span>
                <span className="text-muted">{n < items.length - 1 ? "," : ""}</span>
                <span className="ml-3 hidden text-xs text-muted/70 sm:inline">{`// ${i.label}`}</span>
              </div>
            ))}
            <div className="text-muted">{"}"}</div>
          </div>
        )}
      </div>
    </EditorWindow>
  );
}
