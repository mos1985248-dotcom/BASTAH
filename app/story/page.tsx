
// app/story/page.tsx

import type { Metadata } from "next";
import SiteShell from "@/components/layout/SiteShell";
import AboutHero from "@/components/about/AboutHero";
import AboutIntro from "@/components/about/AboutIntro";
import AboutStoryPart1 from "@/components/about/AboutStoryPart1";
import AboutStoryPart2 from "@/components/about/AboutStoryPart2";
import AboutStoreLife from "@/components/about/AboutStoreLife";
import AboutExperience from "@/components/about/AboutExperience";
import AboutGlobalReach from "@/components/about/AboutGlobalReach";
import AboutTech from "@/components/about/AboutTech";
import AboutPeopleFirst from "@/components/about/AboutPeopleFirst";
import AboutClosing from "@/components/about/AboutClosing";

export const metadata: Metadata = {
  title: "قصتنا | بسطة",
  description:
    "تعرف على قصة بسطة، من روح البسطات والأسواق المحلية إلى تجربة رقمية تجمع المنتجات والأسر المنتجة في مكان واحد.",
};

export default function StoryPage() {
  return (
    <SiteShell>
      <AboutHero />
      <AboutIntro />
      <AboutStoryPart1 />
      <AboutStoryPart2 />
      <AboutStoreLife />
      <AboutExperience />
      <AboutGlobalReach />
      <AboutTech />
      <AboutPeopleFirst />
      <AboutClosing />
    </SiteShell>
  );
}

