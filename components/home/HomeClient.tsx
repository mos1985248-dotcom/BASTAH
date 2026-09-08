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

export default function HomeClient() {
  const { user, loading } = useCurrentUser();

  // زر "ابدأ متجرك" يظهر فقط للزائر أو المشتري بدون متجر — التاجر عنده متجر أصلاً
  const showStartStore = !loading && (!user || (user.role !== "SELLER" && !user.store));

  return (
    <SiteShell>
      <HeroSection showStartStore={showStartStore} />
      <TrustBadgeBar />
      <MuniraShowcase />
      <PlansSection />
      <DaftariShowcase />
      <StoryBlogCTARow showStartStore={showStartStore} />
      <CategoryNav />
      <FeaturedStores />
      <WhyBasita />
    </SiteShell>
  );
}