// app/marketplace/page.tsx
import type { Metadata } from "next";
import MarketplaceClient from "@/components/marketplace/MarketplaceClient";

export const metadata: Metadata = {
  title: "تصفّح المتاجر والمنتجات | بسطة",
  description: "تصفّحي منتجات وحرف يدوية من مئات الأسر السعودية المنتجة — تمور، عسل، عطور، أزياء وأكثر",
};

export default function MarketplacePage() {
  return <MarketplaceClient />;
}
