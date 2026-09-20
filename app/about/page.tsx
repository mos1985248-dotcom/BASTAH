
// app/about/page.tsx

import type { Metadata } from "next";
import SiteShell from "@/components/layout/SiteShell";
import CompanyHero from "@/components/about/company/CompanyHero";
import CompanyIntro from "@/components/about/company/CompanyIntro";
import CompanyServices from "@/components/about/company/CompanyServices";
import CompanyVisionMission from "@/components/about/company/CompanyVisionMission";
import CompanyValues from "@/components/about/company/CompanyValues";
import CompanyEcosystem from "@/components/about/company/CompanyEcosystem";
import CompanyClosing from "@/components/about/company/CompanyClosing";

export const metadata: Metadata = {
  title: "من نحن | بسطة",
  description:
    "تعرف على بسطة، منصة رقمية تساعد الأسر المنتجة وأصحاب المشاريع المحلية على عرض منتجاتهم وإدارة متاجرهم والوصول إلى عملائهم.",
};

export default function AboutPage() {
  return (
    <SiteShell>
      <CompanyHero />
      <CompanyIntro />
      <CompanyServices />
      <CompanyVisionMission />
      <CompanyValues />
      <CompanyEcosystem />
      <CompanyClosing />
    </SiteShell>
  );
}

