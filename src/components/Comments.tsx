"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "@/lib/store";

const repo = process.env.NEXT_PUBLIC_GISCUS_REPO;
const repoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID;
const category = process.env.NEXT_PUBLIC_GISCUS_CATEGORY;
const categoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID;

// Giscus comments backed by GitHub Discussions; hidden until configured
export function Comments({ locale }: { locale: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  useEffect(() => {
    const el = ref.current;
    if (!el || !repo || !repoId || !category || !categoryId) return;
    const script = document.createElement("script");
    Object.entries({
      src: "https://giscus.app/client.js",
      "data-repo": repo,
      "data-repo-id": repoId,
      "data-category": category,
      "data-category-id": categoryId,
      "data-mapping": "pathname",
      "data-reactions-enabled": "1",
      "data-input-position": "top",
      "data-theme": theme === "dark" ? "dark" : "light",
      "data-lang": locale,
      "data-loading": "lazy",
      crossorigin: "anonymous",
    }).forEach(([k, v]) => script.setAttribute(k, v));
    script.async = true;
    el.replaceChildren(script);
  }, [locale, theme]);

  if (!repo) return null;
  return <div ref={ref} className="mt-16 border-t border-line pt-10" />;
}
