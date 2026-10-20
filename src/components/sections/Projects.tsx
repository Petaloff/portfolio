import { getTranslations } from "next-intl/server";
import { FormationSection } from "@/components/FormationSection";
import { ProjectGrid } from "@/components/ProjectGrid";
import { Reveal } from "@/components/Reveal";
import { getProjects } from "@/lib/content";
import { getLiveStats } from "@/lib/live";
import { SectionTitle } from "./SectionTitle";

export async function Projects() {
  const t = await getTranslations("projects");
  const stats = await getLiveStats();
  const projects = getProjects().map((p) => ({
    ...p,
    stars: p.repo ? stats.repoStars[p.repo.toLowerCase()] : undefined,
    downloads: p.modrinth ? stats.modDownloads[p.modrinth] : undefined,
  }));

  return (
    <FormationSection id="projects" formation="projects" className="mx-auto max-w-6xl px-4 py-32 md:px-8">
      <SectionTitle index="02">{t("title")}</SectionTitle>
      <Reveal>
        <ProjectGrid projects={projects} />
      </Reveal>
    </FormationSection>
  );
}
