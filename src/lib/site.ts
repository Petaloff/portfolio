export const site = {
  name: "Petaloff",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.petaloff.space",
  github: "Petaloff",
  modrinth: "Petaloff",
  curseforge: "Petaloff",
  discordId: "1082579184397865050",
  // Fill these in to show them in the contact section
  telegram: null as string | null,
  email: null as string | null,
};

export const contacts = [
  { label: "Discord", href: `https://discord.com/users/${site.discordId}` },
  site.telegram && { label: "Telegram", href: `https://t.me/${site.telegram}` },
  { label: "GitHub", href: `https://github.com/${site.github}` },
  { label: "Modrinth", href: `https://modrinth.com/user/${site.modrinth}` },
  { label: "CurseForge", href: `https://www.curseforge.com/members/${site.curseforge}` },
  site.email && { label: "Email", href: `mailto:${site.email}` },
].filter((c): c is { label: string; href: string } => Boolean(c));

export const stack = [
  { group: "Languages", items: ["TypeScript", "Java", "Kotlin", "Python"] },
  { group: "Bots", items: ["discord.js", "JDA", "Node.js", "Redis"] },
  { group: "Minecraft", items: ["Fabric", "Paper", "Gradle", "Mixin"] },
  { group: "Web", items: ["Next.js", "React", "PostgreSQL", "Docker"] },
];
