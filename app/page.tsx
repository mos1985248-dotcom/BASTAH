// app/page.tsx
import type { Metadata } from "next";
import HomeClient from "@/components/home/HomeClient";

export const metadata: Metadata = {
  title: "بسطة | منصة الأسر المنتجة السعودية",
  description: "منصة بسطة تجمع أفضل المنتجات من الأسر السعودية المنتجة — تسوّقي منتجات سعودية أصيلة بدون عمولة على البائعين",
  openGraph: {
    title: "بسطة | منصة الأسر المنتجة السعودية",
    description: "ادعمي الأسر المنتجة واكتشفي منتجات سعودية أصيلة",
    type: "website",
  },
};

export default function HomePage() {
  return <HomeClient />;
}
