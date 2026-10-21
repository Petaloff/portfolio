"use client";

import { useState, useTransition } from "react";
import { clearGuestbook, deleteGuestbookEntry, type AdminState } from "@/app/[locale]/admin/actions";
import type { Entry } from "@/lib/guestbook";
import { danger, Status } from "./ui";

export function GuestbookAdmin({ entries, locale }: { entries: Entry[]; locale: string }) {
  const [pending, start] = useTransition();
  const [state, setState] = useState<AdminState>(null);
  const run = (fn: () => Promise<AdminState>) => start(async () => setState(await fn()));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <span className="font-mono text-sm text-muted">Записей: {entries.length}</span>
        <button
          type="button"
          className={danger}
          disabled={pending || entries.length === 0}
          onClick={() => {
            if (confirm("Точно очистить всю гостевую книгу? Вернуть не получится.")) run(clearGuestbook);
          }}
        >
          Очистить всё
        </button>
        <Status state={state} pending={pending} />
      </div>
      <ol className="divide-y divide-line/60 border-y border-line/60">
        {entries.length === 0 && <li className="py-6 font-mono text-sm text-muted">Пусто.</li>}
        {entries.map((e) => (
          <li key={e.id} className="flex items-start gap-4 py-4 transition-colors hover:bg-bg/40">
            <div className="min-w-0 flex-1">
              <p className="font-mono text-xs text-muted">
                <span className="text-fg">{e.name}</span> · {e.provider} ·{" "}
                {new Date(e.at).toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" })}
              </p>
              <p className="mt-1 break-words">{e.text}</p>
            </div>
            <button
              type="button"
              className={danger}
              disabled={pending}
              onClick={() => run(() => deleteGuestbookEntry(e.id))}
            >
              Удалить
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
