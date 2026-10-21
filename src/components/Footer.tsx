import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function Footer() {
  const t = await getTranslations();
  const locale = await getLocale();
  return (
    <footer className="mx-auto flex max-w-6xl flex-wrap justify-between gap-4 px-4 py-10 font-mono text-xs text-muted md:px-8">
      <span>© 2026 Petaloff · {t("footer.made")}</span>
      <span className="flex gap-4">
        <a href={`/${locale}/blog/rss.xml`} className="hover:text-fg">
          {t("blog.rss")}
        </a>
        <Link href="/guestbook" className="hover:text-fg">
          {t("nav.guestbook")}
        </Link>
        <Link href="/terms" className="hover:text-fg">
          {t("terms.title")}
        </Link>
        <Link href="/privacy" className="hover:text-fg">
          {t("privacy.title")}
        </Link>
      </span>
    </footer>
  );
}
