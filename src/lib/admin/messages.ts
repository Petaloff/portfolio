import { parse } from "@formatjs/icu-messageformat-parser";

// Interface texts are edited as a flat "section.key" → string map. The JSON
// files stay the defaults, Redis keeps only the keys that differ from them

export type MessageTree = { [key: string]: string | MessageTree };
export type FlatMessages = Record<string, string>;

export function flatten(tree: MessageTree, prefix = ""): FlatMessages {
  const out: FlatMessages = {};
  for (const [key, value] of Object.entries(tree)) {
    const path = `${prefix}${key}`;
    if (typeof value === "string") out[path] = value;
    else Object.assign(out, flatten(value, `${path}.`));
  }
  return out;
}

// Defaults with overrides applied. Keys that no longer exist in the defaults
// are dropped, so a renamed key never leaves junk behind
export function applyOverrides(defaults: MessageTree, overrides: FlatMessages | null | undefined): MessageTree {
  if (!overrides) return defaults;
  const walk = (tree: MessageTree, prefix: string): MessageTree =>
    Object.fromEntries(
      Object.entries(tree).map(([key, value]) => {
        const path = `${prefix}${key}`;
        if (typeof value !== "string") return [key, walk(value, `${path}.`)];
        const override = overrides[path];
        return [key, typeof override === "string" && override.trim() ? override : value];
      }),
    );
  return walk(defaults, "");
}

// Only the edited values that are known keys and differ from the default
export function diffOverrides(defaults: FlatMessages, edited: FlatMessages): FlatMessages {
  const out: FlatMessages = {};
  for (const [key, value] of Object.entries(edited)) {
    if (key in defaults && value.trim() && value !== defaults[key]) out[key] = value;
  }
  return out;
}

// Keys whose text is not valid ICU, so a typo in a plural can't take the site down
export function invalidMessages(messages: FlatMessages): string[] {
  return Object.entries(messages)
    .filter(([, value]) => {
      try {
        parse(value);
        return false;
      } catch {
        return true;
      }
    })
    .map(([key]) => key);
}
