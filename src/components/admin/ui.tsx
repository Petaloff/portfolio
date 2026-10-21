"use client";

import { useActionState, useTransition, type FormEvent, type ReactNode } from "react";
import type { AdminState } from "@/app/[locale]/admin/actions";

export const field =
  "w-full border border-line bg-bg px-3 py-2 font-mono text-sm text-fg transition-colors outline-none placeholder:text-muted/60 focus:border-accent";
export const button =
  "inline-flex h-9 items-center justify-center border border-line px-4 font-mono text-xs tracking-wider uppercase transition-[color,border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-fg hover:text-fg active:translate-y-0 disabled:pointer-events-none disabled:opacity-50";
export const primary = `${button} border-accent text-accent hover:border-accent hover:bg-accent hover:text-bg`;
export const danger = `${button} border-rose-400/40 text-rose-300 hover:border-rose-400 hover:text-rose-200`;

const errors: Record<NonNullable<NonNullable<AdminState>["error"]>, string> = {
  storage: "Redis не подключён, сохранять некуда",
  input: "Что-то не так с данными формы",
  icu: "Сломан синтаксис ICU в ключах",
  slug: "Slug: латиница, цифры и дефисы, до 48 символов",
  title: "Нужно название до 80 символов",
  summary: "Нужно описание на обоих языках",
  category: "Выбери хотя бы одну категорию",
  year: "Год выглядит странно",
  repo: "Репозиторий в виде owner/name",
  url: "Ссылка должна начинаться с http(s)://",
  duplicate: "Проект с таким slug уже есть",
};

export function Status({ state, pending }: { state: AdminState; pending?: boolean }) {
  if (pending) return <span className="font-mono text-xs text-muted">сохраняю…</span>;
  if (!state) return null;
  if (state.ok) return <span className="font-mono text-xs text-accent">сохранено ✓</span>;
  return (
    <span className="font-mono text-xs text-rose-300">
      {errors[state.error!]}
      {state.keys && `: ${state.keys.join(", ")}`}
    </span>
  );
}

export function Label({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <span className="mb-1.5 block font-mono text-xs text-muted">
      {children}
      {hint && <span className="ml-2 opacity-60">{hint}</span>}
    </span>
  );
}

// Submits without React's automatic form reset, so a validation error keeps what was typed
export function useAdminForm(fn: (state: AdminState, form: FormData) => Promise<AdminState>) {
  const [state, action, pending] = useActionState<AdminState, FormData>(fn, null);
  const [, start] = useTransition();
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    start(() => action(data));
  };
  return { state, onSubmit, pending };
}
