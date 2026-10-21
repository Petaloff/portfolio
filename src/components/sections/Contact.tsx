import { getTranslations } from "next-intl/server";
import { contacts } from "@/lib/site";
import { EditorWindow } from "./EditorWindow";

// Contacts as a terminal session: one command per channel
export async function Contact() {
  const t = await getTranslations("contact");
  return (
    <EditorWindow id="contact" title={t("title")} className="pb-10 md:pb-16">
      <div className="font-mono">
        <p className="text-sm text-muted">
          <span className="text-accent">petaloff@dev</span>:~$ cat README
        </p>
        <p className="mt-2 mb-8 text-sm">{t("lead")}</p>
        <ul className="space-y-1">
          {contacts.map((c) => (
            <li key={c.label}>
              <a
                href={c.href}
                target="_blank"
                rel="noreferrer"
                className="group flex flex-wrap items-baseline gap-x-3 py-2 text-xl md:text-3xl"
              >
                <span className="text-accent">$</span>
                <span className="text-muted">open</span>
                <span className="font-sans font-semibold tracking-tight transition-colors group-hover:text-accent">
                  {c.label.toLowerCase()}
                </span>
                <span className="text-sm text-muted opacity-0 transition-opacity group-hover:opacity-100">
                  → {c.href.replace(/^(https?:\/\/|mailto:)/, "")}
                </span>
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-muted">
          <span className="text-accent">petaloff@dev</span>:~${" "}
          <span className="inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-fg" />
        </p>
      </div>
    </EditorWindow>
  );
}
