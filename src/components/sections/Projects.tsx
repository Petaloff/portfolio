import { getTranslations } from "next-intl/server";
import { ProjectGrid } from "@/components/ProjectGrid";
import { getProjects } from "@/lib/content";
import { getLiveStats } from "@/lib/live";
import { EditorWindow } from "./EditorWindow";

export async function Projects() {
  const t = await getTranslations("projects");
  const stats = await getLiveStats();
  const projects = (await getProjects()).map((p) => ({
    ...p,
    stars: p.repo ? stats.repoStars[p.repo.toLowerCase()] : undefined,
    downloads: p.modrinth ? stats.modDownloads[p.modrinth] : undefined,
  }));

  return (
    <EditorWindow id="projects" title={t("title")}>
      <ProjectGrid projects={projects} />
    </EditorWindow>
  );
}
