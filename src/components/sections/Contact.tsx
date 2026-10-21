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
              {/* Hover-only URL hint: desktop only and kept on one line, so a long URL never wraps into an empty row */}
              <a
                href={c.href}
                target="_blank"
                rel="noreferrer"
                className="group flex items-baseline gap-x-3 py-2 text-xl transition-transform duration-300 hover:translate-x-2 md:text-3xl"
              >
                <span className="text-accent transition-transform duration-300 group-hover:rotate-12">$</span>
                <span className="text-muted">open</span>
                <span className="font-sans font-semibold tracking-tight transition-colors group-hover:text-accent">
                  {c.label.toLowerCase()}
                </span>
                <span className="hidden min-w-0 -translate-x-2 truncate text-sm text-muted opacity-0 transition-[opacity,translate] duration-300 group-hover:translate-x-0 group-hover:opacity-100 md:block">
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
