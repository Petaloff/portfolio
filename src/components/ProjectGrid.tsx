"use client";

import { AnimatePresence, motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { useState, ViewTransition } from "react";
import { Link } from "@/i18n/navigation";
import type { Project, ProjectCategory } from "../../content/projects";

type Item = Project & { stars?: number; downloads?: number };

const categories: ProjectCategory[] = ["discord", "minecraft", "web"];

const chip =
  "border border-line px-3 py-1.5 font-mono text-xs transition-colors hover:border-fg aria-pressed:border-fg aria-pressed:bg-fg aria-pressed:text-bg";

// Category filter plus clickable tech tags; both narrow the list together
export function ProjectGrid({ projects }: { projects: Item[] }) {
  const t = useTranslations("projects");
  const locale = useLocale() as "ru" | "en";
  const [category, setCategory] = useState<ProjectCategory | "all">("all");
  const [tag, setTag] = useState<string | null>(null);
  const available = categories.filter((c) => projects.some((p) => p.categories.includes(c)));
  const visible = projects.filter(
    (p) => (category === "all" || p.categories.includes(category)) && (!tag || p.tags.includes(tag)),
  );

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center gap-2" role="group">
        {(["all", ...available] as const).map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={category === c}
            onClick={() => setCategory(c)}
            className={`${chip} uppercase tracking-wider`}
          >
            {t(c)}
          </button>
        ))}
        {tag && (
          <button type="button" aria-pressed onClick={() => setTag(null)} className={chip}>
            #{tag} {t("clearTag")}
          </button>
        )}
      </div>
      {visible.length === 0 && <p className="font-mono text-sm text-muted">{t("empty")}</p>}
      <motion.ul layout className="grid gap-px border border-line bg-line md:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {visible.map((p) => (
            <motion.li
              key={p.slug}
              layout
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.35 }}
              className="group relative flex flex-col gap-4 bg-bg p-6 md:p-8"
            >
              <div className="flex items-baseline justify-between gap-4 font-mono text-xs text-muted">
                {/* Meta and title morph into the case study header */}
                <ViewTransition name={`project-meta-${p.slug}`} share="morph" default="none">
                  <span>
                    {p.categories.map((c) => t(c)).join(" · ")} · {p.year}
                  </span>
                </ViewTransition>
                <span className="flex gap-3">
                  {p.stars !== undefined && (
                    <span>
                      ★ {p.stars} {t("stars")}
                    </span>
                  )}
                  {p.downloads !== undefined && (
                    <span>
                      ↓ {p.downloads.toLocaleString(locale)} {t("downloads")}
                    </span>
                  )}
                </span>
              </div>
              <ViewTransition name={`project-title-${p.slug}`} share="morph" default="none">
                <h3 className="w-fit text-2xl font-semibold tracking-tight">{p.title}</h3>
              </ViewTransition>
              <p className="text-muted">{p.summary[locale]}</p>
              <ul className="relative z-10 mt-auto flex flex-wrap gap-2 font-mono text-xs">
                {p.tags.map((tg) => (
                  <li key={tg}>
                    <button
                      type="button"
                      aria-pressed={tag === tg}
                      onClick={() => setTag(tag === tg ? null : tg)}
                      className="bg-surface px-2 py-1 transition-colors hover:text-accent aria-pressed:text-accent"
                    >
                      #{tg}
                    </button>
                  </li>
                ))}
              </ul>
              <div className="flex gap-4 text-sm">
                {p.caseStudy && (
                  <Link href={`/projects/${p.slug}`} className="after:absolute after:inset-0 group-hover:text-accent">
                    {t("case")} →
                  </Link>
                )}
                {p.repo && (
                  <a href={`https://github.com/${p.repo}`} className="relative z-10 text-muted hover:text-fg">
                    {t("source")} ↗
                  </a>
                )}
                {p.url && (
                  <a href={p.url} className="relative z-10 text-muted hover:text-fg">
                    {new URL(p.url).hostname} ↗
                  </a>
                )}
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </div>
  );
}
