// app/blog/page.tsx
import type { Metadata } from "next";
import BlogListClient from "@/components/blog/BlogListClient";

export const metadata: Metadata = {
  title: "المدونة | بسطة",
  description: "قصص ملهمة، نصائح لإدارة متجرك، وأخبار الأسر المنتجة السعودية من مدونة بسطة",
};

export default function BlogPage() {
  return <BlogListClient />;
}
