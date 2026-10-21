"use client";

import { useState, type ReactNode } from "react";
import { button } from "./ui";

export type AdminTab = { id: string; label: string; count?: number; content: ReactNode };

// Tabs over the editors. Hidden tabs stay mounted, so switching never loses unsaved edits
export function AdminPanel({ tabs }: { tabs: AdminTab[] }) {
  const [active, setActive] = useState(tabs[0].id);
  return (
    <div>
      <nav className="mb-8 flex flex-wrap gap-2" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={active === t.id}
            onClick={() => setActive(t.id)}
            className={`${button} aria-selected:border-fg aria-selected:bg-fg aria-selected:text-bg`}
          >
            {t.label}
            {t.count !== undefined && <span className="ml-2 opacity-60">{t.count}</span>}
          </button>
        ))}
      </nav>
      {tabs.map((t) => (
        <div key={t.id} role="tabpanel" hidden={active !== t.id} className="admin-tab">
          {t.content}
        </div>
      ))}
    </div>
  );
}
