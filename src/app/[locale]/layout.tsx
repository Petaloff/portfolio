import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { locale as rootLocale } from "next/root-params";
import { Analytics } from "@/components/Analytics";
import { EasterEgg } from "@/components/EasterEgg";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ScrollProgress } from "@/components/motion/ScrollProgress";
import { SmoothScroll } from "@/components/SmoothScroll";
import { AmbientVoxels } from "@/components/three/AmbientVoxels";
import { Background } from "@/components/three/Background";
import { Overlay } from "@/components/three/Overlay";
import { routing, type Locale } from "@/i18n/routing";
import { introScript } from "@/lib/introScript";
import { mcUsername } from "@/lib/minecraft";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import "../globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin", "cyrillic"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin", "cyrillic"] });

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  const locale = await rootLocale();
  return {
    metadataBase: new URL(site.url),
    title: { default: t("title"), template: `%s · ${site.name}` },
    applicationName: site.name,
    authors: [{ name: site.name, url: site.url }],
    creator: site.name,
    publisher: site.name,
    category: "technology",
    formatDetection: { telephone: false, email: false, address: false },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
      yandex: process.env.YANDEX_VERIFICATION || undefined,
    },
    // Defaults for the home page, every other page sets its own canonical and hreflang
    ...pageMetadata({ locale: locale as Locale, path: "", socialTitle: t("title"), description: t("description") }),
  };
}

export const viewport: Viewport = {
  themeColor: "#0b0b0c",
  colorScheme: "dark",
};

export default async function RootLayout({ children }: LayoutProps<"/[locale]">) {
  const locale = await rootLocale();
  if (!hasLocale(routing.locales, locale)) notFound();

  return (
    // data-intro is set before hydration by introScript
    <html lang={locale} className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
      <body className="min-h-dvh font-sans">
        <script dangerouslySetInnerHTML={{ __html: introScript }} />
        <NextIntlClientProvider>
          <SmoothScroll />
          <AmbientVoxels />
          {/* Reads the pathname, so it streams in on pages that render at request time */}
          <Suspense>
            <Background name={site.name.toUpperCase()} skin={mcUsername} />
          </Suspense>
          <Header />
          <ScrollProgress />
          <main id="main">{children}</main>
          <Footer />
          <Overlay />
          <Analytics />
          <EasterEgg />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
