// app/blog/page.tsx
import type { Metadata } from "next";
import BlogListClient from "@/components/blog/BlogListClient";

export const metadata: Metadata = {
  title: "المدونة | بسطة مارت",
  description: "قصص ملهمة، نصائح لإدارة متجرك، وأخبار الأسر المنتجة السعودية من مدونة بسطة مارت",
};

export default function BlogPage() {
  return <BlogListClient />;
}
