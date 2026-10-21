import { describe, expect, it } from "vitest";
import { parsePost, stripMeta, upsertPost, type StoredPost } from "./posts";

function form(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.append(key, value);
  return data;
}

const valid = {
  slug: "My-Post",
  title: "Пост",
  description: "О чём он",
  date: "2026-10-21",
  lang: "ru",
  tags: "devlog, discord, devlog",
  body: "Текст\r\n\r\n## Заголовок\r\n",
};

const post = (slug: string): StoredPost => ({
  slug,
  title: slug,
  description: "d",
  date: "2026-10-21",
  lang: "ru",
  tags: [],
  body: "b",
});

describe("parsePost", () => {
  it("builds a post from the form", () => {
    expect(parsePost(form(valid))).toEqual({
      post: {
        slug: "my-post",
        title: "Пост",
        description: "О чём он",
        date: "2026-10-21",
        lang: "ru",
        tags: ["devlog", "discord"],
        body: "Текст\n\n## Заголовок",
      },
    });
  });

  it("marks drafts", () => {
    expect(parsePost(form({ ...valid, draft: "on" }))).toMatchObject({ post: { draft: true } });
  });

  it.each([
    ["slug", { slug: "не латиница" }],
    ["description", { description: " " }],
    ["date", { date: "21.10.2026" }],
    ["lang", { lang: "de" }],
    ["body", { body: "\n" }],
  ])("rejects a bad %s", (error, override) => {
    expect(parsePost(form({ ...valid, ...override }))).toEqual({ error });
  });
});

describe("upsertPost", () => {
  it("adds a new post and replaces an edited one", () => {
    const added = upsertPost([post("a")], post("b"), null, []);
    expect("list" in added && added.list.map((p) => p.slug)).toEqual(["a", "b"]);
    const renamed = upsertPost([post("a"), post("b")], post("c"), "a", []);
    expect("list" in renamed && renamed.list.map((p) => p.slug)).toEqual(["c", "b"]);
  });

  it("saves an edited file post next to the others", () => {
    const result = upsertPost([], post("hello-world"), "hello-world", ["hello-world"]);
    expect(result).toEqual({ list: [post("hello-world")] });
  });

  it("refuses a slug another post already has", () => {
    expect(upsertPost([post("a")], post("a"), null, [])).toEqual({ error: "duplicate" });
    expect(upsertPost([], post("hello-world"), null, ["hello-world"])).toEqual({ error: "duplicate" });
  });
});

describe("stripMeta", () => {
  it("drops the meta export of an MDX post", () => {
    const source = 'export const meta = {\n  title: "Hi",\n  tags: ["a"],\n};\n\nBody **text**.\n';
    expect(stripMeta(source)).toBe("Body **text**.");
  });
});
