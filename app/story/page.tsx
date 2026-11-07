// app/story/page.tsx — «قصتنا»: حكاية بسطة (تختلف عن /about الذي يعرّف بالشركة).
import type { Metadata } from "next";
import SiteShell from "@/components/layout/SiteShell";
import { uiVars } from "@/components/ui/vars";
import StoryHero from "@/components/story/StoryHero";
import StoryBlock from "@/components/story/StoryBlock";
import StoryExperience from "@/components/story/StoryExperience";
import StoryClosing from "@/components/story/StoryClosing";
import { BLOCKS_BEFORE, BLOCKS_AFTER } from "@/components/story/story-content";
import s from "@/components/story/story.module.css";

export const metadata: Metadata = {
  title: "قصتنا | بسطة مارت",
  description:
    "تعرف على قصة بسطة مارت، من روح البسطات والأسواق المحلية إلى تجربة رقمية تجمع المنتجات والأسر المنتجة في مكان واحد.",
};

export default function StoryPage() {
  return (
    <SiteShell>
      <div className={s.page} style={uiVars}>
        <StoryHero />

        {BLOCKS_BEFORE.map((block, i) => (
          <StoryBlock key={block.title} block={block} index={i} />
        ))}

        <StoryExperience />

        {BLOCKS_AFTER.map((block, i) => (
          <StoryBlock key={block.title} block={block} index={BLOCKS_BEFORE.length + 1 + i} />
        ))}

        <StoryClosing />
      </div>
    </SiteShell>
  );
}
