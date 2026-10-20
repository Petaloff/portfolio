import type { ReactNode } from "react";
import { Reveal } from "@/components/Reveal";

// Every home section is a "file" open in an editor; the other files show as
// tabs that jump to their section
const files = [
  { id: "about", name: "about.md", lang: "Markdown" },
  { id: "projects", name: "projects.tsx", lang: "TypeScript JSX" },
  { id: "stack", name: "stack.ts", lang: "TypeScript" },
  { id: "minecraft", name: "server.properties", lang: "Properties" },
  { id: "blog", name: "blog.log", lang: "Git Log" },
  { id: "contact", name: "contact.sh", lang: "Shell" },
] as const;

type FileId = (typeof files)[number]["id"];

const commentPrefix: Record<FileId, string> = {
  about: "#",
  projects: "//",
  stack: "//",
  minecraft: "#",
  blog: "#",
  contact: "$",
};

export function EditorWindow({
  id,
  title,
  children,
  className = "",
}: {
  id: FileId;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  const file = files.find((f) => f.id === id)!;
  return (
    <section id={id} className={`mx-auto max-w-6xl px-4 py-20 md:px-8 md:py-28 ${className}`}>
      <Reveal>
        <div className="overflow-hidden border border-line bg-surface/60 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.8)]">
          {/* Title bar with window controls and file tabs */}
          <div className="flex h-10 items-stretch border-b border-line bg-bg/60 font-mono text-xs">
            <div className="flex items-center gap-1.5 px-4" aria-hidden>
              <span className="h-2.5 w-2.5 bg-line" />
              <span className="h-2.5 w-2.5 bg-line" />
              <span className="h-2.5 w-2.5 bg-accent/70" />
            </div>
            <nav className="flex min-w-0 overflow-x-auto" aria-label="files">
              {files.map((f) =>
                f.id === id ? (
                  <span
                    key={f.id}
                    aria-current="page"
                    className="flex shrink-0 items-center gap-2 border-x border-line border-t-2 border-t-accent bg-surface px-4 text-fg"
                  >
                    {f.name}
                  </span>
                ) : (
                  <a
                    key={f.id}
                    href={`#${f.id}`}
                    className="hidden shrink-0 items-center px-4 text-muted transition-colors hover:text-fg md:flex"
                  >
                    {f.name}
                  </a>
                ),
              )}
            </nav>
          </div>

          {/* Breadcrumb */}
          <div className="border-b border-line/60 px-4 py-2 font-mono text-[11px] text-muted md:px-6">
            petaloff <span className="opacity-50">›</span> src <span className="opacity-50">›</span>{" "}
            <span className="text-fg/80">{file.name}</span>
          </div>

          {/* Body with a decorative line-number gutter */}
          <div className="relative">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 hidden w-12 select-none overflow-hidden border-r border-line/60 pt-6 text-right font-mono text-[11px] leading-7 text-muted/50 md:block"
            >
              {Array.from({ length: 80 }, (_, i) => (
                <div key={i} className="pr-3">
                  {i + 1}
                </div>
              ))}
            </div>
            <div className="p-5 md:py-8 md:pl-20 md:pr-10">
              <h2 className="mb-8 font-mono text-sm text-muted">
                <span className="text-accent">{commentPrefix[id]}</span> {title}
              </h2>
              {children}
            </div>
          </div>

          {/* Status bar */}
          <div className="flex h-7 items-center justify-between border-t border-line bg-bg/60 px-4 font-mono text-[11px] text-muted">
            <span className="flex gap-4">
              <span>
                <span className="text-accent">⎇</span> main
              </span>
              <span className="hidden sm:inline">✓ 0 problems</span>
            </span>
            <span className="flex gap-4">
              <span>{file.lang}</span>
              <span className="hidden sm:inline">UTF-8</span>
              <span className="hidden sm:inline">LF</span>
            </span>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
