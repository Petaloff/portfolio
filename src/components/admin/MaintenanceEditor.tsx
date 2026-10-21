"use client";

import { useState, useTransition } from "react";
import {
  addMaintenanceUser,
  removeMaintenanceUser,
  setMaintenance,
  type AdminState,
} from "@/app/[locale]/admin/actions";
import type { Maintenance } from "@/lib/admin/maintenance";
import { danger, field, Label, primary, Status, useAdminForm } from "./ui";

export function MaintenanceEditor({ config, locale }: { config: Maintenance; locale: string }) {
  const [pending, start] = useTransition();
  const [state, setState] = useState<AdminState>(null);
  const run = (fn: () => Promise<AdminState>) => start(async () => setState(await fn()));
  const add = useAdminForm(addMaintenanceUser);

  return (
    <div className="grid max-w-3xl gap-12">
      <section>
        <div className="flex flex-wrap items-center gap-4">
          <span
            className={`flex items-center gap-2 font-mono text-sm ${config.enabled ? "text-accent" : "text-muted"}`}
          >
            <span className={`size-2 rounded-full ${config.enabled ? "bg-accent" : "bg-line"}`} />
            {config.enabled ? "Техработы включены" : "Сайт открыт"}
          </span>
          <button
            type="button"
            className={config.enabled ? primary : danger}
            disabled={pending}
            onClick={() => {
              if (config.enabled || confirm("Закрыть сайт на техработы? Пускать будет только тебя и людей из списка."))
                run(() => setMaintenance(!config.enabled));
            }}
          >
            {config.enabled ? "Открыть сайт" : "Включить техработы"}
          </button>
          <Status state={state} pending={pending} />
        </div>
        <p className="mt-4 max-w-xl text-sm text-muted">
          Пока техработы включены, все страницы ведут на{" "}
          <a href={`/${locale}/maintenance`} className="text-accent hover:underline">
            /maintenance
          </a>
          . Админка остаётся открытой. Тебе и людям из списка там после входа через GitHub появится кнопка «Перейти на
          сайт». Другие серверы подхватывают переключение в течение ~10 секунд.
        </p>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold tracking-tight">Кого пускать</h2>
        <form onSubmit={add.onSubmit} className="flex flex-wrap items-end gap-3">
          <label className="min-w-56 flex-1">
            <Label hint="логин или ссылка на профиль">GitHub</Label>
            <input name="login" required placeholder="octocat" className={field} autoComplete="off" />
          </label>
          <button className={primary} disabled={add.pending}>
            Добавить
          </button>
          <Status state={add.state} pending={add.pending} />
        </form>
        <ul className="mt-6 divide-y divide-line/60 border-y border-line/60">
          <li className="py-3 font-mono text-sm text-muted">ты (владелец) · всегда</li>
          {config.allow.map((u) => (
            <li key={u.id} className="flex items-center gap-4 py-3">
              <a
                href={`https://github.com/${u.login}`}
                target="_blank"
                rel="noreferrer"
                className="min-w-0 flex-1 truncate font-mono text-sm hover:text-accent"
              >
                @{u.login} <span className="text-muted">· id {u.id}</span>
              </a>
              <button
                type="button"
                className={danger}
                disabled={pending}
                onClick={() => run(() => removeMaintenanceUser(u.id))}
              >
                Убрать
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
