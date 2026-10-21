import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Logo } from "./Logo";
import { LocaleSwitch, ModeToggle } from "./ui/Controls";

export async function Header() {
  const t = await getTranslations("nav");
  const links = [
    { href: "/#about", label: t("about") },
    { href: "/#projects", label: t("projects") },
    { href: "/#stack", label: t("stack") },
    { href: "/blog", label: t("blog") },
    { href: "/changelog", label: t("changelog") },
    { href: "/now", label: t("now") },
    { href: "/#contact", label: t("contact") },
  ];
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-line/60 bg-bg/70 backdrop-blur-md">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4">
        {t("skip")}
      </a>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 md:px-8">
        <Link
          href="/"
          aria-label="Petaloff"
          className="flex items-center gap-2.5 font-mono text-sm font-semibold tracking-tight"
        >
          <Logo className="h-5 w-4" />
          petaloff
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="transition-colors hover:text-fg">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            <ModeToggle />
          </div>
          <LocaleSwitch />
        </div>
      </div>
    </header>
  );
}
