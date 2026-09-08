// app/about/page.tsx
// محتوى مقدَّم مباشرة من أحمد (نص "قصتنا" الكامل) — منقول بالكامل عبر
// مكوّنات components/about/*، كل قسم بنص المستند حرفياً دون حذف أو
// إضافة أو أرقام/ادعاءات جديدة. الهيرو + الركائز الأربع مستوحاة من
// الصورة المرجعية المرفقة (نفس المفاهيم: من المملكة للعالم، دعم الأسرة
// المنتجة، منتجات شعبية أصيلة، تجربة آمنة وسهلة) بأيقونات أصلية بسيطة،
// وليست نسخاً عن الصورة نفسها.
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
  description: "من بسطات الأمهات إلى سوق رقمي يحكي الحكاية — قصة بسطة، السوق الرقمي الذي يدعم الأسرة المنتجة السعودية",
};

export default function AboutPage() {
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
