"use client";

import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { remove } from "@/app/[locale]/guestbook/actions";

export function DeleteEntry({ id }: { id: string }) {
  const t = useTranslations("guestbook");
  const [pending, start] = useTransition();
  return (
    <button
      onClick={() => start(() => remove(id))}
      disabled={pending}
      className="text-rose-400/80 hover:text-rose-400 disabled:opacity-50"
    >
      {t("delete")}
    </button>
  );
}
