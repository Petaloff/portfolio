import { getTranslations } from "next-intl/server";
import { SkinViewer } from "@/components/SkinViewer";
import { getServerStatus, getSkin } from "@/lib/minecraft";
import { EditorWindow } from "./EditorWindow";

// Skin on the left, server status as a server.properties-style file on the right
export async function Minecraft() {
  const t = await getTranslations("minecraft");
  const [status, skin] = await Promise.all([getServerStatus(), getSkin()]);
  const rows: [string, string, string?][] =
    status.state === "planned"
      ? [
          ["status", t("planned"), "text-amber-200/90"],
          ["server-ip", "—"],
        ]
      : status.state === "offline"
        ? [
            ["status", t("offline"), "text-rose-400"],
            ["server-ip", status.address],
          ]
        : [
            ["status", t("online"), "text-accent"],
            ["server-ip", status.address],
            ["version", status.version ?? "—"],
            ["players", status.players ? `${status.players.online}/${status.players.max}` : "—"],
            ["motd", status.motd ?? "—"],
          ];

  return (
    <EditorWindow id="minecraft" title={t("title")}>
      <div className="grid items-center gap-10 md:grid-cols-[auto_1fr]">
        <figure className="flex flex-col items-center gap-2">
          <SkinViewer skin={skin} hint={t("drag")} />
        </figure>
        <div className="font-mono text-sm leading-8">
          <p className="mb-4 text-muted"># {t("lead")}</p>
          {rows.map(([key, value, color]) => (
            <div key={key} className="flex flex-wrap gap-x-1">
              <span className="text-sky-300">{key}</span>
              <span className="text-muted">=</span>
              <span className={color ?? "text-fg"}>{value}</span>
            </div>
          ))}
          {status.state === "online" && (
            <p className="mt-4 flex items-center gap-2 text-xs text-muted">
              <span className="h-2 w-2 animate-pulse bg-accent" /> mcsrvstat.us
            </p>
          )}
        </div>
      </div>
    </EditorWindow>
  );
}
