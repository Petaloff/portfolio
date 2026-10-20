import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Hero } from "@/components/sections/Hero";
import { LatestPosts } from "@/components/sections/LatestPosts";
import { Minecraft } from "@/components/sections/Minecraft";
import { Projects } from "@/components/sections/Projects";
import { Stack } from "@/components/sections/Stack";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Projects />
      <Stack />
      <Minecraft />
      <LatestPosts />
      <Contact />
    </>
  );
}
