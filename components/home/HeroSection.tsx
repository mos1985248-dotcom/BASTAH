// components/home/HeroSection.tsx
import { t } from "@/theme";
import { uiVars } from "@/components/ui/vars";
import HeroCopy from "./HeroCopy";
import HeroVisual from "./HeroVisual";
import s from "./hero.module.css";

export default function HeroSection({
  showStartStore,
}: {
  showStartStore: boolean;
}) {
  return (
    <section
      className={s.section}
      style={{ ...uiVars, maxWidth: t.layout.containerMaxWidth }}
    >
      <div className={s.card}>
        <HeroCopy showStartStore={showStartStore} />
        <HeroVisual />
      </div>
    </section>
  );
}
