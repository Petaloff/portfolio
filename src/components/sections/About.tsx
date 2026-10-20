import { getLocale, getTranslations } from "next-intl/server";
import { getLiveStats } from "@/lib/live";
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
        <p className="text-2xl leading-snug tracking-tight text-pretty md:text-[1.75rem]">{t("about.body")}</p>
        {items.length > 0 && (
          // Live numbers presented as the JSON they come from
          <div className="border border-line bg-bg/70 p-5 font-mono text-sm leading-7">
            <div className="mb-2 text-xs text-muted">{"// stats.json · live, refreshed hourly"}</div>
            <div className="text-muted">{"{"}</div>
            {items.map((i, n) => (
              <div key={i.key} className="pl-5" title={i.label}>
                <span className="text-sky-300">&quot;{i.key}&quot;</span>
                <span className="text-muted">: </span>
                <span className="text-accent">{i.value!.toLocaleString(locale)}</span>
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
