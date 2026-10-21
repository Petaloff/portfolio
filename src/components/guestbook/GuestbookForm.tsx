"use client";

import { useTranslations } from "next-intl";
import { useActionState, useState } from "react";
import { post, type PostState } from "@/app/[locale]/guestbook/actions";

export function GuestbookForm({ max, name, image }: { max: number; name: string; image: string | null }) {
  const t = useTranslations("guestbook");
  // Controlled so the text survives a rejected post (React resets uncontrolled forms)
  const [text, setText] = useState("");
  const [state, action, pending] = useActionState(async (prev: PostState, data: FormData) => {
    const next = await post(prev, data);
    if (!next) setText("");
    return next;
  }, null);

  return (
    <form action={action}>
      <div className="mb-3 flex items-center gap-2 font-mono text-xs text-muted">
        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" width={20} height={20} className="h-5 w-5" />
        )}
        <span className="text-fg">{name}</span>
      </div>
      <textarea
        name="text"
        required
        maxLength={max}
        rows={3}
        placeholder={t("placeholder")}
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full resize-none border border-line bg-bg/60 p-3 text-sm transition-colors outline-none placeholder:text-muted focus:border-fg"
      />
      <div className="mt-3 flex items-center justify-between gap-4 font-mono text-xs">
        <span className={state?.error ? "text-rose-400" : "text-muted"} aria-live="polite">
          {state?.error ? t(`error.${state.error}`) : `${text.length}/${max}`}
        </span>
        <button
          disabled={pending}
          className="bg-fg px-4 py-2 text-bg transition-opacity hover:opacity-85 disabled:opacity-50"
        >
          {pending ? "…" : t("submit")}
        </button>
      </div>
    </form>
  );
}
