import { getLocale, getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/JsonLd";
import { About } from "@/components/sections/About";
import { Activity } from "@/components/sections/Activity";
import { Contact } from "@/components/sections/Contact";
import { Hero } from "@/components/sections/Hero";
import { LatestPosts } from "@/components/sections/LatestPosts";
import { Minecraft } from "@/components/sections/Minecraft";
import { Projects } from "@/components/sections/Projects";
import { Stack } from "@/components/sections/Stack";
import { absolute, personRef, personSchema } from "@/lib/seo";
import { site, stack } from "@/lib/site";

export default async function Home() {
  const t = await getTranslations();
  const locale = await getLocale();
  return (
    <>
      <JsonLd
        data={{
          "@graph": [
            personSchema(t("hero.kicker"), t("meta.description"), stack.flatMap((g) => g.items)),
            {
              "@type": "WebSite",
              "@id": absolute("/#website"),
              name: site.name,
              url: absolute(`/${locale}`),
              inLanguage: locale,
              description: t("meta.description"),
              author: personRef,
            },
          ],
        }}
      />
      <Hero />
      <About />
      <Projects />
      <Activity />
      <Stack />
      <Minecraft />
      <LatestPosts />
      <Contact />
    </>
  );
}
