"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import type { Post } from "@/lib/content";

export function BlogList({ posts }: { posts: Post[] }) {
  const t = useTranslations("blog");
  const locale = useLocale();
  const [tag, setTag] = useState<string | null>(null);
  const tags = [...new Set(posts.flatMap((p) => p.tags))].sort();
  const visible = tag ? posts.filter((p) => p.tags.includes(tag)) : posts;

  if (posts.length === 0) return <p className="text-muted">{t("empty")}</p>;

  return (
    <div>
      <div className="mb-8 flex flex-wrap gap-2" role="group">
        {[null, ...tags].map((value) => (
          <button
            key={value ?? "all"}
            type="button"
            aria-pressed={tag === value}
            onClick={() => setTag(value)}
            className="border border-line px-3 py-1.5 font-mono text-xs transition-colors hover:border-fg aria-pressed:border-fg aria-pressed:bg-fg aria-pressed:text-bg"
          >
            {value ? `#${value}` : t("all")}
          </button>
        ))}
      </div>
      <ul className="divide-y divide-line border-y border-line">
        {visible.map((p) => (
          <li key={p.slug}>
            <Link
              href={`/blog/${p.slug}`}
              className="group grid gap-2 py-6 md:grid-cols-[8rem_1fr_auto] md:items-baseline md:gap-8"
            >
              <time dateTime={p.date} className="font-mono text-xs text-muted">
                {new Date(p.date).toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" })}
              </time>
              <span>
                <span className="block text-xl font-medium tracking-tight transition-colors group-hover:text-accent">
                  {p.title}
                </span>
                <span className="mt-1 block text-muted">{p.description}</span>
              </span>
              <span className="font-mono text-xs uppercase text-muted" title={t("lang")}>
                {p.lang}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
