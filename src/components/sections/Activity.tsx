import { getTranslations } from "next-intl/server";
import { ContributionCity } from "@/components/city/ContributionCity";
import { getContributions, level, toWeeks } from "@/lib/contributions";
import { site } from "@/lib/site";
import { EditorWindow } from "./EditorWindow";

const levelClass = ["bg-line/70", "bg-accent/25", "bg-accent/45", "bg-accent/70", "bg-accent"];

// GitHub contributions for the last year: a voxel city on desktop, the flat
// calendar elsewhere. Hidden entirely when the data can't be fetched.
export async function Activity() {
  const data = await getContributions();
  if (!data?.days.length) return null;
  const t = await getTranslations("activity");
  const weeks = toWeeks(data.days);
  const max = Math.max(...data.days.map((d) => d.count));

  return (
    <EditorWindow id="activity" title={t("title")}>
      <p className="mb-6 font-mono text-sm text-muted">
        <span className="text-accent">$</span> git log --since=1.year --author={site.github} | wc -l{" "}
        <span className="text-fg">→ {data.total}</span>
      </p>
      <ContributionCity weeks={weeks} max={max}>
        {/* rtl keeps the most recent weeks in view on narrow screens */}
        <div dir="rtl" className="overflow-x-auto pb-2">
          <div dir="ltr" className="grid w-max grid-flow-col grid-rows-7 gap-[3px]">
            {weeks.flat().map((day, i) =>
              day ? (
                <span
                  key={day.date}
                  title={`${day.date} · ${t("day", { count: day.count })}`}
                  className={`h-2.5 w-2.5 ${levelClass[level(day.count, max)]}`}
                />
              ) : (
                <span key={`pad-${i}`} className="h-2.5 w-2.5" />
              ),
            )}
          </div>
        </div>
      </ContributionCity>
    </EditorWindow>
  );
}
