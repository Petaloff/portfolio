import { getTranslations } from "next-intl/server";
import { stack } from "@/lib/site";
import { EditorWindow } from "./EditorWindow";

// The stack rendered as the TypeScript object it would be, with light syntax colouring
export async function Stack() {
  const t = await getTranslations("stack");
  return (
    <EditorWindow id="stack" title={t("title")}>
      <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-sm leading-8 md:whitespace-pre md:text-base">
        <code>
          <span className="text-muted">{`// ${t("lead")}`}</span>
          {"\n"}
          <span className="text-accent">export const</span> <span className="text-sky-300">stack</span>
          <span className="text-muted"> = {"{"}</span>
          {"\n"}
          {stack.map((group) => (
            <span key={group.group}>
              {"  "}
              <span className="text-fg">{group.group.toLowerCase()}</span>
              <span className="text-muted">: [</span>
              {group.items.map((item, i) => (
                <span key={item}>
                  <span className="text-amber-200/90">&quot;{item}&quot;</span>
                  {i < group.items.length - 1 && <span className="text-muted">, </span>}
                </span>
              ))}
              <span className="text-muted">],</span>
              {"\n"}
            </span>
          ))}
          <span className="text-muted">{"}"}</span> <span className="text-accent">as const</span>
          <span className="text-muted">;</span>
        </code>
      </pre>
    </EditorWindow>
  );
}
