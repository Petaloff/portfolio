"use client";

import { useState, useTransition } from "react";
import { resetMessages, saveMessages } from "@/app/[locale]/admin/actions";
import type { Locale } from "@/i18n/routing";
import type { FlatMessages } from "@/lib/admin/messages";
import { button, field, primary, Status, useAdminForm } from "./ui";

type Props = { locale: Locale; defaults: FlatMessages; overrides: FlatMessages };

function LocaleForm({ locale, defaults, overrides }: Props) {
  const { state, onSubmit, pending } = useAdminForm(saveMessages);
  const [query, setQuery] = useState("");
  const [resetting, startReset] = useTransition();
  const q = query.trim().toLowerCase();
  const edited = Object.keys(overrides).length;

  return (
    <form onSubmit={onSubmit}>
      <input type="hidden" name="locale" value={locale} />
      <div className="sticky top-16 z-10 -mx-1 mb-4 flex flex-wrap items-center gap-3 bg-surface/95 px-1 py-3 backdrop-blur">
        <input
          type="search"
          placeholder="Поиск по ключу или тексту"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={`${field} max-w-xs`}
        />
        <button className={primary} disabled={pending}>
          Сохранить {locale.toUpperCase()}
        </button>
        <button
          type="button"
          className={button}
          disabled={resetting || edited === 0}
          onClick={() => {
            if (confirm(`Вернуть все тексты ${locale.toUpperCase()} к messages/${locale}.json?`)) {
              startReset(async () => void (await resetMessages(locale)));
            }
          }}
        >
          Сбросить ({edited})
        </button>
        <Status state={state} pending={pending || resetting} />
      </div>
      <div className="divide-y divide-line/60">
        {Object.entries(defaults).map(([key, value]) => {
          const current = overrides[key] ?? value;
          const hidden = q && !key.toLowerCase().includes(q) && !current.toLowerCase().includes(q);
          return (
            <label key={key} className={`grid gap-2 py-3 md:grid-cols-[14rem_1fr] ${hidden ? "hidden" : ""}`}>
              <span className="font-mono text-xs break-all text-muted">
                {key}
                {key in overrides && <span className="ml-2 text-accent">● изменён</span>}
              </span>
              <textarea
                name={`m:${key}`}
                defaultValue={current}
                placeholder={value}
                rows={Math.min(6, Math.max(1, Math.ceil(current.length / 70)))}
                className={field}
              />
            </label>
          );
        })}
      </div>
    </form>
  );
}

export function MessagesEditor({ locales }: { locales: Props[] }) {
  const [active, setActive] = useState(locales[0].locale);
  return (
    <div>
      <div className="mb-4 flex gap-2" role="group">
        {locales.map((l) => (
          <button
            key={l.locale}
            type="button"
            aria-pressed={active === l.locale}
            onClick={() => setActive(l.locale)}
            className={`${button} aria-pressed:border-fg aria-pressed:bg-fg aria-pressed:text-bg`}
          >
            {l.locale}
          </button>
        ))}
      </div>
      <p className="mb-4 text-sm text-muted">
        Пустое поле или текст как в файле не сохраняются, работает значение из messages/*.json. Плюралы и переменные в
        фигурных скобках проверяются перед сохранением.
      </p>
      {locales.map((l) => (
        <div key={l.locale} hidden={active !== l.locale}>
          <LocaleForm {...l} />
        </div>
      ))}
    </div>
  );
}
