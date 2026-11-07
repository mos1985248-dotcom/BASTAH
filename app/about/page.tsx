// app/about/page.tsx — «من نحن»: التعريف بالشركة (تختلف عن /story التي تحكي قصة بسطة).
import type { Metadata } from "next";
import SiteShell from "@/components/layout/SiteShell";
import { uiVars } from "@/components/ui/vars";
import CompanyHero from "@/components/company/CompanyHero";
import CompanyFacts from "@/components/company/CompanyFacts";
import CompanyIntro from "@/components/company/CompanyIntro";
import CompanyServices from "@/components/company/CompanyServices";
import CompanyPrinciples from "@/components/company/CompanyPrinciples";
import CompanyEcosystem from "@/components/company/CompanyEcosystem";
import CompanyClosing from "@/components/company/CompanyClosing";
import s from "@/components/story/story.module.css";

export const metadata: Metadata = {
  title: "من نحن | بسطة مارت",
  description:
    "تعرف على بسطة مارت، منصة رقمية تساعد الأسر المنتجة وأصحاب المشاريع المحلية على عرض منتجاتهم وإدارة متاجرهم والوصول إلى عملائهم.",
};

export default function AboutPage() {
  return (
    <SiteShell>
      <div className={s.page} style={uiVars}>
        <CompanyHero />
        <CompanyFacts />
        <CompanyIntro />
        <CompanyServices />
        <CompanyPrinciples />
        <CompanyEcosystem />
        <CompanyClosing />
      </div>
    </SiteShell>
  );
}
