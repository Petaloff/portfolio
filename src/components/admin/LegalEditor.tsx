"use client";

import { saveLegalDoc } from "@/app/[locale]/admin/actions";
import type { Locale } from "@/i18n/routing";
import type { LegalDoc } from "@/lib/legal";
import { field, Label, primary, Status, useAdminForm } from "./ui";

export type LegalText = { doc: LegalDoc; locale: Locale; text: string };

const titles: Record<LegalDoc, string> = { terms: "Пользовательское соглашение", privacy: "Конфиденциальность" };

function LegalForm({ doc, locale, text }: LegalText) {
  const { state, onSubmit, pending } = useAdminForm(saveLegalDoc);
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <input type="hidden" name="doc" value={doc} />
      <input type="hidden" name="locale" value={locale} />
      <label>
        <Label hint="абзацы через пустую строку, пусто = текст по умолчанию">
          {titles[doc]} · {locale.toUpperCase()}
        </Label>
        <textarea name="text" defaultValue={text} rows={14} className={`${field} font-sans leading-relaxed`} />
      </label>
      <div className="flex items-center gap-3">
        <button className={primary} disabled={pending}>
          Сохранить
        </button>
        <Status state={state} pending={pending} />
      </div>
    </form>
  );
}

export function LegalEditor({ texts }: { texts: LegalText[] }) {
  return (
    <div className="grid gap-10 lg:grid-cols-2">
      {texts.map((t) => (
        <LegalForm key={`${t.doc}-${t.locale}`} {...t} />
      ))}
    </div>
  );
}
