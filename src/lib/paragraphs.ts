// Paragraphs of a plain text field (stories, legal pages), split by blank lines
export function paragraphs(story: string): string[] {
  return story
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}
