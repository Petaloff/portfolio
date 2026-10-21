import { describe, expect, it } from "vitest";
import { paragraphs } from "../paragraphs";
import { parseProject, upsertProject } from "./projects";

function form(fields: Record<string, string | string[]>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    for (const v of Array.isArray(value) ? value : [value]) data.append(key, v);
  }
  return data;
}

const valid = {
  slug: "cool-bot",
  title: "Cool Bot",
  "summary.ru": "Бот",
  "summary.en": "Bot",
  categories: ["discord", "nope"],
  year: "2026",
  tags: "discord.js, TypeScript, discord.js",
};

describe("parseProject", () => {
  it("builds a project from the form", () => {
    expect(parseProject(form(valid))).toEqual({
      project: {
        slug: "cool-bot",
        title: "Cool Bot",
        summary: { ru: "Бот", en: "Bot" },
        categories: ["discord"],
        year: 2026,
        tags: ["discord.js", "TypeScript"],
      },
    });
  });

  it("rejects bad fields", () => {
    expect(parseProject(form({ ...valid, slug: "Bad Slug!" }))).toEqual({ error: "slug" });
    expect(parseProject(form({ ...valid, categories: [] }))).toEqual({ error: "category" });
    expect(parseProject(form({ ...valid, year: "99" }))).toEqual({ error: "year" });
    expect(parseProject(form({ ...valid, url: "javascript:alert(1)" }))).toEqual({ error: "url" });
  });

  it("turns a story into a case study and fills the missing language", () => {
    const result = parseProject(form({ ...valid, "story.ru": "Первый абзац" }));
    expect(result).toMatchObject({ project: { caseStudy: true, story: { ru: "Первый абзац", en: "Первый абзац" } } });
  });
});

describe("upsertProject", () => {
  const a = { slug: "a", title: "A", summary: { ru: "", en: "" }, categories: [], tags: [], year: 2026 } as const;
  const list = [
    { ...a, categories: [...a.categories], tags: [...a.tags] },
    { ...a, slug: "b", categories: [], tags: [] },
  ];

  it("adds a new project", () => {
    expect(upsertProject(list, { ...list[0], slug: "c" }, null)).toMatchObject({ list: [{}, {}, { slug: "c" }] });
  });

  it("renames in place", () => {
    expect(upsertProject(list, { ...list[0], slug: "z" }, "a")).toMatchObject({ list: [{ slug: "z" }, { slug: "b" }] });
  });

  it("refuses to take another project's slug", () => {
    expect(upsertProject(list, { ...list[0], slug: "b" }, "a")).toEqual({ error: "duplicate" });
  });
});

describe("paragraphs", () => {
  it("splits on blank lines", () => {
    expect(paragraphs("one\nline\n\n  two  \n\n\n")).toEqual(["one\nline", "two"]);
  });
});
