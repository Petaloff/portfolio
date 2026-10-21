"use client";

import { AnimatePresence, motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { useState, ViewTransition } from "react";
import { Tilt } from "@/components/motion/Tilt";
import { ProjectCover } from "@/components/ProjectCover";
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
            className={`${chip} tracking-wider uppercase`}
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
          {visible.map((p, i) => (
            <motion.li
              key={p.slug}
              layout
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="group bg-bg transition-colors duration-300 hover:z-10 hover:bg-surface"
            >
              <Tilt className="flex h-full flex-col gap-4 p-6 transition-shadow duration-300 group-hover:shadow-[0_24px_60px_-30px_color-mix(in_oklab,var(--accent)_45%,transparent)] md:p-8">
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
                <div className="flex items-start justify-between gap-4">
                  <ViewTransition name={`project-title-${p.slug}`} share="morph" default="none">
                    <h3 className="w-fit text-2xl font-semibold tracking-tight transition-transform duration-300 group-hover:translate-x-1">
                      {p.title}
                    </h3>
                  </ViewTransition>
                  {p.categories[0] && <ProjectCover category={p.categories[0]} />}
                </div>
                <p className="text-muted">{p.summary[locale]}</p>
                <ul className="relative z-10 mt-auto flex flex-wrap gap-2 font-mono text-xs">
                  {p.tags.map((tg) => (
                    <li key={tg}>
                      <button
                        type="button"
                        aria-pressed={tag === tg}
                        onClick={() => setTag(tag === tg ? null : tg)}
                        className="inline-block bg-line/50 px-2 py-1 transition-[color,transform,background-color] duration-200 hover:-translate-y-0.5 hover:bg-line hover:text-accent aria-pressed:text-accent"
                      >
                        #{tg}
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="flex gap-4 text-sm">
                  {p.caseStudy && (
                    <Link href={`/projects/${p.slug}`} className="group-hover:text-accent after:absolute after:inset-0">
                      {t("case")}{" "}
                      <span className="inline-block transition-transform duration-300 group-hover:translate-x-1.5">
                        →
                      </span>
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
              </Tilt>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </div>
  );
}
