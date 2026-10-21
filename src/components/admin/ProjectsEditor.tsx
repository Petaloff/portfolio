"use client";

import { useState, useTransition } from "react";
import { deleteProject, resetProjects, saveProject, type AdminState } from "@/app/[locale]/admin/actions";
import { CATEGORIES } from "@/lib/admin/projects";
import type { Project } from "../../../content/projects";
import { button, danger, field, Label, primary, Status, useAdminForm } from "./ui";

const empty: Project = {
  slug: "",
  title: "",
  categories: [],
  summary: { ru: "", en: "" },
  tags: [],
  year: new Date().getFullYear(),
};

function ProjectForm({ project, isNew = false }: { project: Project; isNew?: boolean }) {
  const { state, onSubmit, pending } = useAdminForm(saveProject);
  const [deleting, startDelete] = useTransition();
  const [deleteState, setDeleteState] = useState<AdminState>(null);

  return (
    <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
      <input type="hidden" name="original" value={isNew ? "" : project.slug} />
      <label>
        <Label hint="в адресе /projects/…">slug</Label>
        <input name="slug" defaultValue={project.slug} required className={field} />
      </label>
      <label>
        <Label>Название</Label>
        <input name="title" defaultValue={project.title} required className={field} />
      </label>
      <label>
        <Label>Описание RU</Label>
        <textarea name="summary.ru" defaultValue={project.summary.ru} rows={2} required className={field} />
      </label>
      <label>
        <Label>Описание EN</Label>
        <textarea name="summary.en" defaultValue={project.summary.en} rows={2} required className={field} />
      </label>
      <fieldset>
        <Label>Категории</Label>
        <div className="flex flex-wrap gap-4 font-mono text-sm">
          {CATEGORIES.map((c) => (
            <label key={c} className="flex items-center gap-2">
              <input
                type="checkbox"
                name="categories"
                value={c}
                defaultChecked={project.categories.includes(c)}
                className="accent-[var(--accent)]"
              />
              {c}
            </label>
          ))}
        </div>
      </fieldset>
      <label>
        <Label>Год</Label>
        <input name="year" type="number" defaultValue={project.year} required className={field} />
      </label>
      <label className="md:col-span-2">
        <Label hint="через запятую">Теги</Label>
        <input name="tags" defaultValue={project.tags.join(", ")} className={field} />
      </label>
      <label>
        <Label hint="owner/name, для звёзд">GitHub</Label>
        <input name="repo" defaultValue={project.repo ?? ""} className={field} />
      </label>
      <label>
        <Label hint="slug, для загрузок">Modrinth</Label>
        <input name="modrinth" defaultValue={project.modrinth ?? ""} className={field} />
      </label>
      <label className="md:col-span-2">
        <Label>Ссылка на сайт</Label>
        <input name="url" type="url" defaultValue={project.url ?? ""} className={field} />
      </label>
      <label>
        <Label hint="абзацы через пустую строку">История RU</Label>
        <textarea name="story.ru" defaultValue={project.story?.ru ?? ""} rows={5} className={field} />
      </label>
      <label>
        <Label hint="пусто = берётся RU">История EN</Label>
        <textarea name="story.en" defaultValue={project.story?.en ?? ""} rows={5} className={field} />
      </label>
      <label className="flex items-center gap-2 font-mono text-xs text-muted md:col-span-2">
        <input type="checkbox" name="caseStudy" defaultChecked={project.caseStudy} className="accent-[var(--accent)]" />
        Есть страница кейса (MDX-файл в content/projects или история выше)
      </label>
      <div className="flex flex-wrap items-center gap-3 md:col-span-2">
        <button className={primary} disabled={pending}>
          {isNew ? "Добавить" : "Сохранить"}
        </button>
        {!isNew && (
          <button
            type="button"
            className={danger}
            disabled={deleting}
            onClick={() => {
              if (!confirm(`Удалить «${project.title}»?`)) return;
              startDelete(async () => setDeleteState(await deleteProject(project.slug)));
            }}
          >
            Удалить
          </button>
        )}
        <Status state={deleteState ?? state} pending={pending || deleting} />
      </div>
    </form>
  );
}

export function ProjectsEditor({ projects }: { projects: Project[] }) {
  const [resetting, startReset] = useTransition();
  return (
    <div className="space-y-3">
      {projects.map((p) => (
        <details key={p.slug} className="group border border-line bg-bg/40 open:bg-surface/60">
          <summary className="flex cursor-pointer items-baseline justify-between gap-4 px-5 py-4 transition-colors hover:bg-surface">
            <span className="text-lg font-medium tracking-tight">{p.title}</span>
            <span className="font-mono text-xs text-muted">
              {p.slug} · {p.year}
            </span>
          </summary>
          <div className="border-t border-line p-5">
            <ProjectForm project={p} />
          </div>
        </details>
      ))}
      <details className="border border-dashed border-accent/40 open:bg-surface/60">
        <summary className="cursor-pointer px-5 py-4 font-mono text-sm text-accent">+ Новый проект</summary>
        <div className="border-t border-line p-5">
          <ProjectForm project={empty} isNew />
        </div>
      </details>
      <button
        type="button"
        className={`${button} mt-4`}
        disabled={resetting}
        onClick={() => {
          if (confirm("Вернуть проекты из content/projects.ts? Всё, что добавлено в админке, пропадёт.")) {
            startReset(async () => void (await resetProjects()));
          }
        }}
      >
        Сбросить к файлу
      </button>
    </div>
  );
}
