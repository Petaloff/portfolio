"use client";

import { useState, useTransition } from "react";
import { refreshSkin, type AdminState } from "@/app/[locale]/admin/actions";
import type { Skin } from "@/lib/minecraft";
import { primary, Status } from "./ui";

export function SkinAdmin({ skin }: { skin: Skin }) {
  const [pending, start] = useTransition();
  const [state, setState] = useState<AdminState>(null);
  const known = skin.id !== skin.name;

  return (
    <div className="grid max-w-3xl gap-6">
      <div className="flex flex-wrap items-center gap-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://mc-heads.net/avatar/${skin.id}/64`}
          alt={skin.name}
          width={64}
          height={64}
          className="[image-rendering:pixelated]"
        />
        <div className="font-mono text-sm">
          <p>{skin.name}</p>
          <p className="mt-1 text-xs break-all text-muted">
            {known
              ? `текстура ${skin.id.slice(0, 16)}…${skin.slim ? " · slim" : ""}`
              : "Mojang не ответил, скин берётся по нику"}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          className={primary}
          disabled={pending}
          onClick={() => start(async () => setState(await refreshSkin()))}
        >
          Обновить скин
        </button>
        <Status state={state} pending={pending} />
      </div>
      <p className="max-w-xl text-sm text-muted">
        Сайт сам сверяет скин с Mojang раз в час. Если поменял скин и не хочешь ждать, нажми кнопку: голова в «Обо мне»
        и модель в разделе Minecraft подтянут новый скин при следующей загрузке страницы.
      </p>
    </div>
  );
}
