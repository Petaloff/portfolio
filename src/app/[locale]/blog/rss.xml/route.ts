import { getPosts } from "@/lib/content";
import { site } from "@/lib/site";

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function GET(_req: Request, { params }: RouteContext<"/[locale]/blog/rss.xml">) {
  const { locale } = await params;
  const posts = await getPosts();
  const items = posts
    .map(
      (p) => `<item>
  <title>${escape(p.title)}</title>
  <link>${site.url}/${p.lang}/blog/${p.slug}</link>
  <guid>${site.url}/${p.lang}/blog/${p.slug}</guid>
  <description>${escape(p.description)}</description>
  <pubDate>${new Date(p.date).toUTCString()}</pubDate>
  ${p.tags.map((t) => `<category>${escape(t)}</category>`).join("")}
</item>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>${site.name} — blog</title>
  <link>${site.url}/${locale}/blog</link>
  <description>Devlog</description>
  <language>${locale}</language>
${items}
</channel>
</rss>`;

  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
