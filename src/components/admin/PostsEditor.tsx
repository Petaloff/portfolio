"use client";

import { useState, useTransition } from "react";
import { deletePost, savePost, type AdminState } from "@/app/[locale]/admin/actions";
import { routing } from "@/i18n/routing";
import type { StoredPost } from "@/lib/admin/posts";
import { danger, field, Label, primary, Status, useAdminForm } from "./ui";

export type EditablePost = StoredPost & { file: boolean };

// A file post that was never saved here has nothing in Redis to delete
function PostForm({ post, saved, isNew = false }: { post: EditablePost; saved: boolean; isNew?: boolean }) {
  const { state, onSubmit, pending } = useAdminForm(savePost);
  const [deleting, startDelete] = useTransition();
  const [deleteState, setDeleteState] = useState<AdminState>(null);

  return (
    <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
      <input type="hidden" name="original" value={isNew ? "" : post.slug} />
      <label>
        <Label hint={post.file ? "у поста из файла не меняется" : "в адресе /blog/…"}>slug</Label>
        <input name="slug" defaultValue={post.slug} required readOnly={post.file} className={field} />
      </label>
      <label>
        <Label>Название</Label>
        <input name="title" defaultValue={post.title} required className={field} />
      </label>
      <label className="md:col-span-2">
        <Label>Описание</Label>
        <textarea name="description" defaultValue={post.description} rows={2} required className={field} />
      </label>
      <label>
        <Label>Дата</Label>
        <input name="date" type="date" defaultValue={post.date} required className={field} />
      </label>
      <label>
        <Label>Язык</Label>
        <select name="lang" defaultValue={post.lang} className={field}>
          {routing.locales.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </label>
      <label className="md:col-span-2">
        <Label hint="через запятую">Теги</Label>
        <input name="tags" defaultValue={post.tags.join(", ")} className={field} />
      </label>
      <label className="md:col-span-2">
        <Label hint="Markdown: ## заголовки, **жирный**, [ссылки](https://…), списки, `код`">Текст</Label>
        <textarea name="body" defaultValue={post.body} rows={18} required className={`${field} leading-relaxed`} />
      </label>
      <label className="flex items-center gap-2 font-mono text-xs text-muted md:col-span-2">
        <input type="checkbox" name="draft" defaultChecked={post.draft} className="accent-[var(--accent)]" />
        Черновик: пост не виден на сайте
      </label>
      {post.file && (
        <p className="font-mono text-xs text-muted md:col-span-2">
          Пост из content/blog/{post.slug}.mdx. После сохранения сайт показывает версию из админки
          {saved ? ", кнопка ниже вернёт файл." : "."}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3 md:col-span-2">
        <button className={primary} disabled={pending}>
          {isNew ? "Опубликовать" : "Сохранить"}
        </button>
        {!isNew && !post.draft && (
          <a
            href={`/${post.lang}/blog/${post.slug}`}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-xs text-accent hover:underline"
          >
            Открыть ↗
          </a>
        )}
        {saved && (
          <button
            type="button"
            className={danger}
            disabled={deleting}
            onClick={() => {
              const question = post.file ? `Вернуть «${post.title}» к версии из файла?` : `Удалить «${post.title}»?`;
              if (!confirm(question)) return;
              startDelete(async () => setDeleteState(await deletePost(post.slug)));
            }}
          >
            {post.file ? "Вернуть файл" : "Удалить"}
          </button>
        )}
        <Status state={deleteState ?? state} pending={pending || deleting} />
      </div>
    </form>
  );
}

export function PostsEditor({ posts, saved }: { posts: EditablePost[]; saved: string[] }) {
  const empty: EditablePost = {
    slug: "",
    title: "",
    description: "",
    date: new Date().toISOString().slice(0, 10),
    lang: "ru",
    tags: [],
    body: "",
    file: false,
  };
  return (
    <div className="space-y-3">
      <details className="border border-dashed border-accent/40 open:bg-surface/60">
        <summary className="cursor-pointer px-5 py-4 font-mono text-sm text-accent">+ Новый пост</summary>
        <div className="border-t border-line p-5">
          <PostForm post={empty} saved={false} isNew />
        </div>
      </details>
      {posts.map((p) => (
        <details key={p.slug} className="group border border-line bg-bg/40 open:bg-surface/60">
          <summary className="flex cursor-pointer items-baseline justify-between gap-4 px-5 py-4 transition-colors hover:bg-surface">
            <span className="text-lg font-medium tracking-tight">
              {p.title}
              {p.draft && <span className="ml-3 font-mono text-xs text-muted">черновик</span>}
            </span>
            <span className="font-mono text-xs text-muted">
              {p.slug} · {p.lang} · {p.date}
            </span>
          </summary>
          <div className="border-t border-line p-5">
            <PostForm post={p} saved={saved.includes(p.slug)} />
          </div>
        </details>
      ))}
    </div>
  );
}
