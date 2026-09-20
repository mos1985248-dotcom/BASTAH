// components/home/HomeClient.tsx
"use client";

import { useCurrentUser } from "@/app/providers";
import SiteShell from "@/components/layout/SiteShell";
import HeroSection from "@/components/home/HeroSection";
import TrustBadgeBar from "@/components/home/TrustBadgeBar";
import MuniraShowcase from "@/components/home/MuniraShowcase";
import PlansSection from "@/components/home/PlansSection";
import DaftariShowcase from "@/components/home/DaftariShowcase";
import StoryBlogCTARow from "@/components/home/StoryBlogCTARow";
import CategoryNav from "@/components/home/CategoryNav";
import FeaturedStores from "@/components/home/FeaturedStores";
import WhyBasita from "@/components/home/WhyBasita";
import SectionBand from "@/components/home/SectionBand";

export default function HomeClient() {
  const { user, loading } = useCurrentUser();

  // زر "ابدأ متجرك" يظهر فقط للزائر أو المشتري بدون متجر —
  // التاجر عنده متجر أصلاً
  const showStartStore =
    !loading && (!user || (user.role !== "SELLER" && !user.store));

  return (
    <SiteShell>
      {/* رحلة المتسوّق أولاً */}
      <HeroSection showStartStore={showStartStore} />

      {/* شريط الثقة + الأقسام — منطقة واحدة مضغوطة */}
      <SectionBand tone="white" divider={false}>
        <div className="basita-home-discovery-bar">
          <TrustBadgeBar />
          <CategoryNav />
        </div>
      </SectionBand>

      {/* المتاجر المميزة */}
      <SectionBand tone="white">
        <FeaturedStores />
      </SectionBand>

      {/* لماذا بسطة */}
      <SectionBand tone="transparent" divider={false}>
        <WhyBasita />
      </SectionBand>

      {/* أدوات التاجر */}
      <SectionBand tone="white">
        <MuniraShowcase />
        <DaftariShowcase />
      </SectionBand>

      {/* الخطط والاشتراك */}
      <SectionBand tone="transparent" divider={false}>
        <PlansSection />
      </SectionBand>

      {/* الإقفال النهائي */}
      <SectionBand tone="tint">
        <StoryBlogCTARow showStartStore={showStartStore} />
      </SectionBand>
    </SiteShell>
  );
}